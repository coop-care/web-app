import Vue from "vue";
import {
    Stitch,
    StitchAppClient,
    RemoteMongoClient,
    RemoteMongoCollection
} from "mongodb-stitch-browser-sdk";
import { Client } from "../models/client";
import { ObjectID } from "bson";

declare module "vue/types/vue" {
    // 3. Declare augmentation for Vue
    interface Vue {
        $stitchApi: StitchApi;
    }
}

class StitchApi {
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
    userId() {
        if (this.stitch.auth.user) {
            return this.stitch.auth.user.id;
        }
        return "";
    }
    createClient(client: Client) {
        return this.clients.insertOne(client);
    }
    deleteClient(client: Client) {
        return this.clients.deleteOne(client);
    }
    deleteAllClients() {
        return this.clients.deleteMany({});
    }
    getAllClients(): Promise<Client[]> {
        return (
            this.clients
                // limiting the fetched properties to name and leftAt causes bugs
                // where details of selected client cannot be displayed in client view
                .find({}, {})
                .toArray()
                .then(data => {
                    return Client.fromObject(data) as Client[];
                })
        );
    }
    getClientById(id: ObjectID) {
        // console.log("getClientById:", id);
        return this.clients
            .find({ _id: id }, {})
            .first()
            .then(data => {
                return Client.fromObject(data) as Client;
            });
    }
    saveClient(client: Client) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        client.user_id = this.userId();
        return this.clients.findOneAndReplace({ _id: client._id }, client);
    }
}

export const stitchApi = new StitchApi(
    "openomaha-elgvq",
    "openomaha",
    "clients"
);

Vue.prototype.$stitchApi = stitchApi;
