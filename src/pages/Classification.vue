<template>
  <editing-sheet
    ref="editingSheet"
    :title="title"
    :is-data-available="!!record"
    :paramsToRemoveOnClose="['problemId']"
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
          :title="problemSelectionTitle"
          :caption="$t('stepCaption', {step: 1, stepCount: 2})"
          :prefix="1"
          :done="step > 1"
          :error="!!selectionWarnings && ((step > 1) || (step == 1 && showWarning ))"
          :header-nav="step > 1 || !selectionWarnings"
          active-color="classification"
        >
          <problem-selection
            v-if="editableProblem"
            v-model="editableProblem"
            edit-mode
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
              :disable="!(editableProblem || {}).code"
              icon-right="fas fa-caret-right"
              :label="problemSelectionButtonLabel"
              class="done-button"
            />
          </div>
        </q-step>
        <q-step
          :name="2"
          :title="$t('describeProblem')"
          :caption="$t('stepCaption', {step: 1, stepCount: 2})"
          :prefix="2"
          :done="step > 2"
          :error="!!classificationWarnings && ((step > 2) || (step == 2 && showWarning ))"
          :header-nav="step > 2 || !(selectionWarnings || classificationWarnings)"
          active-color="classification"
        >
          <problem-classification
            v-if="editableProblem"
            v-model="editableProblem"
            :activeInterventionsAvailable="hasActiveInterventions"
            edit-mode
            class="q-mt-xs"
          />
          <warning
            v-model="showWarning"
            :messages="classificationWarnings"
          />
          <div class="q-mt-lg row justify-center">
            <q-btn
              v-if="step == 2"
              @click="validate(classificationWarnings, save)"
              color="primary"
              rounded
              unelevated
              no-caps
              :outline="!!classificationWarnings"
              :label="doneButtonLabel"
              class="done-button"
            />
          </div>
        </q-step>
      </q-stepper>
  </editing-sheet>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { QStepper } from "quasar";
import RecordValidator from "../mixins/RecordValidator";
import EditingSheet from "../components/EditingSheet.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import ProblemSelection from "components/ProblemSelection.vue";
import ProblemClassification from "components/ProblemClassification.vue";
import Warning from "components/Warning.vue";
import { Problem } from "src/models";

@Component({
  components: {
    EditingSheet,
    ProblemSummaryContainer,
    ProblemSelection,
    ProblemClassification,
    Warning,
  },
})
export default class ClassificationPage extends RecordValidator {
  @Ref() readonly editingSheet!: EditingSheet;
  @Ref() readonly stepper!: QStepper;
  step = 2;
  editableProblem: Problem | null = null;

  get title() {
    return [
      this.client?.contact.name,
      this.$t(this.editableProblem?.title ?? ""),
      this.$t("editProblem")
    ].filter(Boolean).join(": ")
  }
  get problemSelectionTitle() {
    if (this.step < 2 || !this.editableProblem) {
      return this.$t("selectProblem");
    } else {
      const problem = this.$t(this.editableProblem?.title);
      return this.$t("selectedProblem", { problem });
    }
  }
  get problemSelectionButtonLabel() {
    if (!this.showWarning) {
      return this.$t("editProblem");
    } else {
      return this.$t("editProblemAnyway");
    }
  }
  get classificationWarnings() {
    return this.problemClassificationWarnings(this.editableProblem);
  }
  get selectionWarnings() {
    return this.problemSelectionWarnings(this.editableProblem, this.record?.id, this.client);
  }
  get isChangingProblemAdvisable() {
    return !this.record || this.record.outcomes.length > 0 || this.record.interventions.length > 0 
  }
  get hasActiveInterventions() {
    return this.record && this.record.interventions
      .filter(intervention => !intervention.finishedAt).length > 0
  }
  
  hasPendingChanges() {
    return !!this.editableProblem && !!this.record 
      && !this.editableProblem.equals(this.record.problem);
  }

  nextStep() {
    this.stepper.next();
  }

  save() {
    if (this.record && this.editableProblem && this.hasPendingChanges()) {
      this.$store.direct.commit.updateObject({
        target: this.record.problem,
        changes: this.editableProblem,
        clientId: this.$route.params.clientId,
        problemId: this.record.id,
      });
    }

    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.editingSheet.confirm());
  }

  created() {
    this.editableProblem = this.record?.problem.clone() ?? null;
  }
}
</script>
