import { EventBus } from "quasar"
import { boot } from "quasar/wrappers"

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $bus: EventBus;
    }
}

export type UpdateInfo = {
    installedVersion: string;
}
export type UpdateAvailableInfo = UpdateInfo & {
    availableVersion: string;
    downloadSize?: number;
    storeUrl?: string;
    downloadUrls?: string[];
}

const bus = new EventBus<{
  "did-change-locale": (locale: string) => void;
  "update-available": (updateInfo: UpdateAvailableInfo) => void;
  "update-unavailable": (updateInfo: UpdateInfo) => void;
  "new-client": () => void;
  "toggle-drawer": () => void;
  "open-drawer": () => void;
  "close-drawer": () => void;
  "did-move-client-to-team": () => void;
  "did-add-client-to-team": () => void;
  "did-remove-client-from-team": () => void;
  "did-archive-client": () => void;
  "did-unarchive-client": () => void;
  "did-delete-client": () => void;
  "did-debug": (value: any) => void;
}>();

export default boot(({ app }) => {
  // for Options API
  app.config.globalProperties.$bus = bus

  // for Composition API
  app.provide("bus", bus)
})

export { bus };
