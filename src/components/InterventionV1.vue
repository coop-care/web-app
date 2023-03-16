<template>
  <problem-summary-container class="intervention">
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
        :key="index"
      />
    </q-tabs>
    <q-tab-panels
      v-model="categorySelected"
      animated
    >
      <q-tab-panel
        :name="index"
        v-for="(category, index) in categories"
        :key="index"
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
          v-model:ticked="interventions"
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
              :model-value="details[prop.node.id]"
              @update:model-value="updateDetails(prop.node.id, $event)"
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
  </problem-summary-container>
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
import { Vue, Component, Ref } from "vue-facing-decorator";
import {
  HasTitleDescription,
  Terminology,
  sortByTitle,
  filterTerminology,
  treeifyTerminology
} from "../helper/terminology";
import ProblemSummaryContainer from "../components/ProblemSummaryContainer.vue";
import { QInput } from "quasar";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention } from "../models/intervention";

@Component({
  components: {
    ProblemSummaryContainer
  }
})
export default class InterventionView extends Vue {
  @Ref() readonly filter!: QInput[];

  categorySelected = null;
  targetsFilter = "";

  get interventions() {
    return this.unsavedInterventions.map(intervention => intervention.code);
  }
  set interventions(values: string[]) {
    const existingInterventions = this.unsavedInterventions.filter(
      intervention => values.includes(intervention.code)
    );
    const addedInterventions: Intervention[] = values
      .filter(code => {
        return !existingInterventions.find(
          intervention => intervention.code == code
        );
      })
      .map(code => {
        return Intervention.fromCode(code);
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
    let targets = this.terminology.interventionScheme.targets.concat([]);
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
    return (this.$tm("terminology") as unknown) as Terminology;
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }
  get unsavedInterventions() {
    const interventions = this.record?.interventions || [];
    return interventions.filter(
      intervention => !intervention.createdAt && intervention.categoryCode
    );
  }
  get savedInterventions() {
    const interventions = this.record?.interventions || [];
    return interventions.filter(
      intervention => intervention.createdAt && intervention.categoryCode
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

  updateProblemRecord(interventions: Intervention[]) {
    const changes: any = {};
    const key: keyof ProblemRecord = "interventions";
    changes[key] = interventions;
    this.$store.direct.commit.updateObject({
      target: this.record,
      changes: changes
    });
  }

  resetTargetsFilter() {
    this.targetsFilter = "";
    this.filter[0].focus();
  }

  filterTerminology(node: HasTitleDescription, filter: string) {
    return filterTerminology(node, filter);
  }
}
</script>
