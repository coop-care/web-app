<template>
    <q-expansion-item
      v-if="true"
      header-class="text-primary"
      expand-icon-class="text-primary"
      dense
      class="full-width"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-btn
            :icon="activeRecording ? 'fas fa-stop' : 'fas fa-play'"
            :title="activeRecording ? $t('stopTimeTracking') : $t('startTimeTracking')"
            round
            flat
            size="12px"
            color="primary"
            @click.stop="toggleRecording()"
          />
        </q-item-section>
        <q-item-section>
          <div class="line-height-11">
            {{ $t('timeTracking') }}
            <div
              v-if="recordings.length"
              class="text-caption inline-block"
            >
              ({{ $t("timeTrackingRecordCount", recordings.length) }}, {{ $t("minuteCount", overallDurationMinutes) }})
            </div>
          </div>
        </q-item-section>
      </template>
      <div
        v-for="(recording, index) in recordings"
        :key="index"
        class="row items-center q-col-gutter-x-sm justify-between q-px-md"
      >
        <div class="text-body2">{{ index + 1 }}</div>
        <date-time-input
          :label="$t('startTime')"
          :model-value="new Date(recording.start)"
          @update:model-value="changeStart(recording, $event)"
          :format="$t('timeFormat')"
          required
          class="time-tracking-input"
        />
        <date-time-input
          :label="$t('endTime')"
          :model-value="recordingEnd(recording)"
          @update:model-value="changeEnd(recording, $event)"
          :format="$t('timeFormat')"
          :required="recording.duration != undefined"
          class="time-tracking-input"
        />
        <q-input
          :label="$t('duration')"
          :model-value="recordingDuration(recording)"
          @update:model-value="changeDuration(recording, $event)"
          :suffix="recording == activeRecording ? seconds : ':00'"
          input-class="text-right"
          mask="#:##"
          fill-mask="0"
          reverse-fill-mask
          class="time-tracking-duration"
        />
        <q-input
          :label="$t('serviceType')"
          :model-value="recording.serviceType"
          @update:model-value="changeServiceType(recording, $event)"
          class="col service-type-input"
        />
        <div>
          <q-btn
            icon="delete"
            :title="$t('delete')"
            flat
            round
            color="primary"
            @click="deleteRecording(recording)"
          />
        </div>
      </div>
      <div class="q-px-md q-pt-sm">
        <q-btn
          icon="add"
          :label="$t('startTimeTracking')"
          flat
          rounded
          no-caps
          color="primary"
          @click="startRecording"
        />
      </div>
    </q-expansion-item>
</template>

<style lang="sass">
.time-tracking-input
  width: 8em
.time-tracking-duration
  width: 5em
  .q-field__suffix
    color: rgba(0, 0, 0, 0.6)
    font-size: 12px
    line-height: 26px
    padding-left: 2px
.row > .col.service-type-input
  min-width: 6em
  max-width: 16em
</style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-facing-decorator";
import DateTimeInput from "components/DateTimeInput.vue";

type TimeRecording = {
  start: number;
  duration?: number;
  serviceType?: string;
};

@Component({
  components: {
    DateTimeInput
  }
})
export default class TimeRecordingView extends Vue {
  @Prop({ type: Date, required: true}) readonly date!: Date;
  /* ToDo: recordings need to be saved somewhere and derived from there (only for current day, only for current user) */
  recordings: TimeRecording[] = [];
  seconds = ":00";
  secondsInterval = 0;

  get activeRecording() {
    return this.recordings.find(item => item.duration == undefined);
  }
  get overallDurationMinutes() {
    this.seconds;
    return Math.round(this.recordings
      .map(item => 
        item.duration != undefined 
          ? item.duration 
          : Date.now() - item.start
      )
      .reduce((previous, current) => previous + current, 0) / 60_000);
  }

  startRecording() {
    if (this.activeRecording) {
      this.toggleRecording();
    }

    this.toggleRecording();
  }

  toggleRecording(date = new Date()) {
    date.setMilliseconds(0);
    date.setSeconds(0);
    const timestamp = date.getTime();

    if (this.activeRecording) {
      this.activeRecording.duration = timestamp - this.activeRecording.start;
      this.recordings = this.recordings.slice();
    } else {
      this.recordings = this.recordings.concat({
        start: timestamp
      });
    }
  }

  deleteRecording(recording: TimeRecording) {
    this.$q.dialog({
      title: this.$t("confirmDeletionTitle") as string,
      persistent: true,
      ok: {
        label: this.$t("delete"),
        rounded: true,
        flat: true,
        noCaps: true,
        color: "negative"
      },
      cancel: {
        rounded: true,
        flat: true,
        noCaps: true
      }
    }).onOk(() => {
      this.recordings = this.recordings.filter(item => item != recording);
    });
  }

  changeStart(recording: TimeRecording, value?: Date) {
    if (value) {
      const start = this.adustDate(value);
      recording.start = start.getTime();
    }
  }

  changeEnd(recording: TimeRecording, value?: Date) {
    if (value) {
      const end = this.adustDate(value);
      const duration = end.getTime() - recording.start;

      if (duration >= 0) {
        recording.duration = duration;
        this.recordings = this.recordings.slice();
      }
    }
  }

  changeDuration(recording: TimeRecording, value: string) {
    const [hours, minutes] = value.split(":");
    const duration = (parseInt(hours) * 60 + parseInt(minutes)) * 60_000;
    recording.duration = duration;
    this.recordings = this.recordings.slice();
  }

  changeServiceType(recording: TimeRecording, value?: string) {
    recording.serviceType = value;
    this.recordings = this.recordings.slice();
  }

  recordingEnd(recording: TimeRecording) {
    return recording.duration != undefined ? new Date(recording.start + recording.duration) : undefined;
  }

  recordingDuration(recording: TimeRecording) {
    const duration = recording.duration != undefined
      ? Math.round(recording.duration / 60_000)
      : Math.floor((Date.now() - recording.start) / 60_000);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours + ":" + minutes.toString().padStart(2, "0");
  }

  adustDate(value: Date) {
    value.setFullYear(this.date.getFullYear());
    value.setMonth(this.date.getMonth());
    value.setDate(this.date.getDate());
    return value;
  }

  updateSeconds() {
      if (this.activeRecording) {
        const seconds = Math.round((Date.now() - this.activeRecording.start) / 1000) % 60;
        this.seconds = ":" + seconds.toString().padStart(2, "0");
      } else {
        this.seconds = ":00";
      }
  }

  created() {
    this.secondsInterval = window.setInterval(this.updateSeconds, 1000);
  }

  unmounted() {
    clearTimeout(this.secondsInterval);
  }
}
</script>
