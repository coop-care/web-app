<template>
  <div class="row q-col-gutter-lg q-mb-md items-start">
    <date-time-input
      v-if="!hideStart"
      v-model="startDate"
      :min="new Date(new Date().setHours(0, 0, 0, 0))"
      :format="$t('datetimeFormat')"
      :label="$t('planReminder')"
      :placeholder="$t('datetimeFormatPlaceholder')"
      :options="startDateOptions"
      :color="color"
      :class="[
        !hideFrequency && !hideEnd ? 'col-md-4' : '', 
        !hideFrequency || !hideEnd ? 'col-sm-6' : '',
        'col-12'
      ]"
      default-time="08:00"
    />
    <div :class="[
      !hideStart && !hideFrequency && !hideEnd ? 'col-md-8' : '', 
      !hideStart && (!hideFrequency || !hideEnd) ? 'col-sm-6' : '', 
      'col-12'
    ]">
      <div
        v-if="(startDate || hideStart) && (!hideFrequency || !hideEnd)"
        class="row q-col-gutter-lg items-start"
      >
        <div
          v-if="!hideFrequency"
          :class="[!hideEnd ? 'col-md-6' : '', 'col-12']"
        >
          <q-select
            v-model="frequency"
            :options="frequencyOptions"
            :label="$t('recurrence')"
            options-dense
            :color="color"
            options-cover
            map-options
            emit-value
            :hint="recurrenceDescription"
          />

          <q-toggle
            v-if="frequency != -1"
            v-model="hasOwnRecurrencePattern"
            @update:model-value="frequency = frequency"
            :label="$t('ownRecurrencePatternTitle')"
            :color="color"
            switch-toggle-side
            class="q-mt-lg q-mb-sm"
            dense
          />

          <div v-if="hasOwnRecurrencePattern">
            <div v-if="frequency != -1">
              <q-input
                :model-value="interval"
                @update:model-value="onUpdateNumeric3Digits($event, () => interval = $event)"
                @change="interval = $event"
                type="text"
                inputmode="numeric"
                pattern="[0-9]"
                dense
                :prefix="intervalLabels[0]"
                :suffix="intervalLabels[1]"
                :color="color"
                input-class="text-center"
                class="q-pb-md"
                :key="intervalKey"
              />
            </div>

            <div v-if="frequency == Frequency.DAILY">
              <date-time-input
                v-for="(time, index) in timesOfTheDay"
                :key="index"
                :model-value="time"
                :format="$t('timeFormat')"
                :placeholder="
                  $t('addTimePlaceholder', {
                    format: $t('timeFormatPlaceholder')
                  })
                "
                :color="color"
                dense
                @update:model-value="timesOfTheDayInput($event, index)"
              />
            </div>

            <div v-if="frequency == Frequency.WEEKLY">
              <toggle-button-group
                v-model="daysOfTheWeek"
                :options="daysOfTheWeekOptions"
                color="transparent"
                text-color="gray-9"
                :toggle-color="color"
                toggle-text-color="white"
              />
            </div>

            <div v-if="frequency == Frequency.MONTHLY">
              <div>
                <q-radio
                  :model-value="monthlyMode"
                  @update:model-value="emitRecurrenceRule(updatingMonthlyMode($event, value))"
                  val="DayOfMonth"
                  :label="$t('onDayOfMonthTitle')"
                  :color="color"
                  dense
                  class="q-mt-xs"
                />
              </div>
              <toggle-button-group
                v-if="monthlyMode == 'DayOfMonth'"
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
                  :model-value="monthlyMode"
                  @update:model-value="emitRecurrenceRule(updatingMonthlyMode($event, value))"
                  val="DayOfWeek"
                  :label="$t('onDayOfWeekTitle')"
                  :color="color"
                  dense
                />
              </div>
              <div
                v-if="monthlyMode == 'DayOfWeek'"
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
                  class="col dayofweek-select"
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
                  class="col dayofweek-select"
                />
              </div>
            </div>

            <div v-if="frequency == Frequency.YEARLY">
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
                  :model-value="showYearlyDayOfWeek"
                  @update:model-value="emitRecurrenceRule(updatingYearlyDayOfWeek($event, value))"
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
                  class="col dayofweek-select"
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
                  class="col dayofweek-select"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="(frequency != -1) && !hideEnd"
          :class="[!hideFrequency ? 'col-md-6' : '', 'col-12']"
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

          <div v-if="recurrenceEndMode == 'EndDate'">
            <date-time-input
              v-model="endDate"
              :format="$t('datetimeFormat')"
              :min="new Date(new Date().setHours(0, 0, 0, 0))"
              :placeholder="$t('dateFormatPlaceholder')"
              :color="color"
              class="q-mt-sm"
              required
              dense
            />
          </div>

          <div v-if="recurrenceEndMode == 'NumberOfOccurrences'">
            <q-input
              :color="color"
              :model-value="endCount"
              @update:model-value="onUpdateNumeric3Digits($event, () => endCount = $event)"
              @change="endCount = $event"
              type="text"
              inputmode="numeric"
              pattern="[0-9]"
              class="q-my-sm"
              dense
              input-class="text-center"
              :key="occurrenceCountKey"
            >
              <template v-slot:prepend>
                <div class="text-body2 text-black">
                  {{ endAfterOccurrenceCountLabels[0] }}
                </div>
              </template>
              <template v-slot:append>
                <div class="text-body2 text-black">
                  {{ endAfterOccurrenceCountLabels[1] }}
                </div>
              </template>
            </q-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.dayofweek-select
  min-width: 140px
