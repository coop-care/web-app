<template>
  <div
    class="problem-classification"
    v-if="record"
  >
    <div class="row split-layout">
      <div class="col-md-6">
        <h6 class="counter">{{ $t("selectProblem") }}</h6>
        <q-input
          ref="filter"
          color="red"
          filled
          v-model="problemsFilter"
          :label="$t('selectProblem')"
          dense
        >
          <template v-slot:prepend>
            <q-icon
              name="search"
              color="red"
            />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="problemsFilter !== ''"
              name="clear"
              color="red"
              class="cursor-pointer"
              @click="resetProblemsFilter"
            />
          </template>
        </q-input>

        <q-tree
          :nodes="problems"
          label-key="title"
          node-key="id"
          :filter="problemsFilter"
          :filter-method="filterTerminology"
          :no-results-label="$t('noProblemsFound')"
          color="red"
        >
          <template v-slot:header-domains="prop">
            <div class="row items-center text-white">
              <div>
                <div class="text-weight-bold">{{ prop.node.title }}</div>
                <div class="text-weight-light">{{ prop.node.description }}</div>
              </div>
            </div>
          </template>
          <template v-slot:header-problems="prop">
            <div class="row items-center">
              <!-- <q-icon :name="prop.node.icon" color="red" size="28px" class="q-mr-sm" /> -->
              <q-radio
                v-model="selectedProblem"
                :val="prop.node.value"
                color="red"
                keep-color
                dense
                class="q-mr-sm col-auto"
              />
              <div class="col">
                <div class="text-weight-bold text-red">{{ prop.node.title }}</div>
                <div class="text-weight-light text-black">{{ prop.node.description }}</div>
              </div>
            </div>
          </template>
          <template
            v-slot:body-problems="prop"
            class="symptom-body"
          >
            <div class="text-weight-light text-black">{{ $t("signsAndSymptoms") }}:</div>
          </template>
          <template v-slot:header-signsAndSymptoms="prop">
            <div class="text-weight-light">{{ prop.node.title }}</div>
          </template>
        </q-tree>
      </div>

      <div class="col-md-6">
        <h6 class="counter">{{ $t("selectModfiers") }}</h6>
        <q-btn-toggle
          v-model="scope"
          spread
          no-caps
          unelevated
          rounded
          toggle-color="red"
          text-color="red"
          :options="modifier('scope')"
          class="q-mb-xs"
        />
        <div class="text-weight-light q-mb-md q-px-lg">{{ record.problem.descriptions.scope }}</div>
        <q-btn-toggle
          v-model="severity"
          spread
          no-caps
          unelevated
          rounded
          toggle-color="red"
          text-color="red"
          :options="modifier('severity')"
          class="q-mb-xs"
        />
        <div class="text-weight-light q-mb-md q-px-lg">{{ record.problem.descriptions.severity }}</div>

        <h6
          v-if="showSymptomsSection"
          class="counter"
        >{{ $t("signsAndSymptoms") }}</h6>
        <q-option-group
          v-if="showSymptomsSection"
          v-model="selectedSymptoms"
          :options="symptomsForSelectedProblem"
          color="red"
          type="checkbox"
          keep-color
        />
        <q-input
          v-if="showSymptomsSection && isOtherSymptomSelected"
          v-model="otherSymptoms"
          color="red"
          autogrow
          dense
          filled
          :label="$t('otherSignsAndSymptoms')"
          class="q-ml-xl"
        />

        <h6 class="counter">{{ $t("customerSpecificProblems") }}</h6>
        <q-input
          v-model="details"
          :label="$t('customerSpecificProblemsHint')"
          autogrow
          color="red"
          filled
          class="q-mb-lg"
        />

        <problem-summary
          :problemRecord="record"
          :params="$route.params"
          :isSummary="true"
        />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.q-stepper--horizontal .q-stepper__step-inner
  @media screen and (max-width: $breakpoint-xs-max)
    padding-left: 12px
    padding-right: 12px
.problem-classification
  .q-tree > .q-tree__node > .q-tree__node-header
    background-color: #f44336
    color: #fff
  .q-tree__node .q-tree__node .q-tree__node .q-tree__node-header
    padding-top: 0
    padding-bottom: 0
  .q-btn-toggle
    border-color: #f44336
    button
      @media screen and (max-width: $breakpoint-xs-max)
        font-size: 13px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import TerminologyData, {
  HasTitleDescription,
  Terminology
} from "../helper/terminology";
import { QInput } from "quasar";
import ProblemSummary from "../components/ProblemSummary.vue";

@Component({
  components: {
    ProblemSummary
  }
})
export default class ProblemClassification extends Vue {
  problemsFilter = "";

  get selectedProblem() {
    return this.record.problem.id;
  }
  set selectedProblem(value: string) {
    this.updateProblemRecord("problem.id", value);
  }
  get selectedSymptoms() {
    return this.record.problem.signsAndSymptoms.map(
      (symptom: any) => symptom.id
    );
  }
  set selectedSymptoms(value: string[]) {
    // preserving order of symptoms is super important because of "other" symptom
    let symptoms = this.symptomsForSelectedProblem
      .map((symptom: any) => {
        return { id: symptom.value };
      })
      .filter((symptom: any) => value.includes(symptom.id));
    this.updateProblemRecord("problem.signsAndSymptoms", symptoms);
  }
  get otherSymptoms() {
    return this.record.problem.otherSignsAndSymptoms;
  }
  set otherSymptoms(value: string) {
    this.updateProblemRecord("problem.otherSignsAndSymptoms", value);
  }
  get scope() {
    return this.record.problem.scope;
  }
  set scope(value: number) {
    this.updateProblemRecord("problem.scope", value);
  }
  get severity() {
    return this.record.problem.severity;
  }
  set severity(value: number) {
    this.updateProblemRecord("problem.severity", value);
  }
  get details() {
    return this.record.problem.details;
  }
  set details(value: string) {
    this.updateProblemRecord("problem.details", value);
  }

  get problems() {
    let domains = this.terminology.problemClassificationScheme.domains;
    return TerminologyData.treeify(domains, "domains");
  }
  get symptomsForSelectedProblem() {
    return this.$store.getters.symptomsForProblemCode({
      problemCode: this.selectedProblem,
      terminology: this.terminology
    });
  }
  get showSymptomsSection() {
    return this.selectedProblem && this.severity == 2;
  }
  get isOtherSymptomSelected() {
    let otherSymptom = this.$store.getters.otherSymptomForProblemCode({
      problemCode: this.selectedProblem,
      terminology: this.terminology
    });
    return this.selectedSymptoms.includes(otherSymptom.value);
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get record() {
    return this.$store.getters.getProblemRecordById({
      terminology: this.terminology,
      ...this.$route.params
    });
  }

  updateProblemRecord(path: string, value: any) {
    this.$store.commit("updateProblemRecord", {
      path: path,
      value: value,
      ...this.$route.params
    });
  }

  modifier(type: string) {
    let modifiers = this.terminology.problemClassificationScheme
      .modifiers as any;
    let modifier = (modifiers[type] || []) as HasTitleDescription[];

    return modifier.map((item, index) => {
      return {
        label: item.title,
        value: index,
        description: item.description
      };
    });
  }

  resetProblemsFilter() {
    this.problemsFilter = "";
    (this.$refs.filter as QInput).focus();
  }

  filterTerminology(node: HasTitleDescription, filter: string) {
    return TerminologyData.filter(node, filter);
  }
}
</script>
