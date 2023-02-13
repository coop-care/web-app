<template>
  <div class="full-width">
    <q-resize-observer @resize="onResize" />
    <q-btn-toggle
      v-model="categoryCode"
      spread
      no-caps
      unelevated
      rounded
      stack
      clearable
      :toggle-color="color"
      :text-color="color"
      :class="['intervention-category q-mt-sm q-mb-xs', 'border-' + color]"
      :options="categoryOptions"
    />
    <text-with-tooltip 
      v-if="categoryCode"
      :text="$t('category') + ': ' + $t('terminology.categoryByCode[' + categoryCode + '].title')"
      :tooltip="$t('terminology.categoryByCode[' + categoryCode + '].description')"
      :icon-class="'text-' + color"
      :class="['q-mx-md text-center text-body2 text-weight-medium', 'text-' + color]"
    />
    <div
      v-else
      :class="['text-center text-body2 text-weight-medium', 'text-' + color]"
    >{{ $t("noCategorySelected") }}</div>
  </div>
</template>

<style lang="sass">
.q-btn-toggle.intervention-category
  .q-btn__wrapper
    padding-left: 8px
    padding-right: 8px
    .q-btn__content
      .q-icon
        font-size: 24px
      span
        margin-top: 2px
        font-size: 12px
        line-height: .9rem
        width: 100%
        text-overflow: ellipsis
        white-space: nowrap
        overflow: hidden
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { TerminologyWithMaps } from "../helper/terminology";
import TextWithTooltip from "../components/TextWithTooltip.vue";

@Component({
  components: {
    TextWithTooltip
  }
})
export default class InterventionCategorySelect extends Vue {
  @Prop({ type: String, default: ""}) readonly value!: string;
  @Prop({ type: String, default: "primary"}) readonly color!: string;

  width = Infinity;
  
  get categoryCode() {
    return this.value;
  }
  set categoryCode(value) {
    this.$emit("input", value ?? "");
  }
  get categoryOptions() {
    return this.terminology.interventionScheme.categories.map((item) => {
      return {
        label: this.width > 600
          ? item.title
          : this.width > 320 && item.shortTitleKey 
            ? this.$t(item.shortTitleKey)
            : "",
        value: item.code,
        icon: item.icon,
      };
    });
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as TerminologyWithMaps;
  }

  private onResize() {
    this.width = (this.$el as HTMLElement).offsetWidth;
  }
}
</script>