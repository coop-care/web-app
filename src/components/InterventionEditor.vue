<template>
  <div
    class="intervention"
    v-if="record"
  >
    <div class="row q-col-gutter-lg">
      <div class="col-md-9 col-12">
        <h6 class="counter">{{ $t("selectInterventionCategory") }}</h6>
        <searchable-option-list
          color="intervention"
          :options="terminology.interventionScheme.categories"
          v-model="categoryCode"
        />

        <h6 class="counter">{{ $t("selectInterventionTarget") }}</h6>
        <div v-if="usersGuideForProblem">
          <i18n
            path="frequentInterventionTargetsForProblem"
            tag="div"
            class="text-subtitle1 text-weight-medium q-mt-md q-mb-sm"
          >
            <template v-slot:problem>
              <span class="text-weight-bold">{{
                $t(record.problem.title)
              }}</span>
            </template>
          </i18n>
          <searchable-option-list
            color="intervention"
            :options="suggestedTargets"
            v-model="targetCode"
          />
          <q-expansion-item
            :label="$t('otherInterventionTargetSelection')"
            header-class="text-subtitle1 text-weight-medium q-mt-md q-mb-sm q-px-none dense-avatar"
            switch-toggle-side
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

        <h6 class="counter">{{ $t("describeClientSpecificIntervention") }}</h6>
        <q-input
          v-model="details"
          :label="$t('clientSpecificInterventions')"
          autogrow
          color="intervention"
          debounce="50"
          :hint="$t('clientSpecificInterventionsHint')"
          filled
          dense
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

        <h6 class="counter">{{ $t("planReminder") }}</h6>
        <div class="row q-col-gutter-xl q-mb-lg items-start">
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
      <div class="col-md-3 col-12 summary">
        <problem-summary
          :problemRecord="record"
          :params="$route.params"
          :isSummary="true"
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
import { RecurrenceRule } from "../models/recurrenceRule";
import ProblemSummary from "../components/ProblemSummary.vue";
import SearchableOptionList from "../components/SearchableOptionList.vue";
import ReminderEditor from "../components/ReminderEditor.vue";
import DateTime from "../components/DateTime.vue";

@Component({
  components: {
    ProblemSummary,
    SearchableOptionList,
    ReminderEditor,
    DateTime
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
  categoryCode = "";
  targetCode = "";
  details = "";
  startDate: Date | null = null;
  recurrenceRule: RecurrenceRule | null = null;

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
    if (this.categoryCode && this.targetCode) {
      const intervention = this.usersGuideForProblem?.interventionSuggestions;
      const category = intervention[this.categoryCode] || {};
      return category[this.targetCode] || [];
    } else {
      return [];
    }
  }
  get usersGuideForProblem() {
    return ((this.$t("usersGuide") as unknown) as UsersGuide)[
      this.record.problem.code
    ];
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as TerminologyWithMaps;
  }
  get record() {
    return this.$store.getters.getProblemRecordById(this.$route.params);
  }
}
</script>
