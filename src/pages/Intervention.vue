<template>
  <editing-page-container
    :title="$t('editIntervention')"
    :is-data-available="!!(client && intervention)"
    hide-default-footer
  >
      <intervention-editor
        :value="intervention"
        isSingleEditor
        editMode
      />
      <warning
        v-model="showWarning"
        :messages="customWarnings"
      />
      <q-btn
        @click="validate(customWarnings, save)"
        color="primary"
        rounded
        no-caps
        :outline="!!customWarnings"
        icon-right="fas fa-caret-right"
        :label="doneButtonLabel"
        class="q-mt-lg"
      />
  </editing-page-container>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import RecordValidator from "../mixins/RecordValidator";
import { Reminder, Intervention } from "../models";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import InterventionEditor from "components/InterventionEditorV3.vue";
import Warning from "components/Warning.vue";

let oldIntervention: Reminder | undefined;

@Component({
  components: {
    InterventionEditor,
    EditingPageContainer,
    ProblemSummaryContainer,
    Warning,
  },
})
export default class InterventionPage extends RecordValidator {
  get intervention() {
    return this.client?.findReminder(this.$route.params.interventionId);
  }
  get customWarnings() {
    if (this.intervention) {
      return this.warningsForIntervention(this.intervention as Intervention)
    } else {
      return ""
    }
  }

  save() {
    if (this.intervention) {
      this.$store.direct.commit.addToClientHistory({
        clientId: this.$route.params.clientId,
        problemId: this.$route.params.problemId,
        changeType: "InterventionModified",
        newInstance: this.intervention,
        oldInstance: oldIntervention,
      });
    }
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }

  mounted() {
    oldIntervention = this.intervention?.clone();
  }
}
</script>
