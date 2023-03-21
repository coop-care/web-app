import { EventBus } from "quasar"
import { boot } from "quasar/wrappers"

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $bus: EventBus;
    }
}

const bus = new EventBus();

export default boot(({ app }) => {
  // for Options API
  app.config.globalProperties.$bus = bus

  // for Composition API
  app.provide("bus", bus)
})

export { bus };
