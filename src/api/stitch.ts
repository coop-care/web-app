import {
    Stitch,
    StitchAppClient,
    RemoteMongoClient,
    RemoteMongoCollection,
    UserPasswordAuthProviderClient,
    UserPasswordCredential
} from "mongodb-stitch-browser-sdk";
import CoopCareApiInterface from "./coopCareApiInterface";
import { Client, User } from "../models";
import { ObjectID } from "bson";

export default class StitchApi implements CoopCareApiInterface {
    stitch: StitchAppClient;
    mongodb: RemoteMongoClient;
    clients: RemoteMongoCollection<Client>;

    constructor(stitchApp: string, database: string, collection: string) {
        this.stitch = Stitch.initializeDefaultAppClient(stitchApp);
        this.mongodb = this.stitch.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
        );
        this.clients = this.mongodb.db(database).collection(collection);
    }

    get isLoggedIn() {
        return this.stitch.auth.isLoggedIn;
    }
    get user() {
        const stitchUser = this.stitch.auth.user;
        if (stitchUser) {
            const user = new User(stitchUser.id);
            user.email = stitchUser.profile.email || "";
            user.signature = window.localStorage.getItem("signature") || "";
            return user;
        } else {
            return undefined;
        }
    }
    login(username: string, password: string) {
        const credential = new UserPasswordCredential(username, password);
        return this.stitch.auth
            .loginWithCredential(credential)
            .then(() => undefined);
    }
    logout() {
        return this.stitch.auth.logout();
    }
    registerUser(username: string, password: string) {
        const epclient = this.stitch.auth.getProviderClient(
            UserPasswordAuthProviderClient.factory
        );
        return epclient.registerWithEmail(username, password);
    }
    confirmUser(token: string, tokenId: string) {
        const epclient = this.stitch.auth.getProviderClient(
            UserPasswordAuthProviderClient.factory
        );
        return epclient.confirmUser(token, tokenId);
    }
    saveUser(user: User) {
        window.localStorage.setItem("signature", user.signature);
        return Promise.resolve(user);
    }

    createClient(client: Client) {
        return this.clients.insertOne(client).then(() => client);
    }
    deleteClient(client: Client) {
        return this.clients
            .deleteOne({ _id: client._id })
            .then(() => undefined);
    }
    deleteAllClients() {
        return this.clients.deleteMany({}).then(() => undefined);
    }
    getAllClients(): Promise<Client[]> {
        return (
            this.clients
                // limiting the fetched properties to name and leftAt causes bugs
                // where details of selected client cannot be displayed in client view
                .find({}, {})
                .toArray()
                .then(data => {
                    // console.log(JSON.stringify(data));
                    const result = Client.fromObject(data) as Client[];
                    // console.log(result);
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
        client.user_id = this.user?.id || "";
        const data: any = client.toJSON();
        data._id = client._id;
        return this.clients
            .findOneAndReplace({ _id: client._id }, data)
            .then(() => client);
    }
}
