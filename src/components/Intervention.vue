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
            <div class="text-weight-light q-mb-md">
              {{ category.description }}
            </div>
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
              control-color="amber-10"
              tick-strategy="strict"
              :ticked.sync="interventions"
            >
              <template v-slot:default-header="prop">
                <div>
                  <div class="text-weight-bold text-amber-10">
                    {{ prop.node.title }}
                  </div>
                  <div class="text-weight-light">
                    {{ prop.node.description }}
                  </div>
                </div>
              </template>
              <template v-slot:default-body="prop">
                <div v-if="interventions.includes(prop.node.id)">
                  <q-input
                    :value="details[prop.node.id]"
                    @input="updateDetails(prop.node.id, $event)"
                    :label="$t('customerSpecificInterventions')"
                    autogrow
                    :autofocus="!details[prop.node.id]"
                    color="amber-10"
                  />
                  <p class="q-my-xs text-caption">
                    {{ $t("customerSpecificInterventionsHint") }}
                  </p>
                </div>
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
  .q-tab__label
    white-space: normal
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
import TerminologyData, {
  HasTitleDescription,
  Terminology
} from "../helper/terminology";
import ProblemSummary from "../components/ProblemSummary.vue";
import { QInput } from "quasar";
import * as Store from "../store";
import { Dictionary } from "vuex";

@Component({
  components: {
    ProblemSummary
  }
})
export default class Intervention extends Vue {
  categorySelected = null;
  targetsFilter = "";

  get interventions() {
    return this.unsavedInterventions.map(intervention => {
      return intervention.category.id + "." + intervention.target.id;
    });
  }
  set interventions(values: string[]) {
    let existingInterventions = this.unsavedInterventions.filter(
      intervention => {
        let key = intervention.category.id + "." + intervention.target.id;
        return values.includes(key);
      }
    );
    let addedInterventions: Store.Intervention[] = values
      .map(value => value.split("."))
      .filter(codes => {
        return !existingInterventions.find(
          intervention =>
            intervention.category.id == codes[0] &&
            intervention.target.id == codes[1]
        );
      })
      .map(codes => {
        return {
          category: {
            id: codes[0],
            title: (
              this.terminology.interventionScheme.categories.find(
                category => category.code == codes[0]
              ) || {}
            ).title
          },
          target: {
            id: codes[1],
            title: (
              this.terminology.interventionScheme.targets.find(
                target => target.code == codes[1]
              ) || {}
            ).title
          },
          details: [],
          startedAt: undefined,
          endedAt: undefined
        };
      });
    let interventions = this.savedInterventions
      .concat(existingInterventions)
      .concat(addedInterventions);
    this.updateProblemRecord("interventions", interventions);
  }
  get details() {
    let map: Dictionary<string> = {};
    this.unsavedInterventions.forEach(intervention => {
      let key = intervention.category.id + "." + intervention.target.id;
      let text = (intervention.details[0] || {}).text || "";
      map[key] = text;
    });
    return map;
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
  get unsavedInterventions() {
    let interventions: Store.Intervention[] =
      (this.record || {}).interventions || [];
    return interventions.filter(intervention => !intervention.startedAt);
  }
  get savedInterventions() {
    let interventions: Store.Intervention[] =
      (this.record || {}).interventions || [];
    return interventions.filter(intervention => intervention.startedAt);
  }

  updateDetails(key: string, value: string) {
    let unsavedInterventions = this.unsavedInterventions;
    let codes = key.split(".");
    let intervention = unsavedInterventions.find(
      intervention =>
        intervention.category.id == codes[0] &&
        intervention.target.id == codes[1]
    );

    if (!intervention) {
      return;
    }

    let note = intervention.details[0] || {};
    note.text = value;
    note.createdAt = new Date();
    intervention.details[0] = note;

    this.updateProblemRecord(
      "interventions",
      this.savedInterventions.concat(unsavedInterventions)
    );
  }

  updateProblemRecord(path: string, value: any) {
    this.$store.commit("updateProblemRecord", {
      path: path,
      value: value,
      ...this.$route.params
    });
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
