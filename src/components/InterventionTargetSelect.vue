<template>
  <q-select
    :color="color"
    :options="filteredOptions"
    :label="$t('selectInterventionTarget')"
    :value="value"
    :hint="hint"
    :virtual-scroll-slice-size="options.length"
    option-value="code"
    option-label="title"
    emit-value
    map-options
    hide-bottom-space
    use-input
    hide-selected
    fill-input
    input-debounce="0"
    ref="select"
    class="intervention-target-select"
    @input="$emit('input', $event)"
    @filter="filterOptions"
  >
    <q-resize-observer @resize="onResize" />
    <template v-slot:option="scope">
      <q-item
        v-if="!scope.opt.isHeader"
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
        class="intervention-target-option"
        :style="widthStyle"
      >
        <q-item-section class="q-ml-md">
          <q-item-label>
            <text-with-highlights
              :text="scope.opt.title"
              :regex="filterRegExp"
              classesForMatches="text-underline text-weight-bolder"
            />
          </q-item-label>
          <q-item-label
            caption
            lines="2"
          >
            <text-with-highlights
              :text="scope.opt.description"
              :regex="filterRegExp"
              classesForMatches="text-underline text-weight-bolder"
              class="text-grey-8"
            />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-else
        v-bind="scope.itemProps"
        dense
        :class="'sticky-option-header bg-grey-4 ' + (scope.index > 0 ? '' : '')"
        :style="widthStyle"
      >
        <q-item-section>
          <simplified-markdown
            :text="scope.opt.title"
            class="text-subtitle2 one-line"
          />
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">{{ $t("noTargetsFound") }}</q-item-section>
      </q-item>
    </template>
    <template v-slot:after>
      <slot name="after" />
    </template>
  </q-select>
</template>

<style lang="sass">
body.desktop .intervention-target-option.q-manual-focusable--focused > .q-focus-helper
  opacity: .08
.sticky-option-header
  position: -webkit-sticky
  position: sticky
  top: 0px
  z-index: 1
.intervention-target-select .q-field__messages
  line-height: 1.3
</style>

<script lang="ts">
import { Vue, Component, Prop, Ref } from "vue-property-decorator";
import { QSelect } from "quasar";
import SimplifiedMarkdown from "components/SimplifiedMarkdown.vue";
import TextWithHighlights from "components/TextWithHighlights.vue";

export type InterventionTargetOption = {
  title: string;
  description?: string;
  code?: string;
  isHeader?: boolean;
};

@Component({
  components: {
    SimplifiedMarkdown,
    TextWithHighlights
  }
})
export default class InterventionTargetSelect extends Vue {
  @Prop(String) readonly value: string | undefined;
  @Prop({ type: Array, default: () => []}) readonly options!: InterventionTargetOption[];
  @Prop(String) readonly color: string | undefined;
  @Ref() readonly  select!: QSelect;

  filterRegExp: RegExp | undefined = undefined;
  filteredOptions: InterventionTargetOption[] = [];
  maxWidth = 300;

  get hint() {
    return this.value
      ? this.$t("terminology.targetByCode[" + this.value + "].description")
      : "";
  }
  get widthStyle() {
    return "max-width: " + this.maxWidth + "px";
  }

  filterOptions(inputValue: string, doneFn: (callbackFn: () => void) => void) {
    doneFn(() => {
      if (inputValue) {
        const regExp = new RegExp(
          // comment next line to search to word beginnings:
          // "(^|\\b)" +
          inputValue.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
          "gi"
        );
        this.filterRegExp = regExp;
        this.filteredOptions = this.options
          .filter(
            option =>
              (option.title && new RegExp(regExp).test(option.title)) ||
              (option.description && new RegExp(regExp).test(option.description)) ||
              option.isHeader
          )
          .filter(
            (option, index, list) =>
              !option.isHeader || (list[index + 1] && !list[index + 1].isHeader)
          );
      } else {
        this.filterRegExp = undefined;
        this.filteredOptions = this.options;
      }
    });
  }

  onResize() {
    this.maxWidth = (this.select.$el as HTMLElement).offsetWidth
  }

  mounted() {
    this.filteredOptions = this.options;
    this.maxWidth = (this.select.$el as HTMLElement).offsetWidth;
  }
}
</script>
