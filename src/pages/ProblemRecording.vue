<template>
  <editing-sheet
    ref="editingSheet"
    :title="title"
    :is-data-available="isDataAvailable"
    :paramsToRemoveOnClose="['problemId', 'step']"
    :hasPendingChanges="hasPendingChanges"
  >
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
            v-model="editableRecord.tag"
            @input="nextStep"
            class="q-mt-xs"
          />
          <div class="q-mt-lg row justify-center">
            <q-btn
              @click="nextStep"
              color="primary"
              rounded
              unelevated
              no-caps
              :outline="!!selectionWarnings"
              icon-right="fas fa-caret-right"
              :label="continueButtonLabel"
              class="done-button"
            />
          </div>
        </q-step>
        <q-step
          :name="2"
          :title="problemSelectionTitle"
          :caption="$t('requiredStep', {step: firstStepPrefix + 1, stepCount: stepCount})"
          :prefix="firstStepPrefix + 1"
          :done="step > 2"
          :error="!!selectionWarnings && ((step > 2) || (step == 2 && showWarning ))"
          :header-nav="step > 2 || !selectionWarnings"
          active-color="classification"
        >
          <problem-selection
            v-model="editableRecord.problem"
            @input="validate(selectionWarnings, nextStep)"
            class="q-mt-xs"
          />
          <warning
            v-model="showWarning"
            :messages="selectionWarnings"
          />
          <div class="q-mt-lg row justify-center">
            <q-btn
              @click="validate(selectionWarnings, nextStep)"
              color="primary"
              rounded
              unelevated
              no-caps
              :outline="!!selectionWarnings"
              :disable="!editableRecord.problem.code"
              icon-right="fas fa-caret-right"
              :label="problemSelectionButtonLabel"
              class="done-button"
            />
          </div>
        </q-step>
        <q-step
          :name="3"
          :title="problemClassificationTitle"
          :caption="$t('requiredStep', {step: firstStepPrefix + 2, stepCount: stepCount})"
          :prefix="firstStepPrefix + 2"
          :done="step > 3"
          :error="!!classificationWarnings && ((step > 3) || (step == 3 && showWarning ))"
          :header-nav="step > 3 || !(selectionWarnings || classificationWarnings)"
          active-color="classification"
        >
          <problem-classification
            v-model="editableRecord.problem"
            :activeInterventionsAvailable="hasActiveInterventions"
            :edit-mode="!isNewProblem"
            class="q-mt-xs"
          />
          <warning
            v-model="showWarning"
            :messages="classificationWarnings"
          />
          <div class="q-mt-lg row justify-center">
            <q-btn
              v-if="isHighPriority"
              @click="validate(classificationWarnings, nextStep)"
              color="primary"
              rounded
              unelevated
              no-caps
              :outline="!!classificationWarnings"
              icon-right="fas fa-caret-right"
              :label="continueButtonLabel"
              class="done-button"
            />
            <q-btn
              v-else
              @click="validate(classificationWarnings, saveProblemRecord)"
              color="primary"
              rounded
              unelevated
              no-caps
              :outline="!!classificationWarnings"
              :label="isNewProblem ? addButtonLabel : doneButtonLabel"
              class="done-button"
            />
          </div>
        </q-step>

        <q-step
          :name="4"
          v-if="isHighPriority"
          :title="ratingTitle"
          :caption="$t('recommendedStep', {step: firstStepPrefix + 3, stepCount: stepCount})"
          :prefix="firstStepPrefix + 3"
          :done="step > 4"
          :error="!!ratingWarnings(editableOutcome) && ((step > 4) || (step == 4 && showWarning ))"
          :header-nav="step > 4 || !ratingWarnings(editableOutcome)"
          active-color="outcome"
        >
          <problem-rating
            v-model="editableOutcome"
            :rating-reminder="editableRecord.ratingReminder"
            @change:rating-reminder="updateRatingReminder"
            class="q-mt-xs"
          />
          <warning
            v-model="showWarning"
            :messages="ratingWarnings(editableOutcome)"
          />
          <div class="q-mt-lg row justify-center">
            <q-btn
              @click="validate(ratingWarnings(editableOutcome), nextStep)"
              color="primary"
              rounded
              unelevated
              no-caps
              :outline="!!ratingWarnings(editableOutcome)"
              icon-right="fas fa-caret-right"
              :label="continueButtonLabel"
              class="done-button"
            />
          </div>
        </q-step>

        <q-step
          :name="5"
          v-if="isHighPriority"
          :title="$t('planInterveneStep')"
          :caption="$t('recommendedStep', {step: firstStepPrefix + 4, stepCount: stepCount})"
          :prefix="firstStepPrefix + 4"
          icon="add_comment"
          :header-nav="step > 5 || !interventionListWarnings(editableRecord.interventions)"
          active-color="intervention"
        >
          <intervention-view
            :value="editableRecord.interventions"
            @input="editableRecord.interventions = $event"
            :problemTitle="$t(editableRecord.problem.title)"
            class="q-mt-xs"
          />
          <warning
            v-model="showWarning"
            :messages="interventionListWarnings(editableRecord.interventions)"
          />
          <div class="q-mt-lg row justify-center">
            <q-btn
              @click="validate(interventionListWarnings(editableRecord.interventions), saveProblemRecord)"
              color="primary"
              rounded
              unelevated
              no-caps
              :outline="!!interventionListWarnings(editableRecord.interventions)"
              :label="isNewProblem ? addButtonLabel : doneButtonLabel"
              class="done-button"
            />
          </div>
        </q-step>
      </q-stepper>
  </editing-sheet>
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
import { Outcome, ProblemRecord, RatingReminder } from "../models";
import EditingSheet from "../components/EditingSheet.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import DiagnosisSelection from "components/DiagnosisSelection.vue";
import ProblemSelection from "components/ProblemSelection.vue";
import ProblemClassification from "components/ProblemClassification.vue";
import ProblemRating from "components/ProblemRating.vue";
import InterventionView from "components/InterventionV3.vue";
import Warning from "components/Warning.vue";

