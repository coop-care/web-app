<template>
  <div class="row q-col-gutter-lg">
    <div class="col-12 col-md-9">
      <slot />
    </div>
    <div class="col-12 col-md-3">
      <problem-summary
        :params="$route.params"
        :problemRecord="problemRecord"
        :isExpandable="false"
        :style="style"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";
import ProblemSummary from "../components/ProblemSummary.vue";
import { ProblemRecord } from "../models/problemRecord";

@Component({
  components: {
    ProblemSummary,
  },
})
export default class ProblemSummaryContainer extends Vue {
  @Prop({ type: Object }) readonly problemRecord: ProblemRecord | undefined;

  get style() {
    const style = "transition: .3s all ease; ";
    if (this.$q.screen.gt.sm) {
      const step = parseInt(this.$route.params.step as string || "1");
      const margin = (step - 1) * 48;
      return style + "margin-top: " + margin + "px";
    } else {
      return style + "margin-top: 0";
    }
  }
}
</script>
