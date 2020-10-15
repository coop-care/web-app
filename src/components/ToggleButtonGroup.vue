<template>
  <div class="q-pb-sm toggle-button-group">
    <q-btn
      v-for="option in options"
      v-bind:key="option.value"
      :label="option.label"
      :color="value.includes(option.value) ? toggleColor : color"
      :text-color="value.includes(option.value) ? toggleTextColor : textColor"
      @click="toggle(option.value)"
      unelevated
      round
      :size="size"
      no-caps
      class="text-weight-regular"
    />
  </div>
</template>

<style lang="sass">
.toggle-button-group
  border-bottom: 1px solid $grey-5
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

interface Option {
  label: string;
  value: string;
}

@Component
export default class ToggleButtonGroup extends Vue {
  @Prop({ type: Array, default: []}) readonly options!: Option[];
  @Prop(String) readonly color: string | undefined;
  @Prop(String) readonly textColor: string | undefined;
  @Prop(String) readonly toggleColor: string | undefined;
  @Prop(String) readonly toggleTextColor: string | undefined;
  @Prop({ type: Array, default: []}) readonly value!: string[];
  @Prop({ type: String, default: "md"}) readonly size!: string;

  toggle(value: any) {
    if (this.value.includes(value)) {
      this.$emit(
        "input",
        this.value.filter((val: any) => val != value)
      );
    } else {
      this.$emit("input", this.value.concat([value]));
    }
  }
}
</script>
