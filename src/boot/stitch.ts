import Vue from "vue";
import {
    Stitch,
    StitchAppClient,
    RemoteMongoClient,
    RemoteMongoCollection
} from "mongodb-stitch-browser-sdk";
import { Customer } from "../models/customer";
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
    customers: RemoteMongoCollection<Customer>;
    constructor(stitchApp: string, database: string, collection: string) {
        this.stitch = Stitch.initializeDefaultAppClient(stitchApp);
        this.mongodb = this.stitch.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
        );
        this.customers = this.mongodb.db(database).collection(collection);
    }
    userId() {
        if (this.stitch.auth.user) {
            return this.stitch.auth.user.id;
        }
        return "";
    }
    createCustomer(customer: Customer) {
        return this.customers.insertOne(customer);
    }
    deleteCustomer(customer: Customer) {
        return this.customers.deleteOne(customer);
    }
    deleteAllCustomers() {
        return this.customers.deleteMany({});
    }
    getAllCustomers(): Promise<Customer[]> {
        return (
            this.customers
                // limiting the fetched properties to name and leftAt causes bugs
                // where details of selected customer cannot be displayed in customer view
                .find({}, {})
                .toArray()
                .then(data => {
                    return Customer.fromObject(data) as Customer[];
                })
        );
    }
    getCustomerById(id: ObjectID) {
        // console.log("getCustomerById:", id);
        return this.customers
            .find({ _id: id }, {})
            .first()
            .then(data => {
                return Customer.fromObject(data) as Customer;
            });
    }
    saveCustomer(customer: Customer) {
        customer.user_id = this.userId();
        return this.customers.findOneAndReplace(
            { _id: customer._id },
            customer
        );
    }
}

export const stitchApi = new StitchApi(
    "openomaha-elgvq",
    "openomaha",
    "clients"
);

Vue.prototype.$stitchApi = stitchApi;
