<template>
  <q-card>
    <q-card-section>
      <div v-if="isSummary">
        <div class="text-h6 q-mb-sm">{{ $t("summary") }}</div>
        <div class="text-subtitle1">
          {{ problem.title || $t("unspecifiedProblem") }}
        </div>
        <p class="q-pl-lg q-ma-none">
          {{ (problem.titles || {}).scope }},
          {{ (problem.titles || {}).severity }},
          {{ $t((problem.titles || {}).priorityKey) }}
        </p>
      </div>
      <div v-else class="text-h6">
        <q-btn
          v-if="isDraft"
          :label="$t('editDraft')"
          icon="edit"
          :to="{ name: 'problem', params: params }"
          rounded
          unelevated
          dense
          size="sm"
          color="red"
          class="q-mr-xs q-px-sm"
          style="font-size: 56%"
        />
        <q-btn
          v-if="isDraft"
          :label="$t('delete')"
          icon="close"
          @click="$store.commit('deleteDraftProblemRecord', params)"
          rounded
          unelevated
          dense
          size="sm"
          color="red"
          class="q-mr-xs q-px-sm"
          style="font-size: 56%"
        />
        {{ problem.title || $t("unspecifiedProblem") }}
        <span class="text-subtitle2 text-weight-light q-ml-xs">
          {{ (problem.titles || {}).scope }},
          {{ (problem.titles || {}).severity }},
          {{ $t((problem.titles || {}).priorityKey) }}
        </span>
      </div>
    </q-card-section>
    <q-card-section v-if="problem.signsAndSymptoms.length || problem.details">
      <div class="text-subtitle1" v-if="problem.signsAndSymptoms.length">
        {{ $t("signsAndSymptoms") }}
      </div>
      <div :class="isSummary ? '' : 'column-2'">
        <ul class="q-ma-none" v-if="problem.signsAndSymptoms">
          <li
            v-for="(symptom, index) in problem.signsAndSymptoms"
            v-bind:key="index"
          >
            {{ titleForSymptom(symptom) }}
          </li>
        </ul>
        <p v-if="problem.details" class="q-pl-lg q-my-none text-italic">
          {{ problem.details }}
        </p>
      </div>
    </q-card-section>
    <q-card-section v-if="interventions.length">
      <div class="text-subtitle1">{{ $tc("intervention", 2) }}</div>
      <ul :class="'q-ma-none ' + (isSummary ? '' : 'column-2')">
        <li v-for="(intervention, index) in interventions" v-bind:key="index">
          {{ intervention.category.title }}: {{ intervention.target.title }}
          <div v-if="intervention.details.length">
            <div
              v-for="(detail, index) in intervention.details"
              v-bind:key="index"
              class="text-italic"
            >
              {{ detail.text }}
            </div>
          </div>
        </li>
      </ul>
    </q-card-section>
    <q-card-section
      v-if="lastOutcome || (isInteractive && problem.isHighPriority)"
    >
      <div class="text-subtitle1">
        {{ $tc("outcome", 2) }}
        <q-btn
          v-if="isInteractive"
          :label="$t('newRating')"
          :to="{ name: 'outcome', params: params }"
          color="primary"
          flat
          class="q-ml-xs"
        />
      </div>
      <div v-if="lastOutcome">
        <div v-if="isInteractive" class="row">
          <div
            class="col-12 col-sm-4"
            style=""
            v-for="(outcome, index) in outcomesForChart"
            v-bind:key="index"
            ref="chartRow"
          >
            <div class="text-subtitle2 q-pl-lg">{{ outcome.title }}</div>
            <apexchart
              type="area"
              :options="outcome.options"
              :series="outcome.series"
              width="100%"
              height="160"
              class="q-pa-none"
            />
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
                / {{ rating.expectation }}</span
              >)
              <span v-if="rating.comment" class="text-italic">
                ({{ rating.comment }})</span
              >
            </li>
          </ul>
          <p
            v-if="lastOutcome.ratedWhoInsteadOfOwner"
            class="q-pl-lg q-my-none text-italic"
          >
            {{ lastOutcome.ratedWhoInsteadOfOwner }}
          </p>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="sass"></style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import VueApexCharts from "vue-apexcharts";
import { Terminology } from "../helper/terminology";
import * as Store from "../store/index";

Vue.use(VueApexCharts);

@Component({
  props: {
    params: Object,
    problemRecord: Object,
    isSummary: Boolean
  },
  components: {
    apexchart: VueApexCharts
  }
})
export default class ProblemSummary extends Vue {
  get problem() {
    return this.record.problem;
  }
  get signsAndSymptoms() {
    return this.problem.signsAndSymptoms;
  }
  get interventions() {
    return this.record.interventions;
  }
  get lastOutcome() {
    if (this.record.outcomes.length) {
      return this.record.outcomes[this.record.outcomes.length - 1];
    } else {
      return null;
    }
  }
  get ratings() {
    return ["knowledge", "behaviour", "status"].map(
      key => this.lastOutcome[key]
    );
  }
  get isDraft() {
    return !this.record.created;
  }
  get isInteractive() {
    return !this.isDraft && !this.$props.isSummary;
  }
  get outcomesForChart() {
    return this.$store.getters.getOutcomeAsChartData({
      expectation: this.$t("expectation"),
      ratings: this.terminology.problemRatingScale.ratings,
      ...this.$props.params
    });
  }
  get titleForSymptom() {
    return (symptom: Store.Term) => {
      let otherSymptom = this.$store.getters.otherSymptomForProblemCode({
        problemCode: this.record.problem.id,
        terminology: this.terminology
      });
      let otherSignsAndSymptomsText = this.record.problem.otherSignsAndSymptoms;

      if (otherSignsAndSymptomsText && otherSymptom.value == symptom.id) {
        return symptom.title + ": " + otherSignsAndSymptomsText;
      } else {
        return symptom.title;
      }
    };
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get record() {
    return (
      this.$props.problemRecord ||
      this.$store.getters.getProblemRecordById({
        terminology: this.terminology,
        ...this.$props.params
      })
    );
  }

  destroyed() {
    // sometimes chart instances are not removed from Apex store, especially after intensive window resizing,
    // which causes duplicate entries and therefore errors when the charts are drawn again for the same components
    // @ts-ignore
    let Apex = window.Apex;
    let params = this.$props.params;
    let group = ["summary", params.customerId, params.problemIndex].join(".");
    let zombieChartIndices = Apex._chartInstances
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