</style>

<script lang="ts">
import { Component, Prop, Vue, Model } from "vue-facing-decorator";
import { TranslateResult } from "vue-i18n";
import { date } from "quasar";
import { RRuleSet, RRule, Frequency, Options } from "../models/rrule";
import InterventionMixin, { InterventionMixinInterface } from "../mixins/InterventionMixin";
import SearchableOptionList from "./SearchableOptionList.vue";
import ToggleButtonGroup from "./ToggleButtonGroup.vue";
import DateTimeInput from "../components/DateTimeInput.vue";

const { addToDate, adjustDate } = date;
const isEmpty = (value: any) =>
  value == null || (value instanceof Array && value.length == 0);
const toArray = (value: number | undefined | null | number[]) =>
  value instanceof Array || value == null ? value || [] : [value];

type MonthlyMode = "DayOfMonth" | "DayOfWeek";
type RecurrenceEndMode = "Never" | "EndDate" | "NumberOfOccurrences";

interface RecurrenceRuleEditor extends InterventionMixinInterface {};

@Component({
  components: {
    SearchableOptionList,
    ToggleButtonGroup,
    DateTimeInput
  },
  mixins: [InterventionMixin],
  emits: ["update:model-value"]
})
class RecurrenceRuleEditor extends Vue {
  @Model({ type: Object }) readonly value: RRuleSet | undefined;
  @Prop({ type: Number, required: true}) readonly ruleIndex!: number;
  @Prop({ type: String, default: "primary"}) readonly color!: string;
  @Prop({ type: String, default: "Never"}) readonly noFrequencyKey!: string;
  @Prop({ type: Boolean }) readonly hideStart!: boolean;
  @Prop({ type: Boolean }) readonly hideFrequency!: boolean;
  @Prop({ type: Boolean }) readonly hideEnd!: boolean;

  hasOwnRecurrencePattern = false;
  monthlyMode: MonthlyMode = "DayOfMonth";
  showYearlyDayOfWeek = false;
  intervalKey = Math.random();
  occurrenceCountKey = Math.random();

