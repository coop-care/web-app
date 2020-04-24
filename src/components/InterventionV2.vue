<template>
  <div>
    <editable-intervention
      v-for="intervention in interventions"
      :key="intervention.id"
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
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EditableIntervention from "./EditableIntervention.vue";
import { Intervention as InterventionModel } from "../models/intervention";

@Component({
  components: {
    EditableIntervention
  }
})
export default class Intervention extends Vue {
  interventions: InterventionModel[] = [];

  addIntervention() {
    this.interventions.push(new InterventionModel());
    // scroll
  }
}
</script>
