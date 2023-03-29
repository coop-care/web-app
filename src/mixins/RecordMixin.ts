
import { defineComponent } from "vue";
import { TerminologyWithMaps } from "src/helper/terminology";
import { debounce } from "src/helper/utils";
import { Client, ProblemRecord, Team, TeamMember } from "src/models";

export interface RecordMixinInterface {
    client?: Client;
    record?: ProblemRecord;
    teamMembers: Record<string, TeamMember>;
    teams: Team[];
    currentTeam?: Team;
    terminology: TerminologyWithMaps;
    isDisabled: boolean;
    isCurrentRoute(name: string, params: Record<string, string>): boolean;
    pushRoute(name: string, params?: Record<string, string>, query?: Record<string, string>): void;
    updateAndSave<T>(target: T, changes: Partial<T>): void;
    update<T>(target: T, changes: Partial<T>): void;
    saveClient(): Promise<void>;
    saveClientDelayed(): Promise<void>;
    clientCustomValue(label: string): any;
    saveClientCustomField(label: string, value: any, immediately?: boolean): void;
};

export default defineComponent({
    data() {
        return {
            // @ts-ignore
            saveClientDelayed: debounce(this.saveClient, 1000)
        }
    },

    computed: {
        client() {
            return this.$store.direct.getters.getClient(this.$route.params);
        },
        record() {
            return this.$store.direct.getters.getProblemRecordById(
                this.$route.params
            );
        },
        teamMembers() {
            return this.$store.direct.state.teamMembers;
        },
        teams() {
            return this.$store.direct.state.teams;
        },
        team() {
            return this.$store.direct.getters.currentTeam;
        },
        terminology() {
            return (this.$tm("terminology") as unknown) as TerminologyWithMaps;
        },
        isDisabled() {
            return !!this.client?.leftAt;
        },
    },

    methods: {
        isCurrentRoute(name: string, params: Record<string, string>) {
            const route = this.$route;
            return (name == route.name) &&
                (Object.keys(params).filter(key => params[key] != route.params[key]).length == 0);
        },
        pushRoute(name: string, params: Record<string, string> = {}, query: Record<string, string> = {}) {
            if (!this.isCurrentRoute(name, params)) {
                void this.$router.push({
                    name: name,
                    params: {
                        ...params,
                        clientId: this.$route.params.clientId
                    },
                    query: query
                });
            }
        },

        updateAndSave<T>(target: T, changes: Partial<T>) {
            this.update(target, changes);
            void this.saveClient();
        },
        update<T>(target: T, changes: Partial<T>) {
            if (target && changes) {
                this.$store.direct.commit.updateObject({
                    target: target,
                    changes: changes
                });
            }
        },
        saveClient() {
            if (this.client) {
                return this.$store.direct.dispatch.saveClient({
                    client: this.client
                });
            } else {
                return Promise.resolve();
            }
        },

        clientCustomValue(label: string) {
            return this.client?.customValue(label);
        },
        saveClientCustomField(label: string, value: any, immediately = true) {
            this.update(this.client, {
                customFields: this.client?.updatedCustomField(label, value)
            });
            immediately ? void this.saveClient() : void this.saveClientDelayed();
        }
    }
});