  get rule(): Options | undefined {
    return this.value?.rrules()[this.ruleIndex]?.options;
  }
  get startDate() {
    return this.value?.startDate(this.ruleIndex);
  }
  set startDate(value) {
    const recurrenceRules = this.value || RRuleSet.make();

    if (value) {
      this.emitRecurrenceRule(recurrenceRules.updatingStartDate(this.ruleIndex, value));
    } else {
      if (this.hasMultipleActiveRules) {
        this.emitRecurrenceRule(recurrenceRules.deletingRule(this.ruleIndex));
      } else {
        this.emitRecurrenceRule(undefined);
      }
    }
  }
  get frequency() {
    return this.rule ? this.rule.freq : -1;
  }
  set frequency(value) {
    let rules = this.value;

    if (this.hasMultipleActiveRules) {
      rules = this.value?.updatingRule(
        this.ruleIndex,
        {
          freq: value,
          dtstart: this.startDate,
          until: this.endDate,
          count: this.rule?.count,
          wkst: RRuleSet.weekstart,
          tzid: RRuleSet.localTimezone
        },
        true
      );
    } else {
      rules = RRuleSet.make();
      const startDate = this.startDate ? RRuleSet.toUTC(this.startDate) : undefined;

      if (value < 0) {
        if (startDate) {
          rules.rdate(startDate);
        }
      } else {
        const endDate = this.endDate ? RRuleSet.toUTC(this.endDate) : undefined;
        rules.rrule(
          new RRule(
            {
              freq: value,
              dtstart: startDate,
              until: endDate,
              count: this.rule?.count,
              wkst: RRuleSet.weekstart,
              tzid: RRuleSet.localTimezone
            },
            true
          )
        );
      }
    }

    rules = this.updatingYearlyDayOfWeek(false, rules);
    rules = this.updatingMonthlyMode("DayOfMonth", rules);
    this.emitRecurrenceRule(rules);
  }
  get interval() {
    return "" + (this.rule?.interval ?? 0);
  }
  set interval(value) {
    if (!this.isNumeric3Digits(value)) {
      value = this.interval;
      this.intervalKey = Math.random();
    }
    this.updateRecurrenceRule({ interval: parseInt(value) });
  }
  get timesOfTheDay(): Array<Date | null> {
    if (
      this.rule &&
      this.rule.byhour instanceof Array &&
      this.rule.byminute instanceof Array
    ) {
      const byminute = this.rule.byminute;
      return (this.rule.byhour.map((hour, index) =>
        adjustDate(new Date(), {
          hours: hour,
          minutes: byminute[index] || 0,
          seconds: 0
        })
      ) as Array<Date | null>).concat([null]);
    } else {
      return [null];
    }
  }
  get daysOfTheWeek() {
    return toArray(this.rule?.byweekday as any);
  }
  set daysOfTheWeek(value) {
    this.updateRecurrenceRule({ byweekday: value.length ? value : undefined });
  }
  get daysOfTheMonth() {
    return toArray(this.rule?.bymonthday);
  }
  set daysOfTheMonth(value) {
    this.updateRecurrenceRule({ bymonthday: value.length ? value : undefined });
  }
  get monthsOfTheYear() {
    return toArray(this.rule?.bymonth);
  }
  set monthsOfTheYear(value) {
    this.updateRecurrenceRule({ bymonth: value.length ? value : undefined });
  }
  get positions() {
    return toArray(this.rule?.bysetpos);
  }
  set positions(value) {
    this.updateRecurrenceRule({ bysetpos: value.length ? value : undefined });
  }
  get recurrenceEndMode(): RecurrenceEndMode {
    if (this.endDate) {
      return "EndDate";
    } else if (parseInt(this.endCount)) {
      return "NumberOfOccurrences";
    } else {
      return "Never";
    }
  }
  set recurrenceEndMode(value) {
    let count: number | undefined = undefined;
    let until: Date | undefined = undefined;

    if (value == "EndDate") {
      until = new Date(
        Math.max(this.startDate?.getTime() || 0, new Date().getTime())
      );
      count = undefined;
    } else if (value == "NumberOfOccurrences") {
      until = undefined;
      count = 1;
    }

    this.updateRecurrenceRule({ until: until, count: count });
  }
  get endDate() {
    return this.value?.endDate(this.ruleIndex);
  }
  set endDate(value) {
    this.updateRecurrenceRule({ until: value });
  }
  get endCount() {
    return "" + (this.rule?.count ?? 0);
  }
  set endCount(value) {
    if (this.endCount && !this.isNumeric3Digits(value)) {
      value = this.endCount;
      this.occurrenceCountKey = Math.random();
    }
    this.updateRecurrenceRule({ count: parseInt(value) });
  }
  get hasMultipleActiveRules() {
    return this.value && this.value.indicesOfActiveRules.length > 1;
  }
  get singleDayOfTheWeek() {
    if (this.daysOfTheWeek.length == 1) {
      return this.daysOfTheWeek[0];
    } else if (this.daysOfTheWeek.length == 2) {
      return 9;
    } else if (this.daysOfTheWeek.length == 5) {
      return 8;
    } else if (this.daysOfTheWeek.length == 7) {
      return 7;
    } else {
      return 6;
    }
  }
  set singleDayOfTheWeek(value: number) {
    if (value <= 6) {
      this.daysOfTheWeek = [value];
    } else if (value == 7) {
      this.daysOfTheWeek = [0, 1, 2, 3, 4, 5, 6];
    } else if (value == 8) {
      this.daysOfTheWeek = [0, 1, 2, 3, 4];
    } else if (value == 9) {
      this.daysOfTheWeek = [5, 6];
    }
  }
  get startDateOptions() {
    const startTime = { hours: 8, minutes: 0, seconds: 0 };
    return [
      {
        label: this.$t("today"),
        value: () => adjustDate(new Date(), startTime)
      },
      {
        label: this.$t("tomorrow"),
        value: () => addToDate(adjustDate(new Date(), startTime), { days: 1 })
      },
      {
        label: this.$t("inOneWeek"),
        value: () => addToDate(adjustDate(new Date(), startTime), { days: 7 })
      }
    ];
  }
  get frequencyOptions() {
    let values = this.hasMultipleActiveRules ? [] : [-1];
    values = values.concat([
      Frequency.DAILY,
      Frequency.WEEKLY,
      Frequency.MONTHLY,
      Frequency.YEARLY
    ]);
    return values.map(value => {
      const key = Frequency[value];
      const label = key ? key.charAt(0) + key.slice(1).toLowerCase() : this.noFrequencyKey;
      return { label: this.$t(label), value: value };
    });
  }
  get daysOfTheWeekOptions() {
    return this.$q.lang.date.daysShort.map((name, index) => {
      return { label: name, value: index > 0 ? index - 1 : 6 };
    });
  }
  get singleDayOfTheWeekOptions() {
    return this.$q.lang.date.days
      .concat([
        "" + this.$t("day", 1),
        "" + this.$t("weekday"),
        "" + this.$t("weekendDay")
      ])
      .map((name, index) => {
        return {
          label: name,
          value: index > 0 ? (index > 6 ? index : index - 1) : 6
        };
      });
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
          label: this.$t(key),
          value: [index + 1]
        };
      })
      .concat([{ label: this.$t("lastDay"), value: [-1] }]);
  }
  get recurrenceEndOptions(): {
    label: TranslateResult;
    value: RecurrenceEndMode;
  }[] {
    return [
      {
        label: this.$t("Never"),
        value: "Never"
      },
      {
        label: this.$t("recurrenceEndDate"),
        value: "EndDate"
      },
      {
        label: this.$t("endAfterOccurrenceCount"),
        value: "NumberOfOccurrences"
      }
    ];
  }
  get endAfterOccurrenceCountLabels() {
    return this.$t("endAfterOccurrenceCountLabel", parseInt(this.endCount)).split(
      " " + this.endCount + " "
    );
  }
  get intervalLabels() {
    const frequency = "every" + ["Year", "Month", "Week", "Day"][this.frequency];
    return this.$t(frequency, 5).split(" 5 ");
  }
  get Frequency() {
    return Frequency;
  }
  get recurrenceDescription() {
    return this.localizeRecurrenceRule(this.value, this.ruleIndex);
  }

  toOption(name: string | TranslateResult, index: number) {
    return { label: name, value: index + 1 };
  }
  timesOfTheDayInput(value: Date | null, index: number) {
    const byhour = toArray(this.rule?.byhour).slice();
    const byminute = toArray(this.rule?.byminute).slice();

    if (value == null) {
      byhour.splice(index, 1);
      byminute.splice(index, 1);
    } else {
      byhour[index] = value.getHours();
      byminute[index] = value.getMinutes();
    }

    this.updateRecurrenceRule({
      byhour: byhour.length ? byhour : undefined,
      byminute: byminute.length ? byminute : undefined,
      bysecond: [0],
      bysetpos: byhour.map((hour, index) => index * (byhour.length + 1) + 1)
    });
  }
  updatingMonthlyMode(value: MonthlyMode, rules?: RRuleSet) {
    if (this.monthlyMode == value) {
      return rules;
    } else {
      this.monthlyMode = value;

      if (value == "DayOfMonth") {
        return rules?.updatingRule(this.ruleIndex, {
          bymonthday: undefined,
          byweekday: undefined,
          bysetpos: undefined
        });
      } else {
        return rules?.updatingRule(this.ruleIndex, {
          bymonthday: undefined,
          byweekday: [this.daysOfTheWeekOptions[0].value],
          bysetpos: this.positionOptions[0].value
        });
      }
    }
  }
  updatingYearlyDayOfWeek(value: boolean, rules?: RRuleSet) {
    if (this.showYearlyDayOfWeek == value) {
      return rules;
    } else {
      this.showYearlyDayOfWeek = value;

      if (value) {
        return rules?.updatingRule(this.ruleIndex, {
          byweekday: [this.daysOfTheWeekOptions[0].value],
          bysetpos: this.positionOptions[0].value
        });
      } else {
        return rules?.updatingRule(this.ruleIndex, {
          byweekday: undefined,
          bysetpos: undefined
        });
      }
    }
  }
  isNumeric3Digits(value: string) {
    return /^\d{1,3}$/.test("" + value) && parseInt(value) > 0;
  }
  onUpdateNumeric3Digits(value: string, next: () => void) {
    if (this.isNumeric3Digits(value)) {
      next();
    }
  }
  setupFromRecurrenceRule(rule: Partial<Options> | undefined) {
    if (rule) {
      this.hasOwnRecurrencePattern =
        (rule.interval || 0) > 1 ||
        !isEmpty(rule.byhour) ||
        !isEmpty(rule.byweekday) ||
        !isEmpty(rule.bymonthday) ||
        !isEmpty(rule.bymonth) ||
        !isEmpty(rule.bysetpos);
      this.showYearlyDayOfWeek =
        rule.freq == Frequency.YEARLY &&
        !isEmpty(rule.byweekday) &&
        !isEmpty(rule.bysetpos);

      if (
        rule.freq == Frequency.MONTHLY &&
        !isEmpty(rule.byweekday) &&
        !isEmpty(rule.bysetpos) &&
        isEmpty(rule.bymonthday)
      ) {
        this.monthlyMode = "DayOfWeek";
      } else {
        this.monthlyMode = "DayOfMonth";
      }
    } else {
      this.hasOwnRecurrencePattern = false;
      this.showYearlyDayOfWeek = false;
      this.monthlyMode = "DayOfMonth";
    }
  }
  updateRecurrenceRule(changes: Partial<Options>) {
    this.emitRecurrenceRule(this.value?.updatingRule(this.ruleIndex, changes));
  }
  emitRecurrenceRule(rules?: RRuleSet) {
    this.$emit("update:model-value", rules);
  }

  created() {
    this.setupFromRecurrenceRule(
      this.value?.rrules()[this.ruleIndex]?.origOptions
    );
  }
}

export default RecurrenceRuleEditor;
</script>
