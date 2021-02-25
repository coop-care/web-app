<template>
  <q-select
    :value="value"
    :label="label"
    :options="filteredOptions"
    map-options
    emit-value
    :dense="dense"
    options-dense
    multiple
    use-chips
    use-input
    input-debounce="0"
    :hide-dropdown-icon="hideDropdownIcon"
    @input="onInput"
    @new-value="createValue"
    @input-value="inputValue = $event;"
    @keydown.tab="selectInputValue(); lastTabKeyDownTimestamp = Date.now();"
    @keydown="onKeyDownComma"
    @blur="onBlur"
    @filter="filter"
    ref="select"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from "vue-property-decorator";
import { QSelect } from "quasar";
import { LabeledValue } from "../models";

@Component
export default class MultipleSelectableInput extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly value!: string[];
  @Prop({ type: String, default: "" }) readonly label!: string;
  @Prop({ type: Array, default: () => [] }) readonly options!: LabeledValue<string>[];
  @Prop(Boolean) readonly dense!: boolean;
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
  onKeyDownComma(event: KeyboardEvent) {
    if (event.key == ",") {
      event.preventDefault();
      this.selectInputValue();
    }
  }
  selectInputValue() {
    const value = this.inputValue.trim();
    if (value.length > 0) {
      if (this.value.includes(value)) {
        this.onInput(this.value);
      } else {
        this.onInput(this.value.concat(value));
      }
    }
  }
  onInput(value: string[]) {
    if (value.length) {
      const lastValue = value[value.length - 1];
      const needle = lastValue.toLocaleLowerCase();
      const normalizedValue = this.options.find(option => option.label.toLocaleLowerCase() == needle)?.value || lastValue;

      if (lastValue != normalizedValue) {
        value[value.length - 1] = normalizedValue;
      }
    }
    this.$emit("input", value);
    this.select.updateInputValue("");
  }
  createValue(value: string, done: (value: string, mode: string) => void) {
    if (value.length > 0) {
      done(value, "add-unique");
    }
  }
  filter(value: string, update: (_: () => void) => void) {
    update(() => {
      if (value) {
        const needle = value.toLocaleLowerCase()
        this.filteredOptions = this.options.filter(item => 
          item.label.toLocaleLowerCase().indexOf(needle) > -1
        );
      } else {
        this.filteredOptions = this.options;
      }
    })
  }
}
</script>