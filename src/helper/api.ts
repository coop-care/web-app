import {
    // Stitch,
    RemoteMongoClient,
  } from "mongodb-stitch-browser-sdk";
import { stitch } from '../boot/stitch';

export default {
    client_collection: () => {
        const mongodb = stitch.getServiceClient(RemoteMongoClient.factory, "mongodb-atlas");
        const clients = mongodb.db("openomaha").collection("clients");
        return clients;
    },
    customers: () => {
        // const clients = client_collection();
        // clients.find({ }, { }).toArray()
        //     .then(result => {
        //         console.log("Success:", result);
        //     })
        //     .catch(err => console.error(`Failed: ${err}`))
        // ;
    }
}