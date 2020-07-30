<template>
  <div class="problem-classification" v-if="record">
    <div class="row q-col-gutter-lg">
      <div class="col-md-6">
        <h6 class="counter">{{ $t("selectProblem") }}</h6>
        <q-input
          ref="filter"
          color="classification"
          filled
          v-model="problemsFilter"
          :label="$t('findProblem')"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" color="classification" />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="problemsFilter !== ''"
              name="clear"
              color="classification"
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
          color="classification"
          ref="problems"
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
              <!-- <q-icon :name="prop.node.icon" color="classification" size="28px" class="q-mr-sm" /> -->
              <q-radio
                v-model="selectedProblem"
                :val="prop.node.value"
                color="classification"
                keep-color
                dense
                class="q-mr-sm col-auto"
              />
              <div class="col">
                <div class="text-weight-bold text-classification">
                  <text-with-highlights
                    :text="prop.node.title"
                    :regex="filterRegex"
                    classesForMatches="text-underline text-weight-bolder"
                  />
                </div>
                <div class="text-weight-light text-black">
                  <text-with-highlights
                    :text="prop.node.description"
                    :regex="filterRegex"
                    classesForMatches="text-underline text-weight-bolder"
                  />
                </div>
              </div>
            </div>
          </template>
          <template v-slot:body-problems>
            <div class="text-weight-light text-black">
              {{ $t("signsAndSymptoms") }}:
            </div>
          </template>
          <template v-slot:header-signsAndSymptoms="prop">
            <div class="text-weight-light">
              <text-with-highlights
                :text="prop.node.title"
                :regex="filterRegex"
                classesForMatches="text-underline text-weight-bolder"
              />
            </div>
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
          toggle-color="classification"
          text-color="classification"
          :options="modifier('scope')"
          class="q-mb-xs border-classification"
        />
        <div class="text-weight-light q-mb-md q-px-lg">
          {{ $t(problem.scope.description) }}
        </div>
        <q-btn-toggle
          v-model="severity"
          spread
          no-caps
          unelevated
          rounded
          toggle-color="classification"
          text-color="classification"
          :options="modifier('severity')"
          class="q-mb-xs border-classification"
        />
        <div class="text-weight-light q-mb-md q-px-lg">
          <text-with-tooltip
            :text="$t(problem.severity.description)"
            :tooltip="
              severityModifierExample
                ? $t('examplePrefix', { text: severityModifierExample })
                : ''
            "
            class="text-weight-light q-my-xs"
          />
        </div>

        <h6 v-if="showSymptomsSection" class="counter">
          {{ $t("signsAndSymptoms") }}
        </h6>
        <q-option-group
          v-if="showSymptomsSection"
          v-model="selectedSymptoms"
          :options="symptomsForSelectedProblem"
          color="classification"
          type="checkbox"
          keep-color
        />
        <q-input
          v-if="showSymptomsSection && isOtherSymptomSelected"
          v-model="details"
          color="classification"
          autogrow
          :autofocus="!details"
          :label="$t('otherSignsAndSymptoms')"
          class="q-ml-xl"
        />

        <q-input
          v-if="severity < 2"
          v-model="details"
          :label="
            severity == 0 ? $t('clientRequestLabel') : $t('riskFactorLabel')
          "
          autogrow
          :autofocus="!details"
          color="classification"
        />

        <h6 class="counter">{{ $t("priorityTitle") }}</h6>
        <q-btn-toggle
          v-model="priority"
          spread
          no-caps
          unelevated
          rounded
          toggle-color="classification"
          text-color="classification"
          :options="priorityOptions"
          class="q-mb-xs border-classification"
        />
        <div class="text-weight-light q-mb-md q-px-lg">
          {{ $t(problem.priority.description) }}
        </div>
        <q-input
          v-if="!priority"
          v-model="priorityDetails"
          :label="$t('lowPriorityReasonLabel')"
          autogrow
          :autofocus="!priorityDetails"
          color="classification"
          bottom-slots
          :hint="$t('lowPriorityReasonHint')"
        />

        <problem-summary
          :problemRecord="record"
          :params="$route.params"
          :isSummary="true"
          class="q-mt-xl"
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
    background-color: var(--q-color-classification)
    color: #fff
  .q-tree__node .q-tree__node .q-tree__node .q-tree__node-header
    padding-top: 0
    padding-bottom: 0
  .q-btn-toggle button
      @media screen and (max-width: $breakpoint-xs-max)
        font-size: 13px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {
  HasTitleDescription,
  TerminologyWithMaps,
  treeifyTerminology,
  filterTerminology,
  UsersGuide
} from "../helper/terminology";
import { QInput, QTree } from "quasar";
import ProblemSummary from "../components/ProblemSummary.vue";
import { Problem } from "../models/problem";
import TextWithHighlights from "./TextWithHighlights.vue";
import TextWithTooltip from "./TextWithTooltip.vue";

