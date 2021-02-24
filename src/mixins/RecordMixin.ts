
import { Vue, Component } from "vue-property-decorator";
import { TerminologyWithMaps } from "../helper/terminology";

@Component
export default class RecordMixin extends Vue {
    get client() {
        return this.$store.direct.getters.getClient(this.$route.params);
    }
    get record() {
        return this.$store.direct.getters.getProblemRecordById(
            this.$route.params
        );
    }
    get teamMembers() {
        return this.$store.direct.state.teamMembers;
    }
    get teams() {
        return this.$store.direct.state.teams;
    }
    get team() {
        return this.$store.direct.getters.currentTeam;
    }
    get terminology() {
        return (this.$t("terminology") as unknown) as TerminologyWithMaps;
    }
    get isDisabled() {
        return !!this.client?.leftAt;
    }

    isCurrentRoute(name: string, params: Record<string, string>) {
        const route = this.$route;
        return (name == route.name) &&
            (Object.keys(params).filter(key => params[key] != route.params[key]).length == 0);
    }
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
    }

    updateAndSave<T>(target: T, changes: Partial<T>) {
        this.update(target, changes);
        void this.saveClient();
    }
    update<T>(target: T, changes: Partial<T>) {
        if (target && changes) {
            this.$store.direct.commit.updateObject({
                target: target,
                changes: changes
            });
        }
    }
    saveClient() {
        if (this.client) {
            return this.$store.direct.dispatch.saveClient({
                client: this.client
            });
        } else {
            return Promise.resolve();
        }
    }
}
