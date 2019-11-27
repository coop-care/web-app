<template>
  <q-card class="overflow-hidden">
    <q-card-section>
      <div v-if="isSummary">
        <div class="text-subtitle2 text-weight-normal">
          {{ customerName }}:
        </div>
        <div class="text-h6 text-classification">
          {{ problem.title || $t("unspecifiedProblem") }}
        </div>
      </div>
      <div
        v-else
        class="text-h6"
      >
        <q-btn
          v-if="isDraft"
          :label="$t('editDraft')"
          icon="edit"
          :to="{ name: 'problem', params: params }"
          rounded
          unelevated
          dense
          size="sm"
          color="negative"
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
          color="negative"
          class="q-mr-sm q-px-sm"
          style="font-size: 56%"
        />
        <span class="text-classification">{{ problem.title || $t("unspecifiedProblem") }}</span>
        <span class="text-subtitle2 text-weight-light q-ml-xs">
          {{ $t((problem.titles || {}).priorityKey) }},
          {{ (problem.titles || {}).scope }}
        </span>
      </div>
    </q-card-section>
    <q-card-section v-if="problem.priorityDetails">
      <p class="q-pl-lg q-my-none">
        {{ $t((problem.titles || {}).priorityKey) }}:
        <span class="text-italic">{{ problem.priorityDetails }}</span>
      </p>
    </q-card-section>
    <q-card-section v-if="(problem.severity < 2) && problem.details">
      <div class="text-subtitle1 text-weight-bold text-classification">
        {{ $t(problem.severity == 0 ? "customerRequestForHealthPromotionTitle" : "potentialRiskFactorsTitle") }}
      </div>
      <p class="q-pl-lg q-my-none text-italic">
        {{ problem.details }}
      </p>
    </q-card-section>
    <q-card-section v-if="(problem.severity == 2) && problem.signsAndSymptoms.length">
      <div class="text-subtitle1 text-weight-bold text-classification">
        {{ $t("actualSignsAndSymptomsTitle") }}
      </div>
      <ul :class="'q-ma-none ' + (isSummary ? '' : 'column-2')">
        <li
          v-for="(symptom, index) in problem.signsAndSymptoms"
          v-bind:key="index"
          class="no-column-break"
        >
          {{ symptom.title }}<span v-if="(index == problem.signsAndSymptoms.length - 1) && (symptom.title.toLowerCase() == $t('otherSymptom')) && problem.details">:
            <span class="text-italic">{{ problem.details }}</span>
          </span>
        </li>
      </ul>
    </q-card-section>
    <q-card-section v-if="interventions.length">
      <div class="text-subtitle1 text-weight-bold text-intervention">{{ $tc("intervention", 2) }}</div>
      <ul :class="'q-ma-none '">
        <li
          v-for="(intervention, index) in interventions"
          v-bind:key="index"
          class="no-column-break"
        >
          {{ intervention.category.title }}: {{ intervention.target.title }}
          <span v-if="intervention.details.length">
            <span
              v-for="(detail, index) in intervention.details"
              v-bind:key="index"
              class="text-italic"
            >
              – {{ detail.text }}
            </span>
          </span>
        </li>
      </ul>
    </q-card-section>
    <q-card-section v-if="lastOutcome || (isInteractive && problem.isHighPriority)">
      <div class="text-subtitle1 text-weight-bold">
        <span class="text-outcome">{{ $tc("outcome", 2) }}</span>
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
        <div
          v-if="isInteractive"
          class="row"
        >
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
    return !this.record.createdAt;
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

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get customerName() {
    return this.$store.getters.getCustomerById(this.$props.params).name;
  }
  get language() {
    console.log("language");
    return this.$root.$i18n.locale;
  }
  get record() {
    return this.$props.problemRecord || this.getRecordFromStore();
  }

  updateLocale() {
    if (this.$props.problemRecord) {
      this.$props.problemRecord = this.getRecordFromStore();
    }
  }

  getRecordFromStore() {
    return this.$store.getters.getProblemRecordById({
      terminology: this.terminology,
      ...this.$props.params
    });
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
