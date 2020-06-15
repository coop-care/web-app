<template>
  <q-card
    flat
    bordered
    class="overflow-hidden border-primary radius-sm"
    v-if="!!record"
  >
    <q-card-section :class="sectionPadding + (sectionPadding ? ' q-pt-sm' : '')">
      <div v-if="isSummary">
        <div class="text-subtitle2 text-weight-normal">{{ clientName }}:</div>
        <div class="text-h6 text-classification">
          {{ $t(problem.title) }}
        </div>
      </div>
      <div
        v-else
        class="text-h6"
      >
        <div class="row justify-between">
          <div class="text-classification">
            {{ $t(problem.title) }}
            <q-btn
              v-if="isInteractive"
              :title="$t('editProblem')"
              icon="edit"
              :to="{ name: 'classification', params: params }"
              round
              outline
              size="10.5px"
              color="classification"
              class="on-right shadow-1"
            />
          </div>
          <div class="q-gutter-xs">
            <q-btn
              v-if="isDraft"
              :label="$t('editDraft')"
              icon="edit"
              :to="{ name: 'problem', params: params }"
              rounded
              unelevated
              dense
              size="md"
              color="negative"
              class="shadow-1 q-px-xs"
              :disable="isDisabled"
            />
            <q-btn
              v-if="isDraft && !isDisabled"
              icon="delete_forever"
              :title="$t('delete')"
              @click="deleteDraft"
              dense
              round
              unelevated
              size="13.5px"
              color="negative"
              class="shadow-1"
            />
            <action-menu
              v-if="isInteractive"
              :items="actionMenuItems"
            />
          </div>
        </div>
        <div class="text-subtitle2 text-weight-light q-mt-sm">
          <q-chip
            size="12px"
            dense
            color="transparent"
            :icon="problem.priorityIcon(terminology)"
            text-color="classification"
            :label="$t(problem.priority.title)"
            class="text-weight-medium"
          />
          <q-chip
            size="12px"
            dense
            color="transparent"
            :icon="problem.scopeIcon(terminology)"
            text-color="classification"
            :label="$t(problem.scope.title)"
            class="text-weight-medium"
          />
        </div>
      </div>
    </q-card-section>
    <q-card-section
      v-if="problem.priorityDetails"
      :class="sectionPadding"
    >
      <p class="q-pl-lg q-my-none">
        {{ $t(problem.priority.title) }}:
        <span class="text-italic">{{ problem.priorityDetails }}</span>
      </p>
    </q-card-section>
    <q-card-section
      v-if="problem.severityCode < 2 && problem.details"
      :class="sectionPadding"
    >
      <div class="text-subtitle1 text-weight-bold text-classification">
        {{
          $t(
            problem.severityCode == 0
              ? "clientRequestForHealthPromotionTitle"
              : "potentialRiskFactorsTitle"
          )
        }}
      </div>
      <p class="q-pl-lg q-my-none text-italic">
        {{ problem.details }}
      </p>
    </q-card-section>
    <q-card-section
      v-if="problem.severityCode == 2 && problem.signsAndSymptomsCodes.length"
      :class="sectionPadding"
    >
      <div class="text-subtitle1 text-weight-bold text-classification">
        {{ $t("actualSignsAndSymptomsTitle") }}
      </div>
      <ul :class="'q-ma-none ' + (isSummary ? '' : 'column-2')">
        <li
          v-for="(symptom, index) in problem.signsAndSymptoms"
          v-bind:key="index"
          class="no-column-break"
        >
          {{ $t(symptom.title)
          }}<span v-if="
              index == problem.signsAndSymptomsCodes.length - 1 &&
                $t(symptom.title).toLowerCase() == $t('otherSymptom') &&
                problem.details
            ">:
            <span class="text-italic">{{ problem.details }}</span>
          </span>
        </li>
      </ul>
    </q-card-section>
    <q-card-section
      v-if="interventions.length || (isInteractive && problem.isHighPriority)"
      :class="sectionPadding"
    >
      <div class="text-subtitle1 text-weight-bold text-intervention q-mb-xs">
        {{ $tc("intervention", 2) }}
        <q-btn
          v-if="isInteractive"
          :title="$t('editInterventions')"
          icon="edit"
          :to="{ name: 'interventions', params: params }"
          round
          outline
          size="10.5px"
          color="intervention"
          class="on-right shadow-1"
        />
      </div>
      <ul
        v-if="interventions.length"
        class="q-ma-none"
      >
        <li
          v-for="(intervention, index) in interventions"
          v-bind:key="index"
          class="no-column-break"
        >
          <div>
            {{
              [intervention.category.title, intervention.target.title]
                .filter(title => title)
                .map(title => $t(title))
                .join(": ") || ""
            }}
          </div>
          <div class="text-weight-bold">
            {{ intervention.details || $t("newIntervention") }}
          </div>
        </li>
      </ul>
    </q-card-section>
    <q-card-section
      v-if="problem.isHighPriority && (lastOutcome || isInteractive)"
      :class="sectionPadding"
    >
      <div :class="
          'text-outcome text-subtitle1 text-weight-bold ' +
            (!isSummary ? 'q-mb-sm' : '')
        ">
        {{ $tc("outcome", 2) }}
        <q-btn
          v-if="isInteractive"
          :title="$t('newRating')"
          icon="add"
          :to="{ name: 'outcome', params: params }"
          round
          outline
          size="10.5px"
          color="outcome"
          class="on-right shadow-1"
        />
      </div>
      <div v-if="lastOutcome">
        <div
          v-if="!isSummary && !isDraft"
          class="row q-col-gutter-md"
        >
          <div
            class="col-12 col-sm-4"
            v-for="(outcome, index) in outcomesForChart"
            v-if="outcome"
            v-bind:key="index"
            ref="chartRow"
          >
            <apexchart
              type="area"
              :options="outcome.options"
              :series="outcome.series"
              width="100%"
              height="160"
              class="q-pa-none unselectable"
            />
            <div class="text-subtitle2">{{ outcome.title }}</div>
            <div class="text-weight-light">{{ outcome.subtitle }}</div>
          </div>
        </div>
        <div v-else>
          <ul class="q-ma-none">
            <li
              v-for="(rating, index) in ratings"
              v-bind:key="index"
              v-if="rating.observation"
            >
              {{ terminology.problemRatingScale.ratings[index].title }}:
              {{
                terminology.problemRatingScale.ratings[index].scale[
                  rating.observation - 1
                ].title
              }}
              ({{ rating.observation
              }}<span v-if="rating.expectation">
                / {{ rating.expectation }}</span>)
              <span
                v-if="rating.comment"
                class="text-italic"
              >
                ({{ rating.comment }})</span>
            </li>
          </ul>
          <p
            v-if="lastOutcome.personRatedInPlaceOfOwner"
            class="q-pl-lg q-my-none text-italic"
          >
            {{ lastOutcome.personRatedInPlaceOfOwner }}
          </p>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ActionMenu from "../components/ActionMenu.vue";
