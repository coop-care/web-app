<template>
  <div>
    <q-date
      v-model="dateString"
      :mask="format"
      :color="color"
      @input="onInputDate"
      today-btn
      flat
      :options="dateOptions"
    />
    <q-time
      v-model="dateString"
      :mask="format"
      :color="color"
      flat
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { date } from "quasar";

const emptyDate = new Date(0, 0, 0, 0, 0, 0, 0).getTime();
const { formatDate, extractDate, isBetweenDates } = date;

const DateTimePopupProps = Vue.extend({
  props: {
    value: Date,
    format: {
      type: String,
      default: "YYYY-MM-DD HH:mm"
    },
    min: Date,
    label: String,
    defaultTime: String,
    color: {
      type: String,
      default: "primary"
    }
  }
});

@Component
export default class DateTimePopup extends DateTimePopupProps {
  get dateString(): string {
    return formatDate(this.value || undefined, this.format);
  }
  set dateString(value: string) {
    const result = extractDate(value, this.format);

    if (!isNaN(result.getTime()) && result.getTime() != emptyDate) {
      if (
        !this.min ||
        isBetweenDates(result, this.min, result, {
          inclusiveTo: true,
          inclusiveFrom: true,
          onlyDate: true
        })
      ) {
        this.$emit("input", result);
      } else {
        this.$emit("input", this.min);
      }
    }
  }
  dateOptions(value: string) {
    return !this.min || value >= formatDate(this.min, "YYYY/MM/DD");
  }
  onInputDate(value: string) {
    if (!this.dateString && this.defaultTime) {
      this.dateString = value.replace("00:00", this.defaultTime);
    }
  }
}
</script>
