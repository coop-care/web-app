<template>
  <editing-page-container
    :title="$t('newIntervention')"
    :is-data-available="!!(client && intervention)"
    @cancel="$router.back()"
    @save="save"
  >
    <problem-summary-container :problemRecord="record">
      <div class="q-mb-lg">
        <div class="text-subtitle1 counter">{{ $t("selectProblem") }}</div>
        <q-select
          v-model="problemId"
          :options="problemOptions"
          :label="$tc('problem', 1)"
          color="classification"
          map-options
          emit-value
          style="max-width: 400px"
          autofocus
        >
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              style="max-width: 400px"
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
      </div>
      <intervention-editor
        v-model="intervention"
        :problemRecord="record"
        isSingleEditor
      />
    </problem-summary-container>
  </editing-page-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import InterventionEditor from "components/InterventionEditorV3.vue";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention } from "../models/intervention";

@Component({
  components: {
    InterventionEditor,
    EditingPageContainer,
    ProblemSummaryContainer
  }
})
export default class InterventionPage extends Vue {
  problemRecordId = "";
  intervention = new Intervention();
  problemKey = Math.random();

  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get record() {
    return this.client?.findProblemRecord(this.problemId);
  }
  get problemId() {
    return this.problemRecordId;
  }
  set problemId(value) {
    if (value == "new") {
      this.$store.direct.commit.createProblemRecord(this.$route.params);
      this.$router
        .replace({
          name: "clientReport",
          params: this.$route.params
        })
        .then(() => {
          this.$router.push({
            name: "problem",
            params: this.$store.direct.getters.getRouteParamsForLatestProblem(
              this.$route.params
            )
          });
        });
    } else {
      this.problemRecordId = value;
    }
  }
  get problemOptions() {
    return (this.client?.problems || [])
      .map(problemRecord => {
        return {
          label: "" + this.$t(problemRecord.problem.title),
          description: "" + this.$t(problemRecord.problem.description),
          value: problemRecord.id,
          icon: "fas fa-notes-medical"
        };
      })
      .concat([
        {
          label: this.$t("problemAdmission") + " …",
          description: "",
          value: "new",
          icon: "fas fa-plus"
        }
      ]);
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
        problemId: this.problemId
      });
      this.$store.direct.commit.addToClientHistory({
        clientId: this.$route.params.clientId,
        problemId: this.problemId,
        changeType: "InterventionStarted",
        newInstance: this.intervention
      });
    }
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }

  created() {
    this.problemId = this.problemOptions[0]?.value;
  }
}
</script>
