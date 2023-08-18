<template>
  <q-expansion-item
    v-model="isExpanded"
    switch-toggle-side
    header-class="text-subtitle2 text-weight-bold text-intervention"
    class="expandable-intervention bg-intervention-light radius-md overflow-hidden shadow-1"
    expand-icon="edit"
    :expanded-icon="!modelValue.categoryCode || !modelValue.targetCode || !modelValue.details ? 'fas fa-exclamation' : 'fas fa-check'"
  >
    <template v-slot:header>
      <q-item-section v-if="!isExpanded">
        <q-item-label caption>
          <q-icon 
            v-if="modelValue.category.icon"
            :name="$t(modelValue.category.icon)"
            class="q-mr-xs"
            color="intervention"
          />
          <span
            :class="[!modelValue.category.title ? 'text-italic' : '']"
          >{{ $t(($q.screen.gt.xs ? modelValue.category.title : modelValue.category.shortTitle) || "noInterventionCategory") }}: </span>
          <span
            :class="[!modelValue.target.title ? 'text-italic' : '']"
          >{{ $t(modelValue.target.title || "noInterventionTarget") }}:</span>
        </q-item-label>
        <q-item-label class="text-black">
          <span 
            :class="[detailsText ? 'text-weight-medium' : 'text-weight-regular text-italic']"
          >{{ detailsText || t("noInterventionDetails") }}</span>
          <span class="recurrence">{{ localizeRecurrenceRule(modelValue.recurrenceRules) }}</span>
        </q-item-label>
      </q-item-section>

      <q-item-section v-else>
        <q-item-label class="text-black text-weight-regular">
          {{ $t("editIntervention") + (!editCaption ? ":" : "") }}
        </q-item-label>
        <q-item-label caption>{{ editCaption }}</q-item-label>
      </q-item-section>

      <q-item-section side :top="$q.screen.lt.sm">
        <div :class="[$q.screen.lt.sm ? 'column' : 'row q-gutter-xs']">
          <q-btn
            icon="far fa-clone"
            flat
            round
            dense
            color="intervention"
            :title="$t('duplicate')"
            @click.stop="emit('duplicate')"
          />
          <q-btn
            icon="far fa-trash-alt"
            flat
            round
            dense
            color="intervention"
            :title="$t('delete')"
            @click.stop="emit('delete')"
          />
        </div>
      </q-item-section>
    </template>

    <intervention-editor
      :model-value="modelValue"
      :problem-code="problemCode"
      class="intervention-editor"
    />
  </q-expansion-item>
</template>

<style lang="sass">
.expandable-intervention
  border: 1px solid #ccc
  container-type: inline-size
  &> .q-expansion-item__container .q-item__section--avatar
    min-width: inherit
  .recurrence
    font-size: .75rem
    font-weight: 400
    letter-spacing: 0.03333em
    color: rgba(0, 0, 0, 0.54)
  .intervention-editor
    padding-left: 16px
    padding-right: 16px
  @container (max-width: 400px)
    &> .q-expansion-item__container
      &> .q-item
        padding-left: 8px
        padding-right: 4px
      .q-item__section--avatar
        padding-right: 6px
    .q-item__section--main ~ .q-item__section--side
      padding-left: 6px
    .intervention-editor
      padding-left: 8px
      padding-right: 8px
</style>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { Intervention, RRuleSet } from "src/models";
import { detailsText as interventionDetailsText } from "src/models/intervention";
import InterventionEditor from "src/components/InterventionEditorV4.vue";
import { useStore } from "src/store";

const emit = defineEmits(["delete", "duplicate"]);

const props = defineProps({
  modelValue: {
    type: Object as PropType<Intervention>,
    required: true,
  },
  problemCode: {
    type: String,
    default: "",
  }
});

const { tm, t, locale } = useI18n();
const { lang } = useQuasar();
const store = useStore();

let isExpanded = ref(!props.modelValue.categoryCode || !props.modelValue.targetCode || !props.modelValue.details)

const detailsText = computed(() => 
  interventionDetailsText(store.direct.state.guidelines, props.modelValue, props.problemCode)
);

const editCaption = computed(() => {
  if (!props.modelValue.categoryCode) {
    return t("selectInterventionCategory") + ":"
  } else if (!props.modelValue.targetCode) {
    return t("selectInterventionTarget") + ":"
  } else if (!props.modelValue.details) {
    return t("describeClientSpecificIntervention") + ":"
  } else {
    return "";
  }
});

const localizeRecurrenceRule = (recurrenceRules?: RRuleSet, ruleIndex = 0) => {
  return ", " + (recurrenceRules?.toLocalizedText(
    locale.value,
    tm("rrule") as Record<string, string>,
    {
      monthNames: lang.date.months,
      dayNames: lang.date.days,
      tokens: {}
    },
    ruleIndex
  ) || t("noReminder")) + "";
}

</script>
