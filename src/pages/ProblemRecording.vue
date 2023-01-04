<template>
  <editing-page-container
    :is-data-available="isDataAvailable"
    hide-default-header
    hide-default-footer
    class="width-md"
  >
      <div class="row justify-center">
        <q-btn
          @click="discardProblemRecord"
          color="primary"
          rounded
          no-caps
          flat
          icon="fas fa-undo-alt"
          :label="discardButtonLabel"
          class="icon-smaller"
        />
      </div>
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
          v-if="hasDiagnosisNames"
          :title="diagnosisTitle"
          :caption="$t('optionalStep', {step: firstStepPrefix + 0, stepCount: stepCount})"
          :prefix="firstStepPrefix + 0"
          :done="step > 1"
          :header-nav="step > 1"
        >
          <diagnosis-selection
            v-model="newRecord.tag"
            @input="nextStep"
            class="q-mt-xs"
          />
          <q-btn
            @click="nextStep"
            color="primary"
            rounded
            no-caps
            icon-right="fas fa-caret-right"
            :label="continueButtonLabel"
            class="q-mt-lg"
          />
        </q-step>
        <q-step
          :name="2"
          :title="problemSelectionTitle"
          :caption="$t('requiredStep', {step: firstStepPrefix + 1, stepCount: stepCount})"
          :prefix="firstStepPrefix + 1"
          :done="step > 2"
          :error="!!warnings.problemSelection && ((step > 2) || (step == 2 && showWarning ))"
          :header-nav="step > 2 || !warnings.problemSelection"
          active-color="classification"
        >
          <problem-selection
            :value="record || newRecord"
            @input="validate(warnings.problemSelection, createProblemAndContinue)"
            class="q-mt-xs"
          />
          <warning
            v-model="showWarning"
            :messages="warnings.problemSelection"
          />
          <q-btn
            @click="validate(warnings.problemSelection, createProblemAndContinue)"
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
          :name="3"
          :title="problemClassificationTitle"
          :caption="$t('requiredStep', {step: firstStepPrefix + 2, stepCount: stepCount})"
          :prefix="firstStepPrefix + 2"
          :done="step > 3"
          :error="!!warnings.problemClassification && ((step > 3) || (step == 3 && showWarning ))"
          :header-nav="step > 3 || !(warnings.problemSelection || warnings.problemClassification)"
          active-color="classification"
        >
          <problem-classification class="q-mt-xs" />
          <warning
            v-model="showWarning"
            :messages="warnings.problemClassification"
          />
          <q-btn
            v-if="isHighPriority"
            @click="validate(warnings.problemClassification, nextStep)"
            color="primary"
            rounded
            no-caps
            :outline="!!warnings.problemClassification"
            icon-right="fas fa-caret-right"
            :label="continueButtonLabel"
            class="q-mt-lg"
          />
          <q-btn
            v-else
            @click="validate(warnings.problemClassification, saveProblemRecord)"
            color="primary"
            rounded
            no-caps
            :outline="!!warnings.problemClassification"
            :label="doneButtonLabel"
            class="q-mt-lg"
          />
        </q-step>

        <q-step
          :name="4"
          v-if="isHighPriority"
          :title="ratingTitle"
          :caption="$t('recommendedStep', {step: firstStepPrefix + 3, stepCount: stepCount})"
          :prefix="firstStepPrefix + 3"
          :done="step > 4"
          :error="!!warnings.rating && ((step > 4) || (step == 4 && showWarning ))"
          :header-nav="step > 4 || !warnings.rating"
          active-color="outcome"
        >
          <problem-rating class="q-mt-xs" />
          <warning
            v-model="showWarning"
            :messages="warnings.rating"
          />
          <q-btn
            @click="validate(warnings.rating, nextStep)"
            color="primary"
            rounded
            no-caps
            :outline="!!warnings.rating"
            icon-right="fas fa-caret-right"
            :label="continueButtonLabel"
            class="q-mt-lg"
          />
        </q-step>

        <q-step
          :name="5"
          v-if="isHighPriority"
          :title="$t('planInterveneStep')"
          :caption="$t('recommendedStep', {step: firstStepPrefix + 4, stepCount: stepCount})"
          :prefix="firstStepPrefix + 4"
          icon="add_comment"
          :header-nav="step > 5 || !warnings.intervention"
          active-color="intervention"
        >
          <intervention-view class="q-mt-xs" />
          <warning
            v-model="showWarning"
            :messages="warnings.intervention"
          />
          <q-btn
            @click="validate(warnings.intervention, saveProblemRecord)"
            color="primary"
            rounded
            no-caps
            :outline="!!warnings.intervention"
            :label="doneButtonLabel"
            class="q-mt-lg"
          />
        </q-step>
      </q-stepper>
  </editing-page-container>
</template>

<style lang="sass">
@media (min-width: 1024px)
  .limit-page-width.width-md .row
    > .col-md-9
      width: 72%
    > .col-md-3
      width: 28%
.q-stepper__header--standard-labels .q-stepper__tab:first-child
  justify-content: flex-start !important
.q-stepper--vertical .q-stepper__tab
  padding-left: 4px
.q-stepper--vertical .q-stepper__step-inner
  padding-left: 40px
  padding-right: 0
