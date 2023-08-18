<template>
  <div class="q-pb-sm">
    <intervention-category-select
      v-model="categoryCode"
      color="intervention"
      class="q-mb-sm"
    />

    <div class="q-mb-sm">
      <intervention-target-select
        v-if="categoryCode || targetCode || detailsText"
        v-model="targetCode"
        :problemCode="problemCode"
        :categoryCode="categoryCode"
        color="intervention"
      />
    </div>

    <q-input
      v-if="targetCode || detailsText"
      v-model="detailsText"
      :label="$t('describeClientSpecificIntervention')"
      autogrow
      color="intervention"
      debounce="50"
      :class="['q-mb-sm']"
      clearable
      ref="detailsInput"
      @keydown.up.down.enter.prevent="navigateDetailsMenu"
      @keydown="detailsMenu.show($event)"
    >
      <filterable-menu
        v-model="detailsText"
        ref="detailsMenu"
        :items="suggestedDetailsLabels"
        color="intervention"
        @update:model-value="onUpdateDetailsMenu"
      />
    </q-input>

    <div v-if="targetCode || detailsText || recurrenceRules">
      <reminder-editor
        v-model="recurrenceRules"
        color="intervention"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Model } from "vue-facing-decorator";
import WarningMixin, { WarningMixinInterface } from "../mixins/WarningMixin";
import { QInput } from "quasar";
import { Intervention } from "../models";
import { detailsText } from "src/models/intervention";
import InterventionCategorySelect from "../components/InterventionCategorySelect.vue";
import InterventionTargetSelect from "../components/InterventionTargetSelect.vue";
import ReminderEditor from "../components/ReminderEditor.vue";
import FilterableMenu from "../components/FilterableMenu.vue";
import { interventionSuggestions } from "src/models/guideline";

interface InterventionEditor extends WarningMixinInterface {};

@Component({
  components: {
    InterventionCategorySelect,
    InterventionTargetSelect,
    ReminderEditor,
    FilterableMenu,
  },
  mixins: [WarningMixin],
  emits: ["duplicate", "delete", "update:model-value"]
})
class InterventionEditor extends Vue {
  @Model({ type: Object, required: true}) readonly value!: Intervention;
  @Prop({ type: String, default: "" }) readonly problemCode!: string;
  @Prop({ type: Boolean }) readonly editMode!: boolean;
  @Ref() readonly detailsInput!: QInput;
  @Ref() readonly detailsMenu!: FilterableMenu;

  get categoryCode() {
    return this.value.categoryCode;
  }
  set categoryCode(value) {
    const {guideId, detailsCode} = this.getGuideIdAndDetailsCodeFromDetailsText(
      this.value.details, 
      this.interventionSuggestions?.[value]?.[this.targetCode] || {}
    );
    
    if (this.editMode && (this.value.targetCode || this.value.details)) {
      this.showWarning(
        this.$t("changingInterventionCategoryWarningMessage") as string
      ).onOk(() => {
        this.updateIntervention({ categoryCode: value, guideId, detailsCode });
      });
    } else {
      this.updateIntervention({ categoryCode: value, guideId, detailsCode });
    }
  }
  get targetCode() {
    return this.value.targetCode;
  }
  set targetCode(value) {
    const {guideId, detailsCode} = this.getGuideIdAndDetailsCodeFromDetailsText(
      this.value.details, 
      this.interventionSuggestions?.[this.categoryCode]?.[value] || {}
    );
    
    this.updateIntervention({ targetCode: value, guideId, detailsCode });
  }
  get guideIdAndDetailsCode() {
    return [this.value.guideId, this.value.detailsCode].filter(Boolean).join(".");
  }
  get detailsText() {
    return detailsText(this.$store.direct.state.guidelines, this.value, this.problemCode) || "";
  }
  set detailsText(value) {
    if (!!this.value.guideId && !!this.value.detailsCode) {
      const details = this.suggestedDetails[this.guideIdAndDetailsCode];

      if (details != value) {
        this.updateIntervention({ guideId: "", detailsCode: "" });
      }
    }

    const {guideId, detailsCode, details} = this.getGuideIdAndDetailsCodeFromDetailsText(value);
    
    if (guideId && detailsCode) {
      this.updateIntervention({ guideId, detailsCode, details });
    } else {
      this.updateIntervention({ details: value ?? "" });
    }
  }
  get recurrenceRules() {
    return this.value.recurrenceRules;
  }
  set recurrenceRules(value) {
    this.updateIntervention({ recurrenceRules: value });
  }
  get interventionSuggestions() {
    return interventionSuggestions(this.$store.direct.state.guidelines, this.problemCode);
  }
  get suggestedDetails() {
    if (this.categoryCode && this.targetCode) {
      const category = this.interventionSuggestions?.[this.categoryCode] || {};
      return category[this.targetCode] || {};
    } else {
      return {};
    }
  }
  get suggestedDetailsLabels() {
    return Object.values(this.suggestedDetails).filter(Boolean);
  }

  onUpdateDetailsMenu(value: string) {
    const {guideId, detailsCode, details} = this.getGuideIdAndDetailsCodeFromDetailsText(value);

    if (guideId && detailsCode) {
      this.updateIntervention({ guideId, detailsCode, details });
    }

    this.detailsInput.focus();
  }

  getGuideIdAndDetailsCodeFromDetailsText(value?: string, suggestedDetails = this.suggestedDetails) {
    if (!value) {
      return {guideId: "", detailsCode: "", details: ""};
    }

    const [guideIdAndDetailsCode, details] = Object.entries(suggestedDetails)
      .find(([,label]) => label.toLowerCase() == value.toLowerCase()) || [".", ""];
    const [guideId, detailsCode] = guideIdAndDetailsCode.split(".");

    return {guideId, detailsCode, details};
  }

  navigateDetailsMenu(event: KeyboardEvent) {
    this.detailsMenu.navigateMenu(event);
  }

  updateIntervention(changes: Partial<Intervention>) {
    this.$store.direct.commit.updateReminder({
      target: this.value,
      changes: changes,
    });
    this.$emit("update:model-value", this.value);
  }
}

export default InterventionEditor;
</script>
