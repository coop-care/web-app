<template>
  <q-select
    :value="value"
    :label="label"
    :options="filteredOptions"
    map-options
    emit-value
    :dense="dense"
    options-dense
    use-input
    hide-selected
    fill-input
    input-debounce="0"
    :clearable="clearable"
    :hide-dropdown-icon="hideDropdownIcon"
    @input="$emit('input', $event || '')"
    @input-value="inputValue = $event;"
    @keydown.enter.tab="selectInputValue"
    @keydown.tab="lastTabKeyDownTimestamp = Date.now()"
    @blur="onBlur"
    @filter="filter"
    @popup-show="select.reset()"
    ref="select"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from "vue-property-decorator";
import { QSelect } from "quasar";
import { LabeledValue } from "../models";

@Component
export default class SelectableInput extends Vue {
  @Prop({ type: String, default: "" }) readonly value!: string;
  @Prop({ type: String, default: "" }) readonly label!: string;
  @Prop({ type: Array, default: () => [] }) readonly options!: LabeledValue<string>[];
  @Prop(Boolean) readonly dense!: boolean;
  @Prop(Boolean) readonly clearable!: boolean;
  @Prop(Boolean) readonly hideDropdownIcon!: boolean;
  @Ref() readonly select!: QSelect;

  filteredOptions: LabeledValue<string>[] = this.options;
  lastTabKeyDownTimestamp = 0;
  inputValue = "";

  onBlur() {
    if (this.lastTabKeyDownTimestamp + 100 < Date.now()) {
      this.selectInputValue();
    }
  }
  selectInputValue() {
    const value = this.inputValue.trim();
    const needle = value.toLocaleLowerCase();
    const existingOption = this.options.find(option => 
      option.label.toLocaleLowerCase() == needle || option.value == value
    );

    if (!existingOption) {
      this.filteredOptions = this.options;
      this.$emit("input", value);
      this.$emit("new-value", value);
    } else if (existingOption.value != this.value) {
      this.filteredOptions = this.options;
      this.$emit("input", existingOption.value);
    }
  }
  filter(value: string, update: (_: () => void) => void) {
    update(() => {
      const needle = value.toLocaleLowerCase()
      this.filteredOptions = this.options.filter(item => 
        item.label.toLocaleLowerCase().indexOf(needle) > -1
      );
    })
  }
}
</script>