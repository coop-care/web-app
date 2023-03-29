<template>
  <div>
    <q-input
      ref="filter"
      :color="color"
      filled
      v-model="filter"
      :label="searchInputLabel"
      v-if="!!searchInputLabel"
      dense
    >
      <template v-slot:prepend>
        <q-icon
          name="search"
          :color="color"
        />
      </template>
      <template v-slot:append>
        <q-icon
          v-if="filter !== ''"
          name="clear"
          :color="color"
          class="cursor-pointer"
          @click="resetFilter()"
        />
      </template>
    </q-input>
    <q-list
      :dense="dense"
      :class="optionListClass"
    >
      <q-item
        tag="label"
        v-for="(option, index) in filteredOptions"
        :key="index"
        :dense="!option.description"
      >
        <q-item-section
          side
          top
        >
          <q-checkbox
            v-if="allowMultipleSelection"
            :model-value="value"
            @update:model-value="$emit('update:model-value', $event)"
            :val="option.code"
            :color="color"
            keep-color
          />
          <q-radio
            v-else
            :model-value="value"
            @update:model-value="$emit('update:model-value', $event)"
            :val="option.code"
            :color="color"
            keep-color
          />
        </q-item-section>
        <q-item-section>
          <q-item-label :class="!!option.description ? 'text-weight-medium' : ''">
            <q-icon
              v-if="option.icon"
              :name="option.icon"
              class="on-left q-mr-sm"
            />
            <text-with-highlights
              :text="option.title"
              :regex="filterRegex"
              classesForMatches="text-underline text-weight-bolder"
            />
          </q-item-label>
          <q-item-label
            caption
            v-if="!!option.description"
            :lines="(allowMultipleSelection && !value.includes(option.code)) || (!allowMultipleSelection && (value != option.code)) ? 2 : 0"
          >
            <text-with-highlights
              :text="option.description"
              :regex="filterRegex"
              classesForMatches="text-underline text-weight-bolder"
            />
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Model } from "vue-facing-decorator";
import { QInput } from "quasar";
import { Category } from "../helper/terminology";
import TextWithHighlights from "./TextWithHighlights.vue";

@Component({
  components: {
    TextWithHighlights,
  },
  emits: ["update:model-value"]
})
export default class SearchableOptionList extends Vue {
  @Prop({ type: String }) readonly searchInputLabel: string | undefined;
  @Prop({ type: String }) readonly color: string | undefined;
  @Prop({ type: Array, default: () => []}) readonly options!: Category[];
  @Model({ type: [String, Array] }) readonly value!: string | string[];
  @Prop({ type: Boolean }) readonly allowMultipleSelection!: boolean;
  @Prop({ type: Boolean }) readonly dense!: boolean;
  @Prop({ type: String }) readonly optionListClass: string | undefined;
  @Ref() readonly filterInput!: QInput;

  filter = "";

  get filterRegex() {
    if (!this.filter) {
      return undefined;
    } else {
      return new RegExp(
        "(^|\\b)" + this.filter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "gi"
      );
    }
  }
  get filteredOptions() {
    if (!this.filter) {
      return this.options;
    } else {
      const regexp = this.filterRegex
      return this.options.filter((option) => {
        return (
          !regexp ||
          (option.title && new RegExp(regexp).test(option.title)) ||
          (option.description && new RegExp(regexp).test(option.description))
        );
      });
    }
  }

  resetFilter() {
    this.filter = "";
    this.filterInput.focus();
  }
}
</script>
