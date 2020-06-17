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
import Vue from "vue";
import Component from "vue-class-component";
import { RRuleSet } from "../models";
import RecurrenceRuleEditor from "./RecurrenceRuleEditor.vue";

const ReminderEditorProps = Vue.extend({
  props: {
    value: RRuleSet,
    color: {
      type: String,
      default: "primary"
    }
  }
});

@Component({
  components: {
    RecurrenceRuleEditor
  }
})
export default class ReminderEditor extends ReminderEditorProps {
  get indicesOfActiveRules() {
    return this.value?.indicesOfActiveRules || [-1];
  }
}
</script>
