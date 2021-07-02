<template>
  <div
    v-if="true"
    class="row items-center"
  >
    <div class="text-body2 q-pr-sm">Zeiterfassung:</div>
    <q-input
      :label="$t('activity')"
      :v-model="activity"
    />
    <q-btn-dropdown 
      v-if="!activeRecording"
      :label="$t('Start')"
      split
      auto-close
      outline
      rounded
      no-caps
      :ripple="false"
      color="primary"
    >
      <q-list>
        <q-item
          clickable
          @click="start"
        >
          Start zum Datum
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-btn-dropdown 
      v-else
      :label="$t('Stop')"
      auto-close
      stretch
      flat
      no-caps
      dense
      :ripple="false"
      color="primary"
    >
      <q-list>
        <q-item
          clickable
          @click="end"
        >
          Start zum Datum
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class TimeRecordingView extends Vue {
  recordings: {start: Date; end?: Date; activity: string}[] = [];
  activity = "";

  get activeRecording() {
    return this.recordings.find(item => !item.end);
  }

  start(start = new Date()) {
    if (!this.activeRecording) {
      this.recordings = this.recordings.concat({start, activity: this.activity});
    }
  }
  end(end = new Date()) {
    if (this.activeRecording) {
      this.activeRecording.end = end;
    }
  }
}
</script>
