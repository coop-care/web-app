<template>
  <q-item
    :class="[
      'labeled-item items-center', 
      item.action ? 'can-hover cursor-pointer' : '', 
      compactLayout ? 'compact-layout' : '', 
      item.classes || ''
    ]"
    dense
    :clickable="!!item.action"
    @click="onClick"
  >
    <div :class="['labeled-item-container col text-black', compactLayout ? 'column' : 'row']">
      <q-item-label 
        caption 
        :class="[
          'col-4 ellipsis non-selectable', 
          item.action && !item.value.includes('\n') ? 'single-line-with-action' : ''
        ]"
      >{{ item.label }}</q-item-label>
      <div class="col-8 row no-wrap items-center">
        <q-item-label 
          :class="[
            'col pre-wrap', 
            item.action ? 'text-primary' : '',
            !$q.platform.is.mobile && !item.action ? 'selectable' : 'non-selectable',
          ]"
        >{{ item.value }}</q-item-label>
        <div 
          v-if="item.action"
          class="show-on-hover row q-gutter-sm"
        >
          <q-btn
            v-if="isCopySupported"
            :icon="isCopied ? 'fas fa-check' : 'far fa-clipboard'"
            outline
            round
            color="primary"
            size="xs"
            @click.stop="copyFromButton"
          />
          <q-btn
            :icon="item.icon"
            unelevated
            round
            color="primary"
            size="xs"
            @click.stop="item.action"
          />
        </div>
      </div>
    </div>
    <q-btn
      v-if="isCopySupported"
      :label="$t('Copy')"
      unelevated
      rounded
      no-caps
      dense
      color="primary"
      :class="['callout-button', !showCopyCalloutButton ? 'hidden': '']"
      @click.stop.prevent="copyFromCallout"
    />
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
  .labeled-item-container.row
    .q-item__label
      margin-top: 0
    .q-item__label--caption
      text-align: right
      padding-right: 8px
      padding-top: 2px
  .labeled-item-container.column
    .q-item__label--caption
      padding-bottom: 2px
    .show-on-hover button
      margin-top: -2em
  &.q-hoverable > .q-focus-helper
    display: none
.no-touch .labeled-item
  .show-on-hover
    display: flex
    visibility: hidden
  &:hover .show-on-hover
    visibility: visible
  &.compact-layout .show-on-hover
    margin-right: 8px
  .labeled-item-container.row 
    .q-item__label--caption.single-line-with-action
      padding-top: 6px
.pre-wrap
  white-space: pre-wrap
.callout-button
  position: absolute
  top: -35px
  left: 0
  right: 0
  margin-left: auto
  margin-right: auto
  width: 100px
  box-shadow: 0px 3px 3px 0 rgba(0, 0, 0, 0.4)
  &:after
    content:''
    position: absolute
    top: 100%
    left: 50%
    margin-left: -12px
    width: 0
    height: 0
    box-sizing: border-box
    border: 6px solid black
    border-color: transparent transparent var(--q-primary) var(--q-primary)
    transform-origin: 0 0
    transform: rotate(-45deg)
    box-shadow: -3px 3px 3px 0 rgba(0, 0, 0, 0.4)
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";
import { onLongPress } from "@vueuse/core";
import { notifySuccess } from "src/helper/notify";
import { copyText } from "src/helper/clipboard";

export type LabeledItemType = {
  label: string; 
  value: string; 
  icon?: string; 
  classes?: string; 
  action?: () => void;
};

const delay = 500;

@Component
export default class LabeledItem extends Vue {
  @Prop({ type: Object, required: true}) readonly item!: LabeledItemType;
  @Prop({ type: Boolean }) readonly compactLayout!: boolean;

  isCopied = false;
  showCopyCalloutButton = false;
  lastPointerDownTimestamp = 0;
  isCopiedTimeout: null | number = null;

  get isCopySupported() {
    return true;
  }

  private async copyText() {
    if (this.isCopiedTimeout) {
      window.clearTimeout(this.isCopiedTimeout);
    }

    this.isCopied = await copyText(this.item.value);

    if (this.isCopied) {
      this.isCopiedTimeout = window.setTimeout(() => {
        this.isCopied = false
        this.isCopiedTimeout = null;
      }, 2000);
    }
  }

  onClick() {
    // on mobile, the click event must occur within 500 ms delay after the pointerdown event
    // to distinguish it from a long press gesture
    if (!this.$q.platform.is.mobile || Date.now() < this.lastPointerDownTimestamp + delay) {
      this.item.action?.();
    }
  }

  onDocumentPointerDown(event: Event) {
    if (!event.composedPath().includes(this.$el)) {
      this.showCopyCalloutButton = false;
    } else {
      this.lastPointerDownTimestamp = Date.now();
    }
  }

  async copyFromCallout() {
    await this.copyText();

    if (this.isCopied) {
      setTimeout(() => this.showCopyCalloutButton = false, 300);
    }
  }

  async copyFromButton() {
    await this.copyText();

    if (this.isCopied) {
      notifySuccess(this.$t("copied"));
    }
  }

  /* The item action shall be performed on click and copying the item value should
      as well be possible. Selecting the text always triggers the click event,
      so we need to avoid conflicting gestures.

      Solution for mobile: text selection is always disabled, item action is triggered
        on click and a long press gesuture shows a callout button for copying the 
        item value. The long press gesture is set to a delay of 500 ms, so the click
        must occur in less than 500 ms between pointerdown and pointerup events, otherwise 
        it is not considered a click. Because the clipboard API and the legacy 
        execCommand API require a user gesture (only click events seem to work on iOS) 
        and a long press is not considered a user gesture, the long press makes only the 
        button visible while the button click trigges the copy action.

      Solution for desktop: When no item action is defined, text selection is enabled to 
        make manual copying possible. When an item action exists, text selection is disabled, 
        and the item value can be copied with a button for copying which appears on 
        mouse over, while the item action itself is triggered via a click. There is no 
        need for a long press gesture on desktop because we can rely on the buttons
        appearing on mouse over which are more obvious and intuitive.
  */
  mounted() {
    if (this.$q.platform.is.mobile) {
      onLongPress(this.$el, () => this.showCopyCalloutButton = true);
      document.addEventListener("pointerdown", this.onDocumentPointerDown, false)
    }
  }

  unmounted() {
    document.removeEventListener("pointerdown", this.onDocumentPointerDown, false);
  }
}
</script>