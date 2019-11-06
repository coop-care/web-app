<template>
  <div class="problem-classification">
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
          ref="tree"
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
                :val="prop.node.id"
                color="red"
                keep-color
                dense
                class="q-mr-sm col-auto"
                @input="resetSymptoms"
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
        <div class="text-weight-light q-mb-md q-px-lg">{{ modifier('scope')[scope].description }}</div>
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
        <div class="text-weight-light q-mb-md q-px-lg">{{ modifier('severity')[severity].description }}</div>

        <h6
          v-if="showSymptomsSection"
          class="counter"
        >{{ $t("signsAndSymptoms") }}</h6>
        <q-option-group
          v-if="showSymptomsSection"
          v-model="selectedSymptoms"
          :options="symptoms"
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

        <h6 v-if="selectedProblem || details.length">{{ $t("summary") }}</h6>
        <div v-if="selectedProblem">
          {{ $tc("problem", 1) }}:
          <p class="q-pl-lg">
            {{ $refs.tree.getNodeByKey(selectedProblem).title }} -
            {{ modifier('scope')[scope].label }} -
            {{ modifier('severity')[severity].label }}
          </p>
        </div>
        <div v-if="showSymptomsSection && selectedSymptoms.length">
          {{ $t("signsAndSymptoms") }}:
          <ul class="q-mt-none">
            <li
              v-for="(symptom, index) in selectedSymptomsNames"
              v-bind:key="index"
            >{{ symptom }}</li>
          </ul>
        </div>
        <div v-if="details.length">
          {{ $t("customerSpecificProblems") }}:
          <p class="q-pl-lg">{{ details }}</p>
        </div>
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
import { QTree, QInput } from "quasar";

@Component
export default class ProblemClassification extends Vue {
  autoId = 0;
  problemsFilter = "";
  selectedProblem = "";
  selectedSymptoms: string[] = [];
  otherSymptoms = "";
  scope = 0;
  severity = 2;
  details = "";

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get problems() {
    let domains = this.terminology.problemClassificationScheme.domains;
    return TerminologyData.treeify(domains, "domains");
  }
  get symptoms() {
    return (this.$refs.tree as QTree).getNodeByKey(this.selectedProblem)
      .children;
  }

  get showSymptomsSection() {
    return this.selectedProblem && this.severity == 2;
  }
  get isOtherSymptomSelected() {
    let lastSymptom = this.symptoms[this.symptoms.length - 1];
    return this.selectedSymptoms.includes(lastSymptom.value);
  }
  get selectedSymptomsNames() {
    let names = this.selectedSymptoms.map(id => {
      return (this.$refs.tree as QTree).getNodeByKey(id).title;
    });
    if (this.otherSymptoms && this.isOtherSymptomSelected) {
      names[names.length - 1] += ": " + this.otherSymptoms;
    }
    return names;
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

  resetSymptoms() {
    this.selectedSymptoms = [];
    this.otherSymptoms = "";
  }
}
</script>
