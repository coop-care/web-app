import { defineGetters } from "direct-vuex";
import { store, StateInterface } from ".";
import { Client } from "../models/client";
import { ProblemRecord } from "../models/problemRecord";

export default defineGetters<StateInterface>()({
    getClient: state => (payload: any): Client | undefined => {
        if (payload.clientId) {
            return state.clients.find(
                client => client._id?.equals(payload.clientId) || false
            );
        } else {
            return;
        }
    },

    getProblemRecordById: () => (payload: any): ProblemRecord | undefined => {
        return store.getters
            .getClient(payload)
            ?.findProblemRecord(payload.problemId);
    },

    getRouteParamsForLatestProblem: () => (payload: any): any => {
        const client = store.getters.getClient(payload);
        if (!client) {
            return {};
        }

        return {
            clientId: client._id,
            problemId: client.problems[client.problems.length - 1].id
        };
    },

    userId: state => {
        return state.currentUser?.userId || "";
    }
});
