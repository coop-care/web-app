<template>
  <div class="shift-notes full-width">
    <div>
      <q-chat-message
        v-for="(note, index) in (shiftNotes || [])"
        :key="index"
        :text="[note.text]"
        :stamp="timeFormatter.format(note.created)"
        :sent="note.user == $store.direct.getters.userId"
        :bg-color="note.user == $store.direct.getters.userId ? 'primary-chat' : undefined"
        size="10"
        text-sanitize
        stamp-sanitize
        label-sanitize
        name-sanitize
      >
        <template v-slot:avatar>
          <signature
            :userId="note.user"
            :date="note.created"
            has-tooltip
            :class="[note.user == $store.direct.getters.userId ? 'q-message-avatar--sent' : 'q-message-avatar--received']"
          />
        </template>
      </q-chat-message>
    </div>
    <div v-if="canAddNote">
      <div
        v-if="!shiftNodeInputVisible"
        class="column items-center"
      >
        <q-btn
          :label="$t('addOptionalShiftNote')"
          flat
          rounded
          no-caps
          color="primary"
          @click="shiftNodeInputVisible = true"
        />
      </div>
      <shift-note-input
        v-else
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
import Signature from "components/Signature.vue";
import ShiftNoteInput from "components/ShiftNoteInput.vue";

const {
  isBetweenDates,
  startOfDate,
  endOfDate,
} = date;

@Component({
  components: {
    Signature,
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
  get timeFormatter() {
    return new Intl.DateTimeFormat(this.$root.$i18n.locale, {
      hour: "numeric",
      minute: "numeric",
    });
  }
}
</script>