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
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  props: {
    options: Array,
    color: String,
    textColor: String,
    toggleColor: String,
    toggleTextColor: String,
    value: Array,
    size: {
      type: String,
      default: "md"
    }
  }
})
export default class ToggleButtonGroup extends Vue {
  toggle(value: any) {
    if (this.$props.value.includes(value)) {
      this.$emit(
        "input",
        this.$props.value.filter((val: any) => val != value)
      );
    } else {
      this.$emit("input", this.$props.value.concat([value]));
    }
  }
}
</script>
