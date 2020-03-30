<template>
  <div
    class="intervention"
    v-if="record"
  >
    <div class="row q-col-gutter-lg">
      <div class="col-md-9 col-12">
        <h6>{{ $t("selectInterventions") }}</h6>
        <q-tabs
          v-model="categorySelected"
          dense
          no-caps
          class="bg-intervention text-white shadow-2 q-mb-sm"
        >
          <q-tab
            :name="index"
            :label="
              $q.screen.gt.xs ? category.title : shortCategoryTitles[index]
            "
            :icon="category.icon"
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
            <div class="text-weight-light q-mb-md">
              {{ category.description }}
            </div>
            <q-input
              ref="filter"
              color="intervention"
              filled
              v-model="targetsFilter"
              :label="$t('findTargets')"
              dense
            >
              <template v-slot:prepend>
                <q-icon
                  name="search"
                  color="intervention"
                />
              </template>
              <template v-slot:append>
                <q-icon
                  v-if="targetsFilter !== ''"
                  name="clear"
                  color="intervention"
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
              control-color="intervention"
              tick-strategy="strict"
              :ticked.sync="interventions"
            >
              <template v-slot:default-header="prop">
                <div>
                  <div class="text-weight-bold text-intervention">
                    {{ prop.node.title }}
                  </div>
                  <div class="text-weight-light">
                    {{ prop.node.description }}
                  </div>
                </div>
              </template>
              <template v-slot:default-body="prop">
                <q-input
                  v-if="interventions.includes(prop.node.id)"
                  :value="details[prop.node.id]"
                  @input="updateDetails(prop.node.id, $event)"
                  :label="$t('clientSpecificInterventions')"
                  autogrow
                  :autofocus="!details[prop.node.id]"
                  color="intervention"
                  debounce="50"
                  :hint="$t('clientSpecificInterventionsHint')"
                />
              </template>
            </q-tree>
          </q-tab-panel>
        </q-tab-panels>
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
  .q-tab
    @media (max-width: 400px)
      width: 25%
      padding: 0 4px
  .q-tab__label
    white-space: normal
    line-height: 1.4em
    @media (max-width: 500px)
      font-size: 13px
    @media (max-width: 450px)
      font-size: 12px
    @media (max-width: 400px)
      font-size: 11px
  .q-tab-panel
    padding: 0
  .q-tree > .q-tree__node--child > .q-tree__node-header
    padding-left: 0
  .q-checkbox
    padding: 0 7px 0 13px
  .q-tree__node-body
    margin-left: 40px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {
  HasTitleDescription,
  Terminology,
  sortByTitle,
  filterTerminology,
  treeifyTerminology
} from "../helper/terminology";
import ProblemSummary from "../components/ProblemSummary.vue";
import { QInput } from "quasar";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention as InterventionModel } from "../models/intervention";

const nameof = (name: keyof ProblemRecord) => name;

@Component({
  components: {
    ProblemSummary
  }
})
export default class Intervention extends Vue {
  categorySelected = null;
  targetsFilter = "";

  get interventions() {
    return this.unsavedInterventions.map(intervention => intervention.code);
  }
  set interventions(values: string[]) {
    const existingInterventions = this.unsavedInterventions.filter(
      intervention => values.includes(intervention.code)
    );
    const addedInterventions: InterventionModel[] = values
      .filter(code => {
        return !existingInterventions.find(
          intervention => intervention.code == code
        );
      })
      .map(code => {
        return InterventionModel.fromCode(code);
      });
    const interventions = this.savedInterventions
      .concat(existingInterventions)
      .concat(addedInterventions);
    this.updateProblemRecord(interventions);
  }
  get details() {
    const map: any = {};
    this.unsavedInterventions.forEach(intervention => {
      map[intervention.code] = intervention.details;
    });
    return map;
  }

  get categories() {
    const icons = [
      "add_comment",
      "enhanced_encryption",
      "event",
      "remove_red_eye"
    ];
    return this.terminology.interventionScheme.categories.map(
      (category, index) => {
        //@ts-ignore
        category.icon = icons[index];
        return category;
      }
    );
  }
  get shortCategoryTitles() {
    return ["01", "02", "03", "04"].map(code =>
      this.$t("categoryShortTitle" + code)
    );
  }
  get targets() {
    let targets = this.terminology.interventionScheme.targets;
    const other = targets.pop();
    targets = targets.sort(sortByTitle);

    if (other) {
      targets.push(other);
    }
    return this.categories.map(category => {
      return treeifyTerminology(targets, "targets").map((target: any) => {
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
  get unsavedInterventions() {
    const interventions: InterventionModel[] =
      (this.record || {}).reminders || [];
    return interventions.filter(
      intervention => !intervention.startDate && intervention.categoryCode
    );
  }
  get savedInterventions() {
    const interventions: InterventionModel[] =
      (this.record || {}).reminders || [];
    return interventions.filter(
      intervention => intervention.startDate && intervention.categoryCode
    );
  }

  updateDetails(key: string, value: string) {
    const unsavedInterventions = this.unsavedInterventions;
    const intervention = unsavedInterventions.find(
      intervention => intervention.code == key
    );

    if (!intervention) {
      return;
    }

    intervention.details = value;

    this.updateProblemRecord(
      this.savedInterventions.concat(unsavedInterventions)
    );
  }

  updateProblemRecord(interventions: InterventionModel[]) {
    const changes: any = {};
    changes[nameof("reminders")] = interventions;
    this.$store.direct.commit.updateObject({
      target: this.record,
      changes: changes
    });
  }

  resetTargetsFilter() {
    this.targetsFilter = "";
    (this.$refs.filter as QInput[])[0].focus();
  }

  filterTerminology(node: HasTitleDescription, filter: string) {
    return filterTerminology(node, filter);
  }
}
</script>
