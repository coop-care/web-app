<template>
  <div class="row problem-classification">
    <div class="col-md-6">
      <h6>1. Das zutreffende Problem auswählen</h6>
      <q-input
        ref="filter"
        color="red"
        filled
        v-model="problemsFilter"
        label="Problem finden"
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
        class="problems"
        no-results-label="Keine Probleme, Anzeichen oder Symptome gefunden"
        color="red"
        :selected.sync="problemSelected"
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
        class="toggle q-mb-xs"
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
        class="toggle q-mb-xs"
      />
      <div class="text-caption q-mb-md q-px-lg">{{ modifier('severity')[severity].description }}</div>
      <h6>3. Anzeichen und Symptome auswählen</h6>
      <h6>4. Kundenspezifische Ergänzung</h6>
      <q-input
        v-model="notes"
        label="Notizen"
        autogrow
        color="red"
        filled
        class="q-mb-lg"
      />
      {{problemSelected}}
    </div>
  </div>
</template>

<style lang="sass">
.problems.q-tree > .q-tree__node > .q-tree__node-header
  background-color: #f44336
  color: #fff
.q-tree__node--parent > .q-tree__node-collapsible > .q-tree__node-body
  // padding: 0 0 0 25px !important
.q-tree__node .q-tree__node .q-tree__node .q-tree__node-header
  padding-top: 0
  padding-bottom: 0
.problem-classification
  margin: -2em -20px 0
  .col-md-6
    padding: 2em 20px 0
  .toggle
    border-color: #f44336
  h6
    margin: 1.5em 0 .5em
    &:first-child
      margin-top: 0
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
  scope = 0;
  severity = 2;
  notes = "";

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
    this.$refs.problemsFilter.focus();
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
    return list.map(item => {
      let result: any = {
        id: ++this.autoId,
        title: item.title,
        description: item.description,
        type: key,
        header: key,
        body: key,
        selectable: key == "problems"
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
