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
        v-for="(item, index) in filteredItems"
        :key="item.value"
        clickable
        @click="$emit('input', item.value)"
        :active="value == item.value"
        :active-class="'text-' + color"
        :manual-focus="selectedItem >= 0"
        :focused="selectedItem == index"
      >
        <q-item-section>
          <q-item-label>
            <text-with-highlights
              :text="item.displayValue || item.value"
              :regex="filterRegExp"
              :classesForMatches="
                value != item.value ? 'text-underline text-weight-bolder' : ''
              "
            />
          </q-item-label>
          <q-item-label
            v-if="item.displayValue"
            caption
          >
            <text-with-highlights
              :text="item.value"
              :regex="filterRegExp"
              :classesForMatches="
                value != item.value ? 'text-underline text-weight-bolder' : ''
              "
            />
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, Watch } from "vue-property-decorator";
import { QMenu } from "quasar";
import TextWithHighlights from "../components/TextWithHighlights.vue";

type TitleCaption = { value: string; displayValue?: string; };

@Component({
  components: {
    TextWithHighlights
  }
})
export default class FilterableMenu extends Vue {
  @Prop({ type: String, required: true}) readonly value!: string;
  @Prop({ type: Array, default: () => []}) readonly items!: string[] | TitleCaption[];
  @Prop({ type: String, default: "primary"}) readonly color!: string;
  @Ref() readonly  menu: QMenu | undefined;

  isVisible = false;
  selectedItem = -1;

  @Watch("isVisible")
  onIsVisibleChanged(value: boolean) {
    if (!value) {
      this.selectedItem = -1;
    }
  }

  @Watch("filteredItems")
  onFilteredItemsChanged(values: string[]) {
    if (values.length == 0) {
      this.selectedItem = -1;
    }
  }

  @Watch("value")
  onValueChanged() {
    this.selectedItem = -1;
  }

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
    // @ts-ignore
    const items: TitleCaption[] = this.items.map((item: string | TitleCaption) => 
      typeof item == "string" ? { value: item } : item
    )

    if (this.filterRegExp) {
      const regexp = this.filterRegExp;
      return items.filter(item => {
        const value = item.value + " " + (item.displayValue || "");
        return new RegExp(regexp).test(value);
      });
    } else {
      return items;
    }
  }

  navigateMenu(event: KeyboardEvent) {
    if (!this.isVisible || this.filteredItems.length == 0) {
      return;
    }

    if (this.selectedItem < 0) {
      const element = this.menu?.$children[0]?.$el || document;
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
      this.$emit("input", this.filteredItems[this.selectedItem]?.value);
    }
  }

  show() {
    this.menu?.show();
  }
}
</script>
