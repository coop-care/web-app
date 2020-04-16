<template>
  <div>
    <div class="row q-col-gutter-xl items-start">
      <div class="col-md-6 col-12">
        <q-select
          v-model="rule.frequency"
          :options="frequencyOptions"
          :label="$t('recurrence')"
          options-dense
          :color="color"
          options-cover
          map-options
          emit-value
        />

        <q-toggle
          v-if="rule.frequency != RecurrenceFrequency.Never"
          v-model="hasOwnRecurrencePattern"
          :label="$t('ownRecurrencePatternTitle')"
          :color="color"
          switch-toggle-side
          class="q-mt-lg q-mb-sm"
          dense
        />

        <div v-if="hasOwnRecurrencePattern">
          <div v-if="rule.frequency != RecurrenceFrequency.Never">
            <q-input
              :color="color"
              v-model.number="rule.interval"
              type="number"
              dense
              step="1"
              :prefix="$tc('every' + rule.frequencyUnit, 5).split(' 5 ')[0]"
              :suffix="$tc('every' + rule.frequencyUnit, 5).split(' 5 ')[1]"
              input-class="text-center"
              class="q-pb-md"
              :key="intervalKey"
              @input="validateInterval"
            />
          </div>

          <div v-if="rule.frequency == RecurrenceFrequency.Daily">
            <date-time
              v-for="(time, index) in rule.timesOfTheDay.concat([null])"
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

          <div v-if="rule.frequency == RecurrenceFrequency.Weekly">
            <toggle-button-group
              v-model="daysOfTheWeek"
              :options="daysOfTheWeekOptions"
              color="white"
              text-color="gray-9"
              :toggle-color="color"
              toggle-text-color="white"
            />
          </div>

          <div v-if="rule.frequency == RecurrenceFrequency.Monthly">
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
              v-model="rule.daysOfTheMonth"
              :options="daysOfTheMonthOptions"
              color="white"
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
                v-model="rule.positions"
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

          <div v-if="rule.frequency == RecurrenceFrequency.Yearly">
            <toggle-button-group
              v-model="rule.monthsOfTheYear"
              :options="monthsOfTheYearOptions"
              color="white"
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
                v-model="rule.positions"
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
        v-if="rule.frequency != RecurrenceFrequency.Never"
        class="col-md-6 col-12"
      >
        <q-select
          v-model="recurrenceEnd"
          :options="recurrenceEndOptions"
          :label="$t('recurrenceEndLabel')"
          options-dense
          :color="color"
          options-cover
          map-options
          emit-value
        />

        <div v-if="recurrenceEnd == RecurrenceEndMode.EndDate">
          <date-time
            v-model="rule.recurrenceEnd.endDate"
            :format="$t('dateFormat')"
            :min="new Date()"
            :placeholder="$t('dateFormatPlaceholder')"
            color="intervention"
            class="q-mt-sm"
            required
            dense
          />
        </div>

        <div v-if="recurrenceEnd == RecurrenceEndMode.NumberOfOccurences">
          <q-input
            :color="color"
            v-model.number="rule.recurrenceEnd.occurenceCount"
            type="number"
            class="q-my-sm"
            dense
            step="1"
            input-class="text-center"
            @input="validateOccurenceCount"
            :key="occurenceCountKey"
          >
            <template v-slot:prepend>
              <div class="text-body2 text-black">
                {{
                  $tc("endAfterOccureceCountLabel", rule.recurrenceEnd.occurenceCount).split(
                    " " + rule.recurrenceEnd.occurenceCount + " "
                  )[0]
                }}
              </div>
            </template>
            <template v-slot:append>
              <span class="text-body2 text-black">{{
                $tc("endAfterOccureceCountLabel", rule.recurrenceEnd.occurenceCount).split(
                  " " + rule.recurrenceEnd.occurenceCount + " "
                )[1]
              }}</span>
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

enum MonthlyMode {
  DayOfMonth = 1,
  DayOfWeek
}
enum RecurrenceEndMode {
  Never = 1,
  EndDate,
  NumberOfOccurences
}

@Component({
  props: {
    value: RecurrenceRule,
    startDate: Date,
    color: {
      type: String,
      default: "primary"
    }
  },
  components: {
    SearchableOptionList,
    ToggleButtonGroup,
    DateTime
  },
  watch: {
    rule: {
      handler: function(this: EditReminder) {
        if (this.rule.frequency == RecurrenceFrequency.Never) {
          this.$emit("input", null);
        } else if (this.rule != this.$props.value) {
          this.$emit("input", this.rule);
        }
      },
      deep: true
    },
    value(this: EditReminder, rule: RecurrenceRule | undefined) {
      if (!rule) {
        this.rule.frequency = RecurrenceFrequency.Never;
      } else if (rule != this.rule) {
        this.rule = rule;
      }
    }
  }
})
export default class EditReminder extends Vue {
  rule = new RecurrenceRule(RecurrenceFrequency.Never);
  hasOwnRecurrencePattern = false;
  monthlyMode = MonthlyMode.DayOfMonth;
  showYearlyDayOfWeek = false;
  intervalKey = Math.random();
  occurenceCountKey = Math.random();

