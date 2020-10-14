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
        v-bind:key="index"
        :dense="!option.description"
      >
        <q-item-section
          side
          top
        >
          <q-checkbox
            v-if="allowMultipleSelection"
            :value="value"
            @input="$emit('input', $event)"
            :val="option.code"
            :color="color"
            keep-color
          />
          <q-radio
            v-else
            :value="value"
            @input="$emit('input', $event)"
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
import Vue from "vue";
import Component from "vue-class-component";
import { QInput } from "quasar";
import { Category } from "../helper/terminology";
import TextWithHighlights from "./TextWithHighlights.vue";

const SearchableOptionListProps = Vue.extend({
  props: {
    searchInputLabel: String,
    color: String,
    options: Array as () => Category[],
    value: [String, Array],
    allowMultipleSelection: Boolean,
    dense: Boolean,
    optionListClass: String,
  },
});

@Component({
  components: {
    TextWithHighlights,
  },
})
export default class SearchableOptionList extends SearchableOptionListProps {
  filter = "";
  $refs!: { filter: QInput };

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
          (option.title && regexp.exec(option.title)) ||
          (option.description && regexp.exec(option.description))
        );
      });
    }
  }

  resetFilter() {
    this.filter = "";
    this.$refs.filter.focus();
  }
}
</script>