import VueApexCharts from "vue-apexcharts";
import { Terminology } from "../helper/terminology";
import { ProblemRecord } from "../models/problemRecord";

Vue.use(VueApexCharts);

const ProblemSummaryProps = Vue.extend({
  props: {
    params: Object,
    problemRecord: ProblemRecord,
    isSummary: Boolean,
    isDisabled: Boolean
  }
});

@Component({
  components: {
    apexchart: VueApexCharts,
    ActionMenu
  }
})
export default class ProblemSummary extends ProblemSummaryProps {
  get problem() {
    return this.record.problem;
  }
  get interventions() {
    return this.record.interventions;
  }
  get lastOutcome() {
    if (this.record.outcomes.length) {
      return this.record.outcomes[this.record.outcomes.length - 1];
    } else {
      return undefined;
    }
  }
  get ratings() {
    return ["knowledge", "behaviour", "status"].map(
      key => ((this.lastOutcome || {}) as any)[key]
    );
  }
  get isDraft() {
    return !this.record.createdAt;
  }
  get isInteractive() {
    return !this.isDraft && !this.isSummary && !this.isDisabled;
  }
  get outcomesForChart() {
    return this.$store.direct.getters.getOutcomeAsChartData({
      expectation: this.$t("expectedRating"),
      ratings: this.terminology.problemRatingScale.ratings,
      locale: this.$root.$i18n.locale,
      ...this.params
    });
  }
  get actionMenuItems() {
    return [
      {
        condition: !this.problem.isHighPriority,
        name: this.$t("prioritizeProblem"),
        icon: "fas fa-arrow-up",
        action: this.prioritizeProblemRecord
      },
      {
        name: this.$t("problemDismissal"),
        icon: "fas fa-check",
        action: () => {
          this.$store.direct.commit.dismissProblemRecord(this.params);
          this.$store.direct.dispatch.saveClient(this.params);
        }
      }
    ];
  }
  get sectionPadding() {
    if (this.$q.screen.lt.sm) {
      return "q-px-sm";
    } else {
      return "";
    }
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get clientName() {
    return (
      this.$store.direct.getters.getClient(this.params)?.masterData.name || ""
    );
  }
  get language() {
    return this.$root.$i18n.locale;
  }
  get record() {
    return this.problemRecord || this.getRecordFromStore();
  }

  prioritizeProblemRecord() {
    this.$store.direct.commit.prioritizeProblemRecord(this.params);
    this.$router.push({
      name: "problem",
      params: this.$store.direct.getters.getRouteParamsForLatestProblem(
        this.params
      )
    });
    this.$store.direct.dispatch.saveClient(this.params);
  }

  updateLocale() {
    if (this.problemRecord) {
      this.problemRecord = this.getRecordFromStore() as ProblemRecord;
    }
  }

  getRecordFromStore() {
    return this.$store.direct.getters.getProblemRecordById(this.params);
  }

  deleteDraft() {
    this.$store.direct.commit.deleteDraftProblemRecord(this.params);
    this.$store.direct.dispatch.saveClient(this.params);
  }

  created() {
    this.$root.$on("didChangeLocale", this.updateLocale);
  }

  beforeDestroy() {
    this.$root.$off("didChangeLocale", this.updateLocale);
  }

  destroyed() {
    // sometimes chart instances are not removed from Apex store, especially after intensive window resizing,
    // which causes duplicate entries and therefore errors when the charts are drawn again for the same components
    // @ts-ignore
    const Apex = window.Apex;
    const params = this.params;
    const group = ["summary", params.clientId, params.problemId].join(".");
    if (!Apex._chartInstances) return; // I get an error that this is undefined
    const zombieChartIndices = Apex._chartInstances
      .map((chart: any, index: number) => {
        if (chart.group == group) {
          return index;
        } else {
          return null;
        }
      })
      .filter((item: number | null) => item != null);

    zombieChartIndices.forEach((offset: number, index: number) => {
      Apex._chartInstances.splice(offset - index, 1);
    });
  }
}
</script>
