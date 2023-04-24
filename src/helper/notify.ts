import { Notify } from "quasar";
import { i18n, errorMessage } from "src/boot/i18n";

export function notifyError(message?: string, caption?: string, top = true) {
    if (!message && !caption) {
        message = i18n.t("GenericError")
    }

    Notify.create({
        type: "negative",
        classes: "save-notification",
        badgePosition: "top-right",
        position: top ? "top" : "bottom",
        message,
        caption,
        timeout: 0,
        actions: [{
            icon: "close", 
            color: "white", 
            round: true, 
            // @ts-ignore (TS2322: Object literal may only specify known properties, and 'attrs' does not exist in type 'QNotifyAction')
            attrs: {"aria-label": i18n.t("OK")}
        }]
    })
}

export function notifySuccess(message?: string, caption?: string, timeout = 2000) {
    Notify.create({
        textColor: "positive",
        color: "white",
        icon: "done",
        classes: "no-shadow save-notification",
        badgeColor: "positive",
        badgePosition: "top-right",
        message,
        caption,
        timeout,
    })
}

export function notifySaveStatus(saveMethod: () => Promise<any>, label?: string, errorAtBottom = false) {
    const onError = (error: any) => {
        notifyError(
            label
                ? i18n.t("SaveErrorNotificationWithLabel", {label})
                : i18n.t("SaveErrorNotification"),
            errorMessage(error),
            !errorAtBottom
        )
    }

    try {
        return saveMethod()
            .then(() => 
                notifySuccess(
                    label
                        ? i18n.t("SaveNotificationWithLabel", {label})
                        : i18n.t("SaveNotification"),
                    undefined,
                    500
                )
            )
            .catch(onError);
    } catch(error) {
        onError(error);
    }
}
