<template>
  <div
    v-if="record"
    class="problem-classification"
    style="max-width: 800px"
  >
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

    <h6
      v-if="showSymptomsSection"
      class="counter"
    >
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
      :label="severity == 0 ? $t('clientRequestLabel') : $t('riskFactorLabel')"
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
  </div>
</template>

<style lang="sass">
.problem-classification
  .q-btn-toggle button
    @media screen and (max-width: $breakpoint-xs-max)
      font-size: 13px
</style>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import WarningMixin from "../mixins/WarningMixin";
import {
  HasTitleDescription,
  TerminologyWithMaps,
  treeifyTerminology,
  UsersGuide,
} from "../helper/terminology";
import { Problem } from "../models/problem";
import TextWithTooltip from "./TextWithTooltip.vue";

@Component({
  components: {
    TextWithTooltip,
  },
})
export default class ProblemClassification extends WarningMixin {
  @Prop(Boolean) readonly editMode!: boolean;

  get selectedProblem() {
    return this.problem.code;
  }
  get selectedSymptoms() {
    return this.problem.signsAndSymptomsCodes;
  }
  set selectedSymptoms(values: string[]) {
    // preserving order of symptoms is super important because of "other" symptom
    const codes = this.symptomsForSelectedProblem
      .filter((symptom) => values.includes(symptom.value))
      .map((symptom) => symptom.value);
    this.updateProblem({ signsAndSymptomsCodes: codes });
  }
  get scope() {
    return this.problem.scopeCode;
  }
  set scope(value: number) {
    this.updateProblem({ scopeCode: value });
  }
  get severity() {
    return this.problem.severityCode;
  }
  set severity(value: number) {
    if (
      this.editMode &&
      (this.problem.signsAndSymptoms.length || this.problem.details)
    ) {
      this.showWarning(
        this.$t("changingSeverityWarningMessage") as string
      ).onOk(() => {
        this.updateProblem({ severityCode: value });
      });
    } else {
      this.updateProblem({ severityCode: value });
    }
  }
  get priority() {
    return this.problem.isHighPriority;
  }
  set priority(value: boolean) {
    if (
      this.editMode &&
      !value &&
      this.record?.interventions.filter(
        (intervention) => !intervention.finishedAt
      ).length
    ) {
      this.showWarning(
        this.$t("reducingPriorityWarningMessage") as string
      ).onOk(() => {
        this.updateProblem({ isHighPriority: value });
      });
    } else {
      this.updateProblem({ isHighPriority: value });
    }
  }
  get details() {
    return this.problem.details;
  }
  set details(value: string) {
    this.updateProblem({ details: value });
  }
  get priorityDetails() {
    return this.problem.priorityDetails;
  }
  set priorityDetails(value: string) {
    this.updateProblem({ priorityDetails: value });
  }

  get problems() {
    const domains = this.terminology.problemClassificationScheme.domains;
    return treeifyTerminology(domains, "domains");
  }
  get symptomsForSelectedProblem() {
    const problem = this.terminology.problemByCode[this.selectedProblem] || {};
    return (problem.signsAndSymptoms || []).map((symptom) => {
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
        icon: this.terminology.icons.priority[0],
      },
      {
        label: this.$t("highPriority.title"),
        value: true,
        icon: this.terminology.icons.priority[1],
      },
    ];
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

  updateProblem(changes: Partial<Problem>) {
    if (changes.severityCode != undefined) {
      changes.signsAndSymptomsCodes = [];
      changes.details = "";
    } else if (changes.isHighPriority) {
      changes.priorityDetails = "";
    }

    this.$store.direct.commit.updateObject({
      target: this.problem,
      changes: changes,
      clientId: this.$route.params.clientId,
      problemId: this.record?.id,
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
        icon: (this.terminology.icons as any)[type][index],
      };
    });
  }
}
</script>
