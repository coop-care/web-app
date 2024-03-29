<template>
  <q-page class="limit-page-width">

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
        <i18n-t
          keypath="frequentProblemsForDiagnosis"
          scope="global"
          tag="div"
          class="text-h6 q-mt-md q-mb-sm"
          v-if="!!selectedDiagnosisCode"
        >
          <template v-slot:diagnosis>
            <span class="text-weight-bold">{{ $t("diagnosisNames." + selectedDiagnosisCode) }}</span>
          </template>
        </i18n-t>
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
            @click="$router.back()"
            :label="$t('cancel')"
            class="shadow-1 q-ml-sm q-mb-sm"
          />
          <q-btn
            :disable="selectedProblemCodes.length == 0"
            @click="createDraftProblemRecords"
            color="primary"
            rounded
            :label="$t('createDraftProblemRecords', selectedProblemCodes.length)"
            class="q-my-sm"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
    <div class="text-caption text-center q-px-lg q-pb-md">
      {{ $t("omahaSystemBookCopyrightNotice") }} <q-markdown :src="$t('omahaSystemBookReference')" />
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
import { Vue, Component, Watch } from "vue-facing-decorator";
import { ProblemRecord } from "../models/problemRecord";
import { sortByTitle } from "../helper/terminology";
import SearchableOptionList from "../components/SearchableOptionList.vue";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

@Component({
  components: {
    SearchableOptionList,
    SimplifiedMarkdown
  }
})
export default class ProblemsByDiagnosis extends Vue {
  step = 1;
  selectedDiagnosisCode = "";
  selectedProblemCodes = [];

  @Watch("isVisible")
  onSelectedDiagnosisCodeChanged(value: string) {
    if (value) {
      this.step += 1;
    }
    this.selectedProblemCodes = [];
  }

  get problemCodesByDiagnosis() {
    return (this.$t("problemCodesByDiagnosis") as unknown) as {
      [id: string]: string[];
    };
  }
  get diagnosisCodes() {
    return Object.keys(this.problemCodesByDiagnosis)
      .map(code => {
        return {
          code: code,
          title: this.$t("diagnosisNames." + code) as string
        };
      })
      .sort(sortByTitle);
  }
  get allProblemCodes() {
    return Object.keys(this.$tm("terminology.problemByCode"));
  }
  get problemCodesForSelectedDiagnosis() {
    return this.problemCodesByDiagnosis[this.selectedDiagnosisCode] || [];
  }
  get problemOptionsForSelectedDiagnosis() {
    return this.problemCodesForSelectedDiagnosis
      .map(this.makeProblemOption)
      .sort(sortByTitle);
  }
  get otherProblemOptionsForSelectedDiagnosis() {
    return this.allProblemCodes
      .filter(code => !this.problemCodesForSelectedDiagnosis.includes(code))
      .map(this.makeProblemOption)
      .sort(sortByTitle);
  }

  createDraftProblemRecords() {
    this.selectedProblemCodes.forEach(problemCode => {
      const problemRecord = new ProblemRecord();
      problemRecord.problem.code = problemCode;
      problemRecord.tag = this.selectedDiagnosisCode;
      const payload = {
        problemRecord: problemRecord,
        ...this.$route.params
      };
      this.$store.direct.commit.createProblemRecord(payload);
    });
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }

  makeProblemOption(code: string) {
    return {
      code: code,
      title: this.$tm("terminology.problemByCode." + code + ".title") as string,
      description: this.$tm(
        "terminology.problemByCode." + code + ".description"
      ) as string
    };
  }
}
</script>
