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
import Vue from "vue";
import Component from "vue-class-component";
import ProblemSummary from "../components/ProblemSummary.vue";
import { ProblemRecord } from "../models/problemRecord";

const ProblemSummaryContainerProps = Vue.extend({
  props: {
    problemRecord: ProblemRecord,
  },
});

@Component({
  components: {
    ProblemSummary,
  },
})
export default class ProblemSummaryContainer extends ProblemSummaryContainerProps {
  get style() {
    const style = "transition: .3s all ease; ";
    if (this.$q.screen.gt.sm) {
      const step = parseInt(this.$route.params.step || "1");
      const margin = (step - 1) * 48;
      return style + "margin-top: " + margin + "px";
    } else {
      return style + "margin-top: 0";
    }
  }
}
</script>
