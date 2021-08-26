<template>
  <component
    v-if="localizedComponent"
    :is="localizedComponent"
  />
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import BackofficeMixin from "../../mixins/BackofficeMixin";

const components = {
  de: () => import("./de.vue"),
};

export const countryCodes = Object.keys(components);

@Component({
  components,
})
export default class BackofficeReferral extends BackofficeMixin {
  get localizedComponent() {
    return this.matchingCountryCode(countryCodes)
  }
}
</script>
