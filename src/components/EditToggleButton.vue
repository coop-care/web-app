<template>
  <div>
    <q-btn 
      v-if="!value"
      icon="edit"
      round
      outline
      color="primary"
      size="10.5px"
      @click="$emit('input', true)"
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
      @click="$emit('input', false)"
      class="q-px-sm"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class EditToggleButton extends Vue {
  @Prop(Boolean) readonly value!: boolean;
}
</script>
