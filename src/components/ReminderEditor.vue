<template>
  <div>
    <recurrence-rule-editor
      v-for="index in indicesOfActiveRules"
      :key="indicesOfActiveRules.length + '-' + index"
      :value="value"
      :rule-index="index"
      :color="color"
      @input="$emit('input', $event)"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { RRuleSet } from "../models";
import RecurrenceRuleEditor from "./RecurrenceRuleEditor.vue";

@Component({
  components: {
    RecurrenceRuleEditor
  }
})
export default class ReminderEditor extends Vue {
  @Prop(Object) readonly value: RRuleSet | undefined;
  @Prop({ type: String, default: "primary"}) readonly color!: string;

  get indicesOfActiveRules() {
    return this.value?.indicesOfActiveRules || [-1];
  }
}
</script>
