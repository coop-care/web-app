<template>
  <div>
    <div class="text-subtitle1 counter">{{ $t("selectInterventionCategory") }}</div>
    <searchable-option-list
      color="intervention"
      :options="terminology.interventionScheme.categories"
      v-model="intervention.categoryCode"
    />

    <div class="text-subtitle1 counter">{{ $t("selectInterventionTarget") }}</div>
    <div v-if="usersGuideForProblem">
      <i18n
        path="frequentInterventionTargetsForProblem"
        tag="div"
        class="text-subtitle2 text-weight-medium q-mt-sm q-mb-xs q-pl-md"
      >
        <template v-slot:problem>
          <span class="text-weight-bold">{{ $t(record.problem.title) }}</span>:
        </template>
      </i18n>
      <searchable-option-list
        color="intervention"
        :options="suggestedTargets"
        v-model="intervention.targetCode"
      />
      <q-expansion-item
        :label="$t('otherInterventionTargetSelection')"
        header-class="text-subtitle2 text-weight-medium q-mb-xs dense-avatar"
        :default-opened="false"
      >
        <searchable-option-list
          color="intervention"
          :searchInputLabel="$t('findTargets')"
          :options="notSuggestedTargets"
          v-model="intervention.targetCode"
        />
      </q-expansion-item>
    </div>
    <div v-else>
      <searchable-option-list
        color="intervention"
        :searchInputLabel="$t('findTargets')"
        :options="allTargets"
        v-model="intervention.targetCode"
      />
    </div>

    <div class="text-subtitle1 counter">{{ $t("describeClientSpecificIntervention") }}</div>
    <q-input
      v-model="intervention.details"
      :label="$t('clientSpecificInterventionsHint')"
      autogrow
      color="intervention"
      debounce="50"
      class="q-mx-md q-mb-lg"
      clearable
    >
      <q-menu
        v-if="suggestedDetails.length"
        auto-close
        fit
        anchor="bottom left"
        self="top left"
        square
        no-focus
      >
        <q-list dense>
          <q-item
            v-for="text in suggestedDetails"
            :key="text"
            clickable
            @click="intervention.details = text"
            :active="intervention.details == text"
            active-class="text-intervention"
          >
            <q-item-section>{{ text }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-input>

    <div class="text-subtitle1 counter">{{ $t("planReminder") }}</div>
    <div class="q-mx-md">
      <div class="row q-col-gutter-lg q-mb-md items-start">
        <date-time
          v-model="intervention.startDate"
          :min="new Date()"
          :format="$t('datetimeFormat')"
          :label="$t('addReminderTime')"
          :placeholder="$t('datetimeFormatPlaceholder')"
          :options="startDateOptions"
          color="intervention"
          class="col-md-4 col-sm-6 col-12"
        />
        <reminder-editor
          v-if="intervention.startDate"
          v-model="recurrenceRule"
          :startDate="intervention.startDate"
          color="intervention"
          class="col-md-8 col-sm-6 col-12"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { date } from "quasar";
import {
  TerminologyWithMaps,
  UsersGuide,
  sortByTitle
} from "../helper/terminology";
import { Intervention } from "../models/intervention";
import { RecurrenceRule } from "../models/recurrenceRule";
import SearchableOptionList from "../components/SearchableOptionList.vue";
import ReminderEditor from "../components/ReminderEditor.vue";
import DateTime from "../components/DateTime.vue";

@Component({
  components: {
    SearchableOptionList,
    ReminderEditor,
    DateTime
  },
  props: {
    value: Intervention
  },
  watch: {
    startDate(this: InterventionEditor, value: Date | null) {
      if (!value) {
        this.recurrenceRule = null;
      }
    }
  }
})
export default class InterventionEditor extends Vue {
  get recurrenceRule() {
    // Always edit the last one. Fits most situations, but should be replaced with returning the currently valid one
    // based on startDate and recurrenceEnd
    const rules = this.intervention.recurrenceRules;
    return rules[rules.length - 1] || null;
  }
  set recurrenceRule(value: RecurrenceRule | null) {
    if (this.recurrenceRule) {
      if (value) {
        this.recurrenceRule = value;
      } else {
        this.intervention.recurrenceRules = this.intervention.recurrenceRules.filter(
          rule => rule != this.recurrenceRule
        );
      }
    } else if (value) {
      this.intervention.recurrenceRules.push(value);
    }
  }
  get startDateOptions() {
    const today = date.startOfDate(new Date(), "day");
    const tomorrow = date.addToDate(today, { days: 1 });
    const nextWeek = date.addToDate(today, { days: 7 });
    return [
      {
        label: this.$t("today"),
        value: today
      },
      {
        label: this.$t("tomorrow"),
        value: tomorrow
      },
      {
        label: this.$t("inOneWeek"),
        value: nextWeek
      }
    ];
  }
  get suggestedTargetCodes() {
    const suggestions = this.usersGuideForProblem?.interventionSuggestions;
    const codes: string[] = [];

    if (!suggestions) {
      return codes;
    }

    if (this.intervention.categoryCode) {
      return Object.keys(suggestions[this.intervention.categoryCode] || {});
    } else {
      return Array.from(
        new Set(
          Object.values(suggestions).reduce(
            (a, b) => a.concat(Object.keys(b)),
            [] as string[]
          )
        )
      );
    }
  }
  get allTargets() {
    let targets = this.terminology.interventionScheme.targets.concat([]);
    const other = targets.pop();
    targets = targets.sort(sortByTitle);

    if (other) {
      targets.push(other);
    }
    return targets;
  }
  get suggestedTargets() {
    return this.suggestedTargetCodes
      .map(code => this.terminology.targetByCode[code])
      .sort(sortByTitle)
      .concat(this.terminology.targetByCode["63"]);
  }
  get notSuggestedTargets() {
    const suggestedTargetCodes = this.suggestedTargetCodes.concat(["63"]);
    return Object.values(this.terminology.targetByCode)
      .filter(target => !suggestedTargetCodes.includes(target.code))
      .sort(sortByTitle);
  }
  get suggestedDetails() {
    if (this.intervention.categoryCode && this.intervention.targetCode) {
      const intervention = this.usersGuideForProblem?.interventionSuggestions;
      const category = intervention[this.intervention.categoryCode] || {};
      return category[this.intervention.targetCode] || [];
    } else {
      return [];
    }
  }
  get usersGuideForProblem() {
    return ((this.$t("usersGuide") as unknown) as UsersGuide)[
      this.record.problem.code
    ];
  }
  get intervention() {
    return this.$props.value as Intervention;
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as TerminologyWithMaps;
  }
  get record() {
    return this.$store.getters.getProblemRecordById(this.$route.params);
  }
}
</script>
