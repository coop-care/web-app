<template>
  <div>
    <recurrence-rule-editor
      v-for="index in indicesOfActiveRules"
      :key="indicesOfActiveRules.length + '-' + index"
      :model-value="value"
      :rule-index="index"
      :color="color"
      @update:model-value="$emit('update:model-value', $event)"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-facing-decorator";
import { RRuleSet } from "../models";
import RecurrenceRuleEditor from "./RecurrenceRuleEditor.vue";

@Component({
  components: {
    RecurrenceRuleEditor
  },
  emits: ["update:model-value"]
})
export default class ReminderEditor extends Vue {
  @Model({ type: Object }) readonly value: RRuleSet | undefined;
  @Prop({ type: String, default: "primary"}) readonly color!: string;

  get indicesOfActiveRules() {
    return this.value?.indicesOfActiveRules || [-1];
  }
}
</script>
