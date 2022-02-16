<template>
  <q-input
    v-model="dateString"
    :mask="dateMaskForInput"
    fill-mask
    :label="label"
    :placeholder="placeholder"
    :color="color"
    :dense="dense"
    :key="dateKey"
    :hint="hint"
    @blur="dateKey = Math.random()"
    ref="dateInput"
    inputmode="numeric"
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
            @input="timeProxy.hide()"
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
            @input="timeProxy.hide()"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from "vue-property-decorator";
import { date, QInput, QPopupProxy } from "quasar";

const emptyDate = new Date(0, 0, 0, 0, 0, 0, 0).getTime();
const { formatDate, extractDate, isBetweenDates } = date;

interface DateSelectionOption {
  label: string;
  value: Date;
}

@Component
export default class DateTimeInput extends Vue {
  @Prop(Date) readonly value: Date | undefined;
  @Prop({ type: String, default: "YYYY-MM-DD HH:mm"}) readonly format!: string;
  @Prop(Date) readonly min: Date | undefined;
  @Prop(String) readonly label: string | undefined;
  @Prop(String) readonly placeholder: string | undefined;
  @Prop(String) readonly defaultTime: string | undefined;
  @Prop({ type: String, default: "primary"}) readonly color!: string;
  @Prop(Boolean) readonly required!: boolean;
  @Prop(Boolean) readonly dense!: boolean;
  @Prop({ type: Array, default: () => []}) readonly options!: DateSelectionOption[];
  @Prop(String) readonly hint: string | undefined;
  @Ref() readonly dateInput!: QInput;
  @Ref() readonly dateProxy!: QPopupProxy;
  @Ref() readonly timeProxy!: QPopupProxy;

  dateKey = Math.random();
  showOptions = false;

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
    this.dateProxy.hide();
  }
  clear(event: Event) {
    this.$emit("input", null);
    this.dateInput.$emit("blur", event);
    this.showOptions = false;
  }
}
</script>