</style>

<script lang="ts">
import { Component, Watch, Ref } from "vue-property-decorator";
import { QStepper } from "quasar";
import RecordValidator from "../mixins/RecordValidator";
import { ProblemRecord } from "../models";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import DiagnosisSelection from "components/DiagnosisSelection.vue";
import ProblemSelection from "components/ProblemSelection.vue";
import ProblemClassification from "components/ProblemClassification.vue";
import ProblemRating from "components/ProblemRating.vue";
import InterventionView from "components/InterventionV3.vue";
import Warning from "components/Warning.vue";

@Component({
  components: {
    EditingPageContainer,
    ProblemSummaryContainer,
    DiagnosisSelection,
    ProblemSelection,
    ProblemClassification,
    ProblemRating,
    InterventionView,
    Warning,
  }
})
export default class ProblemRecording extends RecordValidator {
  @Ref() readonly  stepper!: QStepper;
  step = 2;
  newRecord = new ProblemRecord();

  @Watch("step")
  onStepChanged(value: number) {
    this.$route.params.step = "" + value;
    void this.$router.replace({
      name: this.$route.name || undefined,
      params: this.$route.params,
    });
  }

  get isHighPriority() {
    return (this.record || this.newRecord).problem.isHighPriority;
  }
  get hasDiagnosisNames() {
    return Object.keys(this.$t("diagnosisNames")).length > 0;
  }
  get firstStepPrefix() {
    return this.hasDiagnosisNames ? 1 : 0;
  }
  get stepCount() {
    return this.firstStepPrefix + (this.isHighPriority ? 4 : 2);
  }
  get diagnosisTitle() {
    if (this.step < 2) {
      return this.$t("diagnosisSelectionTitle");
    } else {
      const diagnosis = this.$t(this.newRecord.diagnosisName);
      return this.$t("selectedDiagnosis", { diagnosis: diagnosis });
    }
  }
  get problemSelectionTitle() {
    if (this.step < 3 || !this.record) {
      return this.$t("selectProblem");
    } else {
      const problem = this.$t(this.record.problem.title);
      return this.$t("selectedProblem", { problem: problem });
    }
  }
  get problemClassificationTitle() {
    if (this.step < 4 || !this.record) {
      return this.$t("describeProblem");
    } else {
      const problem = this.record.problem;
      let title = this.$t(problem.severityLongTitle);

      if (problem.severityCode < 2 && !problem.details) {
        title += ": " + this.$t("noDescription");
      } else if (problem.severityCode == 2) {
        const symptomCount = problem.signsAndSymptoms.length;
        title += ": " + this.$tc("selectedSymptomsCount", symptomCount);
      }

      return title;
    }
  }
  get ratingTitle() {
    if (this.step < 5 || !this.record) {
      return this.$t("admissionRatingStep");
    } else {
      const outcome = this.record.outcomes[0];
      const observations = [
        outcome?.knowledge,
        outcome?.behaviour,
        outcome?.status,
      ].flatMap((rating, index) =>
        !!rating && rating.observation ? [[rating.observation, index]] : []
      );
      const title = this.$t("admissionRating") + ": ";

      if (observations.length) {
        const terminologyRatings = this.terminology.problemRatingScale.ratings;
        return (
          title +
          observations
            .map(
              ([observation, index]) =>
                terminologyRatings[index].scale[observation - 1].title
            )
            .join(", ")
        );
      } else {
        return title + this.$t("noRatingShort");
      }
    }
  }
  get problemSelectionButtonLabel() {
    if (!this.record && !this.showWarning) {
      return this.$t("problemAdmission");
    } else if (!!this.record && !this.showWarning) {
      return this.$t("editProblem");
    } else if (!this.record && this.showWarning) {
      return this.$t("problemAdmissionAnyway");
    } else {
      return this.$t("editProblemAnyway");
    }
  }
  get discardButtonLabel() {
    return this.$t("discardProblem")
  }
  get isDataAvailable() {
    return this.$route.params.problemId == "new" || !!this.record;
  }
  get temporaryRecord() {
    return this.newRecord;
  }

  nextStep() {
    this.stepper.next();
  }
  createProblem() {
    if (this.client && this.$route.params.problemId == "new") {
      this.$store.direct.commit.createProblemRecord({
        problemRecord: this.newRecord,
        ...this.$route.params,
      });
      this.$route.params.problemId = this.client.problems[
        this.client.problems.length - 1
      ].id;
    }
  }
  createProblemAndContinue() {
    this.createProblem();
    this.nextStep();
  }
  saveProblemRecord() {
    this.$store.direct.commit.saveNewProblemRecord(this.$route.params);
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.navigateToClient());
  }
  discardProblemRecord() {
    if (this.record) {
      const recordId = this.record.id;
      this.updateAndSave(this.client, {
        problems: this.client?.problems.filter(record => record.id != recordId)
      });
    }

    this.$router.back();
  }
  navigateToClient() {
    void this.$router.push({
      name: "clientReport", 
      params: {
        clientId: this.$route.params.clientId
      }
    });
  }

  created() {
    this.step =
      parseInt(this.$root.$route.params.step) ||
      (this.hasDiagnosisNames ? 1 : 2);
  }
}
</script>
