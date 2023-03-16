<template>
  <div
    v-if="value"
    class="problem-classification"
    style="max-width: 800px"
  >
    <q-input
      ref="filter"
      color="classification"
      filled
      v-model="problemsFilter"
      :label="$t('findProblem')"
      dense
    >
      <template v-slot:prepend>
        <q-icon
          name="search"
          color="classification"
        />
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
      ref="problemTree"
      no-connectors
    >
      <template v-slot:header-domains="prop">
        <div class="row items-center">
          <div>
            <div class="text-weight-bold text-classification">{{ prop.node.title }}</div>
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
        <div class="q-ml-lg text-black">
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
</template>

<style lang="sass">
.problem-classification
  .q-tree > .q-tree__node > .q-tree__node-header
    background-color: var(--q-classification-bg)
  .q-tree__node .q-tree__node .q-tree__node .q-tree__node-header
    padding-top: 0
    padding-bottom: 0
</style>

<script lang="ts">
import { Component, Prop, Ref, Vue, Model } from "vue-facing-decorator";
import WarningMixin, { WarningMixinInterface } from "../mixins/WarningMixin";
import {
  HasTitleDescription,
  TerminologyWithMaps,
  treeifyTerminology,
  filterTerminology,
} from "../helper/terminology";
import { QInput, QTree } from "quasar";
import { Problem } from "../models";
import TextWithHighlights from "./TextWithHighlights.vue";

interface ProblemSelection extends WarningMixinInterface {};

@Component({
  components: {
    TextWithHighlights,
  },
  mixins: [WarningMixin],
  emits: ["update:model-value"]
})
class ProblemSelection extends Vue {
  @Model({ type: Object }) readonly value!: Problem;
  @Prop({ type: Boolean }) readonly editMode!: boolean;
  @Prop({ type: Boolean }) readonly isChangingProblemAdvisable!: boolean;
  @Ref() readonly filter!: QInput;
  @Ref() readonly problemTree!: QTree;

  problemsFilter = "";

  get selectedProblem() {
    return this.value.code || "";
  }
  set selectedProblem(value: string) {
    if (
      this.editMode &&
      !!this.selectedProblem &&
      !!this.value &&
      (this.value.signsAndSymptoms.length ||
        this.problems.details ||
        !this.isChangingProblemAdvisable)
    ) {
      const consequences = [];
      if (this.value.signsAndSymptoms.length) {
        consequences.push(this.$t("existingSignsAndSymptomsWarning"));
      }
      if (this.value.details) {
        consequences.push(this.$t("existingProblemDetailsWarning"));
      }
      if (!this.isChangingProblemAdvisable) {
        consequences.push(this.$t("existingOutcomesOrInterventionsWarning"));
      }
      const message = this.$t("problemChangeWarningMessage", {
        consequences: consequences.join("\n"),
        oldName: this.$tm(this.value.title),
        newName: this.$tm("terminology.problemByCode." + value + ".title"),
      }) as string;

      this.showWarning(message).onOk(() => {
        this.updateProblem(value);
      });
    } else {
      this.updateProblem(value);
    }
  }

  get problems() {
    const domains = this.terminology.problemClassificationScheme.domains;
    return treeifyTerminology(domains, "domains");
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

  get terminology() {
    return (this.$tm("terminology") as unknown) as TerminologyWithMaps;
  }
  get record() {
    return (
      this.value ||
      this.$store.direct.getters.getProblemRecordById(this.$route.params)
    );
  }

  updateProblem(code: string) {
    this.$emit("update:model-value", Object.assign(this.value, {
      code,
      signsAndSymptomsCodes: [],
      details: "",
    }));
  }

  resetProblemsFilter() {
    this.problemsFilter = "";
    this.filter.focus();
  }

  filterTerminology(node: HasTitleDescription, filter: string) {
    return filterTerminology(node, filter);
  }

  expandDomainForSelectedProblem() {
    if (this.selectedProblem) {
      const domain = this.terminology.problemClassificationScheme.domains.find(
        (domain) =>
          domain.problems.find(
            (problem) => problem.code == this.selectedProblem
          )
      );

      if (domain) {
        this.problemTree.setExpanded("domains." + domain.code, true);
      }
    }
  }

  mounted() {
    this.expandDomainForSelectedProblem();
  }
}

export default ProblemSelection;
</script>
