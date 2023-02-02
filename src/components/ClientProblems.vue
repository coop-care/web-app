<template>
  <div class="min-height overflow-auto">
    <div class="text-h6 text-center q-mb-sm print-only">{{ $t("reportTitle") }}</div>
    <div 
      v-if="clientProblems.length"
      class="q-mb-xl q-pa-xs overflow-auto"
    >
      <div class="flex q-gutter-md justify-center">
        <client-insights v-if="clientProblems.length > 0" />
        <problem-summary
          v-for="problemRecord in clientProblems"
          v-bind:key="problemRecord.id"
          :problemRecord="problemRecord"
          :params="{
            clientId: $route.params.clientId,
            problemId: problemRecord.id
          }"
          :expanded="expanded.includes(problemRecord.id)"
          @update:expanded="updateExpanded(problemRecord.id)"
        />
      </div>
    </div>

    <div
      v-else
      class="q-mt-lg q-px-lg column items-center"
    >
      <div class="text-body2 text-italic text-center">{{ $t("noClientProblemRecords") }}</div>
      <q-btn
        v-if="!isDisabled"
        :label="$t('problemAdmission')"
        flat
        no-caps
        rounded
        size="md"
        color="classification"
        class="q-ml-lg q-mt-xs text-normal self-center"
        @click="addProblem"
      />
    </div>

    <q-page-sticky
      v-if="!isDisabled"
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
import { Component } from "vue-property-decorator";
import { ProblemRecord } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import ClientInsights from "../components/ClientInsights.vue";
import ProblemSummary from "../components/ProblemSummary.vue";

@Component({
  components: {
    ClientInsights,
    ProblemSummary
  }
})
export default class ClientProblems extends RecordMixin {
  get clientProblems() {
    const client = this.client;
    const problems = client ? client.problems : [];
    return problems
      .filter((problem) => {
        return !problem.resolvedAt;
      })
      .sort(ProblemRecord.sortByPriorityAndCreatedAt);
  }

  get expanded() {
    return this.$route.params.expandedIds?.split(",") || [];
  }

  addProblem() {
    void this.$router.push({
      name: "clientProblem",
      params: { problemId: "new" },
    });
  }

  updateExpanded(problemId: string) {
    let expandedIds: string;

    if (this.expanded.includes(problemId)) {
      expandedIds = this.expanded.filter(id => id != problemId).join(",");
    } else {
      expandedIds = this.expanded.concat([problemId]).join(",");
    }

    const params: Record<string, string> = {...this.$route.params, expandedIds};

    if (params.expandedIds.length == 0) {
      delete params.expandedIds;
    }

    this.$router.push({name: "clientReport", params})
  }
}
</script>
