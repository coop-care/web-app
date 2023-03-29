<template>
  <div>
    <q-btn 
      v-if="!value"
      icon="edit"
      round
      outline
      color="primary"
      size="10.5px"
      @click="$emit('update:model-value', true)"
      :title="$t('edit')"
      class="shadow-1"
    />
    <q-btn 
      v-else
      :label="$t('done')"
      rounded
      no-caps
      dense
      color="primary"
      @click="$emit('update:model-value', false)"
      class="q-px-sm"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model } from "vue-facing-decorator";

@Component({
  emits: ["update:model-value"]
})
export default class EditToggleButton extends Vue {
  @Model({ type: Boolean }) readonly value!: boolean;
}
</script>
