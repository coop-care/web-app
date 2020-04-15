<template>
  <q-input
    v-model="dateString"
    :mask="dateMaskForInput"
    :label="label"
    :placeholder="placeholder"
    :color="color"
    :dense="dense"
    :key="dateKey"
    @blur="dateKey = Math.random()"
  >
    <q-menu
      v-if="mappedOptions"
      v-model="showOptions"
      auto-close
      fit
      anchor="bottom left"
      self="top left"
      square
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
            @input="$refs.dateProxy.hide()"
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
        @click.stop="$emit('input', null)"
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
import { date } from "quasar";

const emptyDate = new Date(0, 0, 0, 0, 0, 0, 0).getTime();

@Component({
  props: {
    value: Date,
    format: {
      type: String,
      default: "YYYY-MM-DD HH:mm"
    },
    min: Date,
    label: String,
    placeholder: String,
    color: {
      type: String,
      default: "primary"
    },
    required: Boolean,
    dense: Boolean,
    options: Array
  }
})
export default class DateTime extends Vue {
  dateKey = Math.random();
  showOptions = false;

  get dateString(): string {
    return date.formatDate(this.$props.value || undefined, this.$props.format);
  }
  set dateString(value: string) {
    const result = date.extractDate(value, this.$props.format);

    if (!isNaN(result.getTime()) && result.getTime() != emptyDate) {
      if (
        !this.$props.min ||
        date.isBetweenDates(result, this.$props.min, result, {
          inclusiveTo: true,
          inclusiveFrom: true,
          onlyDate: true
        })
      ) {
        this.$emit("input", result);
      } else {
        this.$emit("input", this.$props.min);
      }
    }
  }
  get dateMaskForInput() {
    return this.$props.format
      .toString()
      .replace(/[dDMYHhm]/g, "#")
      .replace(/A/g, "AA");
  }
  get showDatePicker() {
    return /[YMDd]/.test(this.$props.format);
  }
  get showTimePicker() {
    return /[hHmaA]/.test(this.$props.format);
  }
  get mappedOptions() {
    return this.$props.options
      ?.sort((a: any, b: any) => a.value.getTime() - b.value.getTime())
      .map((option: any) => {
        return {
          label: option.label,
          value: date.formatDate(option.value, this.$props.format)
        };
      });
  }

  dateOptions(value: string) {
    return (
      !this.$props.min ||
      value >= date.formatDate(this.$props.min, "YYYY/MM/DD")
    );
  }
}
</script>
