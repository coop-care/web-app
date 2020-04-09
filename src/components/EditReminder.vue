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

        <div v-if="frequency != RecurrenceFrequency.Never">
          <q-input
            :color="color"
            v-model.number="interval"
            type="number"
            class="q-my-sm"
            dense
            :prefix="$tc('every' + frequencyUnit, 5).split(' 5 ')[0]"
            :suffix="$tc('every' + frequencyUnit, 5).split(' 5 ')[1]"
            step="1"
            min="1"
            max="999"
            :rules="[val => (val >= 1 && val <= 999) || '']"
            input-class="text-center"
          />
        </div>

        <q-toggle
          v-if="frequency != RecurrenceFrequency.Never"
          v-model="hasOwnRecurrencePattern"
          :label="$t('ownRecurrencePatternTitle')"
          :color="color"
          switch-toggle-side
          dense
        />
        <div v-if="hasOwnRecurrencePattern">
          <div v-if="frequency == RecurrenceFrequency.Daily">
            <q-input
              :color="color"
              v-model="time"
              mask="time"
              :rules="['time']"
              type="time"
              borderless
            >
              <template v-slot:prepend>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time v-model="time" :color="color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-btn
              icon="add"
              round
              outline
              size="10.5px"
              :color="color"
              :title="$t('addTime')"
              class="shadow-1"
            />
          </div>

          <div v-if="frequency == RecurrenceFrequency.Weekly">
            <toggle-button-group
              v-model="daysOfTheWeek"
              :options="daysOfTheWeekOptions"
              color="white"
              text-color="gray-9"
              toggle-:color="color"
              toggle-text-color="white"
              class="q-mt-sm"
            />
          </div>

          <div v-if="frequency == RecurrenceFrequency.Monthly">
            <div class="q-mt-md">
              <q-radio
                v-model="monthlyMode"
                val="dayOfMonth"
                :label="$t('onDayOfMonthTitle')"
                :color="color"
                dense
              />
            </div>
            <toggle-button-group
              v-if="monthlyMode == 'dayOfMonth'"
              v-model="daysOfTheMonth"
              :options="daysOfTheMonthOptions"
              color="white"
              text-color="gray-9"
              toggle-:color="color"
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
              toggle-:color="color"
              toggle-text-color="white"
              class="q-my-sm"
            />
            <div class="q-mt-md q-mb-sm">
              <q-toggle
                v-model="showYearlyDayOfWeek"
                :label="$t('onDayOfWeekTitle')"
                :color="color"
                dense
              />
            </div>
            <div v-if="showYearlyDayOfWeek" class="row q-col-gutter-x-sm">
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
          <q-input
            v-model="endDate"
            type="date"
            mask="date"
            :color="color"
            class="q-mt-sm"
            dense
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer" :color="color">
                <q-popup-proxy
                  ref="endDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="endDate"
                    mask="YYYY-MM-DD"
                    :color="color"
                    @input="$refs.endDateProxy.hide()"
                    today-btn
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div v-if="recurrenceEnd == 3">
          <q-input
            :color="color"
            v-model.number="occurenceCount"
            type="number"
            class="q-my-sm"
            dense
            step="1"
            min="1"
            max="999"
            :rules="[val => (val >= 1 && val <= 999) || '']"
            input-class="text-center"
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

@Component({
  props: {
    color: {
      type: String,
      default: "primary"
    }
  },
  components: {
    SearchableOptionList,
    ToggleButtonGroup
  },
  watch: {
    frequency() {
      const self = this as EditReminder;
      self.interval = 1;
      self.daysOfTheWeek = [];
      self.daysOfTheMonth = [];
      self.monthsOfTheYear = [];
      self.positions = [];
      self.showYearlyDayOfWeek = false;
      self.monthlyMode = "dayOfMonth";
    },
    hasOwnRecurrencePattern() {
      const self = this as EditReminder;
      self.daysOfTheWeek = [];
      self.daysOfTheMonth = [];
      self.monthsOfTheYear = [];
      self.positions = [];
      self.showYearlyDayOfWeek = false;
      self.monthlyMode = "dayOfMonth";
    },
    recurrenceEnd(value) {
      const self = this as EditReminder;
      if (value == 1) {
        self.endDate = "";
        self.occurenceCount = 0;
      } else if (value == 2) {
        self.endDate = new Date().toISOString().substring(0, 10);
        self.occurenceCount = 0;
      } else if (value == 3) {
        self.endDate = "";
        self.occurenceCount = 1;
      }
    }
  }
})
export default class EditReminder extends Vue {
  frequency = RecurrenceFrequency.Never;
  interval = 1;
  hasOwnRecurrencePattern = false;
  time = "10:00";
  daysOfTheWeek: number[] = [];
  daysOfTheMonth: number[] = [];
  monthsOfTheYear: number[] = [];
  positions: number[] = [];
  showYearlyDayOfWeek = false;
  monthlyMode = "dayOfMonth";
  recurrenceEnd = 1;
  endDate = "";
  occurenceCount = 0;

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
}
</script>
