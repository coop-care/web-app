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
import { Vue, Component, Prop } from "vue-facing-decorator";

@Component({
  emits: ["refresh"]
})
export default class PullToRefreshControl extends Vue {
  @Prop({ type: Boolean }) readonly disable!: boolean;
  
  redrawKey = Math.random();

  refresh(done: () => void) {
    this.$store.direct.dispatch
      .fetchEssentialDataFromDB({locale: this.$i18n.locale, awaitAllResponses: true})
      .finally(() => {
        this.redrawKey = Math.random();
        this.$emit("refresh");
        done();
      });
  }
}
</script>
