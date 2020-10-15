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
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class Warning extends Vue {
  @Prop(Boolean) readonly value!: boolean;
  @Prop({ type: String, default: ""}) readonly messages!: string;

  @Watch("messages")
  onMessagesChanged(value: string) {
    if (!value) {
      this.$emit("input", false);
    }
  }
}
</script>