import { Vue, Component } from "vue-property-decorator";
import { sanitizeHTML } from "src/helper/utils";

@Component
export default class WarningMixin extends Vue {
    showWarning(message: string, title?: string) {
        return this.$q.dialog({
            title: title ?? this.$t("warningTitle") as string,
            message: sanitizeHTML(message).replace(/\n/g, "<br>"),
            html: true,
            class: "warning-dialog",
            ok: {
                label: this.$t("yes"),
                rounded: true,
                outline: true,
            },
            cancel: {
                label: this.$t("no"),
                rounded: true,
                outline: true,
            },
            persistent: true
        });
    }
}
