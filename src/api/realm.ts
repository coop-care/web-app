import * as Realm from "realm-web";
import CoopCareApiInterface, { CoopCareApiListener } from "./coopCareApiInterface";
import { Client, User, Team, TeamMember } from "../models";
import { ObjectID } from "bson";

type RequiredID = { _id: ObjectID };

export default class RealmApi implements CoopCareApiInterface {
    private app: Realm.App;
    private databaseName: string;
    authListener?: CoopCareApiListener<void>;
    userListener?: CoopCareApiListener<TeamMember>;
    teamListener?: CoopCareApiListener<Team>;
    clientListener?: CoopCareApiListener<Client>;

    constructor(realmApp: string, databaseName: string) {
        this.app = new Realm.App(realmApp);
        this.databaseName = databaseName;

        if (this.isLoggedIn) {
            this.addWatchers();
        }
    }

    private get database() {
        return this.app.currentUser?.mongoClient("mongodb-atlas").db(this.databaseName);
    }
    private get clients() {
        return this.database?.collection<Client & RequiredID>("clients")
    }
    private get teams() {
        return this.database?.collection<Team & RequiredID>("teams")
    }
    private get users() {
        return this.database?.collection<TeamMember & RequiredID>("userData")
    }

    get isLoggedIn() {
        return this.app.currentUser?.isLoggedIn == true;
    }
    get userId() {
        return this.app.currentUser?.id;
    }
    get userEmail() {
        return this.app.currentUser?.profile.email;
    }

    private addWatchers() {
        
    }

    login(username: string, password: string) {
        const credentials = Realm.Credentials.emailPassword(username, password);
        return this.app.logIn(credentials)
            .then(user => {
                this.addWatchers();
            });
    }
    logout() {
        // this.watchers.forEach(stream => stream.close());
        // this.watchers = [];
        return (this.app.currentUser?.logOut() || Promise.resolve());
    }
    registerUser(username: string, password: string) {
        return this.app.emailPasswordAuth.registerUser(username, password);
    }
    confirmUser(token: string, tokenId: string) {
        return this.app.emailPasswordAuth.confirmUser(token, tokenId);
    }
    resendConfirmationEmail(email: string) {
        return this.app.emailPasswordAuth.resendConfirmationEmail(email)
    }
    sendResetPasswordEmail(email: string) {
        return this.app.emailPasswordAuth.sendResetPasswordEmail(email)
    }
    resetPassword(token: string, tokenId: string, password: string) {
        return this.app.emailPasswordAuth.resetPassword(token, tokenId, password)
    }

    getUser() {
        const currentUser = this.app.currentUser;
        if (!currentUser || !this.users) {
            return Promise.reject("not logged in");
        }

        return this.users
            .findOne({ userId: currentUser.id }, {})
            .then(data => {
                if (!data) {
                    return undefined;
                } else {
                    // @ts-ignore
                    data._id = data?._id?.toHexString();
                    const user = User.fromObject(data) as User;
                    user.email = currentUser.profile.email || "";
                    return user;
                }
            });
    }
    createUser(user: User) {
        const currentUser = this.app.currentUser;
        if (!currentUser || !this.users) {
            return Promise.reject("not logged in");
        }

        const data: any = user.toJSON();
        delete data._id;

        return this.users.insertOne(data).then(result => {
            user._id = new ObjectID(result.insertedId);
            return user;
        });
    }
    saveUser(user: User) {
        if (!this.users) {
            return Promise.reject("not logged in");
        }

        const data: any = user.toJSON();
        data._id = user._id;
        return this.users
            .findOneAndReplace({ _id: user._id }, data)
            .then(() => user);
    }
    deleteUser() {
        const currentUser = this.app.currentUser;
        if (!currentUser?.id || !this.users) {
            return Promise.reject();
        }

        return this.users
            .deleteOne({ userId: currentUser.id })
            .then(() => this.app.removeUser(currentUser));
    }
    getTeamMembers() {
        if (!this.users) {
            return Promise.reject("not logged in");
        }

        return this.users
            .find({}, {})
            .then(data => {
                // @ts-ignore
                data.forEach(item => item._id = item._id?.toHexString())
                const result = TeamMember.fromObject(data) as TeamMember[];
                return result;
            })
    }

    createClient(client: Client) {
        if (!this.clients) {
            return Promise.reject("not logged in");
        }

        const data: any = client.toJSON();
        delete data._id;
        return this.clients.insertOne(data).then(result => {
            client._id = new ObjectID(result.insertedId);
            return client;
        })
    }
    deleteClient(client: Client) {
        if (!this.clients) {
            return Promise.reject("not logged in");
        }

        return this.clients
            .deleteOne({ _id: client._id })
            .then(() => undefined);
    }
    deleteAllClients() {
        if (!this.clients) {
            return Promise.reject("not logged in");
        }

        return this.clients.deleteMany({}).then(() => undefined);
    }
    getClients(clientIds: string[]): Promise<Client[]> {
        if (!this.clients) {
            return Promise.reject("not logged in");
        }

        return (
            this.clients
                // limiting the fetched properties to name and leftAt causes bugs
                // where details of selected client cannot be displayed in client view
                .find({
                    _id: {
                        $in: clientIds.map(id => new ObjectID(id))
                    }
                }, {})
                .then(data => {
                    return data.flatMap((item: any) => {
                        try {
                            item._id = item._id?.toHexString();

                            if (typeof item.contact.id == "object") {
                                item.contact.id = item.contact.id?.toHexString();
                            }
                            return [Client.fromObject(item) as Client]
                        } catch (error) {
                            console.error(error);
                            return [];
                        }
                    })
                })
        );
    }
    getClient(id: ObjectID) {
        if (!this.clients) {
            return Promise.reject("not logged in");
        }
        
        return this.clients
            .findOne({ _id: id }, {})
            .then(data => {
                // @ts-ignore
                data._id = data?._id?.toHexString();
                return Client.fromObject(data) as Client;
            });
    }
    saveClient(client: Client) {
        if (!this.clients) {
            return Promise.reject("not logged in");
        }

        const data: any = client.toJSON();
        data._id = client._id;
        return this.clients
            .findOneAndReplace({ _id: client._id }, data)
            .then(() => client);
    }
    getClientsInAdditionalTeams(clientIds: string[], teamIds: string[]) {
        if (!this.app.currentUser) {
            return Promise.reject("not logged in");
        }

        return this.app.currentUser.callFunction(
            "getClientsInAdditionalTeams",
            clientIds, teamIds
        ) as Promise<any>;
    }

    createTeam(team: Team) {
        if (!this.teams) {
            return Promise.reject("not logged in");
        }

        const data: any = team.toJSON();
        delete data._id;
        return this.teams.insertOne(data).then(result => {
            team._id = new ObjectID(result.insertedId);
            return team;
        })
    }
    getMyTeams() {
        if (!this.teams) {
            return Promise.reject("not logged in");
        }

        return (
            this.teams
                .find({}, {})
                .then(data => {
                    // @ts-ignore
                    data.forEach(item => item._id = item._id?.toHexString())
                    const result = Team.fromObject(data) as Team[];
                    return result;
                })
        );
    }
    saveTeam(team: Team) {
        if (!this.teams) {
            return Promise.reject("not logged in");
        }

        const data: any = team.toJSON();
        data._id = team._id;
        return this.teams
            .findOneAndReplace({ _id: team._id }, data)
            .then(() => team);
    }
    deleteTeam(team: Team) {
        if (!this.teams) {
            return Promise.reject("not logged in");
        }

        return this.teams
            .deleteOne({ _id: team._id })
            .then(() => undefined);
    }
}
