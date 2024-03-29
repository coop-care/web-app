<template>
  <editing-sheet
    ref="editingSheet"
    :title="title"
    :is-data-available="!!(client && editableIntervention)"
    :paramsToRemoveOnClose="['problemId', 'interventionId']"
    :hasPendingChanges="hasPendingChanges"
  >
      <intervention-editor
        :model-value="editableIntervention"
        :problem-code="problemCode"
        isSingleEditor
        editMode
        class="q-mt-lg"
      />
      <warning
        v-model="showWarning"
        :messages="interventionWarnings(editableIntervention)"
      />
      <div class="q-mt-lg row justify-center">
        <q-btn
          @click="validate(interventionWarnings(editableIntervention), save)"
          color="primary"
          rounded
          unelevated
          no-caps
          :outline="!!interventionWarnings(editableIntervention)"
          :label="doneButtonLabel"
          class="done-button"
        />
      </div>
  </editing-sheet>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "vue-facing-decorator";
import RecordValidator, { RecordValidatorInterface } from "../mixins/RecordValidator";
import { Intervention } from "../models";
import EditingSheet from "../components/EditingSheet.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import InterventionEditor from "components/InterventionEditorV3.vue";
import Warning from "components/Warning.vue";

interface InterventionPage extends RecordValidatorInterface {};

@Component({
  components: {
    InterventionEditor,
    EditingSheet,
    ProblemSummaryContainer,
    Warning,
  },
  mixins: [RecordValidator]
})
class InterventionPage extends Vue {
  @Ref() readonly editingSheet!: EditingSheet;
  editableIntervention: Intervention | null = null;

  get title() {
    return [
      this.client?.contact.name,
      this.record?.problem.title
        ? this.$t(this.record?.problem.title)
        : "",
      this.$t("editIntervention")
    ].filter(Boolean).join(": ");
  }
  get intervention() {
    return this.client?.findReminder(this.$route.params.interventionId as string);
  }
  get problemCode() {
    return this.record?.problem.code ?? ""
  }

  hasPendingChanges() {
    return !!this.editableIntervention && !!this.intervention 
      && !this.editableIntervention.equals(this.intervention);
  }

  save() {
    if (this.editableIntervention && this.hasPendingChanges()) {
      this.$store.direct.commit.addToClientHistory({
        clientId: this.$route.params.clientId as string,
        problemId: this.$route.params.problemId as string,
        changeType: "InterventionModified",
        newInstance: this.editableIntervention,
        oldInstance: this.intervention,
      });
      this.$store.direct.commit.updateObject({
        target: this.intervention,
        changes: this.editableIntervention,
      });
    }

    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.editingSheet.confirm());
  }

  created() {
    this.editableIntervention = (this.intervention?.clone() as Intervention) ?? null;
  }
}

export default InterventionPage;
</script>
