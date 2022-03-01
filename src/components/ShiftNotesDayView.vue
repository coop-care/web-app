<template>
  <div class="shift-notes full-width">
    <div
      v-if="client && client.hasBirthday(date)"
      class="column items-center q-mb-lg"
    >
      <div class="row">
        <q-icon name="fas fa-birthday-cake" color="intervention" size="sm"/>
        <div class="q-ml-md text-subtitle2">{{ $t('hasBirthdayTodayMessage', {name: client.name, age: client.age(date) }) }}</div>
      </div>
    </div>
    <div
      v-if="client && client.hasBirthday(yesterday)"
      class="column items-center q-mb-lg"
    >
      <div class="row">
        <q-icon name="far fa-heart" color="intervention" size="sm"/>
        <div class="q-ml-md">{{ $t('hadBirthdayYesterdayMessage', {name: client.name, age: client.age(date) }) }}</div>
      </div>
    </div>

    <div>
      <chat-message
        v-for="(note, index) in shiftNotes"
        :key="index"
        :message="note"
      />
    </div>

    <div>
      <div
        v-if="shiftNotes.length || (canAddNote && !shiftNodeInputVisible)"
        class="column items-center"
      >
        <div class="row">
          <q-btn
            v-if="shiftNotes.length"
            :label="$t('showShiftNoteTabView')"
            flat
            rounded
            no-caps
            color="primary"
            :class="[!canAddNote ? 'text-caption' : '']"
            :to="{name: 'clientConversation', params: {day: this.date.getTime()}}"
          />
          <q-btn
            v-if="canAddNote && !shiftNodeInputVisible"
            :label="$t('addOptionalShiftNote')"
            flat
            rounded
            no-caps
            color="primary"
            @click="shiftNodeInputVisible = true"
          />
        </div>
      </div>

      <shift-note-input
        v-if="canAddNote && shiftNodeInputVisible"
        autofocus
        cancelable
        @add="shiftNodeInputVisible = false"
        @cancel="shiftNodeInputVisible = false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { date } from "quasar";
import { ShiftNote } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import ChatMessage from "components/ChatMessage.vue";
import ShiftNoteInput from "components/ShiftNoteInput.vue";

const {
  isBetweenDates,
  startOfDate,
  endOfDate,
  subtractFromDate,
} = date;

@Component({
  components: {
    ChatMessage,
    ShiftNoteInput
  }
})
export default class ShiftNotesDayView extends RecordMixin {
  @Prop({ type: Date, required: true}) readonly date!: Date;
  @Prop(Boolean) readonly canAddNote!: boolean;
  shiftNodeInputVisible = false;
  shiftNoteDraft = "";

  get shiftNotes() {
    const startOfDay = startOfDate(this.date, "day", false);
    const endOfDay = endOfDate(this.date, "day", false);
    
    return this.client?.shiftNotes.filter(note => 
      isBetweenDates(note.created, startOfDay, endOfDay)
    ).slice().sort(ShiftNote.sortByCreated) || [];
  }
  get yesterday() {
    return subtractFromDate(this.date, {days: 1})
  }
}
</script>