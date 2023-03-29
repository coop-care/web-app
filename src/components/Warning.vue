<template>
  <q-item
    v-if="value && messages"
    :class="['warning text-body2 q-pa-md radius-sm', margin]"
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
  background-color: var(--q-negative-bg)
  border: 2px dotted var(--q-negative)

  p
    margin: 0
</style>

<script lang="ts">
import { Vue, Component, Prop, Watch, Model } from "vue-facing-decorator";

@Component({
  emits: ["update:model-value"]
})
export default class Warning extends Vue {
  @Model({ type: Boolean }) readonly value!: boolean;
  @Prop({ type: String, default: ""}) readonly messages!: string;
  @Prop({ type: String, default: "q-mt-lg"}) readonly margin!: string;

  @Watch("messages")
  onMessagesChanged(value: string) {
    if (!value) {
      this.$emit("update:model-value", false);
    }
  }
}
</script>