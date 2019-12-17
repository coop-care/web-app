import Vue from 'vue';
import {
    Stitch,
    StitchAppClient,
    RemoteMongoClient,
    RemoteMongoCollection,
} from 'mongodb-stitch-browser-sdk';
import { CoreCustomer, UnsavedCustomer, Customer } from '../helper/coreTypes';
import { ObjectID } from 'bson';

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $stitchApi: StitchApi,
    }
}

class StitchApi {
    stitch: StitchAppClient;
    mongodb: RemoteMongoClient;
    customers: RemoteMongoCollection<Customer>;
    constructor(stitchApp: string, database: string, collection: string) {
        this.stitch = Stitch.initializeDefaultAppClient(stitchApp);
        this.mongodb = this.stitch.getServiceClient(RemoteMongoClient.factory, "mongodb-atlas");
        this.customers = this.mongodb.db(database).collection(collection);
    }
    userId() {
        if (this.stitch.auth.user) {
            return this.stitch.auth.user.id;
        }
        return "";
    }
    createCustomer(customer: UnsavedCustomer) {
        return this.customers.insertOne(customer as Customer);
    }
    deleteAllCustomers() {
        return this.customers.deleteMany({ });
    }
    getAllCustomers(): Promise<CoreCustomer[]> {
        return this.customers.find({ }, { projection: { name: 1 } }).toArray();
    }
    getCustomerById(id: ObjectID) {
        // console.log("getCustomerById:", id);
        return this.customers.find({ _id: id }, { }).first();
    }
    saveCustomer(customer: Customer) {
        customer.user_id = this.userId();
        return this.customers
            .findOneAndReplace({ _id: customer._id }, customer);
    }
}

export const stitchApi = new StitchApi('openomaha-elgvq', 'openomaha', 'clients');

Vue.prototype.$stitchApi = stitchApi;
