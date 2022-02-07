<template>
  <div class="shift-notes q-px-md full-width">
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
      <div
        v-else
        class="q-pb-sm"
      >
        <q-input
          v-model="shiftNoteDraft"
          autofocus
          :label="$t('shiftNoteLabel')"
          maxlength="140"
          counter
          autogrow
          :rules="[val => canAddNote || $t('shiftNoteAdditionForCurrentDayOnly')]"
          class="shift-note-input"
        >
          <template v-slot:after>
            <q-btn
              v-if="canAddNote && shiftNoteDraft.length"
              :label="$t('send')"
              :disabled="!shiftNoteDraft"
              flat
              rounded
              no-caps
              color="primary"
              @click="addShiftNote"
            />
            <q-btn
              v-else
              :label="$t('cancel')"
              flat
              rounded
              no-caps
              color="primary"
              @click="shiftNodeInputVisible = false"
            />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.shift-note-input .q-field__after
  padding-left: 0
  align-items: flex-end
</style>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { date } from "quasar";
import { ShiftNote } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import Signature from "components/Signature.vue";

const {
  isBetweenDates,
  startOfDate,
  endOfDate,
} = date;

@Component({
  components: {
    Signature
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
    ) || [];
  }
  get timeFormatter() {
    return new Intl.DateTimeFormat(this.$root.$i18n.locale, {
      hour: "numeric",
      minute: "numeric",
    });
  }

  addShiftNote() {
    if (this.client && this.canAddNote) {
      const shiftNote = new ShiftNote(this.$store.direct.getters.userId, this.shiftNoteDraft);
      this.updateAndSave(this.client, {
        shiftNotes: this.client.shiftNotes.concat([shiftNote])
      })
      this.shiftNodeInputVisible = false;
      this.shiftNoteDraft = "";
    }
  }
}
</script>