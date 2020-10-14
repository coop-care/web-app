import { defineActions } from "direct-vuex";
import sampleData from "../data/sample1.json";
import { rootActionContext } from ".";
import { Client, User } from "../models";
import { ccApi } from "../api/apiProvider";

export default defineActions({
    fetchClientsFromDB(context) {
        if (!ccApi.isLoggedIn) {
            return Promise.reject();
        }

        const { commit } = rootActionContext(context);
        commit.isLoadingClientList(true);
        return new Promise((resolve, reject) => {
            ccApi
                .getAllClients()
                .then(clients => {
                    clients.forEach(client =>
                        commit.calculateOccurrences(client)
                    );
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
                commit.calculateOccurrences(client);
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
                return dispatch.fetchClientsFromDB().catch(() => 0);
            })
            .catch(err =>
                console.error(`Save current client failed with error: ${err}`)
            );
    },

    login(context, { email, password }: { email: string; password: string }) {
        const { commit, dispatch } = rootActionContext(context);
        return ccApi.login(email, password).then(() => {
            commit.setCurrentUser(ccApi.user);
            void dispatch.fetchClientsFromDB();
            return Promise.resolve();
        });
    },

    logout(context) {
        const { commit } = rootActionContext(context);
        return ccApi.logout().then(() => {
            commit.setCurrentUser(undefined);
            commit.setClients([]);
            return Promise.resolve();
        });
    },

    saveUser(context, user?: User) {
        const { commit } = rootActionContext(context);
        commit.setCurrentUser(user);
        if (user) {
            ccApi
                .saveUser(user)
                .catch(err =>
                    console.error(`Save current user failed with error: ${err}`)
                );
        }
    },

    addSamplesToDB(context) {
        const { state, dispatch } = rootActionContext(context);
        const samples = Client.fromObject(sampleData) as Client[];
        const userId = state.currentUser?.id;
        if (!userId) {
            return;
        }

        return Promise.all(
            samples.map(client => {
                client.user_id = userId;
                return ccApi.createClient(client);
            })
        )
            .then(() => {
                dispatch.fetchClientsFromDB().catch(() => 0);
            })
            .catch(err => console.error(`Failed to insert documents: ${err}`));
    },

    clearDB(context) {
        const { dispatch } = rootActionContext(context);
        ccApi
            .deleteAllClients()
            .then(() => {
                dispatch.fetchClientsFromDB().catch(() => 0);
            })
            .catch(err => console.error(`Delete failed with error: ${err}`));
    }
});
