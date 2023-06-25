<template>
  <div
    v-if="problem"
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
      v-if="showSymptomsSection && !!otherSymptom"
      v-model="otherSymptomDetails"
      color="classification"
      autogrow
      :autofocus="!otherSymptomDetails"
      :label="$t('otherSignsAndSymptoms')"
      class="q-ml-xl"
    />

    <q-input
      v-if="severity == 1"
      v-model="potentialRiskDetails"
      :label="$t('riskFactorLabel')"
      autogrow
      :autofocus="!potentialRiskDetails"
      color="classification"
    />
    <q-input
      v-else-if="severity == 0"
      v-model="healthPromotionDetails"
      :label="$t('clientRequestLabel')"
      autogrow
      :autofocus="!healthPromotionDetails"
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
import { Component, Prop, Vue, Model } from "vue-facing-decorator";
import WarningMixin, { WarningMixinInterface } from "../mixins/WarningMixin";
import {
  HasTitleDescription,
  TerminologyWithMaps,
  treeifyTerminology,
  UsersGuide,
} from "../helper/terminology";
import { Problem, Symptom } from "../models/problem";
import TextWithTooltip from "./TextWithTooltip.vue";

interface ProblemClassification extends WarningMixinInterface {};

@Component({
  components: {
    TextWithTooltip,
  },
  mixins: [WarningMixin],
  emits: ["update:model-value"]
})
class ProblemClassification extends Vue {
  @Model({ type: Object }) readonly value!: Problem;
  @Prop({ type: Boolean }) readonly activeInterventionsAvailable!: boolean;
  @Prop({ type: Boolean }) readonly editMode!: boolean;

  componentCreationDate = new Date();

  get selectedProblem() {
    return this.problem.code;
  }
  get otherSymptom() {
    return this.problem.currentSymptoms()
      .find(symptom => symptom.code == this.otherSymptomCode);
  }
  get selectedSymptoms() {
    return this.problem.currentSymptoms().map(symptom => symptom.code);
  }
  set selectedSymptoms(values: string[]) {
    const insertionCode = values.filter(code => !this.selectedSymptoms.includes(code)).at(0);
    const deletionCode = this.selectedSymptoms.filter(code => !values.includes(code)).at(0);

    if (insertionCode) {
      const removedSymptom = this.problem.symptomsList.find(symptom => 
        symptom.code == insertionCode 
          && symptom.removedDate && this.componentCreationDate < symptom.removedDate
      );

      if (removedSymptom) {
        removedSymptom.removedDate = undefined;
      } else {
        const newSymptom = new Symptom();
        newSymptom.code = insertionCode;

        if (this.editMode) {
          newSymptom.addedDate = new Date();
        }

        this.problem.symptomsList.push(newSymptom);
      }
    } else if (deletionCode) {
      const currentSymptoms = this.problem.currentSymptoms();
      const symptomIndex = currentSymptoms.findIndex(symptom => symptom.code == deletionCode);
      const symptom = symptomIndex >= 0 ? currentSymptoms[symptomIndex] : undefined;
      
      if (symptom) {
        if (!this.editMode || (symptom.addedDate && this.componentCreationDate < symptom.addedDate)) {
          this.problem.symptomsList.splice(symptomIndex, 1);
        } else {
          symptom.removedDate = new Date();
        }
      }
    }

    this.$emit("update:model-value", this.problem);
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
    this.updateProblem({ severityCode: value });
  }
  get priority() {
    return this.problem.isHighPriority;
  }
  set priority(value: boolean) {
    if (this.editMode && !value && this.activeInterventionsAvailable) {
      this.showWarning(
        this.$t("reducingPriorityWarningMessage") as string
      ).onOk(() => {
        this.updateProblem({ isHighPriority: value });
      });
    } else {
      this.updateProblem({ isHighPriority: value });
    }
  }
  get otherSymptomDetails() {
    return this.otherSymptom?.other || "";
  }
  set otherSymptomDetails(value: string) {
    if (this.otherSymptom) {
      this.otherSymptom.other = value;
      this.$emit("update:model-value", this.problem);
    }
  }
  get potentialRiskDetails() {
    return this.problem.potentialRiskDetails;
  }
  set potentialRiskDetails(value: string) {
    this.updateProblem({ potentialRiskDetails: value ?? "" });
  }
  get healthPromotionDetails() {
    return this.problem.healthPromotionDetails;
  }
  set healthPromotionDetails(value: string) {
    this.updateProblem({ healthPromotionDetails: value ?? "" });
  }
  get priorityDetails() {
    return this.problem.priorityDetails;
  }
  set priorityDetails(value: string) {
    this.updateProblem({ priorityDetails: value ?? "" });
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
  get otherSymptomCode() {
    return this.symptomsForSelectedProblem.at(-1)?.value || "";
  }
  get showSymptomsSection() {
    return this.selectedProblem && this.severity == 2;
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
    const usersGuide = (this.$tm("usersGuide") as unknown) as UsersGuide;
    const usersGuideForProblem = usersGuide[this.problem.code || ""];
    const examples = usersGuideForProblem?.severityModifierExamples || [];
    return examples[this.severity];
  }

  get terminology() {
    return (this.$tm("terminology") as unknown) as TerminologyWithMaps;
  }
  get problem() {
    return this.value;
  }

  updateProblem(changes: Partial<Problem>) {
    if (!this.editMode) {
      // if the problem has not been stored yet, symptoms are better reset when severityCode has changed
      if (changes.severityCode != undefined) {
        changes.symptomsList = [];
      }
    } else {
      if (changes.severityCode != undefined) {
        if (changes.severityCode < 2 && this.problem.severityCode == 2) {
          // stop signs and symptoms
          changes.symptomsList = this.problem.symptomsList.map(symptom => {
            if (!symptom.removedDate) {
              symptom.removedDate = new Date();
            }

            return symptom;
          });
        } else if (changes.severityCode == 2 && this.problem.severityCode < 2) {
          // reactivate signs and symptoms
          changes.symptomsList = this.problem.symptomsList.map(symptom => {
            if (!!symptom.removedDate && this.componentCreationDate < symptom.removedDate) {
              symptom.removedDate = undefined;
            }

            return symptom;
          });
        }
      }
    }

    this.$emit("update:model-value", Object.assign(this.problem, changes));
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

export default ProblemClassification;
</script>
