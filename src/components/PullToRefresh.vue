<template>
  <q-pull-to-refresh @refresh="refresh">
    <slot />
  </q-pull-to-refresh>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class PullToRefreshControl extends Vue {
  refresh(done: () => void) {
    this.$store.direct.dispatch
      .fetchEssentialDataFromDB({locale: this.$root.$i18n.locale})
      .finally(done);
  }
}
</script>
