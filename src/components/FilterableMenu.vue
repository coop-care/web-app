<template>
  <q-menu
    auto-close
    fit
    anchor="bottom left"
    self="top left"
    square
    no-focus
    ref="menu"
    v-model="isVisible"
  >
    <q-list dense @mousemove="selectedItem = -1">
      <q-item
        v-for="(text, index) in filteredItems"
        :key="text"
        clickable
        @click="$emit('input', text)"
        :active="value == text"
        active-class="text-intervention"
        :manual-focus="selectedItem >= 0"
        :focused="selectedItem == index"
      >
        <q-item-section>
          <q-item-label>
            <text-with-highlights
              :text="text"
              :regex="filterRegExp"
              :classesForMatches="
                value != text ? 'text-underline text-weight-bolder' : ''
              "
            />
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QMenu } from "quasar";
import TextWithHighlights from "../components/TextWithHighlights.vue";

const FilterableMenuProps = Vue.extend({
  props: {
    value: String,
    items: Array as () => string[]
  }
});

@Component({
  components: {
    TextWithHighlights
  },
  watch: {
    isVisible(this: FilterableMenu, value: boolean) {
      if (!value) {
        this.selectedItem = -1;
      }
    },
    filteredItems(this: FilterableMenu, values: string[]) {
      if (values.length == 0) {
        this.selectedItem = -1;
      }
    },
    value(this: FilterableMenu) {
      this.selectedItem = -1;
    }
  }
})
export default class FilterableMenu extends FilterableMenuProps {
  $refs!: { menu: QMenu };
  isVisible = false;
  selectedItem = -1;

  get filterRegExp() {
    if (this.value) {
      return new RegExp(
        // comment next line to search to word beginnings:
        // "(^|\\b)" +
        this.value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "gi"
      );
    } else {
      return undefined;
    }
  }
  get filteredItems() {
    setTimeout(() => {
      this.$refs.menu?.updatePosition();
    }, 0);

    if (this.filterRegExp) {
      const regexp = this.filterRegExp;
      return this.items.filter(text => regexp.exec(text));
    } else {
      return this.items;
    }
  }

  navigateMenu(event: KeyboardEvent) {
    if (!this.isVisible || this.filteredItems.length == 0) {
      return;
    }

    if (this.selectedItem < 0) {
      const element = this.$refs.menu?.$children[0]?.$el || document;
      const hoveredItem = element.querySelector(".q-item:hover");
      const siblings = hoveredItem?.parentElement?.children || [];

      if (hoveredItem) {
        this.selectedItem = Array.from(siblings).indexOf(hoveredItem);
      }
    }

    if (event.key == "ArrowDown") {
      this.selectedItem = (this.selectedItem + 1) % this.filteredItems.length;
    } else if (event.key == "ArrowUp") {
      this.selectedItem =
        this.selectedItem > 0
          ? this.selectedItem - 1
          : this.filteredItems.length - 1;
    } else if (
      event.key == "Enter" &&
      this.selectedItem >= 0 &&
      this.selectedItem < this.filteredItems.length
    ) {
      this.$emit("input", this.filteredItems[this.selectedItem]);
    }
  }
}
</script>
