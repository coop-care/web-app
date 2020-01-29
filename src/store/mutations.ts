import { createMutations } from "direct-vuex";
import { store, StoreState } from ".";
import { Client } from "../models/client";
import { ProblemRecord } from "../models/problemRecord";
import { Outcome } from "../models/outcome";
import { Rating } from "src/models/rating";

export default createMutations<StoreState>()({
    setSelectedClient(state, client: Client | undefined) {
        state.selectedClientId = client?._id;
    },

    replaceClientInList(state, client: Client) {
        state.clients = state.clients.map(current => {
            if (current.equals(client)) {
                return client;
            } else {
                return current;
            }
        });
    },

    setClients(state, clients: Client[]) {
        state.clients = clients;
    },

    isLoadingClient(state, isLoading: boolean) {
        state.isLoadingClient = isLoading;
    },

    isLoadingClientList(state, isLoading: boolean) {
        state.isLoadingClientList = isLoading;
    },

    archiveClient(state, client: Client) {
        client.leftAt = new Date();
    },

    unarchiveClient(state, client: Client) {
        client.leftAt = undefined;
    },

    createProblemRecord(state, payload) {
        store.getters.getClient(payload)?.problems.push(new ProblemRecord());
    },

    updateObject(
        state,
        { target, changes }: { target: any; changes: { [key: string]: any } }
    ) {
        Object.assign(target, changes);
    },

    prioritizeProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        const problemRecord = client?.findProblemRecord(payload.problemId);
        if (!problemRecord) {
            return;
        }

        client?.problems.push(problemRecord.prioritizedClone());
        problemRecord.resolvedAt = new Date();
    },

    dismissProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        const problemRecord = client?.findProblemRecord(payload.problemId);
        if (!client || !problemRecord || problemRecord.resolvedAt) {
            return;
        }

        problemRecord.resolvedAt = new Date();
        // trigger change detection on array
        client.problems = client.problems.concat([]);
    },

    deleteDraftProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        if (!client) {
            return;
        }
        client.problems = client.problems.filter(
            (problemRecord: ProblemRecord) => {
                return (
                    problemRecord.createdAt ||
                    problemRecord.id != payload.problemId
                );
            }
        );
    },

    updateNewOutcome(state, payload) {
        const problemRecord = store.getters.getProblemRecordById(payload);
        if (!problemRecord) {
            return;
        }

        let target: Outcome | Rating = problemRecord.editableOutcome;

        if (payload.ratingType) {
            target = (target as any)[payload.ratingType];
        }

        Object.assign(target, payload.changes);
    },

    saveNewProblemRecord(state, payload) {
        const problemRecord = store.getters.getProblemRecordById(payload);
        if (!problemRecord) {
            return;
        }

        const now = new Date();
        problemRecord.createdAt = now;
        (problemRecord.outcomes[0] || {}).createdAt = now;
        problemRecord.interventions.forEach(intervention => {
            intervention.startedAt = now;
        });
    }
});
