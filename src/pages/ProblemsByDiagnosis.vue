<template>
  <q-page>

    <q-stepper
      v-model="step"
      flat
      vertical
      color="primary"
      header-nav
      animated
      class="diagnosis-stepper"
    >
      <q-step
        :name="1"
        :title="$t('diagnosisSelectionTitle')"
        :done="step > 1"
      >
        <searchable-option-list
          color="primary"
          :options="diagnosisCodes"
          v-model="selectedDiagnosisCode"
          class="column-2-sm"
        />
      </q-step>

      <q-step
        :name="2"
        :title="$t('problemsForDiagnosisSelectionTitle')"
        :header-nav="!!selectedDiagnosisCode"
        active-color="classification"
        done-color="classification"
      >
        <i18n
          path="frequentProblemsForDiagnosis"
          tag="div"
          class="text-h6 q-mt-md q-mb-sm"
          v-if="!!selectedDiagnosisCode"
        >
          <template v-slot:diagnosis>
            <span class="text-weight-bold">{{ $t("diagnosisNames." + selectedDiagnosisCode) }}</span>
          </template>
        </i18n>
        <searchable-option-list
          color="classification"
          :options="problemOptionsForSelectedDiagnosis"
          v-model="selectedProblemCodes"
          allowMultipleSelection
        />

        <q-expansion-item
          :label="$t('additionalProblemSelection')"
          header-class="text-h6 q-mt-md q-mb-sm q-px-none dense-avatar"
          switch-toggle-side
          :default-opened="false"
        >
          <searchable-option-list
            color="classification"
            :options="otherProblemOptionsForSelectedDiagnosis"
            v-model="selectedProblemCodes"
            allowMultipleSelection
          />
        </q-expansion-item>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex justify-around">
          <q-btn
            flat
            color="primary"
            rounded
            :to="{name: 'clientProblems', params: $route.params}"
            :label="$t('cancel')"
            class="shadow-1 q-ml-sm q-mb-sm"
          />
          <q-btn
            :disable="selectedProblemCodes.length == 0"
            @click="createDraftProblemRecords"
            color="primary"
            rounded
            :label="$tc('createDraftProblemRecords', selectedProblemCodes.length)"
            class="q-my-sm"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
    <div class="text-caption text-center q-px-lg q-pb-md">
      <simplified-markdown :text="$t('omahaSystemBookCopyrightNotice')" />
    </div>
  </q-page>
</template>

<style lang="sass">
.q-stepper--vertical > .q-stepper__nav
  padding-left: 0
  padding-right: 0
@media (max-width: 450px)
  .diagnosis-stepper
    .q-item
      padding-left: 2px
      padding-right: 2px
      &:not(.dense-avatar) .q-item__section--side
        padding-right: 2px
    &.q-stepper--vertical
      .q-stepper__tab
        padding-left: 8px
      .q-stepper__step-inner
        padding-left: 20px
      .q-stepper__tab, .q-stepper__step-inner
        padding-right: 8px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ProblemRecord } from "../models/problemRecord";
import SearchableOptionList from "../components/SearchableOptionList.vue";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

@Component({
  watch: {
    selectedDiagnosisCode(value) {
      const self = this as ProblemsByDiagnosis;
      if (value) {
        self.step += 1;
      }
      self.selectedProblemCodes = [];
    }
  },
  components: {
    SearchableOptionList,
    SimplifiedMarkdown
  }
})
export default class ProblemsByDiagnosis extends Vue {
  step = 1;
  selectedDiagnosisCode = "";
  selectedProblemCodes = [];

  get problemCodesByDiagnosis() {
    return (this.$t("problemCodesByDiagnosis") as unknown) as {
      [id: string]: string[];
    };
  }
  get diagnosisCodes() {
    return Object.keys(this.problemCodesByDiagnosis).map(code => {
      return {
        code: code,
        title: this.$t("diagnosisNames." + code)
      };
    });
  }
  get allProblemCodes() {
    return Object.keys(this.$t("terminology.problemByCode"));
  }
  get problemCodesForSelectedDiagnosis() {
    return this.problemCodesByDiagnosis[this.selectedDiagnosisCode] || [];
  }
  get problemOptionsForSelectedDiagnosis() {
    return this.problemCodesForSelectedDiagnosis.map(this.makeProblemOption);
  }
  get otherProblemOptionsForSelectedDiagnosis() {
    return this.allProblemCodes
      .filter(code => !this.problemCodesForSelectedDiagnosis.includes(code))
      .map(this.makeProblemOption);
  }

  createDraftProblemRecords() {
    this.selectedProblemCodes.forEach(problemCode => {
      const problemRecord = new ProblemRecord();
      problemRecord.problem.code = problemCode;
      const payload = {
        problemRecord: problemRecord,
        ...this.$route.params
      };
      this.$store.direct.commit.createProblemRecord(payload);
    });
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.push({ name: "clientProblems" }));
  }

  makeProblemOption(code: string) {
    return {
      code: code,
      title: this.$t("terminology.problemByCode." + code + ".title"),
      description: this.$t("terminology.problemByCode." + code + ".description")
    };
  }
}
</script>
