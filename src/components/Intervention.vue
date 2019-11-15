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
              :nodes="targets[index]"
              label-key="title"
              node-key="id"
              :filter="targetsFilter"
              :filter-method="filterTerminology"
              :no-results-label="$t('noTargetsFound')"
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
        <problem-summary
          :problemRecord="record"
          :params="$route.params"
          :isSummary="true"
        />
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
import ProblemSummary from "../components/ProblemSummary.vue";
import { QInput } from "quasar";

@Component({
  components: {
    ProblemSummary
  }
})
export default class Intervention extends Vue {
  categorySelected = null;
  targetsFilter = "";
  targetsTicked = [];
  details = "";

  get interventions() {
    let interventions = (this.record || {}).interventions || [];
    return interventions.map((intervention: any) => {
      return intervention.categoryId + "." + intervention.targetId;
    });
  }
  set interventions(value: string[]) {}

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
    return this.categories.map(category => {
      return TerminologyData.treeify(targets, "targets").map((target: any) => {
        target.id = category.code + "." + target.id;
        return target;
      });
    });
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get record() {
    return this.$store.getters.getProblemRecordById(this.$route.params);
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