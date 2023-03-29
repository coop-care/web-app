<template>
  <component
    v-if="localizedComponent"
    :is="localizedComponent"
  />
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import BackofficeMixin, { BackofficeMixinInterface } from "src/mixins/BackofficeMixin";
import { defineAsyncComponent } from "vue";

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
    return this.matchingCountryCode(countryCodes, this.$store.direct.getters.countryCode);
  }
}

export default BackofficeReferral;
</script>
