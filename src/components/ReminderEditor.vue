<template>
  <div>
    <div class="row q-col-gutter-lg items-start">
      <div class="col-md-6 col-12">
        <q-select
          v-model="frequency"
          :options="frequencyOptions"
          :label="$t('recurrence')"
          options-dense
          :color="color"
          options-cover
          map-options
          emit-value
        />

        <q-toggle
          v-if="frequency != RecurrenceFrequency.Never"
          v-model="hasOwnRecurrencePattern"
          :label="$t('ownRecurrencePatternTitle')"
          :color="color"
          switch-toggle-side
          class="q-mt-lg q-mb-sm"
          dense
        />

        <div v-if="hasOwnRecurrencePattern">
          <div v-if="frequency != RecurrenceFrequency.Never">
            <q-input
              :color="color"
              v-model.number="interval"
              type="number"
              dense
              step="1"
              :prefix="$tc('every' + value.frequencyUnit, 5).split(' 5 ')[0]"
              :suffix="$tc('every' + value.frequencyUnit, 5).split(' 5 ')[1]"
              input-class="text-center"
              class="q-pb-md"
              :key="intervalKey"
            />
          </div>

          <div v-if="frequency == RecurrenceFrequency.Daily">
            <date-time
              v-for="(time, index) in value.timesOfTheDay.concat([null])"
              :key="index"
              :value="time"
              :format="$t('timeFormat')"
              :placeholder="$t('addTimePlaceholder', {format: $t('timeFormatPlaceholder')})"
              color="intervention"
              class=""
              dense
              @input="timesOfTheDayInput($event, index)"
            />
          </div>

          <div v-if="frequency == RecurrenceFrequency.Weekly">
            <toggle-button-group
              v-model="daysOfTheWeek"
              :options="daysOfTheWeekOptions"
              color="transparent"
              text-color="gray-9"
              :toggle-color="color"
              toggle-text-color="white"
            />
          </div>

          <div v-if="frequency == RecurrenceFrequency.Monthly">
            <div>
              <q-radio
                v-model="monthlyMode"
                :val="MonthlyMode.DayOfMonth"
                :label="$t('onDayOfMonthTitle')"
                :color="color"
                dense
                class="q-mt-xs"
              />
            </div>
            <toggle-button-group
              v-if="monthlyMode == MonthlyMode.DayOfMonth"
              v-model="daysOfTheMonth"
              :options="daysOfTheMonthOptions"
              color="transparent"
              text-color="gray-9"
              :toggle-color="color"
              toggle-text-color="white"
              class="q-mt-sm q-mb-md"
            />
            <div class="q-my-sm">
              <q-radio
                v-model="monthlyMode"
                :val="MonthlyMode.DayOfWeek"
                :label="$t('onDayOfWeekTitle')"
                :color="color"
                dense
              />
            </div>
            <div
              v-if="monthlyMode == MonthlyMode.DayOfWeek"
              class="row q-col-gutter-x-sm"
            >
              <q-select
                v-model="positions"
                :options="positionOptions"
                dense
                options-dense
                :color="color"
                options-cover
                map-options
                emit-value
                :prefix="$t('everyDayPrefix')"
                class="col"
                style="min-width: 140px"
              />
              <q-select
                v-model="singleDayOfTheWeek"
                :options="singleDayOfTheWeekOptions"
                dense
                options-dense
                :color="color"
                options-cover
                map-options
                emit-value
                class="col"
                style="min-width: 140px"
              />
            </div>
          </div>

          <div v-if="frequency == RecurrenceFrequency.Yearly">
            <toggle-button-group
              v-model="monthsOfTheYear"
              :options="monthsOfTheYearOptions"
              color="transparent"
              text-color="gray-9"
              :toggle-color="color"
              toggle-text-color="white"
              class="q-mb-sm"
            />
            <div class="q-mt-md q-mb-sm">
              <q-toggle
                v-model="showYearlyDayOfWeek"
                :label="$t('onDayOfWeekTitle')"
                :color="color"
                dense
              />
            </div>
            <div
              v-if="showYearlyDayOfWeek"
              class="row q-col-gutter-x-sm"
            >
              <q-select
                v-model="positions"
                :options="positionOptions"
                dense
                options-dense
                :color="color"
                options-cover
                map-options
                emit-value
                :prefix="$t('everyDayPrefix')"
                class="col"
                style="min-width: 140px"
              />
              <q-select
                v-model="singleDayOfTheWeek"
                :options="singleDayOfTheWeekOptions"
                dense
                options-dense
                :color="color"
                options-cover
                map-options
                emit-value
                class="col"
                style="min-width: 140px"
              />
            </div>
          </div>
        </div>

        <div
          class="text-caption q-mt-md bg-grey-2 q-pa-sm"
          v-if="!!description && false"
        >
          {{ description }}
        </div>
      </div>

      <div
        v-if="frequency != RecurrenceFrequency.Never"
        class="col-md-6 col-12"
      >
        <q-select
          v-model="recurrenceEndMode"
          :options="recurrenceEndOptions"
          :label="$t('recurrenceEndLabel')"
          options-dense
          :color="color"
          options-cover
          map-options
          emit-value
        />

        <div v-if="recurrenceEndMode == RecurrenceEndMode.EndDate">
          <date-time
            v-model="recurrenceEndDate"
            :format="$t('dateFormat')"
            :min="new Date()"
            :placeholder="$t('dateFormatPlaceholder')"
            color="intervention"
            class="q-mt-sm"
            required
            dense
          />
        </div>

        <div v-if="recurrenceEndMode == RecurrenceEndMode.NumberOfOccurences">
          <q-input
            :color="color"
            v-model.number="recurrenceEndCount"
            type="number"
            class="q-my-sm"
            dense
            step="1"
            input-class="text-center"
            :key="occurenceCountKey"
          >
            <template v-slot:prepend>
              <div class="text-body2 text-black">{{ endAfterOccurenceCountLabels[0] }}</div>
            </template>
            <template v-slot:append>
              <div class="text-body2 text-black">{{ endAfterOccurenceCountLabels[1] }}</div>
            </template>
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {
  RecurrenceRule,
  RecurrenceFrequency,
  RecurrenceDayOfWeek,
  RecurrenceEnd
} from "../models/recurrenceRule";
import SearchableOptionList from "./SearchableOptionList.vue";
import ToggleButtonGroup from "./ToggleButtonGroup.vue";
import DateTime from "../components/DateTime.vue";