@Component({
  components: {
    EditingSheet,
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
  @Ref() readonly stepper!: QStepper;
  @Ref() readonly editingSheet!: EditingSheet;
  step = 2;
  editableRecord = this.record?.clone() || new ProblemRecord();
  originalRecord = this.editableRecord.toJSON();
  ratingReminderChanges: Partial<RatingReminder> = {};

  @Watch("step")
  onStepChanged(value: number) {
    if (value > 2 && !this.editableRecord.problem.code) {
      this.step = 2;
      return;
    }

    const params = {...this.$route.params, step: "" + value};

    if (JSON.stringify(params) != JSON.stringify(this.$route.params)) {
      void this.$router.replace({
        name: this.$route.name || undefined,
        params: {...this.$route.params, step: "" + value},
      });
    }
  }

  get title() {
    return [
      this.client?.contact.name,
      !this.isNewProblem
        ? this.$t(this.editableRecord.problem.title) 
        : this.$t("problemAdmission")
    ].filter(Boolean).join(": ")
  }
  get isNewProblem() {
    return !this.$route.params.problemId;
  }
  get isHighPriority() {
    return this.editableRecord.problem.isHighPriority;
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
      const diagnosis = this.$t(this.editableRecord.diagnosisName);
      return this.$t("selectedDiagnosis", { diagnosis });
    }
  }
  get problemSelectionTitle() {
    if (this.step < 3 || !this.editableRecord.problem.title) {
      return this.$t("selectProblem");
    } else {
      const problem = this.$t(this.editableRecord.problem.title);
      return this.$t("selectedProblem", { problem });
    }
  }
  get problemClassificationTitle() {
    if (this.step < 4) {
      return this.$t("describeProblem");
    } else {
      const problem = this.editableRecord.problem;
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
    if (this.step < 5) {
      return this.$t("admissionRatingStep");
    } else {
      const outcome = this.editableOutcome;
      const observations = [
        outcome.knowledge,
        outcome.behaviour,
        outcome.status,
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
    if (this.isNewProblem && !this.showWarning) {
      return this.$t("problemAdmission");
    } else if (!this.isNewProblem && !this.showWarning) {
      return this.$t("editProblem");
    } else if (this.isNewProblem && this.showWarning) {
      return this.$t("problemAdmissionAnyway");
    } else {
      return this.$t("editProblemAnyway");
    }
  }
  get isDataAvailable() {
    return !!this.client && !!this.editableRecord
      && (this.$route.params.sheet == "newProblem" || !!this.record);
  }
  get classificationWarnings() {
    return this.problemClassificationWarnings(this.editableRecord.problem);
  }
  get selectionWarnings() {
    return this.problemSelectionWarnings(this.editableRecord.problem, this.editableRecord.id, this.client);
  }
  get hasActiveInterventions() {
    return this.editableRecord.interventions
      .filter(intervention => !intervention.finishedAt).length > 0;
  }
  get editableOutcome() {
    return this.editableRecord.outcomes[this.editableRecord.outcomes.length - 1];
  }
  set editableOutcome(outcome: Outcome) {
    this.editableRecord.outcomes[this.editableRecord.outcomes.length - 1] = outcome;
  }

  nextStep() {
    this.stepper.next();
  }

  hasPendingChanges() {
    return this.editableRecord.toJSON() != this.originalRecord;
  }
  
  updateRatingReminder(changes: Partial<RatingReminder>) {
    this.ratingReminderChanges = {...this.ratingReminderChanges, ...changes};

    // delete changes that equal currently stored value
    Object.entries(this.ratingReminderChanges)
      .forEach(([key, value]) => {
        if (value == (this.editableRecord.ratingReminder as any)[key]) {
          delete (this.ratingReminderChanges as any)[key]
        }
      })

    Object.assign(this.editableRecord.ratingReminder, changes);
  }

  saveProblemRecord() {
    if (this.isNewProblem) {
      this.$store.direct.commit.createProblemRecord({
        problemRecord: this.editableRecord,
        ...this.$route.params,
      });
      this.$store.direct.commit.saveNewProblemRecord({
        ...this.$route.params, 
        problemId: this.editableRecord.id
      });
    } else {
      this.$store.direct.commit.updateObject({
        target: this.record,
        changes: this.editableRecord,
        clientId: this.$route.params.clientId,
        problemId: this.editableRecord.id
      });
    }

    this.$store.direct.commit.updateReminder({
      target: this.editableRecord.ratingReminder,
      changes: this.ratingReminderChanges
    });
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.editingSheet.confirm());
  }

  created() {
    this.step = parseInt(this.$root.$route.params.step)
      || (this.hasDiagnosisNames ? 1 : 2);
    this.editableRecord = this.record?.clone() || new ProblemRecord();

    if (this.editableRecord.outcomes.length == 0) {
      this.editableRecord.outcomes.push(new Outcome());
    }

    this.originalRecord = this.editableRecord.toJSON();
  }
}
</script>
