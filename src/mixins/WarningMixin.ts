import { Vue, Component } from "vue-property-decorator";
import { sanitizeHTML } from "src/helper/utils";

@Component
export default class WarningMixin extends Vue {
    showWarning(message: string) {
        return this.$q.dialog({
            title: this.$t("warningTitle") as string,
            message: sanitizeHTML(message).replace(/\n/g, "<br>"),
            html: true,
            ok: {
                label: this.$t("yes"),
                rounded: true,
                color: "transparent",
                textColor: "primary"
            },
            cancel: {
                label: this.$t("no"),
                rounded: true,
                color: "transparent",
                textColor: "primary"
            },
            persistent: true
        });
    }
}
