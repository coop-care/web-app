<template>
  <q-select
    :model-value="value"
    :label="label"
    :options="filteredOptions"
    map-options
    emit-value
    :behavior="behavior"
    :dense="dense"
    options-dense
    multiple
    use-chips
    use-input
    type="text"
    enterkeyhint="enter"
    autocorrect="off"
    input-debounce="0"
    :hide-dropdown-icon="hideDropdownIcon"
    @update:model-value="onInput"
    @new-value="createValue"
    @input-value="onInputValue"
    @blur="onBlur"
    @filter="filter"
    @focus="onFocus"
    @popup-show="onPopupShow"
    @popup-hide="onPopupHide"
    ref="select"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Model } from "vue-facing-decorator";
import { QSelect } from "quasar";
import { LabeledValue } from "../models";
import { selectBehavior } from "src/helper/utils";

const delay = 200;

@Component({
  emits: ["update:model-value"]
})
export default class MultipleSelectableInput extends Vue {
  @Model({ type: Array, default: () => [] }) readonly value!: string[];
  @Prop({ type: String, default: "" }) readonly label!: string;
  @Prop({ type: Array, default: () => [] }) readonly options!: LabeledValue<string>[];
  @Prop({ type: Boolean }) readonly dense!: boolean;
  @Prop({ type: Boolean }) readonly hideDropdownIcon!: boolean;
  @Ref() readonly select!: QSelect;

  filteredOptions: LabeledValue<string>[] = this.options;
  lastOnInputTimestamp = 0;
  inputValue = "";
  isPopupVisible = false;

  get behavior() {
    return selectBehavior();
  }
  get input() {
    return this.$el?.querySelector("input.q-field__input") as HTMLElement | undefined
  }
  get isCordovaOnIOS() {
    return this.$q.platform.is.cordova && this.$q.platform.is.ios;
  }

  /*
   * Component can loose focus – blur – through three events:
   * 1. via tap/click outside the component,
   * 2. via tab key or 
   * 3. via tap on iOS inputAccessoryView next/previous buttons.
   * In case the component lost focus, we need to check if there is a remaining 
   * text input value that is not yet added to the values and displayed as a chip. 
   * If so, we do exactly that with the remaining text input value.
   */
  onBlur() {
    this.selectInputValue();
  }
  /**
   * In case the component lost focus because of a tap on iOS inputAccessoryView 
   * next/previous buttons, the onBlur method is not triggered and the popup won't hide,
   * but only if there is no remaining text input value, otherwise onInput would be called
   * and the popup would hide.
   * So we're going to fix this by listening to the native blur event of this component's
   * input element directly, but only for iOS.
   */
  onInputBlur() {
    setTimeout(() => {
      if (this.lastOnInputTimestamp + delay < Date.now()) {
        this.select.hidePopup();
      }
    })
  }

  /**
   * Component can receive focus through three events:
   * 1. via tap/click on the component,
   * 2. via tab key or 
   * 3. via tap on iOS inputAccessoryView next/previous buttons.
   * While a component tap/click shows the popup automatically, the other two focus events 
   * won't, so we need to show the popup manually, in case the popup is not visible after 
   * the focus event and a certain delay. If the popup is already visible, calling showPopup
   * would hide it again, so this needs to be prevented as well.
   */
  onFocus() {
    setTimeout(() => {
      if (!this.isPopupVisible) {
        this.select.showPopup();
      }
    }, delay)
  }
  onPopupShow() {
    this.isPopupVisible = true;
  }
  onPopupHide() {
    this.isPopupVisible = false;
  }

  // - handle text input, option selection and filtering options with text input:

  onInputValue(value: string) {
    if (value.includes(",")) {
      this.inputValue = value.split(",")[0];
      this.selectInputValue();
    } else {
      this.inputValue = value;
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
    this.$emit("update:model-value", value.map(item => item.trim()));
    // second parameter noFocus = true ensures that popup will only show if component does
    // not loose focus
    this.select.updateInputValue("", true);
    this.lastOnInputTimestamp = Date.now();
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

  mounted() {
    if (this.isCordovaOnIOS) {
      this.input?.addEventListener("blur", this.onInputBlur)
    }
  }
  unmounted() {
    if (this.isCordovaOnIOS) {
      this.input?.removeEventListener("blur", this.onInputBlur)
    }
  }
}
</script>
