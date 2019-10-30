<template>
  <div class="problem-classification">
    <div class="row">
      <div class="col-md-6">
        <h6>1. Das Problem auswählen</h6>
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
          class="problems"
          no-results-label="Keine Probleme, Anzeichen oder Symptome gefunden"
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
        <h6>2. Merkmale auswählen</h6>
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
        <div class="text-caption q-mb-md q-px-lg">{{ modifier('scope')[scope].description }}</div>
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
        <div class="text-caption q-mb-md q-px-lg">{{ modifier('severity')[severity].description }}</div>

        <h6>3. Anzeichen und Symptome</h6>
        <q-option-group
          v-model="symptomsSelected"
          v-if="problemSelected"
          :options="$refs.tree.getNodeByKey(problemSelected).children"
          color="red"
          type="checkbox"
          keep-color
        />
        <div v-else>
          <q-icon
            name="warning"
            color="red"
          />
          Zuerst das Problem auswählen.
        </div>

        <h6>4. Kundenspezifische Details</h6>
        <q-input
          v-model="details"
          label="Notizen"
          autogrow
          color="red"
          filled
          class="q-mb-lg"
        />

        <h6 v-if="problemSelected || details.length">Zusammenfassung</h6>
        <div v-if="problemSelected">
          Problem: {{ $refs.tree.getNodeByKey(problemSelected).title }} - {{ modifier('scope')[scope].label }} - {{ modifier('severity')[severity].label }}
        </div>
        <div v-if="symptomsSelected.length">
          Symptome: {{ symptomsSelected }}
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
  margin: -2em -20px 0
  @media screen and (max-width: $breakpoint-sm-max)
    margin-left: 0
    margin-right: 0
  .col-md-6, .summary
    padding: 2em 20px 0
    @media screen and (max-width: $breakpoint-sm-max)
      padding-left: 0
      padding-right: 0
  h6
    margin: 1.5em 0 .5em
    &:first-child
      margin-top: 0
  .q-tree > .q-tree__node > .q-tree__node-header
    background-color: #f44336
    color: #fff
  .q-tree__node--parent > .q-tree__node-collapsible > .q-tree__node-body
    // padding: 0 0 0 25px !important
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
import * as Types from "../data/terminology";

@Component
export default class ProblemClassification extends Vue {
  autoId = 0;
  problemsFilter = "";
  problemSelected = 0;
  symptomsSelected = [];
  scope = 0;
  severity = 2;
  details = "";

  get terminology() {
    return terminology;
  }
  get problems() {
    let domains = terminology.problemClassificationScheme.domains.map(
      domain => {
        domain.problems = domain.problems.sort(this.sortByTitle);
        return domain;
      }
    );
    return this.treeify(domains, "domains");
  }

  modifier(type: string) {
    let modifiers = terminology.problemClassificationScheme.modifiers as any;
    let modifier = (modifiers[type] || []) as Types.TitleAndDescribable[];

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

  filterTerminology(node: Types.TitleAndDescribable, filter: string) {
    let regex = new RegExp(
      "(^|\\b)" + filter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
      "gi"
    );
    return (
      (node.title && node.title.match(regex)) ||
      (node.description && node.description.match(regex))
    );
  }

  treeify(list: any[], key: string): any {
    let lastIndex = list.length - 1;
    return list.map((item, index) => {
      let autoId = ++this.autoId;
      let result: any = {
        id: autoId,
        title: item.title,
        label: item.title,
        value: autoId,
        description: item.description,
        type: key,
        header: key,
        body: key,
        selectable: key == "problems",
        isLast: index == lastIndex
      };

      for (let key in item) {
        let value = item[key];
        if (Array.isArray(value)) {
          result.children = this.treeify(value, key);
        }
      }

      return result;
    });
  }

  sortByTitle(a: Types.Titleable, b: Types.Titleable): number {
    return a.title.localeCompare(b.title);
  }
}
</script>
