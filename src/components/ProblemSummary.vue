<template>
  <q-card class="overflow-hidden">
    <q-card-section>
      <div v-if="isSummary">
        <div class="text-subtitle2 text-weight-normal">{{ customerName }}:</div>
        <div class="text-h6 text-classification">
          {{ $t(problem.title) }}
        </div>
      </div>
      <div v-else class="text-h6">
        <span class="text-classification q-mr-md">{{ $t(problem.title) }}</span>
        <span class="text-subtitle2 text-weight-light q-mr-sm">
          <q-chip
            size="12px"
            dense
            color="transparent"
            :icon="problem.scopeIcon(terminology)"
            text-color="classification"
            :label="$t(problem.scope.title)"
            class="text-weight-medium"
          />
          <q-chip
            size="12px"
            dense
            color="transparent"
            :icon="problem.priorityIcon(terminology)"
            text-color="classification"
            :label="$t(problem.priority.title)"
            class="text-weight-medium"
          />
        </span>
        <action-menu
          v-if="isInteractive"
          :items="actionMenuItems"
          class="q-mr-xs"
        />
        <q-btn
          v-if="isDraft && !isDisabled"
          :label="$t('editDraft')"
          icon="edit"
          :to="{ name: 'problem', params: params }"
          rounded
          unelevated
          dense
          size="md"
          color="negative"
          class="shadow-1 q-mr-xs q-px-xs"
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
          class="shadow-1 q-mr-sm"
        />
      </div>
    </q-card-section>
    <q-card-section v-if="problem.priorityDetails">
      <p class="q-pl-lg q-my-none">
        {{ $t(problem.priority.title) }}:
        <span class="text-italic">{{ problem.priorityDetails }}</span>
      </p>
    </q-card-section>
    <q-card-section v-if="problem.severityCode < 2 && problem.details">
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
          }}<span
            v-if="
              index == problem.signsAndSymptomsCodes.length - 1 &&
                $t(symptom.title).toLowerCase() == $t('otherSymptom') &&
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
          {{ $t(intervention.category.title) }}:
          {{ $t(intervention.target.title) }}
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
      v-if="lastOutcome || (!isSummary && problem.isHighPriority)"
    >
      <div
        :class="
          'text-subtitle1 text-weight-bold ' + (!isSummary ? 'q-mb-sm' : '')
        "
      >
        <span class="text-outcome q-mr-md">{{ $tc("outcome", 2) }}</span>
        <q-btn
          v-if="isInteractive"
          :title="$t('newRating')"
          icon="add"
          :to="{ name: 'outcome', params: params }"
          round
          outline
          size="10.5px"
          color="primary"
          class="shadow-1"
        />
      </div>
      <div v-if="lastOutcome">
        <div v-if="!isSummary" class="row q-col-gutter-md">
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
import ActionMenu from "../components/ActionMenu.vue";
import VueApexCharts from "vue-apexcharts";
import { Terminology } from "../helper/terminology";

Vue.use(VueApexCharts);

@Component({
  props: {
    params: Object,
    problemRecord: Object,
    isSummary: Boolean,
    isDisabled: Boolean
  },
  components: {
    apexchart: VueApexCharts,
    ActionMenu
  }
})
export default class ProblemSummary extends Vue {
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
    return !this.isDraft && !this.$props.isSummary && !this.$props.isDisabled;
  }
  get outcomesForChart() {
    return this.$store.getters.getOutcomeAsChartData({
      expectation: this.$t("expectation"),
      ratings: this.terminology.problemRatingScale.ratings,
      locale: this.$root.$i18n.locale,
      ...this.$props.params
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
          this.$store.direct.commit.dismissProblemRecord(this.$props.params);
          this.$store.direct.dispatch.saveCustomer(this.$props.params);
        }
      }
    ];
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
    this.$store.direct.commit.prioritizeProblemRecord(this.$props.params);
    this.$router.push({
      name: "problem",
      params: this.$store.getters.getRouteParamsForLatestProblem(
        this.$props.params
      )
    });
    this.$store.direct.dispatch.saveCustomer(this.$props.params);
  }

  updateLocale() {
    if (this.$props.problemRecord) {
      this.$props.problemRecord = this.getRecordFromStore();
    }
  }

  getRecordFromStore() {
    return this.$store.getters.getProblemRecordById(this.$props.params);
  }

  deleteDraft() {
    this.$store.direct.commit.deleteDraftProblemRecord(this.$props.params);
    this.$store.direct.dispatch.saveCustomer(this.$props.params);
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
