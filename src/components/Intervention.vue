<template>
  <div class="intervention">
    <div class="row">
      <div class="col-md-9 col-12">
        <h6 class="counter">{{ $t("selectInterventions") }}</h6>
        <q-tabs
          v-model="categorySelected"
          dense
          no-caps
          class="bg-amber-10 text-white shadow-2 q-mb-sm"
        >
          <q-tab
            :name="index"
            :label="category.title"
            v-for="(category, index) in categories"
            v-bind:key="index"
          />
        </q-tabs>
        <q-tab-panels
          v-model="categorySelected"
          animated
        >
          <q-tab-panel
            :name="index"
            v-for="(category, index) in categories"
            v-bind:key="index"
          >
            <div class="text-weight-light q-mb-md">{{ category.description }}</div>
            <q-input
              ref="filter"
              color="amber-10"
              filled
              v-model="targetsFilter"
              :label="$t('findTargets')"
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
              :no-results-label="$t('noTargetsFound')"
              color="amber-10"
              tick-strategy="strict"
              :ticked.sync="targetsTicked[index]"
            >
              <template v-slot:default-header="prop">
                <div>
                  <div class="text-weight-bold text-amber-10">{{ prop.node.title }}</div>
                  <div class="text-weight-light text-black">{{ prop.node.description }}</div>
                </div>
              </template>
            </q-tree>
          </q-tab-panel>
        </q-tab-panels>

        <h6 class="counter">{{ $t("customerSpecificInterventions") }}</h6>
        <q-input
          v-model="details"
          :label="$t('customerSpecificInterventionsHint')"
          autogrow
          color="amber-10"
          filled
          class="q-mb-lg"
        />

      </div>
      <div class="col-md-3 col-12 summary">
        <q-card
          bordered
          class="bg-grey-1"
        >
          <q-card-section>
            <div class="text-h6">{{ $t("summary") }}</div>
          </q-card-section>

          <q-card-section>
            <div v-if="interventions.length">
              {{ $tc("intervention", 2) }}:
              <ul class="q-mt-none">
                <li
                  v-for="(intervention, index) in interventions"
                  v-bind:key="index"
                >{{ intervention }}</li>
              </ul>
            </div>
            <div v-if="details.length">
              {{ $t("customerSpecificInterventions") }}:
              <p class="q-pl-lg">{{ details }}</p>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.intervention
  .q-tab__label
    white-space: normal
  .q-tab-panel
    padding: 0
  .q-tree > .q-tree__node--child > .q-tree__node-header
    padding-left: 0
  .q-checkbox
    padding: 0 7px 0 13px
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
export default class Intervention extends Vue {
  autoId = 0;
  categorySelected = null;
  targetsFilter = "";
  targetsTicked = [[], [], [], []];
  details = "";

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get categories() {
    return this.terminology.interventionScheme.categories;
  }
  get targets() {
    let targets = this.terminology.interventionScheme.targets;
    let other = targets.pop();
    targets = targets.sort(TerminologyData.sortByTitle);

    if (other) {
      targets.push(other);
    }
    return TerminologyData.treeify(targets, "targets");
  }
  get interventions() {
    return this.targetsTicked
      .map((category, index) => {
        let categoryTitle = this.categories[index].title;
        return category.map(targetId => {
          return (
            categoryTitle +
            ": " +
            (this.$refs.tree as QTree[])[0].getNodeByKey(targetId).title
          );
        });
      })
      .reduce((prev, current) => prev.concat(current), []);
  }

  resetTargetsFilter() {
    this.targetsFilter = "";
    (this.$refs.filter as QInput[])[0].focus();
  }

  filterTerminology(node: HasTitleDescription, filter: string) {
    return TerminologyData.filter(node, filter);
  }
}
</script>