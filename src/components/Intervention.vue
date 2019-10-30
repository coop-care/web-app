<template>
  <div class="intervention">
    <div class="row split-layout">
      <div class="col-md-6">
        <h6>1. Interventionen auswählen</h6>
        <q-input
          ref="filter"
          color="amber-10"
          filled
          v-model="targetsFilter"
          label="Ziele finden"
          dense
        >
          <template v-slot:prepend>
            <q-icon
              name="search"
              color="amber-10"
            />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="targetsFilter !== ''"
              name="clear"
              color="amber-10"
              class="cursor-pointer"
              @click="resetTargetsFilter"
            />
          </template>
        </q-input>

        <q-tree
          :nodes="targets"
          ref="tree"
          label-key="title"
          node-key="id"
          :filter="targetsFilter"
          :filter-method="filterTerminology"
          no-results-label="Keine Interventions-Ziele gefunden"
          color="amber-10"
          tick-strategy="strict"
          :ticked.sync="targetsTicked"
        >
          <template v-slot:default-header="prop">
            <div>
              <div class="text-weight-bold text-amber-10">{{ prop.node.title }}</div>
              <div class="text-weight-light text-black">{{ prop.node.description }}</div>
            </div>
          </template>
        </q-tree>
      </div>
      <div class="col-md-6">
        <h6>2. Kundenspezifische Details</h6>
        <q-input
          v-model="details"
          label="Notizen"
          autogrow
          color="amber-10"
          filled
          class="q-mb-lg"
        />

        <h6 v-if="targetsTicked.length || details.length">Zusammenfassung</h6>
        <div v-if="targetsTicked.length">
          Interventionen: {{ targetsTicked.map(id => { return $refs.tree.getNodeByKey(id).title }).join("; ") }}
        </div>
        <div v-if="details.length">
          Details: {{ details }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.intervention
  .q-tree > .q-tree__node--child > .q-tree__node-header
    padding-left: 0
  .q-checkbox
    padding: 0 7px 0 13px
.targets.q-tree > .q-tree__node--child > .q-tree__node-header 
  // padding-left: 12px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
//@ts-ignore
import terminology from "../data/terminology_DE.json";
import Terminology, { TitleAndDescribable } from "../helper/terminology";

@Component
export default class Intervention extends Vue {
  autoId = 0;
  targetsFilter = "";
  targetsTicked = [];
  details = "";

  get terminology() {
    return terminology;
  }
  get targets() {
    let targets = terminology.interventionScheme.targets;
    let other = targets.pop();
    targets = targets.sort(Terminology.sortByTitle);

    if (other) {
      targets.push(other);
    }
    return Terminology.treeify(targets, "targets");
  }

  resetTargetsFilter() {
    this.targetsFilter = "";
    // @ts-ignore
    this.$refs.filter.focus();
  }

  filterTerminology(node: TitleAndDescribable, filter: string) {
    return Terminology.filter(node, filter);
  }
}
</script>