import { defineActions } from "direct-vuex";
import { stitchApi } from "../boot/stitch";
import sampleData from "../data/sample1.json";
import { rootActionContext } from ".";
import { Client } from "../models/client";

export default defineActions({
    fetchClientsFromDB(context) {
        const { commit } = rootActionContext(context);
        commit.isLoadingClientList(true);
        return new Promise((resolve, reject) => {
            stitchApi
                .getAllClients()
                .then(clients => {
                    // console.log("Success:", result);
                    commit.setClients((clients as unknown) as Client[]);
                    commit.isLoadingClientList(false);
                    resolve();
                })
                .catch(err => {
                    console.error(`Failed: ${err}`);
                    commit.isLoadingClientList(false);
                    reject();
                });
        });
    },

    saveClient(context, payload) {
        return new Promise((resolve, reject) => {
            const client =
                payload.client ||
                rootActionContext(context).getters.getClient(payload);

            if (client) {
                stitchApi
                    .saveClient(client)
                    .then(resolve)
                    .catch(error => {
                        console.error(error);
                        if (payload.resolveOnError) {
                            resolve();
                        } else {
                            reject(error);
                        }
                    });
            } else {
                if (payload.resolveOnError) {
                    resolve();
                } else {
                    reject("client not found");
                }
            }
        });
    },

    deleteClient(context, client: Client) {
        const { dispatch } = rootActionContext(context);
        stitchApi
            .deleteClient(client)
            .then(() => {
                return dispatch.fetchClientsFromDB();
            })
            .catch(err =>
                console.error(`Save current client failed with error: ${err}`)
            );
    },

    addSamplesToDB(context) {
        const { dispatch } = rootActionContext(context);
        const samples = Client.fromObject(sampleData) as Client[];
        samples.forEach(client => {
            // eslint-disable-next-line @typescript-eslint/camelcase
            client.user_id = stitchApi.userId();
        });
        stitchApi.clients
            .insertMany(samples)
            .then(() => {
                // console.log("Successfully inserted", result);
                dispatch.fetchClientsFromDB();
            })
            .catch(err => console.error(`Failed to insert documents: ${err}`));
    },

    clearDB(context) {
        const { dispatch } = rootActionContext(context);
        stitchApi
            .deleteAllClients()
            .then(() => {
                dispatch.fetchClientsFromDB();
            })
            .catch(err => console.error(`Delete failed with error: ${err}`));
    }
});
