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
        <q-list>
          <q-item
            tag="label"
            v-for="diagnosisCode in diagnosisCodes"
            v-bind:key="diagnosisCode"
            dense
          >
            <q-item-section
              side
              top
            >
              <q-radio
                v-model="selectedDiagnosisCode"
                :val="diagnosisCode"
                color="primary"
                keep-color
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{
            $t("diagnosisNames." + diagnosisCode)
          }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
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
        <q-list>
          <q-item
            v-for="problemCode in problemCodesForSelectedDiagnosis"
            v-bind:key="selectedDiagnosisCode + '_' + problemCode"
            tag="label"
          >
            <q-item-section
              side
              top
            >
              <q-checkbox
                v-model="selectedProblemCodes"
                :val="problemCode"
                color="classification"
                keep-color
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{
            $t("terminology.problemByCode." + problemCode + ".title")
          }}</q-item-label>
              <q-item-label caption>{{
            $t("terminology.problemByCode." + problemCode + ".description")
          }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-expansion-item
          :label="$t('additionalProblemSelection')"
          header-class="text-h6 q-mt-md q-mb-sm q-px-none dense-avatar"
          switch-toggle-side
          :default-opened="false"
        >
          <q-list>
            <q-item
              v-for="problemCode in otherProblemCodesForSelectedDiagnosis"
              v-bind:key="selectedDiagnosisCode + '_' + problemCode"
              tag="label"
            >
              <q-item-section
                side
                top
              >
                <q-checkbox
                  v-model="selectedProblemCodes"
                  :val="problemCode"
                  color="classification"
                  keep-color
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium text-grey-8">{{
            $t("terminology.problemByCode." + problemCode + ".title")
          }}</q-item-label>
                <q-item-label caption>{{
            $t("terminology.problemByCode." + problemCode + ".description")
          }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex justify-around">
          <q-btn
            flat
            color="primary"
            rounded
            to="/"
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

@Component({
  watch: {
    selectedDiagnosisCode(value) {
      if (value) {
        (this as ProblemsByDiagnosis).step += 1;
      }
    }
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
    return Object.keys(this.problemCodesByDiagnosis);
  }
  get allProblemCodes() {
    return Object.keys(this.$t("terminology.problemByCode"));
  }
  get problemCodesForSelectedDiagnosis() {
    return this.problemCodesByDiagnosis[this.selectedDiagnosisCode] || [];
  }
  get otherProblemCodesForSelectedDiagnosis() {
    return this.allProblemCodes.filter(
      code => !this.problemCodesForSelectedDiagnosis.includes(code)
    );
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
      .then(() => this.$router.push({ name: "client" }));
  }
}
</script>
