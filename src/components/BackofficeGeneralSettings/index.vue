<template>
  <component
    v-if="localizedComponent"
    :is="localizedComponent"
    :backoffice="backoffice"
  />
</template>

<script lang="ts">
import { BackOffice } from "src/models";
import { defineAsyncComponent } from "vue";
import { Vue, Component, Prop } from "vue-facing-decorator";

const components = {
  de: defineAsyncComponent(() => import("./de.vue")),
};

export const countryCodes = Object.keys(components);

@Component({
  components,
})
export default class BackOfficeSettings extends Vue {
  @Prop({type: Object, required: true}) readonly backoffice!: BackOffice;

  get localizedComponent() {
    const countryCode = this.backoffice.countryCode.toLowerCase() || "default";
    return countryCodes.includes(countryCode)
      ? countryCode
      : "";
  }
}
</script>