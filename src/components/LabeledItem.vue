<template>
  <q-item
    :class="[
      'labeled-item items-center non-selectable', 
      item.action ? 'can-hover cursor-pointer' : '', 
      compactLayout ? 'compact-layout' : '', 
      item.classes || ''
    ]"
    dense
    @mousedown="mousedown"
    @mouseup="mouseup"
  >
    <div :class="['col text-black', layoutClasses]">
      <q-item-label 
        caption 
        class="col-4 ellipsis"
      >{{ item.label }}</q-item-label>
      <div class="col-8 row no-wrap items-center">
        <q-item-label 
          :class="['col pre-wrap selectable', item.action ? 'text-primary' : '']"
        >{{ item.value }}</q-item-label>
        <div 
          v-if="item.action"
          class="show-on-hover"
        >
          <q-btn
            :icon="item.icon"
            unelevated
            round
            color="primary"
            size="xs"
            @click="item.action"
          />
        </div>
      </div>
    </div>
  </q-item>
</template>

<style lang="sass">
.labeled-item
  padding-top: 6px
  padding-bottom: 6px
  .show-on-hover
    display: none
  &.compact-layout
    padding-left: 0
    padding-right: 0
  :first-child.row
    .q-item__label
      margin-top: 0
    .q-item__label--caption
      text-align: right
      padding-right: 8px
  :first-child.column
    .q-item__label--caption
      padding-bottom: 2px
    .show-on-hover button
      margin-top: -2em
.no-touch .labeled-item
  .show-on-hover
    display: flex
    visibility: hidden
  &:hover .show-on-hover
    visibility: visible
  &.compact-layout .show-on-hover
    margin-right: 8px
.pre-wrap
  white-space: pre-wrap
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";

export type LabeledItemType = {
  label: string; 
  value: string; 
  icon?: string; 
  classes?: string; 
  action?: () => void;
};

@Component
export default class LabeledItem extends Vue {
  @Prop({ type: Object, required: true}) readonly item!: LabeledItemType;
  @Prop({ type: Boolean }) readonly compactLayout!: boolean;

  mouseDownEvent: MouseEvent | null = null;

  get layoutClasses() {
    if (this.compactLayout) {
      return "column"
    } else {
      return "row items-center"
    }
  }
  mousedown(event: MouseEvent) {
    this.mouseDownEvent = event;
  }
  mouseup(event: MouseEvent) {
    if (this.item.action && this.mouseDownEvent && 
      (Math.abs(event.x - this.mouseDownEvent.x) < 10) && 
      (Math.abs(event.y - this.mouseDownEvent.y) < 10)) {
        this.item.action();
    }
  }
}
</script>