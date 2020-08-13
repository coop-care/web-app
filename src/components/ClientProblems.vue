<template>
  <div class="min-height">
    <div
      v-if="clientProblems.length"
      class="flex q-gutter-md q-my-md q-px-xs"
    >
      <problem-summary
        v-for="problemRecord in clientProblems"
        v-bind:key="problemRecord.id"
        :problemRecord="problemRecord"
        :params="{
          clientId: $route.params.clientId,
          problemId: problemRecord.id
        }"
        :isDisabled="isDisabled"
      />
    </div>

    <div
      v-else
      class="text-body2 text-italic q-mt-lg"
    >
      {{ $t("noClientProblemRecords") }}
    </div>

    <q-page-sticky
      v-if="!client.leftAt"
      position="bottom-left"
      :offset="$q.screen.lt.sm ? [16, 10] : [56, 10]"
    >
      <q-btn
        fab
        icon="add"
        color="classification"
        :title="$t('problemAdmission')"
        @click="addProblem"
      />
    </q-page-sticky>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProblemSummary from "../components/ProblemSummary.vue";

@Component({ components: { ProblemSummary } })
export default class ClientProblems extends Vue {
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get isDisabled() {
    return !!this.client?.leftAt;
  }
  get clientProblems() {
    const client = this.client;
    const problems = client ? client.problems : [];
    return problems
      .filter((problem) => {
        return !problem.resolvedAt;
      })
      .reverse()
      .sort(
        (first, second) =>
          // sort order: draft first, then high priority followed by low priority
          //@ts-ignore
          !second.createdAt - !first.createdAt ||
          //@ts-ignore
          second.problem.isHighPriority - first.problem.isHighPriority
      );
  }

  addProblem() {
    this.$router.push({
      name: "problem",
      params: { problemId: "new" },
    });
  }
}
</script>
