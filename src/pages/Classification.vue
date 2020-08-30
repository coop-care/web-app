<template>
  <editing-page-container
    :title="$t('stateProblemStep')"
    :is-data-available="!!record"
    @cancel="$router.back()"
    @save="save"
  >
    <problem-summary-container :problemRecord="record">
      <problem-classification />
    </problem-summary-container>
  </editing-page-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import ProblemClassification from "components/ProblemClassification.vue";

@Component({
  components: {
    ProblemSummaryContainer,
    ProblemClassification,
    EditingPageContainer,
  },
})
export default class ClassificationPage extends Vue {
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }

  save() {
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
