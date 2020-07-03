<template>
  <editing-page-container
    :title="$t('editIntervention')"
    :is-data-available="!!(client && intervention)"
    @cancel="$router.back()"
    @save="save"
  >
    <problem-summary-container>
      <intervention-editor
        :value="intervention"
        isSingleEditor
      />
    </problem-summary-container>
  </editing-page-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Reminder } from "../models";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import InterventionEditor from "components/InterventionEditorV3.vue";

let oldIntervention: Reminder | undefined;

@Component({
  components: {
    InterventionEditor,
    EditingPageContainer,
    ProblemSummaryContainer
  }
})
export default class InterventionPage extends Vue {
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get intervention() {
    return this.client?.findReminder(this.$route.params.interventionId);
  }

  save() {
    if (this.intervention) {
      this.$store.direct.commit.addToClientHistory({
        clientId: this.$route.params.clientId,
        problemId: this.$route.params.problemId,
        changeType: "InterventionModified",
        newInstance: this.intervention,
        oldInstance: oldIntervention
      });
    }
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }

  mounted() {
    oldIntervention = this.intervention?.clone();
  }
}
</script>
