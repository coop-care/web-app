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
      <div
        v-else
        class="q-pb-sm column items-center"
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
          :hint="$t('shiftNoteOmahaSystemHint')"
          hide-bottom-space
        >
          <template v-slot:append>
            <q-btn
              v-if="canAddNote && shiftNoteDraft.length"
              :label="$t('send')"
              :disabled="!shiftNoteDraft"
              flat
              no-caps
              color="primary"
              class="full-height"
              @click="addShiftNote"
            />
            <q-btn
              v-else
              :label="$t('cancel')"
              flat
              no-caps
              color="primary"
              class="full-height"
              @click="shiftNodeInputVisible = false"
            />
          </template>
        </q-input>
        <q-btn-group
          flat
          rounded
          class="q-mt-xs"
        >
          <q-btn
            v-if="hasActiveProblems"
            :label="$t('interimRating')"
            flat
            no-caps
            color="outcome"
            @click="addOutcome"
          />
          <q-btn
            v-if="hasActiveProblems"
            :label="$t('addTask')"
            flat
            no-caps
            color="intervention"
            :to="{ name: 'newIntervention' }"
          />
          <q-btn
            :label="$t('problemAdmission')"
            flat
            no-caps
            color="classification"
            :to="{ name: 'problem', params: { problemId: 'new' } }"
          />
        </q-btn-group>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.shift-note-input
  .q-field__append
    height: auto
    padding-top: 16px
  .q-field__messages, .q-field__counter
    line-height: 1.3
</style>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { date } from "quasar";
import { ShiftNote } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import Signature from "components/Signature.vue";
import SelectDialog from "components/SelectDialog.vue";

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
    ).sort(ShiftNote.sortByCreated) || [];
  }
  get timeFormatter() {
    return new Intl.DateTimeFormat(this.$root.$i18n.locale, {
      hour: "numeric",
      minute: "numeric",
    });
  }
  get hasActiveProblems() {
    return this.client && this.client.activeProblems.length > 0
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

  addOutcome() {
    if (this.client) {
      const activeProblems = this.client.activeProblems;

      if (activeProblems.length > 1) {
        this.$q.dialog({
          component: SelectDialog,
          parent: this,
          title: this.$t("newRating") as string,
          message: this.$t("selectProblemForNewRating") as string,
          okButtonLabel: this.$t("rateButtonTitle") as string,
          selectOptions: activeProblems.map(problem => ({
            label: this.$t(problem.problem.title),
            value: problem.id
          }))
        }).onOk((problemId: string) => {
          void this.$router.push({
            name: "outcome",
            params: { problemId }
          });
        });
      } else if (activeProblems.length == 1) {
        const problemId = activeProblems[0].id;
        void this.$router.push({
          name: "outcome",
          params: { problemId }
        });
      }
    }
  }
}
</script>