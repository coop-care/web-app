<template>
  <q-expansion-item
    :icon="icon"
    :model-value="isExpanded"
    @update:model-value="expansionChanged"
    ref="expansionItem"
    class="intervention-item bg-intervention-light rounded-borders q-mb-sm"
    expand-icon-class="text-intervention expand-icon"
  >
    <template v-slot:header>
      <q-item-section side>
        <q-icon :name="icon" color="intervention" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-bold">{{ title }}</q-item-label>
        <q-item-label caption>{{ subtitle }}</q-item-label>
      </q-item-section>
      <q-item-section side class="close-icon">
        <q-btn
          icon="cancel"
          flat
          round
          dense
          @click.stop="$emit('delete-intervention')"
        />
      </q-item-section>
    </template>
    <intervention-editor :model-value="value" class="intervention-editor q-pb-md" />
  </q-expansion-item>
</template>

<style lang="sass">
.intervention
  .intervention-item
    .q-item
      @media (max-width: $breakpoint-xs-max)
        padding-right: 2px
    .expand-icon
      padding-left: 8px
      @media (max-width: $breakpoint-xs-max)
        padding-left: 0
        margin-left: -4px
    .q-expansion-item__toggle-icon
      font-size: 36px
    .close-icon
      @media (max-width: $breakpoint-xs-max)
        padding-left: 2px
  .intervention-editor
    padding-left: 58px
    @media (max-width: $breakpoint-xs-max)
      padding-left: 8px
</style>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-facing-decorator";
import InterventionEditor from "./InterventionEditorV2.vue";
import { Intervention } from "../models/intervention";

@Component({
  components: {
    InterventionEditor
  },
  emits: ["delete-intervention", "did-expand", "did-collapse"]
})
export default class EditableIntervention extends Vue {
  @Model({ type: Object, required: true}) readonly value!: Intervention;
  @Prop({ type: Boolean }) readonly isExpanded!: boolean;

  get icon() {
    return this.$t(this.value.category.icon) || "fas fa-question";
  }
  get title() {
    return this.value.details || this.$t("newIntervention");
  }
  get subtitle() {
    return (
      [this.value.category.title, this.value.target.title]
        .filter(title => title)
        .map(title => this.$t(title))
        .join(": ") || ""
    );
  }
  expansionChanged(expanded: boolean) {
    this.$emit(expanded ? "did-expand" : "did-collapse");
  }
}
</script>
