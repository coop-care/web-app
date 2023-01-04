<template>
  <q-select
    :value="value"
    :label="label"
    :options="filteredOptions"
    map-options
    emit-value
    :dense="dense"
    :options-dense="optionsDense"
    use-input
    hide-selected
    fill-input
    input-debounce="0"
    :clearable="clearable"
    :hide-dropdown-icon="hideDropdownIcon"
    :hint="hint"
    @input="$emit('input', $event || '')"
    @input-value="inputValue = $event;"
    @keydown.enter.tab="selectInputValue"
    @keydown.tab="lastTabKeyDownTimestamp = Date.now()"
    @blur="onBlur"
    @filter="filter"
    @popup-show="select.reset()"
    ref="select"
  >
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
      >
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label
            caption
            lines="1"
          >{{ scope.opt.description }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from "vue-property-decorator";
import { QSelect } from "quasar";

type SelectableInputOptions = {
  label: string;
  value: string;
  description?: string;
}

@Component
export default class SelectableInput extends Vue {
  @Prop({ type: String, default: "" }) readonly value!: string;
  @Prop({ type: String, default: "" }) readonly label!: string;
  @Prop({ type: Array, default: () => [] }) readonly options!: SelectableInputOptions[];
  @Prop(Boolean) readonly dense!: boolean;
  @Prop({ type: Boolean, default: true }) readonly optionsDense!: boolean;
  @Prop(Boolean) readonly clearable!: boolean;
  @Prop(Boolean) readonly hideDropdownIcon!: boolean;
  @Prop(Boolean) readonly noNewValue!: boolean;
  @Prop(String) readonly hint?: string;
  @Ref() readonly select!: QSelect;

  filteredOptions: SelectableInputOptions[] = this.options;
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

      if (!this.noNewValue) {
        this.$emit("input", value);
        this.$emit("new-value", value);
      }
    } else if (existingOption.value != this.value) {
      this.filteredOptions = this.options;
      this.$emit("input", existingOption.value);
    }
  }
  filter(value: string, update: (_: () => void) => void) {
    update(() => {
      const needle = value.toLocaleLowerCase()
      this.filteredOptions = this.options.filter(item => 
        [item.label, item.description || ""].join(" ").toLocaleLowerCase().indexOf(needle) > -1
      );
    })
  }
}
</script>