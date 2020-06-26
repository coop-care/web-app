<template>
  <div class="row q-col-gutter-lg">
    <div class="col-12 col-md-9">
      <slot />
    </div>
    <div class="col-12 col-md-3">
      <problem-summary
        :params="$route.params"
        :problemRecord="problemRecord"
        :isSummary="true"
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
    problemRecord: ProblemRecord
  }
});

@Component({
  components: {
    ProblemSummary
  }
})
export default class ProblemSummaryContainer extends ProblemSummaryContainerProps {}
</script>
