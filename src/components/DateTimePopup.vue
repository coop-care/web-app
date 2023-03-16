<template>
  <div class="bg-white">
    <q-tabs
      v-model="selectedTab"
      no-caps
      inline-label
      :class="'bg-' + color + ' text-white'"
    >
      <q-tab
        name="date"
        :label="$t('date')"
        icon="event"
      />
      <q-tab
        name="time"
        :label="$t('time')"
        icon="access_time"
      />
    </q-tabs>
    <q-tab-panels
      v-model="selectedTab"
      animated
    >
      <q-tab-panel
        name="date"
        class="q-pa-none"
      >
        <q-date
          v-model="dateString"
          :mask="format"
          :color="color"
          today-btn
          flat
          :options="dateOptions"
          class="no-border-radius"
        />
      </q-tab-panel>
      <q-tab-panel
        name="time"
        class="q-pa-none"
      >
        <q-time
          v-model="dateString"
          :mask="format"
          :color="color"
          flat
          class="no-border-radius"
        />
      </q-tab-panel>
    </q-tab-panels>
    <div class="row justify-between q-mb-md q-mx-lg">
      <q-btn
        :label="$t('cancel')"
        flat
        rounded
        :color="color"
        no-caps
        v-close-popup
      />
      <q-btn
        :label="$t('confirmDate')"
        :color="color"
        rounded
        unelevated
        no-caps
        v-close-popup
        @click="$emit('update:model-value', selectedDate)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-facing-decorator";
import { date } from "quasar";

const { formatDate, extractDate, isBetweenDates } = date;

@Component({
  emits: ["update:model-value"]
})
export default class DateTimePopup extends Vue {
  @Model({ type: Date, required: true}) readonly value!: Date;
  @Prop({ type: String, default: "YYYY-MM-DD HH:mm"}) readonly format!: string;
  @Prop({ type: Date }) readonly min: Date | undefined;
  @Prop({ type: String, default: "primary"}) readonly color!: string;

  selectedDate = new Date();
  selectedTab = "date";

  get dateString() {
    return formatDate(this.selectedDate, this.format);
  }
  set dateString(value) {
    const result = extractDate(value, this.format);

    if (!isNaN(result.getTime())) {
      if (
        !this.min ||
        isBetweenDates(result, this.min, result, {
          inclusiveTo: true,
          inclusiveFrom: true,
          onlyDate: true
        })
      ) {
        this.selectedDate = result;
      } else {
        this.selectedDate = (this.min as unknown) as Date;
      }
    }
  }
  dateOptions(value: string) {
    return !this.min || value >= formatDate(this.min, "YYYY/MM/DD");
  }

  created() {
    this.selectedDate = ((this.value as unknown) as Date) || this.selectedDate;
  }
}
</script>
