
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
    get terminology() {
        return (this.$t("terminology") as unknown) as TerminologyWithMaps;
    }
    get isDisabled() {
        return !!this.client?.leftAt;
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
