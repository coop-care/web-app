<template>
  <div class="min-height overflow-auto">
    <div class="text-h6 text-center q-mb-sm print-only">{{ $t("reportTitle") }}</div>
    <div 
      v-if="clientProblems.length"
      class="q-mb-lg q-pa-xs overflow-auto limit-page-width width-sm"
    >
      <div class="flex q-gutter-md justify-center">
        <client-insights v-if="clientProblems.length > 0" />
        <problem-summary
          v-for="problemRecord in clientProblems"
          :key="problemRecord.id"
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
      class="q-my-lg q-px-lg column items-center"
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
        class="q-mt-xs text-normal self-center"
        @click="addProblem"
      />
    </div>

    <div
      v-if="resolvedProblems.length > 0"
      class="limit-page-width width-sm"
    >
      <div class="flex justify-center q-mb-md">
        <q-btn
          :label="!showResolvedProblems ? $t('showResolvedProblems', resolvedProblems.length) : $t('hideResolvedProblems') + ':'"
          no-caps
          flat
          rounded
          color="classification"
          @click="showResolvedProblems = !showResolvedProblems; expandedResolvedProblems = []"
        />
      </div>
      <div
        v-if="showResolvedProblems"
        class="flex q-gutter-md justify-center"
      >
        <problem-summary
          v-for="problemRecord in resolvedProblems"
          :key="problemRecord.id"
          :problemRecord="problemRecord"
          :params="{
            clientId: $route.params.clientId,
            problemId: problemRecord.id
          }"
          inactive
          style="opacity: .7"
          :expanded="expandedResolvedProblems.includes(problemRecord.id)"
          @update:expanded="updateExpandedResolvedProblems($event, problemRecord.id)"
        />
      </div>
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
import { Component, Vue } from "vue-facing-decorator";
import { ProblemRecord } from "../models";
import RecordMixin, { RecordMixinInterface } from "../mixins/RecordMixin";
import ClientInsights from "../components/ClientInsights.vue";
import ProblemSummary from "../components/ProblemSummary.vue";

interface ClientProblems extends RecordMixinInterface {};

@Component({
  components: {
    ClientInsights,
    ProblemSummary
  },
  mixins: [RecordMixin]
})
class ClientProblems extends Vue {
  showResolvedProblems = false;
  expandedResolvedProblems = [] as string[];

  get clientProblems() {
    const client = this.client;
    const problems = client ? client.problems : [];
    return problems
      .filter((problem) => {
        return !problem.resolvedAt;
      })
      .sort(ProblemRecord.sortByPriorityAndCreatedAt);
  }

  get resolvedProblems() {
    const client = this.client;
    const problems = client ? client.problems : [];
    return problems
      .filter((problem) => {
        return !!problem.resolvedAt;
      })
      .sort(ProblemRecord.sortByPriorityAndCreatedAt);
  }

  get expanded() {
    return (this.$route.params.expandedIds as string)?.split(",") || [];
  }

  addProblem() {
    void this.$router.push({
      name: "clientReport", 
      params: { ...this.$route.params, sheet: "newProblem" }
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

    void this.$router.push({name: "clientReport", params})
  }
  
  updateExpandedResolvedProblems(value: boolean, problemId: string) {
    if (value) {
      this.expandedResolvedProblems = this.expandedResolvedProblems.concat(problemId);
    } else {
      this.expandedResolvedProblems = this.expandedResolvedProblems.filter(id => id != problemId);
    }
  }
}

export default ClientProblems;
</script>
