<template>
  <div>
    <div
      v-if="!isRevealed && !revealImmediately"
      @click="isRevealed = true"
      :class="['cursor-pointer text-weight-medium', 'text-' + color, buttonClass]"
    >{{ label }}</div>
    <slot v-else/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component
export default class ContactView extends Vue {
  @Prop({ type: String, default: ""}) readonly label!: string;
  @Prop({ type: String, default: "primary"}) readonly color!: string;
  @Prop({ type: String, default: "primary"}) readonly buttonClass!: string;
  @Prop({ type: Boolean }) readonly revealImmediately!: boolean;

  isRevealed = false;
}
</script>