<template>
  <div style="max-width: 300px">
    <q-select
      v-model="frequency"
      :options="frequencyOptions"
      :label="$t('recurrence')"
      options-dense
      color="intervention"
      options-cover
      map-options
      emit-value
      style="width: 180px"
    />

    <div v-if="frequency != RecurrenceFrequency.Never">
      <q-input
        color="intervention"
        v-model.number="interval"
        type="number"
        class="q-my-sm"
        :prefix="$tc('every' + frequencyUnit, 5).split(' 5 ')[0]"
        :suffix="$tc('every' + frequencyUnit, 5).split(' 5 ')[1]"
        step="1"
        min="1"
        max="999"
        :rules="[ val => val >= 1 && val <= 999 || '']"
        style="width: 180px"
        input-class="text-center"
      />
    </div>

    <q-expansion-item
      v-if="frequency != RecurrenceFrequency.Never"
      :label="$t('ownRecurrencePatternTitle')"
      switch-toggle-side
    >
      <div v-if="frequency == RecurrenceFrequency.Daily">
        <q-input
          color="intervention"
          v-model="time"
          mask="time"
          :rules="['time']"
          type="time"
          borderless
        >
          <template v-slot:prepend>
            <q-icon
              name="access_time"
              class="cursor-pointer"
            >
              <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="time"
                  color="intervention"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-btn
          icon="add"
          round
          outline
          size="10.5px"
          color="intervention"
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
          toggle-color="intervention"
          toggle-text-color="white"
          size="14px"
          class="q-my-sm"
        />
      </div>

      <div v-if="frequency == RecurrenceFrequency.Monthly">
        <div>
          <q-radio
            v-model="monthlyMode"
            val="dayOfMonth"
            :label="$t('onDayOfMonthTitle')"
            color="intervention"
            dense
          />
        </div>
        <toggle-button-group
          v-if="monthlyMode == 'dayOfMonth'"
          v-model="daysOfTheMonth"
          :options="daysOfTheMonthOptions"
          color="white"
          text-color="gray-9"
          toggle-color="intervention"
          toggle-text-color="white"
          size="14px"
          class="q-mt-sm q-mb-lg"
        />
        <div class="q-mt-sm">
          <q-radio
            v-model="monthlyMode"
            val="dayOfWeek"
            :label="$t('onDayOfWeekTitle')"
            color="intervention"
            dense
          />
        </div>
        <div
          v-if="monthlyMode == 'dayOfWeek'"
          class="row q-gutter-md"
        >
          <q-select
            v-model="positions"
            :options="positionOptions"
            dense
            options-dense
            color="intervention"
            options-cover
            map-options
            emit-value
            style="width: 142px"
            :prefix="$t('everyDayPrefix')"
          />
          <q-select
            v-model="singleDayOfTheWeek"
            :options="singleDayOfTheWeekOptions"
            dense
            options-dense
            color="intervention"
            options-cover
            map-options
            emit-value
            style="width: 142px"
          />
        </div>
      </div>

      <div v-if="frequency == RecurrenceFrequency.Yearly">
        <toggle-button-group
          v-model="monthsOfTheYear"
          :options="monthsOfTheYearOptions"
          color="white"
          text-color="gray-9"
          toggle-color="intervention"
          toggle-text-color="white"
          size="16px"
          class="q-my-sm"
        />
        <div class="q-mt-lg">
          <q-toggle
            v-model="showYearlyDayOfWeek"
            :label="$t('onDayOfWeekTitle')"
            color="intervention"
            dense
          />
        </div>
        <div
          v-if="showYearlyDayOfWeek"
          class="row q-gutter-md"
        >
          <q-select
            v-model="positions"
            :options="positionOptions"
            dense
            options-dense
            color="intervention"
            options-cover
            map-options
            emit-value
            style="width: 142px"
            :prefix="$t('everyDayPrefix')"
          />
          <q-select
            v-model="singleDayOfTheWeek"
            :options="singleDayOfTheWeekOptions"
            dense
            options-dense
            color="intervention"
            options-cover
            map-options
            emit-value
            style="width: 142px"
          />
        </div>
      </div>
    </q-expansion-item>

    <div
      class="text-caption q-mt-md"
      v-if="!!description"
    >{{ description }}</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { RecurrenceFrequency } from "../models/recurrenceRule";
import SearchableOptionList from "./SearchableOptionList.vue";
import ToggleButtonGroup from "./ToggleButtonGroup.vue";

@Component({
  components: {
    SearchableOptionList,
    ToggleButtonGroup
  }
})
export default class EditReminder extends Vue {
  frequency = RecurrenceFrequency.Never;
  interval = 0;
  time = "10:00";
  daysOfTheWeek: number[] = [];
  daysOfTheMonth: number[] = [];
  monthsOfTheYear: number[] = [];
  positions: number[] = [];
  showYearlyDayOfWeek = false;
  monthlyMode = "dayOfMonth";

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
