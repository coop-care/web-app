<template>
  <div class="q-pb-sm column items-center full-width">
    <q-input
      v-model="shiftNoteDraft"
      :autofocus="autofocus"
      :label="$t('shiftNoteLabel')"
      maxlength="140"
      counter
      autogrow
      class="shift-note-input full-width"
      :hint="$t('shiftNoteOmahaSystemHint')"
      hide-bottom-space
      hide-hint
    >
      <template v-slot:append>
        <q-btn
          v-if="cancelable && !shiftNoteDraft.length"
          :label="$t('cancel')"
          flat
          no-caps
          color="primary"
          class="full-height"
          @click="$emit('cancel')"
        />
        <q-btn
          v-else
          :label="$t('send')"
          :disabled="!shiftNoteDraft.length"
          flat
          no-caps
          color="primary"
          class="full-height"
          @click="addShiftNote"
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
        :to="{ params: {sheet: 'newIntervention'} }"
      />
      <q-btn
        :label="$t('problemAdmission')"
        flat
        no-caps
        color="classification"
        :to="{ name: 'clientReport', params: {sheet: 'newProblem'} }"
      />
    </q-btn-group>
  </div>
</template>

<style lang="sass">
.shift-note-input
  .q-field__append
    height: auto
    padding-top: 16px
  .q-field__messages, .q-field__counter
    line-height: 1.3
  .q-field__messages
    font-weight: bold
</style>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { ShiftNote } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import Signature from "components/Signature.vue";
import SelectDialog from "components/SelectDialog.vue";

@Component({
  components: {
    Signature
  }
})
export default class ShiftNoteInput extends RecordMixin {
  @Prop(Boolean) readonly autofocus!: boolean;
  @Prop(Boolean) readonly cancelable!: boolean;
  shiftNoteDraft = "";

  get hasActiveProblems() {
    return this.client && this.client.activeProblems.length > 0
  }

  addShiftNote() {
    if (this.client) {
      const shiftNote = new ShiftNote(this.$store.direct.getters.userId, this.shiftNoteDraft);
      this.updateAndSave(this.client, {
        shiftNotes: this.client.shiftNotes.concat([shiftNote])
      })
      this.shiftNoteDraft = "";
      this.$emit("add");
    }
  }

  addOutcome() {
    if (this.client) {
      const activeProblems = this.client.activeProblems;
      const sheet = "newOutcome";

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
            name: this.$route.name || "",
            params: { ...this.$route.params, problemId, sheet }
          });
        });
      } else if (activeProblems.length == 1) {
        const problemId = activeProblems[0].id;
        void this.$router.push({
          name: this.$route.name || "",
          params: { ...this.$route.params, problemId, sheet }
        });
      }
    }
  }
}
</script>