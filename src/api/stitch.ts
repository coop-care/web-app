import {
    Stitch,
    StitchAppClient,
    RemoteMongoClient,
    RemoteMongoCollection,
    UserPasswordAuthProviderClient,
    UserPasswordCredential,
    Stream
} from "mongodb-stitch-browser-sdk";
import { ChangeEvent } from "mongodb-stitch-core-services-mongodb-remote"
import CoopCareApiInterface, { CoopCareApiListener } from "./coopCareApiInterface";
import { Client, User, UserData, Team, TeamMember } from "../models";
import { ObjectID } from "bson";

export default class StitchApi implements CoopCareApiInterface {
    private stitch: StitchAppClient;
    private mongodb: RemoteMongoClient;
    private clients: RemoteMongoCollection<Client>;
    private teams: RemoteMongoCollection<Team>;
    private users: RemoteMongoCollection<TeamMember>;
    private watchers: Stream<ChangeEvent<any>>[] = [];
    authListener?: CoopCareApiListener<void>;
    userListener?: CoopCareApiListener<TeamMember>;
    teamListener?: CoopCareApiListener<Team>;
    clientListener?: CoopCareApiListener<Client>;

    constructor(stitchApp: string, databaseName: string) {
        this.stitch = Stitch.initializeDefaultAppClient(stitchApp);
        this.mongodb = this.stitch.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
        );
        const database = this.mongodb.db(databaseName)
        this.clients = database.collection("clients");
        this.teams = database.collection("teams");
        this.users = database.collection("userData");

        if (this.isLoggedIn) {
            this.addWatchers();
        }

        this.stitch.auth.addAuthListener({
            onActiveUserChanged: (auth, currentActiveUser, previousActiveUser) => {
                if (!currentActiveUser) {
                    this.authListener?.("sessionEnded");
                }
                if (!previousActiveUser) {
                    this.authListener?.("sessionStarted");
                }
            }
        })
    }

    get isLoggedIn() {
        return this.stitch.auth.isLoggedIn;
    }
    get userId() {
        return this.stitch.auth.user?.id;
    }
    get userEmail() {
        return this.stitch.auth.user?.profile.email;
    }
    private get epclient() {
        return this.stitch.auth.getProviderClient(
            UserPasswordAuthProviderClient.factory
        );
    }

    private addWatchers() {
        // -> Adding watchers leads to quick session expiration. Better migrate to a new backend.
        // this.addWatcher(this.users, event => this.userListener?.(event.operationType, event.fullDocument));
        // this.addWatcher(this.teams, event => this.teamListener?.(event.operationType, event.fullDocument));
        // this.addWatcher(this.clients, event => this.clientListener?.(event.operationType, event.fullDocument));
    }
    private addWatcher<T>(collection: RemoteMongoCollection<T>, listener: (event: ChangeEvent<T>) => void) {
        void collection.watch().then(stream => {
            this.watchers.push(stream);
            stream.onNext(listener);
        });
    }

    login(username: string, password: string) {
        const credential = new UserPasswordCredential(username, password);
        return this.stitch.auth
            .loginWithCredential(credential)
            .then(() => this.addWatchers());
    }
    logout() {
        this.watchers.forEach(stream => stream.close());
        this.watchers = [];
        return this.stitch.auth.logout();
    }
    registerUser(username: string, password: string) {
        return this.epclient.registerWithEmail(username, password);
    }
    confirmUser(token: string, tokenId: string) {
        return this.epclient.confirmUser(token, tokenId);
    }
    resendConfirmationEmail(email: string) {
        return this.epclient.resendConfirmationEmail(email)
    }
    sendResetPasswordEmail(email: string) {
        return this.epclient.sendResetPasswordEmail(email)
    }
    resetPassword(token: string, tokenId: string, password: string) {
        return this.epclient.resetPassword(token, tokenId, password)
    }

    getUser() {
        const stitchUser = this.stitch.auth.user;
        if (!stitchUser) {
            return Promise.reject("not logged in");
        }

        return this.users
            .find({ userId: stitchUser.id }, {})
            .first()
            .then(data => {
                if (!data) {
                    return undefined;
                } else {
                    const user = User.fromObject(data) as User;
                    user.email = stitchUser.profile.email || "";
                    return user;
                }
            });
    }
    createUser(user: User) {
        const stitchUser = this.stitch.auth.user;
        if (!stitchUser) {
            return Promise.reject("not logged in");
        }

        const userData = UserData.fromUser(user)
        return this.users.insertOne(userData).then(result => {
            user._id = new ObjectID(result.insertedId);
            return user;
        });
    }
    saveUser(user: User) {
        const data: any = user.toJSON();
        data._id = user._id;
        return this.users
            .findOneAndReplace({ _id: user._id }, data)
            .then(() => user);
    }
    deleteUser() {
        const stitchUser = this.stitch.auth.user;
        if (!stitchUser?.id) {
            return Promise.reject();
        }

        return this.users
            .deleteOne({ userId: stitchUser.id })
            .then(() => this.stitch.auth.removeUser());
    }
    getTeamMembers() {
        return this.users
            .find({}, {})
            .toArray()
            .then(data => {
                const result = TeamMember.fromObject(data) as TeamMember[];
                return result;
            })
    }

    createClient(client: Client) {
        return this.clients.insertOne(client).then(result => {
            client._id = new ObjectID(result.insertedId);
            return client;
        })
    }
    deleteClient(client: Client) {
        return this.clients
            .deleteOne({ _id: client._id })
            .then(() => undefined);
    }
    deleteAllClients() {
        return this.clients.deleteMany({}).then(() => undefined);
    }
    getClients(clientIds: string[]): Promise<Client[]> {
        return (
            this.clients
                // limiting the fetched properties to name and leftAt causes bugs
                // where details of selected client cannot be displayed in client view
                .find({
                    _id: {
                        $in: clientIds.map(id => new ObjectID(id))
                    }
                }, {})
                .toArray()
                .then(data => {
                    const result = Client.fromObject(data) as Client[];
                    return result;
                })
        );
    }
    getClient(id: ObjectID) {
        return this.clients
            .find({ _id: id }, {})
            .first()
            .then(data => {
                return Client.fromObject(data) as Client;
            });
    }
    saveClient(client: Client) {
        const data: any = client.toJSON();
        data._id = client._id;
        return this.clients
            .findOneAndReplace({ _id: client._id }, data)
            .then(() => client);
    }

    createTeam(team: Team) {
        return this.teams.insertOne(team).then(result => {
            team._id = new ObjectID(result.insertedId);
            return team;
        })
    }
    getMyTeams() {
        return (
            this.teams
                .find({}, {})
                .toArray()
                .then(data => {
                    const result = Team.fromObject(data) as Team[];
                    return result;
                })
        );
    }
    saveTeam(team: Team) {
        const data: any = team.toJSON();
        data._id = team._id;
        return this.teams
            .findOneAndReplace({ _id: team._id }, data)
            .then(() => team);
    }
    deleteTeam(team: Team) {
        return this.teams
            .deleteOne({ _id: team._id })
            .then(() => undefined);
    }
}
