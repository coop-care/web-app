<template>
  <div class="labeled-value-item"> 
    <div
      v-for="(item, index) in items"
      :key="keyPrefix + index"
      class="row"
    >
      <div class="col-5 row items-center">
        <q-btn
          icon="remove"
          color="negative"
          :title="$t('delete')"
          unelevated
          round
          dense
          size="9.5px"
          @click="$emit('remove', index)"
        />
        <selectable-input
          :value="item.label"
          :options="labels"
          @input="$emit('input:label', {target: item, value: $event})"
          dense
          class="unlabeled-selectable-input col q-pl-md q-pr-xs no-text-size-adjust"
        />
      </div>
      <div class="col-7 q-pl-xs">
        <slot v-bind:item="item" />
      </div>
    </div>
    <div
      class="row items-center q-py-sm cursor-pointer non-selectable contact-add-button can-hover text-primary"
      @click="$emit('add')"
    >
      <q-btn
        icon="add"
        :title="addButtonLabel"
        color="positive"
        unelevated
        round
        dense
        size="9.5px"
      />
      <div class="q-pl-md text-body2 text-weight-medium no-text-size-adjust">
        {{ addButtonLabel }}
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.labeled-value-item > *
  border-bottom: 1px solid #cccccc
.unlabeled-selectable-input.q-field--auto-height.q-field--dense.q-field--labeled .q-field__control-container
  padding-top: 2px
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { LabeledValue } from "../models";
import SelectableInput from "../components/SelectableInput.vue";

@Component({
  components: {
    SelectableInput
  }
})
export default class ContactView extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly items!: LabeledValue<any>[];
  @Prop({ type: Array, default: () => [] }) readonly labels!: LabeledValue<string>[];
  @Prop({ type: String, default: "" }) readonly addButtonLabel!: string;
  @Prop({ type: String, default: "" + Math.random() }) readonly keyPrefix!: string;
}
</script>