<template>
  <q-item
    v-if="value && messages"
    class="warning text-body2 q-pa-md q-mt-lg radius-sm"
  >
    <q-item-section side>
      <q-icon
        name="fas fa-exclamation-triangle"
        color="negative"
      />
    </q-item-section>
    <q-item-section>
      <p
        v-for="message in messages.split('\n')"
        :key="message"
      >{{ message }}</p>
    </q-item-section>
  </q-item>
</template>

<style lang="sass">
.warning
  background-color: var(--q-color-negative-bg)
  border: 2px dotted var(--q-color-negative)

  p
    margin: 0
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const WarningProps = Vue.extend({
  props: {
    value: Boolean,
    messages: String,
  },
});

@Component({
  watch: {
    messages(this: Warning, value: string) {
      if (!value) {
        this.$emit("input", false);
      }
    },
  },
})
export default class Warning extends WarningProps {}
</script>