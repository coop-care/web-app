<template>
  <q-page
    padding
    class="limit-page-width width-md"
  >
    <div v-if="$route.params.problemId != 'new' && !record">
      <loading v-if="$store.direct.state.isLoadingClientList" />

      <central-message
        v-else-if="!$store.direct.state.isLoadingClientList"
        :message="$t('clientNotFound')"
      />
    </div>

    <div v-else>
      <problem-summary-container>
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
            :error="!!problemSelectionValidationError && ((step > 2) || (step == 2 && showWarning ))"
            :header-nav="step > 2 || !problemSelectionValidationError"
            active-color="classification"
          >
            <problem-selection
              @input="didSelectProblemCode"
              class="q-mt-xs"
            />
            <warning
              v-model="showWarning"
              :messages="problemSelectionValidationError"
            />
            <q-btn
              @click="validate(problemSelectionValidationError, createProblemAndContinue)"
              color="primary"
              rounded
              no-caps
              :outline="!!problemSelectionValidationError"
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
            :error="!!problemClassificationValidationError && ((step > 3) || (step == 3 && showWarning ))"
            :header-nav="step > 3 || !problemClassificationValidationError"
            active-color="classification"
          >
            <problem-classification class="q-mt-xs" />
            <warning
              v-model="showWarning"
              :messages="problemClassificationValidationError"
            />
            <q-btn
              v-if="isHighPriority"
              @click="validate(problemClassificationValidationError, nextStep)"
              color="primary"
              rounded
              no-caps
              :outline="!!problemClassificationValidationError"
              icon-right="fas fa-caret-right"
              :label="continueButtonLabel"
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
            :error="!!ratingValidationError && ((step > 4) || (step == 4 && showWarning ))"
            :header-nav="step > 4 || !ratingValidationError"
            active-color="outcome"
          >
            <problem-rating class="q-mt-xs" />
            <warning
              v-model="showWarning"
              :messages="ratingValidationError"
            />
            <q-btn
              @click="validate(ratingValidationError, nextStep)"
              color="primary"
              rounded
              no-caps
              :outline="!!ratingValidationError"
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
            :header-nav="step > 5 || !interventionValidationError"
            active-color="intervention"
          >
            <intervention-view class="q-mt-xs" />
            <warning
              v-model="showWarning"
              :messages="interventionValidationError"
            />
          </q-step>
        </q-stepper>
      </problem-summary-container>

      <q-btn
        v-if="step == stepCount"
        @click="validate(isHighPriority ? interventionValidationError : problemClassificationValidationError, saveProblemRecord)"
        color="primary"
        rounded
        no-caps
        :outline="(isHighPriority && !!interventionValidationError) || (!isHighPriority && !!problemClassificationValidationError)"
        :label="doneButtonLabel"
        class="q-mt-lg problem-record-done-button"
      />
    </div>
  </q-page>
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
.problem-record-done-button
  margin-left: 36px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QStepper } from "quasar";
import { TranslateResult } from "vue-i18n";
import { Terminology } from "../helper/terminology";
import { ProblemRecord } from "../models";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import DiagnosisSelection from "components/DiagnosisSelection.vue";
import ProblemSelection from "components/ProblemSelection.vue";
import ProblemClassification from "components/ProblemClassification.vue";
import ProblemRating from "components/ProblemRating.vue";
import InterventionView from "components/InterventionV3.vue";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import Warning from "components/Warning.vue";

@Component({
  components: {
    ProblemSummaryContainer,
    DiagnosisSelection,
    ProblemSelection,
    ProblemClassification,
    ProblemRating,
    InterventionView,
    Loading,
    CentralMessage,
    Warning,
  },
  watch: {
    step(this: ProblemRecording, value: number) {
      this.$route.params.step = "" + value;
      this.$router.replace({
        name: this.$route.name || undefined,
        params: this.$route.params,
      });
    },
  },
})
export default class ProblemRecording extends Vue {
  $refs!: { stepper: QStepper };
  step = 2;
  newRecord = new ProblemRecord();
  showWarning = false;
  lastWarning = "";

