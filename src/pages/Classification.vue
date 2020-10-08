<template>
  <editing-page-container
    :title="$t('editProblem')"
    :is-data-available="!!record"
    hide-default-footer
  >
    <problem-summary-container :problemRecord="record">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        header-nav
        animated
        flat
        vertical
        class="q-pa-none"
        header-class="text-subtitle1 text-primary"
        @before-transition="showWarning = false"
      >
        <q-step
          :name="1"
          :title="problemSelectionTitle"
          :caption="$t('stepCaption', {step: 1, stepCount: 2})"
          :prefix="1"
          :done="step > 1"
          :error="!!warnings.problemSelection && ((step > 1) || (step == 1 && showWarning ))"
          :header-nav="step > 1 || !warnings.problemSelection"
          active-color="classification"
        >
          <problem-selection
            @input="validate(warnings.problemSelection, nextStep)"
            class="q-mt-xs"
          />
          <warning
            v-model="showWarning"
            :messages="warnings.problemSelection"
          />
          <q-btn
            @click="validate(warnings.problemSelection, nextStep)"
            color="primary"
            rounded
            no-caps
            :outline="!!warnings.problemSelection"
            icon-right="fas fa-caret-right"
            :label="problemSelectionButtonLabel"
            class="q-mt-lg"
          />
        </q-step>
        <q-step
          :name="2"
          :title="$t('describeProblem')"
          :caption="$t('stepCaption', {step: 1, stepCount: 2})"
          :prefix="2"
          :done="step > 2"
          :error="!!warnings.problemClassification && ((step > 2) || (step == 2 && showWarning ))"
          :header-nav="step > 2 || !(warnings.problemSelection || warnings.problemClassification)"
          active-color="classification"
        >
          <problem-classification class="q-mt-xs" />
          <warning
            v-model="showWarning"
            :messages="warnings.problemClassification"
          />
          <q-btn
            v-if="step == 2"
            @click="validate(warnings.problemClassification, save)"
            color="primary"
            rounded
            no-caps
            :outline="!!warnings.problemClassification"
            icon-right="fas fa-caret-right"
            :label="doneButtonLabel"
            class="q-mt-lg"
          />
        </q-step>
      </q-stepper>
    </problem-summary-container>
  </editing-page-container>
</template>

<script lang="ts">
import Component from "vue-class-component";
import { QStepper } from "quasar";
import RecordValidator from "../mixins/RecordValidator";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import ProblemSelection from "components/ProblemSelection.vue";
import ProblemClassification from "components/ProblemClassification.vue";
import Warning from "components/Warning.vue";

@Component({
  components: {
    EditingPageContainer,
    ProblemSummaryContainer,
    ProblemSelection,
    ProblemClassification,
    Warning,
  },
})
export default class ClassificationPage extends RecordValidator {
  $refs!: { stepper: QStepper };
  step = 2;

  get problemSelectionTitle() {
    if (this.step < 2 || !this.record) {
      return this.$t("selectProblem");
    } else {
      const problem = this.$t(this.record.problem.title);
      return this.$t("selectedProblem", { problem: problem });
    }
  }
  get problemSelectionButtonLabel() {
    if (!this.showWarning) {
      return this.$t("editProblem");
    } else {
      return this.$t("editProblemAnyway");
    }
  }

  nextStep() {
    this.$refs.stepper.next();
  }
  save() {
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