const nameof = (name: keyof RecurrenceRule) => name;
const nameofEnd = (name: keyof RecurrenceEnd) => name;
const noRecurrenceRule = new RecurrenceRule(RecurrenceFrequency.Never);

enum MonthlyMode {
  DayOfMonth = 1,
  DayOfWeek
}
enum RecurrenceEndMode {
  Never = 1,
  EndDate,
  NumberOfOccurences
}

const ReminderEditorProps = Vue.extend({
  props: {
    value: {
      type: RecurrenceRule,
      default: () => noRecurrenceRule
    },
    startDate: {
      type: (Date as unknown) as () => Date // don't ask… typechecker madness
    },
    color: {
      type: String,
      default: "primary"
    }
  }
});

@Component({
  components: {
    SearchableOptionList,
    ToggleButtonGroup,
    DateTime
  }
})
export default class ReminderEditor extends ReminderEditorProps {
  hasOwnRecurrencePattern = false;
  monthlyMode = MonthlyMode.DayOfMonth;
  showYearlyDayOfWeek = false;
  intervalKey = Math.random();
  occurenceCountKey = Math.random();

  get frequency() {
    return this.value.frequency;
  }
  set frequency(value) {
    if (value == RecurrenceFrequency.Never) {
      this.$emit("input", undefined);
    } else {
      const rule = new RecurrenceRule(value);
      rule.recurrenceStart = this.startDate;
      rule.recurrenceEnd = this.value.recurrenceEnd;

      if (
        value == RecurrenceFrequency.Daily &&
        this.hasOwnRecurrencePattern &&
        this.startDate
      ) {
        rule.timesOfTheDay = [this.startDate];
      }

      this.$emit("input", rule);
    }
    this.showYearlyDayOfWeek = false;
    this.monthlyMode = MonthlyMode.DayOfMonth;
  }
  get interval() {
    return this.value.interval;
  }
  set interval(value) {
    if (!/^\d{1,3}$/.test("" + value) || value < 1) {
      value = 1;
      this.intervalKey = Math.random();
    }
    this.updateRecurrenceRule(nameof("interval"), value);
  }
  get daysOfTheWeek() {
    return this.value.daysOfTheWeekOnlyDays;
  }
  set daysOfTheWeek(value) {
    this.updateRecurrenceRule(nameof("daysOfTheWeekOnlyDays"), value);
  }
  get daysOfTheMonth() {
    return this.value.daysOfTheMonth;
  }
  set daysOfTheMonth(value) {
    this.updateRecurrenceRule(nameof("daysOfTheMonth"), value);
  }
  get monthsOfTheYear() {
    return this.value.monthsOfTheYear;
  }
  set monthsOfTheYear(value) {
    this.updateRecurrenceRule(nameof("monthsOfTheYear"), value);
  }
  get positions() {
    return this.value.positions;
  }
  set positions(value) {
    this.updateRecurrenceRule(nameof("positions"), value);
  }
  get recurrenceEndMode() {
    if (this.value.recurrenceEnd && this.value.recurrenceEnd.endDate) {
      return RecurrenceEndMode.EndDate;
    } else if (
      this.value.recurrenceEnd &&
      this.value.recurrenceEnd.occurenceCount
    ) {
      return RecurrenceEndMode.NumberOfOccurences;
    } else {
      return RecurrenceEndMode.Never;
    }
  }
  set recurrenceEndMode(value) {
    let recurrenceEnd: RecurrenceEnd | undefined = undefined;

    if (value == RecurrenceEndMode.EndDate) {
      recurrenceEnd = new RecurrenceEnd(new Date());
    } else if (value == RecurrenceEndMode.NumberOfOccurences) {
      recurrenceEnd = new RecurrenceEnd(undefined, 1);
    }

    this.updateRecurrenceRule(nameof("recurrenceEnd"), recurrenceEnd);
  }
  get recurrenceEndDate() {
    return this.value.recurrenceEnd?.endDate;
  }
  set recurrenceEndDate(value) {
    this.updateRecurrenceEnd(nameofEnd("endDate"), value);
  }
  get recurrenceEndCount() {
    return this.value.recurrenceEnd?.occurenceCount || 0;
  }
  set recurrenceEndCount(value) {
    if (
      this.value.recurrenceEnd &&
      (!/^\d{1,3}$/.test("" + value) || value < 1)
    ) {
      value = 1;
      this.occurenceCountKey = Math.random();
    }
    this.updateRecurrenceEnd(nameofEnd("occurenceCount"), value);
  }
  get singleDayOfTheWeek() {
    if (this.daysOfTheWeek.length == 1) {
      return this.daysOfTheWeek[0];
    } else if (this.daysOfTheWeek.length == 2) {
      return 10;
    } else if (this.daysOfTheWeek.length == 5) {
      return 9;
    } else if (this.daysOfTheWeek.length == 7) {
      return 8;
    } else {
      return 1;
    }
  }
  set singleDayOfTheWeek(value: number) {
    if (value <= 7) {
      this.daysOfTheWeek = [value];
    } else if (value == 8) {
      this.daysOfTheWeek = [1, 2, 3, 4, 5, 6, 7];
    } else if (value == 9) {
      this.daysOfTheWeek = [2, 3, 4, 5, 6];
    } else if (value == 10) {
      this.daysOfTheWeek = [1, 7];
    }
  }
  get frequencyOptions() {
    const entries = Object.entries(RecurrenceFrequency);
    return entries.slice(entries.length / 2).map(entry => {
      return { label: this.$t(entry[0]), value: entry[1] };
    });
  }
  get daysOfTheWeekOptions() {
    return this.$q.lang.date.daysShort.map(this.toOption);
  }
  get singleDayOfTheWeekOptions() {
    return this.$q.lang.date.days
      .concat([
        this.$tc("day", 1),
        this.$t("weekday") as string,
        this.$t("weekendDay") as string
      ])
      .map(this.toOption);
  }
  get daysOfTheMonthOptions() {
    return Array.from(new Array(31), (x, i) => "" + (i + 1)).map(this.toOption);
  }
  get monthsOfTheYearOptions() {
    return this.$q.lang.date.monthsShort.map(this.toOption);
  }
  get positionOptions() {
    return ["firstDay", "secondDay", "thirdDay", "fourthDay", "fifthDay"]
      .map((key, index) => {
        return {
          label: this.$t(key) as string,
          value: [index + 1]
        };
      })
      .concat([{ label: this.$t("lastDay") as string, value: [-1] }]);
  }
  get recurrenceEndOptions() {
    return ["never", "recurrenceEndDate"] // add "endAfterOccurenceCount" eventually later to keep things simpler at start
      .map(key => this.$t(key) as string)
      .map(this.toOption);
  }
  get endAfterOccurenceCountLabels() {
    return this.$tc(
      "endAfterOccurenceCountLabel",
      this.recurrenceEndCount
    ).split(" " + this.recurrenceEndCount + " ");
  }
  get description() {
    let description = "";

    if (this.value.frequencyUnit) {
      description += this.$tc(
        "every" + this.value.frequencyUnit,
        this.value.interval
      );
    }

    return description;
  }
  get RecurrenceFrequency() {
    return RecurrenceFrequency;
  }
  get MonthlyMode() {
    return MonthlyMode;
  }
  get RecurrenceEndMode() {
    return RecurrenceEndMode;
  }

