
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
}
