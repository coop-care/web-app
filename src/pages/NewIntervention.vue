<template>
  <editing-sheet
    ref="editingSheet"
    :title="title"
    :is-data-available="!!(client && intervention)"
    :paramsToRemoveOnClose="['problemId']"
    :hasPendingChanges="hasPendingChanges"
    @show="didShow"
  >
      <div v-if="!$route.params.problemId">
        <div class="text-subtitle1 q-mt-sm counter">{{ $t("selectProblem") }}</div>
        <q-select
          v-model="problemId"
          :options="problemOptions"
          :label="$t('problem', 1)"
          color="classification"
          map-options
          emit-value
          item-aligned
          ref="problemSelect"
        >
          <q-resize-observer @resize="onResize" />
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              :style="widthStyle"
            >
              <q-item-section side>
                <q-icon :name="scope.opt.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label
                  caption
                  lines="1"
                >{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <div 
          v-if="problemId"
          class="q-mt-xl text-subtitle1 counter"
        >{{ $t("addIntervention") }}</div>
      </div>
      <div 
        v-if="problemId"
      >
        <intervention-editor
          v-model="intervention"
          :problem-code="problemCode"
          isSingleEditor
        />
        <warning
          v-model="showWarning"
          :messages="interventionWarnings(intervention)"
        />
        <div class="q-mt-lg row justify-center">
          <q-btn
            @click="validate(interventionWarnings(intervention), save)"
            color="primary"
            rounded
            unelevated
            no-caps
            :outline="!!interventionWarnings(intervention)"
            :label="addButtonLabel"
            class="done-button"
          />
        </div>
      </div>
  </editing-sheet>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "vue-facing-decorator";
import { QSelect } from "quasar";
import RecordValidator, { RecordValidatorInterface } from "../mixins/RecordValidator";
import EditingSheet from "../components/EditingSheet.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import InterventionEditor from "components/InterventionEditorV3.vue";
import Warning from "components/Warning.vue";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention } from "../models/intervention";

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
  @Ref() readonly problemSelect!: QSelect;

  problemRecordId = "";
  intervention = new Intervention();
  originalIntervention = this.intervention.toJSONString();
  problemKey = Math.random();
  maxWidth = 300;

  get record() {
    return this.client?.findProblemRecord(this.problemId);
  }
  get problemId() {
    return this.$route.params.problemId as string || this.problemRecordId;
  }
  set problemId(value) {
    if (value == "new") {
      void this.editingSheet.cancel({
        name: "clientReport",
        params: {sheet: "newProblem"},
      });
    } else {
      this.problemRecordId = value;
    }
  }
  get title() {
    return [
      this.client?.contact.name,
      this.record?.problem.title
        ? this.$t(this.record?.problem.title)
        : "",
      this.$t("newIntervention")
    ].filter(Boolean).join(": ");
  }
  get problemOptions() {
    const options = (this.client?.problems || [])
      .filter((record) => record.isActive)
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

    return options;
  }
  get widthStyle() {
    return "max-width: " + this.maxWidth + "px";
  }
  get problemCode() {
    return this.record?.problem.code ?? ""
  }
  
  hasPendingChanges() {
    return this.intervention.toJSONString() != this.originalIntervention;
  }

  save() {
    if (this.record) {
      const changes: any = {};
      const key: keyof ProblemRecord = "interventions";
      changes[key] = this.record.interventions.concat([this.intervention]);
      this.$store.direct.commit.updateObject({
        target: this.record,
        changes: changes,
        clientId: this.$route.params.clientId as string,
        problemId: this.problemId,
      });
      this.$store.direct.commit.addToClientHistory({
        clientId: this.$route.params.clientId as string,
        problemId: this.problemId,
        changeType: "InterventionStarted",
        newInstance: this.intervention,
      });
    }
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.editingSheet.confirm());
  }

  onResize() {
    this.maxWidth = (this.problemSelect?.$el?.firstElementChild as HTMLElement)?.offsetWidth;
  }

  mounted() {
    // problemSelect reference is not always yet available when component is mounted
    setTimeout(() => {
      this.maxWidth = (this.problemSelect?.$el?.firstElementChild as HTMLElement)?.offsetWidth;
    })
  }

  didShow() {
    if (!this.problemRecordId) {
      this.problemSelect?.showPopup();
    }
  }
}

export default InterventionPage;
</script>
