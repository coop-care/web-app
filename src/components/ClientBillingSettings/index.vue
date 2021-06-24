<template>
  <component
    v-if="localizedComponent"
    :is="localizedComponent"
  />
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

const components = {
  de: () => import("./de.vue"),
};

export const countryCodes = Object.keys(components);

@Component({
  components,
})
export default class ClientBillingSettings extends Vue {
  get localizedComponent() {
    const countryCode = this.$store.direct.getters.countryCode || "default";
    return countryCodes.includes(countryCode)
      ? countryCode
      : "";
  }
}
</script>