<template>
  <q-expansion-item
    expand-separator
    icon=""
    :label="title"
    :caption="subtitle"
    :value="isExpanded"
    @input="expansionChanged"
    @show="scroll"
    ref="expansionItem"
  >
    <intervention-editor
      :value="value"
      class="q-pl-xl q-pb-md"
    />
  </q-expansion-item>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { scroll } from "quasar";
import InterventionEditor from "./InterventionEditor.vue";
import { Intervention } from "../models/intervention";

const { setScrollPosition } = scroll;

@Component({
  props: {
    value: Intervention,
    isExpanded: Boolean
  },
  components: {
    InterventionEditor
  }
})
export default class EditableIntervention extends Vue {
  get icon() {
    return "";
  }
  get title() {
    return this.$props.value.details || this.$t("newIntervention");
  }
  get subtitle() {
    return (
      [this.$props.value.category.title, this.$props.value.target.title]
        .filter(title => title)
        .map(title => this.$t(title))
        .join(": ") || ""
    );
  }
  expansionChanged(expanded: boolean) {
    this.$emit(expanded ? "didExpand" : "didCollapse");
  }
  created() {
    if (this.$props.isExpanded) {
      setTimeout(this.scroll, 10);
    }
  }
  scroll() {
    if (!this.$el || !this.$el.parentElement) {
      return;
    }
    const siblings = Array.from(this.$el.parentElement.children || []);
    const offsetTop =
      ((this.$el as HTMLElement).offsetParent as HTMLElement).offsetTop +
      (siblings[0] as HTMLElement).offsetTop;
    const headerHeight = (this.$el.querySelector(".q-item") as HTMLElement)
      .offsetHeight;
    const index = siblings.indexOf(this.$el);
    const offset = offsetTop + headerHeight * index;
    const duration = 250;
    setScrollPosition(window, offset, duration);
  }
}
</script>
