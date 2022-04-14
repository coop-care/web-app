import { ObjectID } from "bson";
import { defineGetters } from "direct-vuex";
import { store, StateInterface } from ".";
import { Client, ProblemRecord, Contact } from "../models";
import { ccApi } from "src/api/apiProvider";
import DemoApi from "src/api/demo";
import { Platform } from "quasar";

const currentTeam = (state: StateInterface) => {
    const teamId = state.currentUser?.activeTeam;
    return state.teams.find(team => teamId && team._id?.equals(teamId));
};

const currentBackoffice = (state: StateInterface) => {
    const backofficeId = currentTeam(state)?.backoffice;
    return state.backoffices.find(item => backofficeId && item.id == backofficeId);
};

const countryCode = (state: StateInterface) => {
    return currentBackoffice(state)?.countryCode.toLowerCase() || "";
};

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

    currentTeam,
    currentBackoffice,
    countryCode,

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

    professionLabels: state => {
        return [... new Set(
            Contact.professionTypes.concat(state.clients
                .flatMap(client => client.formalContacts)
                .flatMap(contact =>
                    contact.profession ? [contact.profession] : []
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

    referenceCountForFormalContact: state => (contactId: ObjectID) =>
        state.clients.flatMap(client => client.formalContacts.filter(
            contact => contact.id.equals(contactId)
        )).length,

    formalContacts: state =>
        Object.values(
            state.clients.reduce((map, client) => {
                client.formalContacts.forEach(contact =>
                    map[contact.id.toHexString()] = contact
                );
                return map;
            }, {} as Record<string, Contact>)
        ),

    appVersion: () => process.env.APP_VERSION || "0",

    appBuild: () => process.env.APP_BUILD || "0",

    appPlatform: () => {
        if (Platform.is.cordova) {
            if (Platform.is.ios) {
                return "ios";
            } else if (Platform.is.android) {
                return "android";
            }
        } else if (Platform.is.electron) {
            return Platform.is.platform; // e.g. "mac", "win", "linux"
        }

        return "";
    },

    isDemo: () => ccApi.constructor == DemoApi,

    license: () => !process.env.USE_FALLBACK_LICENSE ? "AGPL" : "",
});
