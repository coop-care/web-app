<template>
  <div
    class="intervention"
    v-if="record"
  >
    <div class="row q-col-gutter-lg">
      <div class="col-md-9 col-12">
        <editable-intervention
          v-for="(intervention, index) in interventions"
          :key="intervention.id"
          :value="intervention"
          :isExpanded="index == editedIntervention"
          @didExpand="editedIntervention = index"
          @didCollapse="editedIntervention = -1"
        />
        <div
          v-if="!interventions.length"
          class="text-body2"
        >{{ $t("noPlannedInterventions") }}</div>
        <q-btn
          icon="add"
          color="intervention"
          :label="$t('addIntervention')"
          rounded
          outline
          class="shadow-1 q-mt-md"
          @click="addIntervention"
          size="12.5px"
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
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention as InterventionModel } from "../models/intervention";
import EditableIntervention from "./EditableIntervention.vue";
import ProblemSummary from "./ProblemSummary.vue";

const nameof = (name: keyof ProblemRecord) => name;

@Component({
  components: {
    EditableIntervention,
    ProblemSummary
  }
})
export default class Intervention extends Vue {
  editedIntervention = -1;

  get interventions() {
    return this.record.interventions;
  }
  set interventions(interventions) {
    const notInterventions = this.record.reminders.filter(
      reminder => !(reminder instanceof Intervention)
    );
    const changes: any = {};
    changes[nameof("reminders")] = notInterventions.concat(interventions);
    this.$store.direct.commit.updateObject({
      target: this.record,
      changes: changes
    });
  }
  get record() {
    return this.$store.getters.getProblemRecordById(
      this.$route.params
    ) as ProblemRecord;
  }

  addIntervention() {
    this.interventions = this.interventions.concat([new InterventionModel()]);
    this.editedIntervention = this.interventions.length - 1;
  }
}
</script>
