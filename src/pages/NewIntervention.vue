<template>
  <editing-page-container
    :title="title"
    :is-data-available="!!(client && intervention)"
    hide-default-footer
  >
    <problem-summary-container :problemRecord="record">
      <div v-if="!$route.params.problemId">
        <div class="q-mt-sm text-subtitle1 counter">{{ $t("selectProblem") }}</div>
        <q-select
          v-model="problemId"
          :options="problemOptions"
          :label="$tc('problem', 1)"
          color="classification"
          map-options
          emit-value
          autofocus
        >
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
            >
              <q-item-section side>
                <q-icon :name="scope.opt.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label title="">{{ scope.opt.label }}</q-item-label>
                <q-item-label
                  caption
                  lines="1"
                >{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <div class="q-mt-xl text-subtitle1 counter">{{ $t("addIntervention") }}</div>
      </div>
      <intervention-editor
        v-model="intervention"
        :problemRecord="record"
        isSingleEditor
      />
      <warning
        v-model="showWarning"
        :messages="warningsForIntervention(intervention)"
      />
      <q-btn
        @click="validate(warningsForIntervention(intervention), save)"
        color="primary"
        rounded
        no-caps
        :outline="!!warningsForIntervention(intervention)"
        icon-right="fas fa-caret-right"
        :label="doneButtonLabel"
        class="q-mt-lg"
      />
    </problem-summary-container>
  </editing-page-container>
</template>

<script lang="ts">
import Component from "vue-class-component";
import RecordValidator from "../mixins/RecordValidator";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import InterventionEditor from "components/InterventionEditorV3.vue";
import Warning from "components/Warning.vue";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention } from "../models/intervention";

@Component({
  components: {
    InterventionEditor,
    EditingPageContainer,
    ProblemSummaryContainer,
    Warning,
  },
})
export default class InterventionPage extends RecordValidator {
  problemRecordId = "";
  intervention = new Intervention();
  problemKey = Math.random();

  get record() {
    return this.client?.findProblemRecord(this.problemId);
  }
  get problemId() {
    return this.$route.params.problemId || this.problemRecordId;
  }
  set problemId(value) {
    if (value == "new") {
      this.$store.direct.commit.createProblemRecord(this.$route.params);
      void this.$router
        .replace({
          name: "clientReport",
          params: this.$route.params,
        })
        .then(() => {
          void this.$router.push({
            name: "problem",
            params: this.$store.direct.getters.getRouteParamsForLatestProblem(
              this.$route.params
            ),
          });
        });
    } else {
      this.problemRecordId = value;
    }
  }
  get title() {
    if (this.$route.params.problemId) {
      return this.$t("newInterventionForProblem", {
        problem: this.$t(this.record?.problem.title || ""),
      });
    } else {
      return this.$t("newIntervention");
    }
  }
  get problemOptions() {
    const options = (this.client?.problems || [])
      .filter((record) => !record.resolvedAt)
      .map((problemRecord) => {
        return {
          label: "" + this.$t(problemRecord.problem.title),
          description: "" + this.$t(problemRecord.problem.description),
          value: problemRecord.id,
          icon: "fas fa-notes-medical",
        };
      })
      .concat([
        {
          label: this.$t("problemAdmission") + " …",
          description: "",
          value: "new",
          icon: "fas fa-plus",
        },
      ]);

    if (!this.problemId && this.client) {
      this.problemRecordId = options[0]?.value;
    }

    return options;
  }

  save() {
    if (this.record) {
      const changes: any = {};
      const key: keyof ProblemRecord = "interventions";
      changes[key] = this.record.interventions.concat([this.intervention]);
      this.$store.direct.commit.updateObject({
        target: this.record,
        changes: changes,
        clientId: this.$route.params.clientId,
        problemId: this.problemId,
      });
      this.$store.direct.commit.addToClientHistory({
        clientId: this.$route.params.clientId,
        problemId: this.problemId,
        changeType: "InterventionStarted",
        newInstance: this.intervention,
      });
    }
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