@Component({
  components: {
    ProblemSummary,
    TextWithHighlights,
    TextWithTooltip
  }
})
export default class ProblemClassification extends Vue {
  problemsFilter = "";
  $refs!: {
    filter: QInput;
    problems: QTree;
  };

  get selectedProblem() {
    return this.problem.code;
  }
  set selectedProblem(value: string) {
    this.updateProblem("code", value);
  }
  get selectedSymptoms() {
    return this.problem.signsAndSymptomsCodes;
  }
  set selectedSymptoms(values: string[]) {
    // preserving order of symptoms is super important because of "other" symptom
    const codes = this.symptomsForSelectedProblem
      .filter(symptom => values.includes(symptom.value))
      .map(symptom => symptom.value);
    this.updateProblem("signsAndSymptomsCodes", codes);
  }
  get scope() {
    return this.problem.scopeCode;
  }
  set scope(value: number) {
    this.updateProblem("scopeCode", value);
  }
  get severity() {
    return this.problem.severityCode;
  }
  set severity(value: number) {
    this.updateProblem("severityCode", value);
  }
  get priority() {
    return this.problem.isHighPriority;
  }
  set priority(value: boolean) {
    this.updateProblem("isHighPriority", value);
  }
  get details() {
    return this.problem.details;
  }
  set details(value: string) {
    this.updateProblem("details", value);
  }
  get priorityDetails() {
    return this.problem.priorityDetails;
  }
  set priorityDetails(value: string) {
    this.updateProblem("priorityDetails", value);
  }

  get problems() {
    const domains = this.terminology.problemClassificationScheme.domains;
    return treeifyTerminology(domains, "domains");
  }
  get symptomsForSelectedProblem() {
    const problem = this.terminology.problemByCode[this.selectedProblem] || {};
    return (problem.signsAndSymptoms || []).map(symptom => {
      return { label: symptom.title, value: symptom.code };
    });
  }
  get showSymptomsSection() {
    return this.selectedProblem && this.severity == 2;
  }
  get isOtherSymptomSelected() {
    const symptoms = this.symptomsForSelectedProblem;
    const otherSymptom = symptoms[symptoms.length - 1];
    return this.selectedSymptoms.includes(otherSymptom.value);
  }
  get priorityOptions() {
    return [
      {
        label: this.$t("lowPriority.title"),
        value: false,
        icon: this.terminology.icons.priority[0]
      },
      {
        label: this.$t("highPriority.title"),
        value: true,
        icon: this.terminology.icons.priority[1]
      }
    ];
  }
  get filterRegex() {
    if (!this.problemsFilter) {
      return undefined;
    } else {
      return new RegExp(
        "(^|\\b)" +
          this.problemsFilter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "gi"
      );
    }
  }
  get severityModifierExample() {
    const usersGuide = (this.$t("usersGuide") as unknown) as UsersGuide;
    const usersGuideForProblem = usersGuide[this.problem?.code || ""];
    const examples = usersGuideForProblem?.severityModifierExamples || [];
    return examples[this.severity];
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as TerminologyWithMaps;
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }
  get problem() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.record!.problem;
  }

  updateProblem(key: keyof Problem, value: any) {
    const problemKey = (name: keyof Problem) => name;
    const changes: any = {};
    changes[key] = value;

    if (["code", "severityCode"].includes(key)) {
      changes[problemKey("signsAndSymptomsCodes")] = [];
      changes[problemKey("details")] = "";
    } else if (key == "isHighPriority" && !!value) {
      changes[problemKey("priorityDetails")] = "";
    }

    this.$store.direct.commit.updateObject({
      target: this.problem,
      changes: changes,
      clientId: this.$route.params.clientId,
      problemId: this.record?.id
    });
  }

  modifier(type: string) {
    const modifiers = this.terminology.problemClassificationScheme
      .modifiers as any;
    const modifier = (modifiers[type] || []) as HasTitleDescription[];

    return modifier.map((item, index) => {
      return {
        label: item.title,
        value: index,
        description: item.description,
        icon: (this.terminology.icons as any)[type][index]
      };
    });
  }

  resetProblemsFilter() {
    this.problemsFilter = "";
    this.$refs.filter.focus();
  }

  filterTerminology(node: HasTitleDescription, filter: string) {
    return filterTerminology(node, filter);
  }

  expandDomainForSelectedProblem() {
    if (this.selectedProblem) {
      const domain = this.terminology.problemClassificationScheme.domains.find(
        domain =>
          domain.problems.find(problem => problem.code == this.selectedProblem)
      );

      if (domain) {
        this.$refs.problems.setExpanded("domains." + domain.code, true);
      }
    }
  }

  mounted() {
    this.expandDomainForSelectedProblem();
  }
}
</script>
