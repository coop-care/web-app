<template>
  <editing-page-container
    :title="$t('newRating')"
    :is-data-available="!!record"
    hide-default-footer
  >
      <problem-rating />
      <warning
        v-model="showWarning"
        :messages="warnings.rating"
      />
      <q-btn
        @click="validate(warnings.rating, save)"
        color="primary"
        rounded
        no-caps
        :outline="!!warnings.rating"
        icon-right="fas fa-caret-right"
        :label="doneButtonLabel"
        class="q-mt-lg"
      />
  </editing-page-container>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import RecordValidator from "../mixins/RecordValidator";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import ProblemRating from "components/ProblemRating.vue";
import Warning from "components/Warning.vue";
import { Outcome } from "../models/outcome";

@Component({
  components: {
    ProblemSummaryContainer,
    ProblemRating,
    EditingPageContainer,
    Warning,
  },
})
export default class Rating extends RecordValidator {
  save() {
    const changes: Partial<Outcome> = {
      createdAt: new Date(),
      user: this.$store.direct.getters.userId,
    };
    this.$store.direct.commit.updateNewOutcome({
      changes: changes,
      ...this.$route.params,
    });
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
