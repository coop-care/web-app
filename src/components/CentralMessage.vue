<template>
  <div class="fit">
    <div class="q-pa-md absolute-center vertical-middle text-center text-body2 full-width">{{ message }}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";

@Component
export default class CentralMessage extends Vue {
  @Prop({ type: String, required: true}) readonly message!: string;
}
</script>
