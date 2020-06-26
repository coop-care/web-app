<template>
  <q-input
    v-model="dateString"
    :mask="dateMaskForInput"
    :label="label"
    :placeholder="placeholder"
    :color="color"
    :dense="dense"
    :key="dateKey"
    :hint="hint"
    @blur="dateKey = Math.random()"
    ref="dateInput"
  >
    <q-menu
      v-if="mappedOptions"
      v-model="showOptions"
      auto-close
      fit
      anchor="bottom left"
      self="top left"
      square
      no-focus
    >
      <q-list dense>
        <q-item
          v-for="option in mappedOptions"
          :key="option.value"
          clickable
          @click="dateString = option.value"
          :active="dateString == option.value"
          :active-class="'text-' + color"
        >
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <template v-slot:prepend>
      <q-icon
        v-if="showDatePicker"
        name="event"
        class="cursor-pointer"
        :color="color"
        @click.stop.prevent="showOptions = false"
      >
        <q-popup-proxy
          ref="dateProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="dateString"
            :mask="format"
            :color="color"
            @input="onInputDate"
            today-btn
            :options="dateOptions"
          />
        </q-popup-proxy>
      </q-icon>
      <q-icon
        v-if="!showDatePicker && showTimePicker"
        name="access_time"
        class="cursor-pointer"
        :color="color"
        @click.stop.prevent="showOptions = false"
      >
        <q-popup-proxy
          ref="timeProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-time
            v-model="dateString"
            :mask="format"
            :color="color"
            @input="$refs.timeProxy.hide()"
          />
        </q-popup-proxy>
      </q-icon>
    </template>

    <template v-slot:append>
      <q-icon
        v-if="!required && dateString"
        name="cancel"
        @click.stop="clear"
        class="cursor-pointer"
      />
      <q-icon
        v-if="showTimePicker && showDatePicker"
        name="access_time"
        class="cursor-pointer"
        :color="color"
        @click.stop.prevent="showOptions = false"
      >
        <q-popup-proxy
          ref="timeProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-time
            v-model="dateString"
            :mask="format"
            :color="color"
            @input="$refs.timeProxy.hide()"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { date, QInput, QPopupProxy } from "quasar";

const emptyDate = new Date(0, 0, 0, 0, 0, 0, 0).getTime();
const { formatDate, extractDate, isBetweenDates } = date;

const DateTimeProps = Vue.extend({
  props: {
    value: Date,
    format: {
      type: String,
      default: "YYYY-MM-DD HH:mm"
    },
    min: Date,
    label: String,
    placeholder: String,
    defaultTime: String,
    color: {
      type: String,
      default: "primary"
    },
    required: Boolean,
    dense: Boolean,
    options: Array,
    hint: String
  }
});

@Component
export default class DateTimeInput extends DateTimeProps {
  dateKey = Math.random();
  showOptions = false;
  $refs!: { dateInput: QInput; dateProxy: QPopupProxy };

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
        this.$emit(
          "input",
          new Date(
            new Date(this.min).setHours(
              result.getHours(),
              result.getMinutes(),
              result.getSeconds(),
              result.getMilliseconds()
            )
          )
        );
      }
    }
  }
  get dateMaskForInput() {
    return this.format
      .toString()
      .replace(/[dDMYHhm]/g, "#")
      .replace(/A/g, "AA");
  }
  get showDatePicker() {
    return /[YMDd]/.test(this.format);
  }
  get showTimePicker() {
    return /[hHmaA]/.test(this.format);
  }
  get mappedOptions() {
    return this.options
      ?.sort((a: any, b: any) => a.value.getTime() - b.value.getTime())
      .map((option: any) => {
        return {
          label: option.label,
          value: formatDate(option.value, this.format)
        };
      });
  }

  dateOptions(value: string) {
    return !this.min || value >= formatDate(this.min, "YYYY/MM/DD");
  }
  onInputDate(value: string) {
    if (!this.dateString && this.defaultTime) {
      this.dateString = value.replace("00:00", this.defaultTime);
    }
    this.$refs.dateProxy.hide();
  }
  clear(event: Event) {
    this.$emit("input", null);
    this.$refs.dateInput.$emit("blur", event);
    this.showOptions = false;
  }
}
</script>
