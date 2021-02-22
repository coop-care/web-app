import { defineGetters } from "direct-vuex";
import { store, StateInterface } from ".";
import { Client, ProblemRecord, Contact } from "../models";

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
            clientId: client._id?.toHexString() || "",
            problemId: client.problems[client.problems.length - 1].id
        };
    },

    userId: state => {
        return state.currentUser?.userId || "";
    },

    currentTeam: state => {
        const teamId = state.currentUser?.activeTeam;
        return state.teams.find(team => teamId && team._id?.equals(teamId));
    },

    relationshipLabels: state => {
        return [... new Set(
            Contact.relationshipTypes.concat(state.clients
                .flatMap(client => client.informalContacts)
                .flatMap(contact =>
                    contact.relationship ? [contact.relationship] : []
                )
            )
        )];
    },

    phoneLabels: state => {
        return [... new Set(
            Contact.phoneLabels.concat(state.clients
                .flatMap(client => client.informalContacts)
                .flatMap(contact => contact.phoneNumbers)
                .flatMap(item =>
                    item.label ? [item.label] : []
                )
            )
        )];
    },

    emailLabels: state => {
        return [... new Set(
            Contact.emailLabels.concat(state.clients
                .flatMap(client => client.informalContacts)
                .flatMap(contact => contact.emailAddresses)
                .flatMap(item =>
                    item.label ? [item.label] : []
                )
            )
        )];
    },

    addressLabels: state => {
        return [... new Set(
            Contact.postalLabels.concat(state.clients
                .flatMap(client => client.informalContacts)
                .flatMap(contact => contact.postalAddresses)
                .flatMap(item =>
                    item.label ? [item.label] : []
                )
            )
        )];
    },
});
