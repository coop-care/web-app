import { defineActions } from "direct-vuex";
import sampleData from "../data/sample1.json";
import { rootActionContext } from ".";
import { Client, User, Team } from "../models";
import { ccApi } from "../api/apiProvider";
import { defaultColors, setColorSet } from "../helper/color";

export default defineActions({
    fetchEssentialDataFromDB(context, defaults: { locale: string }): Promise<void> {
        if (!ccApi.isLoggedIn) {
            return Promise.reject();
        }

        const { dispatch } = rootActionContext(context);

        const promise = dispatch.fetchUserFromDB(defaults);
        void dispatch.fetchTeamsFromDB()
            .then(() => dispatch.fetchTeamMembersFromDB())
            .then(() => dispatch.fetchClientsFromDB());

        return promise;
    },

    fetchUserFromDB(context, defaults: { locale: string }): Promise<void> {
        if (!ccApi.isLoggedIn) {
            return Promise.reject();
        }

        const { commit } = rootActionContext(context);

        return ccApi
            .getUser()
            .then(user => {
                if (!user && ccApi.userId && ccApi.userEmail) {
                    const user = new User(ccApi.userId, ccApi.userEmail);
                    user.locale = defaults.locale;
                    return ccApi.createUser(user);
                } else {
                    return user;
                }
            })
            .then(user => {
                commit.setCurrentUser(user);
                setColorSet(user?.colorScheme || defaultColors);
            })
            .catch(console.error);
    },

    fetchTeamsFromDB(context): Promise<void> {
        if (!ccApi.isLoggedIn) {
            return Promise.reject();
        }

        const { commit } = rootActionContext(context);

        return ccApi
            .getMyTeams().then(teams => commit.setTeams(teams))
            .catch(console.error);
    },

    fetchTeamMembersFromDB(context): Promise<void> {
        if (!ccApi.isLoggedIn) {
            return Promise.reject();
        }

        const { commit } = rootActionContext(context);

        return ccApi
            .getTeamMembers().then(members => commit.setTeamMembers(members))
            .catch(console.error);
    },

    fetchClientsFromDB(context): Promise<void> {
        if (!ccApi.isLoggedIn) {
            return Promise.reject();
        }

        const { commit, state } = rootActionContext(context);
        const activeTeam = state.currentUser?.activeTeam || "";
        const clientIds = state.teams.find(team => team._id?.toHexString() == activeTeam)?.clients || [];

        if (!activeTeam || !clientIds) {
            commit.setClients([]);
            return Promise.resolve();
        }

        commit.isLoadingClientList(true);
        return ccApi
            .getClients(clientIds)
            .then(clients => {
                clients.forEach(client =>
                    commit.calculateOccurrences(client)
                );
                commit.setClients(clients);
                commit.isLoadingClientList(false);
                return;
            })
            .catch(err => {
                console.error(`Failed: ${err}`);
                commit.isLoadingClientList(false);
                return Promise.reject();
            });
    },

    addClient(context, client: Client): Promise<Client> {
        const { state, dispatch } = rootActionContext(context);
        const user = state.currentUser;

        if (!user) {
            return Promise.reject();
        }

        return ccApi.createClient(client).then(client => {
            const clientId = client._id?.toHexString();
            const team = state.teams.find(team =>
                team._id?.toHexString() == user.activeTeam);

            if (!clientId) {
                return Promise.reject();
            }

            if (team) {
                return dispatch.saveTeam({
                    target: team,
                    changes: {
                        clients: team.clients.concat([clientId])
                    }
                });
            } else {
                const team = new Team(user.username, user.userId);
                team.clients = [clientId];
                return dispatch.addTeam(team);
            }
        })
            .then(() => dispatch.fetchClientsFromDB())
            .then(() => client);
    },

    saveClient(context, payload): Promise<void> {
        const { commit, getters } = rootActionContext(context);
        const client: Client | undefined =
            payload.client || getters.getClient(payload);

        if (client) {
            commit.calculateOccurrences(client);
            return ccApi
                .saveClient(client)
                .then(() => undefined)
                .catch(error => {
                    console.error(error);
                    if (payload.resolveOnError) {
                        return Promise.resolve();
                    } else {
                        return Promise.reject(error);
                    }
                });
        } else {
            if (payload.resolveOnError) {
                return Promise.resolve();
            } else {
                return Promise.reject("client not found");
            }
        }
    },

    deleteClient(context, client: Client): Promise<void> {
        const { state, dispatch } = rootActionContext(context);
        return ccApi
            .deleteClient(client)
            .then(() => {
                const clientId = client._id?.toHexString() || "";
                const teams = state.teams.filter(team => team.clients.includes(clientId));
                return Promise.all(
                    teams.map(team => dispatch.saveTeam({
                        target: team,
                        changes: {
                            clients: team.clients.filter(id => id != clientId)
                        }
                    }))
                );
            })
            .then(() => {
                return dispatch.fetchClientsFromDB();
            })
            .catch(err =>
                console.error(`Save current client failed with error: ${err}`)
            );
    },

    login(context, { email, password, locale }: { email: string; password: string; locale: string }): Promise<void> {
        const { dispatch } = rootActionContext(context);
        return ccApi.login(email, password).then(() => {
            return dispatch.fetchEssentialDataFromDB({ locale: locale });
        });
    },

    logout(context): Promise<void> {
        const { commit } = rootActionContext(context);
        return ccApi.logout().then(() => {
            commit.setCurrentUser(undefined);
            commit.setTeams([]);
            commit.setTeamMembers([]);
            commit.setClients([]);
            commit.isLoadingClientList(false);
            setColorSet(defaultColors);
            return Promise.resolve();
        });
    },

    saveCurrentUser(context, updater: (user: User) => void): Promise<User | void> {
        const { commit, state } = rootActionContext(context);

        if (state.currentUser) {
            commit.updateCurrentUser(updater);
            return ccApi
                .saveUser(state.currentUser)
                .catch(err =>
                    console.error(`Save current user failed with error: ${err}`)
                );
        } else {
            return Promise.resolve()
        }
    },

    addTeam(context, team: Team): Promise<Team> {
        const { commit, state, dispatch } = rootActionContext(context);

        return ccApi.createTeam(team)
            .then(team => {
                commit.setTeams(state.teams.concat([team]));
                return dispatch.saveCurrentUser(user => {
                    user.activeTeam = team._id?.toHexString() || user.activeTeam;
                });
            }).then(() => team);
    },

    saveTeam(context, payload: { target: Team, changes: Partial<Team> }): Promise<Team | void> {
        const { commit, state } = rootActionContext(context);

        if (state.currentUser) {
            commit.updateObject(payload);
            return ccApi
                .saveTeam(payload.target)
                .catch(err =>
                    console.error(`Saving team failed with error: ${err}`)
                );
        } else {
            return Promise.resolve()
        }
    },

    deleteTeam(context, team: Team): Promise<void> {
        const { dispatch, state } = rootActionContext(context);
        return ccApi
            .deleteTeam(team)
            .then(() => {
                return dispatch.fetchTeamsFromDB();
            })
            .then(() => {
                return dispatch.saveCurrentUser(user => {
                    user.activeTeam = state.teams[0]?._id?.toHexString() || "";
                })
            })
            .then(() => dispatch.fetchTeamMembersFromDB())
            .then(() => dispatch.fetchClientsFromDB());
    },

    addSamplesToDB(context): Promise<void> {
        const { state, dispatch } = rootActionContext(context);
        const samples = Client.fromObject(sampleData) as Client[];
        const userId = state.currentUser?.id;
        if (!userId) {
            return Promise.resolve();
        }

        return Promise.all(
            samples.map(client => {
                return dispatch.addClient(client);
            })
        )
            .then(() => {
                dispatch.fetchClientsFromDB().catch(() => 0);
            })
            .catch(err => console.error(`Failed to insert documents: ${err}`));
    },

    clearDB(context): Promise<void> {
        const { dispatch } = rootActionContext(context);
        return ccApi
            .deleteAllClients()
            .then(() => {
                dispatch.fetchClientsFromDB().catch(() => 0);
            })
            .catch(err => console.error(`Delete failed with error: ${err}`));
    }
});
