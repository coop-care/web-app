import { defineComponent } from "vue";
import { sanitizeHTML } from "src/helper/utils";
import { DialogChainObject } from "quasar";

export interface WarningMixinInterface {
  showWarning(message: string, title?: string): DialogChainObject;
};

export default defineComponent({
    methods: {
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
});
