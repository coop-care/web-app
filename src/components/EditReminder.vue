<template>
  <div>
    <div class="row q-col-gutter-xl items-start">
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
              :prefix="$tc('every' + frequencyUnit, 5).split(' 5 ')[0]"
              :suffix="$tc('every' + frequencyUnit, 5).split(' 5 ')[1]"
              input-class="text-center"
              class="q-pb-md"
              :key="intervalKey"
              @input="validateInterval"
            />
          </div>

          <div v-if="frequency == RecurrenceFrequency.Daily">
            <date-time
              v-for="(time, index) in timesOfTheDay.concat([null])"
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
              color="white"
              text-color="gray-9"
              :toggle-color="color"
              toggle-text-color="white"
            />
          </div>

          <div v-if="frequency == RecurrenceFrequency.Monthly">
            <div>
              <q-radio
                v-model="monthlyMode"
                val="dayOfMonth"
                :label="$t('onDayOfMonthTitle')"
                :color="color"
                dense
                class="q-mt-xs"
              />
            </div>
            <toggle-button-group
              v-if="monthlyMode == 'dayOfMonth'"
              v-model="daysOfTheMonth"
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
                val="dayOfWeek"
                :label="$t('onDayOfWeekTitle')"
                :color="color"
                dense
              />
            </div>
            <div
              v-if="monthlyMode == 'dayOfWeek'"
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
          v-model="recurrenceEnd"
          :options="recurrenceEndOptions"
          :label="$t('recurrenceEndLabel')"
          options-dense
          :color="color"
          options-cover
          map-options
          emit-value
        />

        <div v-if="recurrenceEnd == 2">
          <date-time
            v-model="endDate"
            :format="$t('dateFormat')"
            :min="new Date()"
            :placeholder="$t('dateFormatPlaceholder')"
            color="intervention"
            class="q-mt-sm"
            required
            dense
          />
        </div>

        <div v-if="recurrenceEnd == 3">
          <q-input
            :color="color"
            v-model.number="occurenceCount"
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
                  $tc("endAfterOccureceCountLabel", occurenceCount).split(
                    " " + occurenceCount + " "
                  )[0]
                }}
              </div>
            </template>
            <template v-slot:append>
              <span class="text-body2 text-black">{{
                $tc("endAfterOccureceCountLabel", occurenceCount).split(
                  " " + occurenceCount + " "
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
import { RecurrenceFrequency } from "../models/recurrenceRule";
import SearchableOptionList from "./SearchableOptionList.vue";
import ToggleButtonGroup from "./ToggleButtonGroup.vue";
import DateTime from "../components/DateTime.vue";

@Component({
  props: {
    defaultTime: Date,
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
    frequency() {
      (this as EditReminder).reset();
    },
    hasOwnRecurrencePattern() {
      (this as EditReminder).reset();
    },
    recurrenceEnd(value) {
      const self = this as EditReminder;
      if (value == 1) {
        self.endDate = null;
        self.occurenceCount = 0;
      } else if (value == 2) {
        self.endDate = new Date();
        self.occurenceCount = 0;
      } else if (value == 3) {
        self.endDate = null;
        self.occurenceCount = 1;
      }
    }
  }
})
export default class EditReminder extends Vue {
  frequency = RecurrenceFrequency.Never;
  interval = 1;
  hasOwnRecurrencePattern = false;
  timesOfTheDay: Date[] = [];
  daysOfTheWeek: number[] = [];
  daysOfTheMonth: number[] = [];
  monthsOfTheYear: number[] = [];
  positions: number[] = [];
  showYearlyDayOfWeek = false;
  monthlyMode = "dayOfMonth";
  recurrenceEnd = 1;
  endDate: Date | null = null;
  occurenceCount = 0;
  intervalKey = Math.random();
  occurenceCountKey = Math.random();

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
      .map(key => this.$t(key) as string)
      .map(this.toOption)
      .concat([{ label: this.$t("lastDay") as string, value: -1 }]);
  }
  get recurrenceEndOptions() {
    return ["never", "recurrenceEndDate", "endAfterOccurenceCount"]
      .map(key => this.$t(key) as string)
      .map(this.toOption);
  }
  get frequencyUnit() {
    if (this.frequency == RecurrenceFrequency.Daily) {
      return "Day";
    } else if (this.frequency == RecurrenceFrequency.Weekly) {
      return "Week";
    } else if (this.frequency == RecurrenceFrequency.Monthly) {
      return "Month";
    } else if (this.frequency == RecurrenceFrequency.Yearly) {
      return "Year";
    } else {
      return "";
    }
  }
  get description() {
    let description = "";

    if (this.frequencyUnit) {
      description += this.$tc("every" + this.frequencyUnit, this.interval);
    }

    return description;
  }
  get RecurrenceFrequency() {
    return RecurrenceFrequency;
  }

  toOption(name: string, index: number) {
    return { label: name, value: index + 1 };
  }
  reset() {
    this.interval = 1;
    this.timesOfTheDay = [];
    if (
      this.frequency == RecurrenceFrequency.Daily &&
      this.hasOwnRecurrencePattern &&
      this.$props.defaultTime
    ) {
      this.timesOfTheDay = [this.$props.defaultTime];
    } else {
      this.timesOfTheDay = [];
    }
    this.daysOfTheWeek = [];
    this.daysOfTheMonth = [];
    this.monthsOfTheYear = [];
    this.positions = [];
    this.showYearlyDayOfWeek = false;
    this.monthlyMode = "dayOfMonth";
  }
  validateInterval(value: number) {
    if (!/^\d{1,3}$/.test("" + value) || value < 1) {
      this.interval = 1;
      this.intervalKey = Math.random();
    }
  }
  validateOccurenceCount(value: number) {
    if (!/^\d{1,3}$/.test("" + value) || value < 1) {
      this.occurenceCount = 1;
      this.occurenceCountKey = Math.random();
    }
  }
  timesOfTheDayInput(value: Date | null, index: number) {
    if (value == null) {
      this.timesOfTheDay.splice(index, 1);
    } else {
      this.timesOfTheDay[index] = value;
    }
    this.timesOfTheDay = this.timesOfTheDay.concat([]);
  }
}
</script>
