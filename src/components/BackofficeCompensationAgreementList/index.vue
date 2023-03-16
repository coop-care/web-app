<template>
  <component
    v-if="localizedComponent"
    :is="localizedComponent"
    @did-route="$emit('did-route')"
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

interface BackofficeCompensationAgreementList extends BackofficeMixinInterface {};

@Component({
  components,
  mixins: [BackofficeMixin],
  emits: ["did-route"]
})
class BackofficeCompensationAgreementList extends Vue {
  get localizedComponent() {
    return this.matchingCountryCode(countryCodes)
  }
}
export default BackofficeCompensationAgreementList;
</script>
