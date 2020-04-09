<template>
  <div class="q-gutter-md">
    <q-btn
      v-if="!isDisabled"
      icon="add"
      color="primary"
      :label="$t('problemAdmission')"
      rounded
      outline
      class="shadow-1 q-mt-md"
      @click="addProblem"
      size="12.5px"
    />
    <q-btn
      v-if="!isDisabled && $te('problemCodesByDiagnosis')"
      icon="playlist_add"
      color="primary"
      :label="$t('problemAdmissionByDiagnosis')"
      rounded
      outline
      class="shadow-1 q-mt-md"
      @click="addProblemsByDiagnosis"
      size="12.5px"
    />
    <problem-summary
      v-for="problemRecord in selectedClientProblems"
      v-bind:key="problemRecord.id"
      :problemRecord="problemRecord"
      :params="{
            clientId: $route.params.clientId,
            problemId: problemRecord.id
          }"
      :isDisabled="isDisabled"
    />
  </div>
</template>

<style lang="sass">
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProblemSummary from "../components/ProblemSummary.vue";
import { ProblemRecord } from "../models/problemRecord";

@Component({ components: { ProblemSummary } })
export default class ClientProblems extends Vue {
  get selectedClient() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get isDisabled() {
    return !!this.selectedClient?.leftAt;
  }
  get selectedClientProblems() {
    const client = this.selectedClient;
    const problems = client ? client.problems : [];
    return problems
      .concat()
      .filter((problem: ProblemRecord) => {
        return !problem.resolvedAt;
      })
      .sort(
        (first: ProblemRecord, second: ProblemRecord) =>
          // sort order: draft first, then high priority followed by low priority
          //@ts-ignore
          !second.createdAt - !first.createdAt ||
          //@ts-ignore
          second.problem.isHighPriority - first.problem.isHighPriority
      );
  }

  addProblem() {
    const client = this.selectedClient;
    if (!client) {
      console.error("no client selected: this should not happen.");
      return;
    }

    this.$store.direct.commit.createProblemRecord(this.$route.params);
    this.$router.push({
      name: "problem",
      params: this.$store.direct.getters.getRouteParamsForLatestProblem(
        this.$route.params
      )
    });
  }

  addProblemsByDiagnosis() {
    this.$router.push({
      name: "problemsByDiagnosis",
      params: this.$route.params
    });
  }
}
</script>