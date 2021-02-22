<template>
  <q-splitter
    v-model="splitValue"
    :limits="limits"
    :separator-class="!isCollapsed ? '' : 'hidden'"
    before-class="overflow-hidden"
    after-class="overflow-hidden"
  >
    <q-resize-observer @resize="onResize" />
    <template v-slot:before>
      <div ref="beforeContainer">
        <slot name="before" />
      </div>
    </template>

    <template v-slot:after>
      <div ref="afterContainer">
        <slot name="after" />
        <q-btn
          v-if="isCollapsed"
          flat
          round
          color="primary"
          icon="fas fa-chevron-left"
          size="13.5px"
          dense
          class="q-mx-sm absolute-top-left"
          @click="showBefore"/>
      </div>
    </template>
  </q-splitter>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Vue, Component, Prop, Ref } from "vue-property-decorator";

@Component
export default class SplitViewView extends Vue {
  @Prop({ type: Number, default: 300 }) readonly minSlotWidth!: number;
  @Ref() readonly beforeContainer!: HTMLElement;
  @Ref() readonly afterContainer!: HTMLElement;

  splitValue = 35;
  isCollapsed = false;
  isBeforeVisible = true;
  width = Infinity;

  get limits() {
    if (this.isCollapsed) {
      return [0, 100];
    } else {
      return [this.minWidthInPercent, 100 - this.minWidthInPercent];
    }
  }
  get minWidthInPercent() {
    return Math.round(this.minSlotWidth * 100 / this.width);
  }

  private onResize() {
    this.width = (this.$el as HTMLElement).offsetWidth;
    const wasCollapsed = this.isCollapsed;
    this.isCollapsed = this.width <= this.minSlotWidth * 2;
    this.showVisible(false);

    if (wasCollapsed != this.isCollapsed) {
      this.$emit("update:is-collapsed", this.isCollapsed);
    }
  }
  showVisible(animate: boolean) {
    if (this.isCollapsed) {
      const to = this.isBeforeVisible ? 100 : 0;

      if (animate) {
        const from = this.splitValue;
        const easing: (t: number) => number = t => t*(2-t);

        const eventName = this.isBeforeVisible ? "did-show-before" : "did-show-after";
        const containers = [this.beforeContainer, this.afterContainer];
        const width = Math.max(this.beforeContainer.offsetWidth, this.afterContainer.offsetWidth);
        containers.forEach(element => element.style.width = width + "px");

        this.animate(from, to, 200, easing, value => {
          this.splitValue = value;
          
          if (value == to) {
            containers.forEach(element => element.style.removeProperty("width"));
            this.$emit(eventName);
          }
        });
      } else {
        this.splitValue = to;
      }
    }
  }
  showBefore() {
    this.isBeforeVisible = true;
    this.showVisible(true);
  }
  showAfter(animate = true) {
    this.isBeforeVisible = false;
    this.showVisible(animate);
  }
  animate(from: number, to: number, duration: number, easing: (progress: number) => number = t => t,  handler: (value: number) => void) {
    let start: DOMHighResTimeStamp;
    const diff = to - from;

    function step(timestamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timestamp;
      }
      
      const elapsed = timestamp - start;

      if (elapsed < duration) {
        handler(from + diff * easing(elapsed / duration));
        window.requestAnimationFrame(step);
      } else {
        handler(to);
      }
    }
    
    window.requestAnimationFrame(step);
  }

  mounted() {
    this.onResize();

    if (!this.isCollapsed) {
      this.splitValue = this.minWidthInPercent;
    }
  }
}
</script>
