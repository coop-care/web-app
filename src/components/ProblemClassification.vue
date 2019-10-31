<template>
  <div class="problem-classification">
    <div class="row split-layout">
      <div class="col-md-6">
        <h6 class="counter">Das Problem auswählen</h6>
        <q-input
          ref="filter"
          color="red"
          filled
          v-model="problemsFilter"
          label="Problem finden"
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
          no-results-label="Keine Probleme, Anzeichen oder Symptome gefunden"
          color="red"
          @update:selected="resetSymptoms"
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
                v-model="problemSelected"
                :val="prop.node.id"
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
            <div class="text-weight-light text-black">Symptome:</div>
          </template>
          <template v-slot:header-signsAndSymptoms="prop">
            <div class="text-weight-light">{{ prop.node.title }}</div>
          </template>
        </q-tree>
      </div>

      <div class="col-md-6">
        <h6 class="counter">Merkmale auswählen</h6>
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
        >Anzeichen und Symptome</h6>
        <q-option-group
          v-if="showSymptomsSection"
          v-model="symptomsSelected"
          :options="$refs.tree.getNodeByKey(problemSelected).children"
          color="red"
          type="checkbox"
          keep-color
        />

        <h6 class="counter">Kundenspezifische Details</h6>
        <q-input
          v-model="details"
          label="Was gibt es speziell zu diesem Problem bei diesem Kunden noch ergänzend mitzuteilen?"
          autogrow
          color="red"
          filled
          class="q-mb-lg"
        />

        <h6 v-if="problemSelected || details.length">Zusammenfassung</h6>
        <div v-if="problemSelected">
          Problem: {{ $refs.tree.getNodeByKey(problemSelected).title }} - {{ modifier('scope')[scope].label }} - {{ modifier('severity')[severity].label }}
        </div>
        <div v-if="showSymptomsSection && symptomsSelected.length">
          Symptome: {{ symptomsSelected.map(id => { return $refs.tree.getNodeByKey(id).title }).join("; ") }}
        </div>
        <div v-if="details.length">
          Details: {{ details }}
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
//@ts-ignore
import terminology from "../data/terminology_DE.json";
import Terminology, { TitleAndDescribable } from "../helper/terminology";

@Component
export default class ProblemClassification extends Vue {
  autoId = 0;
  problemsFilter = "";
  problemSelected = 0;
  symptomsSelected = [];
  scope = 0;
  severity = 2;
  details = "";

  get problems() {
    let domains = terminology.problemClassificationScheme.domains.map(
      domain => {
        domain.problems = domain.problems.sort(Terminology.sortByTitle);
        return domain;
      }
    );
    return Terminology.treeify(domains, "domains");
  }
  get showSymptomsSection() {
    return this.problemSelected && this.severity == 2;
  }

  modifier(type: string) {
    let modifiers = terminology.problemClassificationScheme.modifiers as any;
    let modifier = (modifiers[type] || []) as TitleAndDescribable[];

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
    // @ts-ignore
    this.$refs.filter.focus();
  }

  filterTerminology(node: TitleAndDescribable, filter: string) {
    return Terminology.filter(node, filter);
  }

  resetSymptoms() {
    console.log("hello");
    this.symptomsSelected = [];
  }
}
</script>