  get isHighPriority() {
    if (this.record) {
      return this.record.problem.isHighPriority;
    } else {
      return true;
    }
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
  get problemSelectionValidationError() {
    const code = (this.record || this.newRecord).problem.code;

    if (!code) {
      return this.$t("noProblemWarning") as string;
    } else if (
      this.client?.problems.find(
        (record) =>
          code == record.problem.code &&
          record.id != this.record?.id &&
          !record.resolvedAt
      )
    ) {
      return this.$t("duplicateProblemWarning") as string;
    } else {
      return "";
    }
  }
  get problemClassificationValidationError() {
    const problem = this.record?.problem;
    const warnings: TranslateResult[] = [];

    if (
      problem &&
      problem.code &&
      problem.severityCode == 2 &&
      problem.signsAndSymptomsCodes.length == 0
    ) {
      warnings.push(this.$t("noSymptomsWarning"));
    } else if (problem && problem.severityCode == 1 && !problem.details) {
      warnings.push(this.$t("noPotentialRiskFactorsWarning"));
    } else if (problem && problem.severityCode == 0 && !problem.details) {
      warnings.push(this.$t("noClientWishForHealthPromotionWarning"));
    }

    if (problem && !problem.isHighPriority && !problem.priorityDetails) {
      warnings.push(this.$t("noLowPriorityDetailsWarning"));
    }

    return warnings.join("\n");
  }
  get ratingValidationError() {
    const outcome = this.record?.outcomes[0];
    const warnings: TranslateResult[] = [];

    if (!outcome || outcome.knowledge.observation == 0) {
      warnings.push(this.$t("noKnowledgeRatingWarning"));
    }
    if (
      outcome &&
      outcome.knowledge.expectation &&
      outcome.knowledge.observation > outcome.knowledge.expectation
    ) {
      warnings.push(this.$t("exceedingKnowledgeRatingWarning"));
    }

    if (!outcome || outcome.behaviour.observation == 0) {
      warnings.push(this.$t("noBehaviourRatingWarning"));
    }
    if (
      outcome &&
      outcome.behaviour.expectation &&
      outcome.behaviour.observation > outcome.behaviour.expectation
    ) {
      warnings.push(this.$t("exceedingBehaviourRatingWarning"));
    }

    if (!outcome || outcome.status.observation == 0) {
      warnings.push(this.$t("noStatusRatingWarning"));
    }
    if (
      outcome &&
      outcome.status.expectation &&
      outcome.status.observation > outcome.status.expectation
    ) {
      warnings.push(this.$t("exceedingStatusRatingWarning"));
    }

    if (
      outcome &&
      outcome.knowledge.observation == 5 &&
      outcome.behaviour.observation == 5 &&
      outcome.status.observation == 5
    ) {
      warnings.push(this.$t("unimprovableRatingsWarning"));
    }

    return warnings.join("\n");
  }
  get interventionValidationError() {
    const interventions = this.record?.interventions || [];
    const noCategoryCount = interventions.filter(
      (intervention) => !intervention.categoryCode
    ).length;
    const noTargetCount = interventions.filter(
      (intervention) => !intervention.targetCode
    ).length;
    const noDetailsCount = interventions.filter(
      (intervention) => !intervention.details
    ).length;
    const warnings: TranslateResult[] = [];

    if (interventions.length == 0) {
      warnings.push(this.$t("noInterventionsWarning"));
    }
    if (noCategoryCount) {
      warnings.push(this.$tc("noInterventionCategoryWarning", noCategoryCount));
    }
    if (noTargetCount) {
      warnings.push(this.$tc("noInterventionTargetWarning", noTargetCount));
    }
    if (noDetailsCount) {
      warnings.push(this.$tc("noInterventionDetailsWarning", noDetailsCount));
    }

    return warnings.join("\n");
  }
  get continueButtonLabel() {
    return !this.showWarning ? this.$t("continue") : this.$t("continueAnyway");
  }
  get doneButtonLabel() {
    return !this.showWarning ? this.$t("done") : this.$t("finishAnyway");
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
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }

  validate(validationErrors: string, next: () => void) {
    if (this.showWarning && this.lastWarning.includes(validationErrors)) {
      this.showWarning = false;
      next();
    } else if (validationErrors) {
      this.showWarning = true;
      this.lastWarning = validationErrors;
    } else {
      next();
    }
  }
  nextStep() {
    this.$refs.stepper.next();
  }
  didSelectProblemCode(value: string) {
    if (!this.record) {
      this.newRecord.problem.code = value;
    }
    this.createProblem();
    this.validate(this.problemSelectionValidationError, this.nextStep);
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
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }

  created() {
    this.step =
      parseInt(this.$root.$route.params.step) ||
      (this.hasDiagnosisNames ? 1 : 2);
  }
}
</script>
