<template>
  <q-pull-to-refresh @refresh="refresh" :key="redrawKey">
    <slot />
  </q-pull-to-refresh>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class PullToRefreshControl extends Vue {
  redrawKey = Math.random();

  refresh(done: () => void) {
    this.$store.direct.dispatch
      .fetchEssentialDataFromDB({locale: this.$root.$i18n.locale, awaitAllResponses: true})
      .finally(() => {
        this.redrawKey = Math.random();
        this.$emit("refresh");
        done();
      });
  }
}
</script>
