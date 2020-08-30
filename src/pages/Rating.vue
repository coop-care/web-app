<template>
  <editing-page-container
    :title="$t('newRating')"
    :is-data-available="!!record"
    @cancel="$router.back()"
    @save="save"
  >
    <problem-summary-container :problemRecord="record">
      <problem-rating />
    </problem-summary-container>
  </editing-page-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import ProblemRating from "components/ProblemRating.vue";
import { Outcome } from "../models/outcome";

@Component({
  components: {
    ProblemSummaryContainer,
    ProblemRating,
    EditingPageContainer,
  },
})
export default class Rating extends Vue {
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }

  save() {
    const changes: Partial<Outcome> = {
      createdAt: new Date(),
      user: this.$store.direct.getters.signature,
    };
    this.$store.direct.commit.updateNewOutcome({
      changes: changes,
      ...this.$route.params,
    });
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
