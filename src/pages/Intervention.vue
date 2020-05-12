<template>
  <editing-page-container
    :title="$t('editIntervention')"
    :is-data-available="!!(client && intervention)"
    @cancel="$router.back()"
    @save="save"
  >
    <problem-summary-container>
      <intervention-editor :value="intervention" />
    </problem-summary-container>
  </editing-page-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import InterventionEditor from "components/InterventionEditor.vue";

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
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
