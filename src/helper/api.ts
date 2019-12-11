import {
    // Stitch,
    RemoteMongoClient,
  } from "mongodb-stitch-browser-sdk";
import { stitch } from '../boot/stitch';

function userId() {
    if (stitch.auth.user) {
        return stitch.auth.user.id;
    }
    return "";
}

function clientCollection() {
    const mongodb = stitch.getServiceClient(RemoteMongoClient.factory, "mongodb-atlas");
    const clients = mongodb.db("openomaha").collection("clients");
    return clients;
}

export default {
    clientCollection: clientCollection,
    userId : userId,
    createCustomer: (customer: any) => {
        return clientCollection().insertOne(customer);
    },
    deleteAllCustomers: () => {
        return clientCollection().deleteMany({ });
    },
    getAllCustomers: () => {
        return clientCollection().find({ }, { projection: { name: 1 } }).toArray();
    },
    getCustomerById: (id: string) => {
        return clientCollection().find({ _id: id }, { }).first();
    },
    saveCustomer: (customer: any) => {
        customer.user_id = userId();
        return clientCollection()
            .findOneAndReplace({ _id: customer._id }, customer);
    },
}