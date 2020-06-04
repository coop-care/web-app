import { defineActions } from "direct-vuex";
import sampleData from "../data/sample1.json";
import { rootActionContext } from ".";
import { Client } from "../models/client";
import { ccApi } from "../api/apiProvider";

export default defineActions({
    fetchClientsFromDB(context) {
        const { commit } = rootActionContext(context);
        commit.isLoadingClientList(true);
        return new Promise((resolve, reject) => {
            ccApi
                .getAllClients()
                .then(clients => {
                    clients.forEach(client => client.calculateOccurrences());
                    commit.setClients(clients);
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
            const { commit, getters } = rootActionContext(context);
            const client: Client | undefined =
                payload.client || getters.getClient(payload);

            if (client) {
                commit.calculateOccurences(client);
                ccApi
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
        ccApi
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
        return Promise.all(
            samples.map(client => {
                // eslint-disable-next-line @typescript-eslint/camelcase
                client.user_id = ccApi.userId;
                return ccApi.createClient(client);
            })
        )
            .then(() => {
                dispatch.fetchClientsFromDB();
            })
            .catch(err => console.error(`Failed to insert documents: ${err}`));
    },

    clearDB(context) {
        const { dispatch } = rootActionContext(context);
        ccApi
            .deleteAllClients()
            .then(() => {
                dispatch.fetchClientsFromDB();
            })
            .catch(err => console.error(`Delete failed with error: ${err}`));
    }
});
