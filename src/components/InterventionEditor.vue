<template>
  <div>
    <div class="text-subtitle1 counter">{{ $t("selectInterventionCategory") }}</div>
    <searchable-option-list
      color="intervention"
      :options="terminology.interventionScheme.categories"
      v-model="categoryCode"
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
        v-model="targetCode"
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
          v-model="targetCode"
        />
      </q-expansion-item>
    </div>
    <div v-else>
      <searchable-option-list
        color="intervention"
        :searchInputLabel="$t('findTargets')"
        :options="allTargets"
        v-model="targetCode"
      />
    </div>

    <div class="text-subtitle1 counter">{{ $t("describeClientSpecificIntervention") }}</div>
    <q-input
      v-model="details"
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
            @click="details = text"
            :active="details == text"
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
          v-model="startDate"
          :min="new Date()"
          :format="$t('datetimeFormat')"
          :label="$t('addReminderTime')"
          :placeholder="$t('datetimeFormatPlaceholder')"
          :options="startDateOptions"
          color="intervention"
          class="col-md-4 col-sm-6 col-12"
        />
        <reminder-editor
          v-if="startDate"
          v-model="recurrenceRule"
          :startDate="startDate"
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

const nameof = (name: keyof Intervention) => name;

const InterventionEditorProps = Vue.extend({
  props: {
    value: Intervention
  }
});

@Component({
  components: {
    SearchableOptionList,
    ReminderEditor,
    DateTime
  },
  watch: {
    startDate(this: InterventionEditor, value: Date | null) {
      if (!value) {
        this.recurrenceRule = undefined;
      }
    }
  }
})
export default class InterventionEditor extends InterventionEditorProps {
  get categoryCode() {
    return this.value.categoryCode;
  }
  set categoryCode(value) {
    this.updateIntervention(nameof("categoryCode"), value);
  }
  get targetCode() {
    return this.value.targetCode;
  }
  set targetCode(value) {
    this.updateIntervention(nameof("targetCode"), value);
  }
  get details() {
    return this.value.details;
  }
  set details(value) {
    this.updateIntervention(nameof("details"), value);
  }
  get startDate() {
    return this.value.startDate;
  }
  set startDate(value) {
    this.updateIntervention(nameof("startDate"), value);
  }
  get recurrenceRule() {
    // Always edit the last one. Fits most situations, but should be replaced with returning the currently valid one
    // based on startDate and recurrenceEnd
    const rules = this.value.recurrenceRules;
    return rules[rules.length - 1] || undefined;
  }
  set recurrenceRule(value: RecurrenceRule | undefined) {
    if (value == this.recurrenceRule) {
      return;
    }

    const recurrenceRules = this.value.recurrenceRules.slice();

    if (this.recurrenceRule) {
      const index = recurrenceRules.indexOf(this.recurrenceRule);

      if (value) {
        recurrenceRules[index] = value;
      } else {
        recurrenceRules.splice(index, 1);
      }
    } else if (value) {
      recurrenceRules.push(value);
    }

    this.updateIntervention(nameof("recurrenceRules"), recurrenceRules);
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

    if (this.categoryCode) {
      return Object.keys(suggestions[this.categoryCode] || {});
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
    if (this.categoryCode && this.targetCode && this.usersGuideForProblem) {
      const intervention = this.usersGuideForProblem.interventionSuggestions;
      const category = intervention[this.categoryCode] || {};
      return category[this.targetCode] || [];
    } else {
      return [];
    }
  }
  get usersGuideForProblem() {
    return ((this.$t("usersGuide") as unknown) as UsersGuide)[
      this.record?.problem.code || ""
    ];
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as TerminologyWithMaps;
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }

  updateIntervention(key: string, value: any) {
    const changes: any = {};
    changes[key] = value;

    this.$store.direct.commit.updateObject({
      target: this.value,
      changes: changes
    });
  }
}
</script>
