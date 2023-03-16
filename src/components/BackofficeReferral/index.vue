<template>
  <component
    v-if="localizedComponent"
    :is="localizedComponent"
  />
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";
import { Component, Vue } from "vue-facing-decorator";
import BackofficeMixin, { BackofficeMixinInterface } from "../../mixins/BackofficeMixin";

const components = {
  de: defineAsyncComponent(() => import("./de.vue")),
};

export const countryCodes = Object.keys(components);

interface BackofficeReferral extends BackofficeMixinInterface {};

@Component({
  components,
  mixins: [BackofficeMixin]
})
class BackofficeReferral extends Vue {
  get localizedComponent() {
    return this.matchingCountryCode(countryCodes)
  }
}

export default BackofficeReferral;
</script>
