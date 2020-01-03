<template>
  <q-card class="overflow-hidden">
    <q-card-section>
      <div v-if="isSummary">
        <div class="text-subtitle2 text-weight-normal">{{ customerName }}:</div>
        <div class="text-h6 text-classification">
          {{ problem.title || $t("unspecifiedProblem") }}
        </div>
      </div>
      <div v-else class="text-h6">
        <span class="text-classification q-mr-md">{{
          problem.title || $t("unspecifiedProblem")
        }}</span>
        <span class="text-subtitle2 text-weight-light q-mr-sm">
          <q-chip
            size="12px"
            dense
            color="transparent"
            :icon="scopeIcon"
            text-color="classification"
            :label="(problem.titles || {}).scope"
            class="text-weight-medium"
          />
          <q-chip
            size="12px"
            dense
            color="transparent"
            :icon="priorityIcon"
            text-color="classification"
            :label="$t((problem.titles || {}).priorityKey)"
            class="text-weight-medium"
          />
        </span>
        <q-btn
          v-if="!isDraft && !problem.isHighPriority"
          :title="$t('prioritizeProblem')"
          icon="fas fa-arrow-up"
          @click="prioritizeProblemRecord"
          round
          outline
          size="sm"
          color="primary"
          class="q-mr-xs"
        />
        <q-btn
          v-if="!isDraft"
          :title="$t('problemDismissal')"
          icon="done_outline"
          @click="$store.commit('dismissProblemRecord', params)"
          round
          outline
          size="sm"
          color="primary"
          class="q-mr-xs"
        />
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
          class="q-mr-xs q-px-xs"
        />
        <q-btn
          v-if="isDraft"
          icon="delete_forever"
          :title="$t('delete')"
          @click="$store.commit('deleteDraftProblemRecord', params)"
          dense
          round
          unelevated
          size="md"
          color="negative"
          class="q-mr-sm"
        />
      </div>
    </q-card-section>
    <q-card-section v-if="problem.priorityDetails">
      <p class="q-pl-lg q-my-none">
        {{ $t((problem.titles || {}).priorityKey) }}:
        <span class="text-italic">{{ problem.priorityDetails }}</span>
      </p>
    </q-card-section>
    <q-card-section v-if="problem.severity < 2 && problem.details">
      <div class="text-subtitle1 text-weight-bold text-classification">
        {{
          $t(
            problem.severity == 0
              ? "customerRequestForHealthPromotionTitle"
              : "potentialRiskFactorsTitle"
          )
        }}
      </div>
      <p class="q-pl-lg q-my-none text-italic">
        {{ problem.details }}
      </p>
    </q-card-section>
    <q-card-section
      v-if="problem.severity == 2 && problem.signsAndSymptoms.length"
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
          {{ symptom.title
          }}<span
            v-if="
              index == problem.signsAndSymptoms.length - 1 &&
                symptom.title.toLowerCase() == $t('otherSymptom') &&
                problem.details
            "
            >:
            <span class="text-italic">{{ problem.details }}</span>
          </span>
        </li>
      </ul>
    </q-card-section>
    <q-card-section v-if="interventions.length">
      <div class="text-subtitle1 text-weight-bold text-intervention">
        {{ $tc("intervention", 2) }}
      </div>
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
    <q-card-section
      v-if="lastOutcome || (isInteractive && problem.isHighPriority)"
    >
      <div class="text-subtitle1 text-weight-bold q-mb-sm">
        <span class="text-outcome q-mr-md">{{ $tc("outcome", 2) }}</span>
        <q-btn
          v-if="isInteractive"
          :title="$t('newRating')"
          icon="add"
          :to="{ name: 'outcome', params: params }"
          round
          outline
          size="sm"
          color="primary"
        />
      </div>
      <div v-if="lastOutcome">
        <div v-if="isInteractive" class="row q-col-gutter-md">
          <div
            class="col-12 col-sm-4"
            style=""
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
                / {{ rating.expectation }}</span
              >)
              <span v-if="rating.comment" class="text-italic">
                ({{ rating.comment }})</span
              >
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
  get scopeIcon() {
    const scope = this.problem.scope;
    if (scope == 0) {
      return "fas fa-user";
    } else if (scope == 1) {
      return "fas fa-user-friends";
    } else if (scope == 2) {
      return "fas fa-users";
    } else {
      return "";
    }
  }
  get priorityIcon() {
    if (this.problem.isHighPriority) {
      return "fas fa-arrow-up";
    } else {
      return "fas fa-arrow-down";
    }
  }
  get outcomesForChart() {
    return this.$store.getters.getOutcomeAsChartData({
      expectation: this.$t("expectation"),
      ratings: this.terminology.problemRatingScale.ratings,
      locale: this.$root.$i18n.locale,
      ...this.$props.params
    });
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get customerName() {
    return this.$store.getters.getCustomer(this.$props.params).name;
  }
  get language() {
    return this.$root.$i18n.locale;
  }
  get record() {
    return this.$props.problemRecord || this.getRecordFromStore();
  }

  prioritizeProblemRecord() {
    this.$store.commit("prioritizeProblemRecord", this.$props.params);
    this.$router.push({
      name: "problem",
      params: this.$store.getters.getRouteParamsForLatestProblem(
        this.$props.params
      )
    });
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
    const Apex = window.Apex;
    const params = this.$props.params;
    const group = ["summary", params.customerId, params.problemId].join(".");
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
