<template>
  <div>
    <intervention-category-select
      v-if="isSingleEditor"
      v-model="categoryCode"
      color="intervention"
      class="q-mb-sm"
    />

    <div
      v-if="!isSingleEditor && $q.screen.lt.sm"
      class="text-right"
    >
      <q-btn
        icon="far fa-clone"
        flat
        round
        dense
        color="intervention"
        :title="$t('duplicate')"
        @click.stop="$emit('duplicate')"
      />
      <q-btn
        icon="far fa-trash-alt"
        flat
        round
        dense
        color="intervention"
        :title="$t('delete')"
        class="q-ml-xs"
        @click.stop="$emit('delete')"
      />
    </div>

    <div class="q-mb-sm">
      <intervention-target-select
        v-model="targetCode"
        :problemCode="problemCode"
        :categoryCode="categoryCode"
        color="intervention"
      >
        <template
          v-slot:after
          v-if="!isSingleEditor && $q.screen.gt.xs"
        >
          <q-btn
            icon="far fa-clone"
            flat
            round
            dense
            color="intervention"
            :title="$t('duplicate')"
            @click.stop="$emit('duplicate')"
          />
          <q-btn
            icon="far fa-trash-alt"
            flat
            round
            dense
            color="intervention"
            :title="$t('delete')"
            class="q-ml-xs"
            @click.stop="$emit('delete')"
          />
        </template>
      </intervention-target-select>
    </div>

    <q-input
      v-if="targetCode || details"
      v-model="details"
      :label="$t('describeClientSpecificIntervention')"
      autogrow
      color="intervention"
      debounce="50"
      class="q-mb-sm"
      clearable
      ref="detailsInput"
      @keydown.up.down.enter.prevent="navigateDetailsMenu"
    >
      <filterable-menu
        v-model="details"
        ref="detailsMenu"
        :items="suggestedDetails"
        color="intervention"
        @update:model-value="detailsInput.focus()"
      />
    </q-input>

    <div v-if="targetCode || details">
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
import { UsersGuide } from "../helper/terminology";
import { Intervention } from "../models";
import InterventionCategorySelect from "../components/InterventionCategorySelect.vue";
import InterventionTargetSelect from "../components/InterventionTargetSelect.vue";
import ReminderEditor from "../components/ReminderEditor.vue";
import FilterableMenu from "../components/FilterableMenu.vue";

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
  @Prop({ type: Boolean }) readonly isSingleEditor!: boolean;
  @Prop({ type: Boolean }) readonly editMode!: boolean;
  @Ref() readonly detailsInput!: QInput;
  @Ref() readonly detailsMenu!: FilterableMenu;

  get categoryCode() {
    return this.value.categoryCode;
  }
  set categoryCode(value) {
    if (this.editMode && (this.value.targetCode || this.value.details)) {
      this.showWarning(
        this.$t("changingInterventionCategoryWarningMessage") as string
      ).onOk(() => {
        this.updateIntervention({ categoryCode: value });
      });
    } else {
      this.updateIntervention({ categoryCode: value });
    }
  }
  get targetCode() {
    return this.value.targetCode;
  }
  set targetCode(value) {
    this.updateIntervention({ targetCode: value });
  }
  get details() {
    return this.value.details;
  }
  set details(value) {
    this.updateIntervention({ details: value ?? "" });
  }
  get recurrenceRules() {
    return this.value.recurrenceRules;
  }
  set recurrenceRules(value) {
    this.updateIntervention({ recurrenceRules: value });
  }
  get suggestedDetails() {
    if (this.categoryCode && this.targetCode && this.usersGuideForProblem) {
      const intervention = this.usersGuideForProblem.interventionSuggestions;
      const category = intervention[this.categoryCode] || {};
      const details = category[this.targetCode] || [];

      return details.filter(Boolean);
    } else {
      return [];
    }
  }
  get usersGuideForProblem() {
    return ((this.$tm("usersGuide") as unknown) as UsersGuide)[this.problemCode || ""];
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
