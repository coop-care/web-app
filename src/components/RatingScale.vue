<template>
  <div class="rating-header column no-wrap justify-center text-center q-mb-xs">
    <text-with-tooltip
      :text="titleText"
      :tooltip="titleTooltip"
      class="text-subtitle2 ellipsis"
    />
    <text-with-tooltip
      :text="mouseoverScale"
      :tooltip="mouseoverExample"
      class="text-weight-light ellipsis"
    />
  </div>
  <div class="row items-center">
    <q-icon
      name="sentiment_very_dissatisfied"
      color="negative"
      size="md"
    />
    <q-btn-toggle
      :model-value="value"
      @update:model-value="$emit('update:model-value', $event ?? 0)"
      spread
      no-caps
      unelevated
      :toggle-color="color"
      rounded
      :text-color="color"
      :options="options"
      :class="'q-mx-xs col border-' + color"
      :clearable="clearable"
      :style="buttonStyle"
    >
      <template v-slot:1>
        <q-tooltip
          v-if="$q.platform.is.desktop"
          class="hidden"
          @before-show="mouseover = 0"
          @before-hide="mouseover = -1"
        />
      </template>
      <template v-slot:2>
        <q-tooltip
          v-if="$q.platform.is.desktop"
          class="hidden"
          @before-show="mouseover = 1"
          @before-hide="mouseover = -1"
        />
      </template>
      <template v-slot:3>
        <q-tooltip
          v-if="$q.platform.is.desktop"
          class="hidden"
          @before-show="mouseover = 2"
          @before-hide="mouseover = -1"
        />
      </template>
      <template v-slot:4>
        <q-tooltip
          v-if="$q.platform.is.desktop"
          class="hidden"
          @before-show="mouseover = 3"
          @before-hide="mouseover = -1"
        />
      </template>
      <template v-slot:5>
        <q-tooltip
          v-if="$q.platform.is.desktop"
          class="hidden"
          @before-show="mouseover = 4"
          @before-hide="mouseover = -1"
        />
      </template>
    </q-btn-toggle>
    <q-icon
      name="sentiment_very_satisfied"
      color="positive"
      size="md"
    />
  </div>
</template>

<style lang="sass">
.rating-header
  height: 2.7rem
</style>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-facing-decorator";
import TextWithTooltip from "./TextWithTooltip.vue";

@Component({
  components: {
    TextWithTooltip
  },
  emits: ["update:model-value"]
})
export default class RatingView extends Vue {
  @Model({ type: Number, default: 0 }) readonly value!: number;
  @Prop({ type: Array, required: true}) readonly scale!: string[];
  @Prop({ type: Array, default: () => []}) readonly examples!: string[];
  @Prop({ type: String, required: true}) readonly titleText!: string;
  @Prop({ type: String, required: true}) readonly titleTooltip!: string;
  @Prop({ type: String, default: "primary"}) readonly color!: string;
  @Prop({ type: String, default: ""}) readonly buttonStyle!: string;
  @Prop({ type: Boolean}) readonly clearable!: boolean;

  mouseover = -1;

  get options() {
    return [1, 2, 3, 4, 5].map(value => {
      return { label: "" + value, value, slot: value };
    });
  }

  get mouseoverScale() {
    if (this.mouseover < 0) {
      return this.scale[this.value - 1] || " ";
    } else {
      return this.scale[this.mouseover];
    }
  }
  get mouseoverExample() {
    if (
      (this.mouseover < 0 ||
        this.mouseover == this.value - 1) &&
      this.examples[this.value - 1]
    ) {
      return this.$t("examplePrefix", {
        text: this.examples[this.value - 1]
      });
    } else {
      return "";
    }
  }

}
</script>