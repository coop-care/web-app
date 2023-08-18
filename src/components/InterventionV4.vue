<template>
  <div class="intervention q-gutter-y-md q-pr-xs">
    <expandable-intervention
      v-for="intervention in interventions"
      :key="intervention.id"
      :model-value="intervention"
      :problem-code="problemCode"
      @delete="deleteIntervention(intervention.id)"
      @duplicate="duplicateIntervention(intervention.id)"
    />
    <div class="column items-center">
      <q-btn
        icon="add"
        color="intervention"
        :label="$t('addIntervention')"
        rounded
        no-caps
        outline
        @click="addIntervention"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-facing-decorator";
import { TerminologyWithMaps } from "../helper/terminology";
import { Intervention } from "../models/intervention";
import ExpandableIntervention from "src/components/ExpandableIntervention.vue";

@Component({
  components: {
    ExpandableIntervention
  },
  emits: ["update:model-value"]
})
export default class InterventionView extends Vue {
  @Model({ type: Array, default: () => [] }) readonly value!: Intervention[];
  @Prop({ type: String, default: "" }) readonly problemCode!: string;

  get interventions() {
    return this.value;
  }
  set interventions(interventions) {
    this.$emit("update:model-value", interventions);
  }
  get terminology() {
    return (this.$tm("terminology") as unknown) as TerminologyWithMaps;
  }

  addIntervention() {
    const intervention = new Intervention();
    const interventions = this.interventions.slice();
    interventions.push(intervention);
    this.interventions = interventions;
  }
  deleteIntervention(id: string) {
    const index = this.interventions.findIndex(item => item.id == id);
    if (index >= 0) {
      const interventions = this.interventions.slice();
      interventions.splice(index, 1);
      this.interventions = interventions;
    }
  }
  duplicateIntervention(id: string) {
    const index = this.interventions.findIndex(item => item.id == id);
    const intervention = this.interventions[index]?.duplicate();
    if (intervention) {
      const interventions = this.interventions.slice();
      interventions.splice(index + 1, 0, intervention);
      this.interventions = interventions;
    }
  }
}
</script>