  get daysOfTheWeek() {
    return this.rule.daysOfTheWeek.map(day => day.dayOfTheWeek);
  }
  set daysOfTheWeek(value: number[]) {
    this.rule.daysOfTheWeek = value.map(day => new RecurrenceDayOfWeek(day));
  }
  get recurrenceEnd() {
    if (this.rule.recurrenceEnd && this.rule.recurrenceEnd.endDate) {
      return RecurrenceEndMode.EndDate;
    } else if (
      this.rule.recurrenceEnd &&
      this.rule.recurrenceEnd.occurenceCount
    ) {
      return RecurrenceEndMode.NumberOfOccurences;
    } else {
      return RecurrenceEndMode.Never;
    }
  }
  set recurrenceEnd(value: RecurrenceEndMode) {
    if (value == RecurrenceEndMode.EndDate) {
      this.rule.recurrenceEnd = new RecurrenceEnd(new Date());
    } else if (value == RecurrenceEndMode.NumberOfOccurences) {
      this.rule.recurrenceEnd = new RecurrenceEnd(undefined, 1);
    } else {
      this.rule.recurrenceEnd = undefined;
    }
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
    return ["never", "recurrenceEndDate", "endAfterOccurenceCount"]
      .map(key => this.$t(key) as string)
      .map(this.toOption);
  }
  get description() {
    let description = "";

    if (this.rule.frequencyUnit) {
      description += this.$tc(
        "every" + this.rule.frequencyUnit,
        this.rule.interval
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
  validateInterval(value: number) {
    if (!/^\d{1,3}$/.test("" + value) || value < 1) {
      this.rule.interval = 1;
      this.intervalKey = Math.random();
    }
  }
  validateOccurenceCount(value: number) {
    if (
      this.rule.recurrenceEnd &&
      (!/^\d{1,3}$/.test("" + value) || value < 1)
    ) {
      this.rule.recurrenceEnd.occurenceCount = 1;
      this.occurenceCountKey = Math.random();
    }
  }
  resetOwnRecurrencePattern() {
    this.rule.interval = 1;
    this.rule.timesOfTheDay = [];
    if (
      this.rule.frequency == RecurrenceFrequency.Daily &&
      this.hasOwnRecurrencePattern &&
      this.$props.startDate
    ) {
      this.rule.timesOfTheDay = [this.$props.startDate];
    } else {
      this.rule.timesOfTheDay = [];
    }
    this.daysOfTheWeek = [];
    this.rule.daysOfTheMonth = [];
    this.rule.monthsOfTheYear = [];
    this.rule.positions = [];
    this.showYearlyDayOfWeek = false;
    this.monthlyMode = MonthlyMode.DayOfMonth;
  }
  resetMonthlyMode() {
    if (this.monthlyMode == MonthlyMode.DayOfMonth) {
      this.rule.daysOfTheMonth = [];
      this.rule.positions = [];
      this.daysOfTheWeek = [];
    } else {
      this.rule.daysOfTheMonth = [];
      this.rule.positions = this.positionOptions[0].value;
      this.daysOfTheWeek = [this.daysOfTheWeekOptions[0].value];
    }
  }
  resetYearlyDayOfWeek() {
    if (this.showYearlyDayOfWeek) {
      this.rule.positions = this.positionOptions[0].value;
      this.daysOfTheWeek = [this.daysOfTheWeekOptions[0].value];
    } else {
      this.rule.positions = [];
      this.daysOfTheWeek = [];
    }
  }
  timesOfTheDayInput(value: Date | null, index: number) {
    if (value == null) {
      this.rule.timesOfTheDay.splice(index, 1);
    } else {
      this.rule.timesOfTheDay[index] = value;
    }
    this.rule.timesOfTheDay = this.rule.timesOfTheDay.concat([]);
  }
  setupFromRecurrenceRule(rule: RecurrenceRule | undefined) {
    if (rule) {
      this.rule = rule;
      this.hasOwnRecurrencePattern =
        rule.timesOfTheDay.length > 0 ||
        rule.daysOfTheWeek.length > 0 ||
        rule.daysOfTheMonth.length > 0 ||
        rule.monthsOfTheYear.length > 0 ||
        rule.positions.length > 0;
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
  }

  created() {
    this.setupFromRecurrenceRule(this.$props.value);
    this.$watch("rule.frequency", this.resetOwnRecurrencePattern);
    this.$watch("hasOwnRecurrencePattern", this.resetOwnRecurrencePattern);
    this.$watch("monthlyMode", this.resetMonthlyMode);
    this.$watch("showYearlyDayOfWeek", this.resetYearlyDayOfWeek);
  }
}
</script>
