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

    <problem-summary-container v-else>
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        header-nav
        animated
        flat
        vertical
        class="q-pa-none"
      >
        <q-step
          :name="1"
          v-if="hasDiagnosisNames"
          :title="$t('diagnosisSelectionTitle')"
          :prefix="firstStepPrefix + 1"
          :done="step > 1"
          :header-nav="step > 1"
          active-color="primary"
          done-color="primary"
        >
          <diagnosis-selection
            v-model="newRecord.tag"
            @input="$refs.stepper.next()"
            class="q-mt-xs"
          />
          <q-btn
            @click="$refs.stepper.next()"
            color="primary"
            rounded
            no-caps
            icon-right="fas fa-caret-right"
            :label="$t('continue')"
            class="q-mt-lg"
          />
        </q-step>
        <q-step
          :name="2"
          :title="$t('selectProblem')"
          :prefix="firstStepPrefix + 1"
          :done="step > 2"
          :header-nav="step > 2 || !problemSelectionValidationError"
          active-color="classification"
          done-color="classification"
        >
          <problem-selection
            @input="didSelectProblemCode"
            class="q-mt-xs"
          />
          <q-btn
            @click="createProblemOrContinue"
            color="primary"
            rounded
            no-caps
            :outline="!!problemSelectionValidationError"
            icon-right="fas fa-caret-right"
            :label="record ? $t('editProblem') : $t('problemAdmission')"
            class="q-mt-lg"
          />
        </q-step>
        <q-step
          :name="3"
          :title="$t('describeProblem')"
          :prefix="firstStepPrefix + 2"
          :done="step > 3"
          :header-nav="step > 3 || !problemClassificationValidationError"
          active-color="classification"
          done-color="classification"
        >
          <problem-classification class="q-mt-xs" />
          <q-btn
            v-if="isHighPriority"
            @click="$refs.stepper.next()"
            color="primary"
            rounded
            no-caps
            :outline="!!problemClassificationValidationError"
            icon-right="fas fa-caret-right"
            :label="$t('continue')"
            class="q-mt-lg"
          />
          <q-btn
            v-else
            @click="saveProblemRecord"
            color="primary"
            rounded
            no-caps
            :label="$t('done')"
            class="q-mt-lg"
          />
        </q-step>

        <q-step
          :name="4"
          v-if="isHighPriority"
          :title="
            $q.screen.lt.md ? $tc('rating', 1) : $t('admissionRatingStep')
          "
          :prefix="firstStepPrefix + 3"
          :done="step > 4"
          :header-nav="step > 4 || !ratingValidationError"
          done-color="outcome"
          active-color="outcome"
        >
          <problem-rating class="q-mt-xs" />
          <q-btn
            @click="$refs.stepper.next()"
            color="primary"
            rounded
            no-caps
            :outline="!!ratingValidationError"
            icon-right="fas fa-caret-right"
            :label="true ? $t('continue') :  $t('continueAnyway')"
            class="q-mt-lg"
          />
        </q-step>

        <q-step
          :name="5"
          v-if="isHighPriority"
          :title="$t('planInterveneStep')"
          :prefix="firstStepPrefix + 4"
          icon="add_comment"
          :header-nav="step > 5 || !interventionValidationError"
          done-color="intervention"
          active-color="intervention"
        >
          <intervention-view class="q-mt-xs" />
          <q-btn
            @click="saveProblemRecord"
            color="primary"
            rounded
            no-caps
            :outline="!!interventionValidationError"
            :label="true ? $t('save') : $t('saveAnyway')"
            class="q-mt-lg"
          />
        </q-step>
      </q-stepper>
    </problem-summary-container>
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
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QStepper } from "quasar";
import { ProblemRecord } from "../models";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import DiagnosisSelection from "components/DiagnosisSelection.vue";
import ProblemSelection from "components/ProblemSelection.vue";
import ProblemClassification from "components/ProblemClassification.vue";
import ProblemRating from "components/ProblemRating.vue";
import InterventionView from "components/InterventionV3.vue";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";

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

  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }
  get isHighPriority() {
    if (this.record) {
      return this.record.problem.isHighPriority;
    } else {
      return true;
    }
  }
  get terminology() {
    return this.$t("terminology");
  }
  get hasDiagnosisNames() {
    return Object.keys(this.$t("diagnosisNames")).length > 0;
  }
  get firstStepPrefix() {
    return this.hasDiagnosisNames ? 1 : 0;
  }
  get problemSelectionValidationError() {
    if (!(this.record || this.newRecord).problem.code) {
      return "!";
    } else {
      return "";
    }
  }
  get problemClassificationValidationError() {
    if (
      !this.record?.problem.details &&
      this.record?.problem.signsAndSymptomsCodes.length == 0
    ) {
      return "!";
    } else {
      return "";
    }
  }
  get ratingValidationError() {
    if (this.record?.outcomes.length == 0) {
      return "!";
    } else {
      return "";
    }
  }
  get interventionValidationError() {
    if (this.record?.interventions.length == 0) {
      return "!";
    } else {
      return "";
    }
  }

  didSelectProblemCode(value: string) {
    if (!this.record) {
      this.newRecord.problem.code = value;
    }
    this.createProblemOrContinue();
  }
  createProblemOrContinue() {
    if (this.client && this.$route.params.problemId == "new") {
      this.$store.direct.commit.createProblemRecord({
        problemRecord: this.newRecord,
        ...this.$route.params,
      });
      this.$route.params.problemId = this.client.problems[
        this.client.problems.length - 1
      ].id;
    }
    this.$refs.stepper.next();
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
