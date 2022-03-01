<template>
  <q-pull-to-refresh
    @refresh="refresh"
    :key="redrawKey"
    :disable="disable"
  >
    <slot />
  </q-pull-to-refresh>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class PullToRefreshControl extends Vue {
  @Prop(Boolean) readonly disable!: boolean;
  
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