  toOption(name: string, index: number) {
    return { label: name, value: index + 1 };
  }
  timesOfTheDayInput(value: Date | null, index: number) {
    const timesOfTheDay = this.value.timesOfTheDay.slice();
    if (value == null) {
      timesOfTheDay.splice(index, 1);
    } else {
      timesOfTheDay[index] = value;
    }
    this.updateRecurrenceRule(nameof("timesOfTheDay"), timesOfTheDay);
  }
  resetOwnRecurrencePattern() {
    this.frequency = this.value.frequency;
  }
  resetMonthlyMode() {
    this.daysOfTheMonth = [];

    if (this.monthlyMode == MonthlyMode.DayOfMonth) {
      this.positions = [];
      this.daysOfTheWeek = [];
    } else {
      this.positions = this.positionOptions[0].value;
      this.daysOfTheWeek = [this.daysOfTheWeekOptions[0].value];
    }
  }
  resetYearlyDayOfWeek() {
    if (this.showYearlyDayOfWeek) {
      this.positions = this.positionOptions[0].value;
      this.daysOfTheWeek = [this.daysOfTheWeekOptions[0].value];
    } else {
      this.positions = [];
      this.daysOfTheWeek = [];
    }
  }
  setupFromRecurrenceRule(rule: RecurrenceRule) {
    this.hasOwnRecurrencePattern = rule.hasOwnRecurrencePattern;
    this.showYearlyDayOfWeek =
      rule.frequency == RecurrenceFrequency.Yearly &&
      rule.daysOfTheWeek.length > 0 &&
      rule.positions.length > 0;

    if (
      rule.frequency == RecurrenceFrequency.Monthly &&
      rule.daysOfTheWeek.length > 0 &&
      rule.positions.length > 0 &&
      rule.daysOfTheMonth.length == 0
    ) {
      this.monthlyMode = MonthlyMode.DayOfWeek;
    } else {
      this.monthlyMode = MonthlyMode.DayOfMonth;
    }
  }
  updateRecurrenceRule(key: string, value: any) {
    const changes: any = {};
    changes[key] = value;

    this.$store.direct.commit.updateObject({
      target: this.value,
      changes: changes
    });
  }
  updateRecurrenceEnd(key: string, value: any) {
    const changes: any = {};
    changes[key] = value;

    this.$store.direct.commit.updateObject({
      target: this.value.recurrenceEnd,
      changes: changes
    });
  }

  created() {
    this.setupFromRecurrenceRule(this.value);
    this.$watch("hasOwnRecurrencePattern", this.resetOwnRecurrencePattern);
    this.$watch("monthlyMode", this.resetMonthlyMode);
    this.$watch("showYearlyDayOfWeek", this.resetYearlyDayOfWeek);
  }
}
</script>
