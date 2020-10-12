<template>
  <q-card
    :class="
      'radius-md bg-white text-body2 ' + (isExpanded ? 'expanded' : 'collapsed')
    "
    :style="
      'transition: all 0s; width: 100%; ' +
        (isExpanded ? 'max-width: 100%' : 'max-width: 320px')
    "
    v-if="!!record"
  >
    <q-card-section
      :class="sectionPadding + (isExpandable ? 'cursor-pointer' : '')"
      @click="toggleExpansion"
    >
      <div class="row justify-between">
        <div class="text-classification text-h6">
          <q-icon
            v-if="isExpandable"
            :name="isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            color="classification"
          />
          {{ problemTitle }}
          <q-btn
            v-if="isInteractive"
            :title="$t('editProblem')"
            icon="edit"
            :to="{ name: 'classification', params: params }"
            round
            outline
            size="10.5px"
            color="classification"
            class="on-right shadow-1 bg-white"
            @click.prevent.stop=""
          />
        </div>
        <div
          v-if="isExpanded && isInteractive"
          class="q-gutter-xs"
          @click.prevent.stop=""
        >
          <q-btn
            v-if="!problem.isHighPriority"
            :label="$t('prioritizeProblem')"
            icon="fas fa-arrow-up"
            @click="prioritizeProblemRecord"
            rounded
            outline
            no-caps
            size="12.5px"
            color="classification"
            class="on-right shadow-1 bg-white"
          />
          <q-btn
            v-if="!record.resolvedAt"
            :label="$t('problemDismissal')"
            icon="fas fa-check"
            @click="dismissProblemRecord"
            rounded
            outline
            no-caps
            size="12.5px"
            color="classification"
            class="on-right shadow-1 bg-white"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section :class="sectionPadding">
      <div
        v-if="isDraft && isExpandable"
        :class="'q-mb-md ' + (isExpanded ? 'q-mt-none' : 'q-mt-sm')"
      >
        <q-btn
          :label="$t('editDraft')"
          icon="edit"
          :to="{
            name: 'problem',
            params: {
              clientId: params.clientId,
              problemId: params.problemId,
              step: problem.code ? 3 : 1
            }
          }"
          rounded
          unelevated
          dense
          size="md"
          color="negative"
          class="shadow-1 q-px-xs q-mr-sm"
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
      </div>
      <div class="align-chips">
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
          :icon="problem.severityIcon(terminology)"
          text-color="classification"
          :label="$t(problem.severity.title)"
          class="text-weight-medium"
        />
        <q-chip
          v-if="isExpanded"
          size="12px"
          dense
          color="transparent"
          :icon="problem.scopeIcon(terminology)"
          text-color="classification"
          :label="$t(problem.scope.title)"
          class="text-weight-medium"
        />
      </div>
      <div v-if="isExpanded">
        <div
          v-if="problem.priorityDetails"
          :class="sectionPadding"
        >
          <p class="q-pl-lg q-my-none">
            {{ $t(problem.priority.title) }}:
            <span class="text-italic">{{ problem.priorityDetails }}</span>
          </p>
        </div>
        <div v-if="problem.severityCode < 2 && problem.details">
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
        </div>

        <div v-if="
            problem.severityCode == 2 && problem.signsAndSymptomsCodes.length
          ">
          <div class="text-subtitle1 text-weight-bold text-classification">
            {{ $t("actualSignsAndSymptomsTitle") }}
          </div>
          <ul class="q-ma-none column-2">
            <li
              v-for="(symptom, index) in problem.signsAndSymptoms"
              v-bind:key="index"
              class="no-column-break"
            >
              {{ $t(symptom.title)
              }}<span v-if="
                  index == problem.signsAndSymptomsCodes.length - 1 &&
                    problem.otherSignAndSymptom
                ">:
                <span class="text-italic">{{
                  problem.otherSignAndSymptom
                }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </q-card-section>

    <q-card-section
      v-if="problem.isHighPriority && (lastOutcome || isInteractive)"
      :class="sectionPadding"
    >
      <div v-if="!isExpanded">
        <div
          v-if="ratingsSummary.length"
          class="text-outcome"
        >
          <div
            v-for="(rating, index) in ratingsSummary"
            v-bind:key="index"
            class="rating row no-wrap"
          >
            <div class="row no-wrap items-center q-mr-xs">
              <div
                v-for="(color, colorIndex) in rating.colors"
                :key="'rating-' + index + '-' + colorIndex"
                class="rating-dot"
                :style="'background-color: ' + color"
              ></div>
            </div>
            <div class="one-line">{{ rating.label }}</div>
          </div>
        </div>
      </div>
      <div v-else>
        <div :class="
            'text-outcome text-subtitle1 text-weight-bold ' +
              (isExpanded ? 'q-mb-sm' : '')
          ">
          {{ $t("outcomeTitle") }}
          <q-btn
            v-if="isInteractive"
            :title="$t('newRating')"
            icon="add"
            :to="{ name: 'outcome', params: params }"
            round
            outline
            size="10.5px"
            color="outcome"
            class="on-right shadow-1 bg-white"
          />
        </div>
        <div v-if="lastOutcome">
          <div class="row q-col-gutter-md">
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
        </div>
        <div
          class="text-italic"
          v-else
        >{{ $t("noRating") }}</div>
      </div>
    </q-card-section>

    <q-card-section
      v-if="interventions.length || (isInteractive && problem.isHighPriority)"
      :class="sectionPadding"
    >
      <div v-if="!isExpanded">
        <simplified-markdown
          :text="
            $tc('numberOfInterventions', record.interventions.length)
          "
          class="text-intervention"
        />
      </div>
      <div v-else-if="isInteractive && problem.isHighPriority">
        <div class="text-subtitle1 text-weight-bold text-intervention q-mb-xs">
          {{ $tc("intervention", 2) }}
          <q-btn
            v-if="isInteractive"
            :title="$t('editInterventions')"
            icon="add"
            :to="{ name: 'newInterventionForProblem', params: params }"
            round
            outline
            size="10.5px"
            color="intervention"
            class="on-right shadow-1 bg-white"
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
        <div
          v-else
          class="text-italic"
        >{{ $t("noPlannedInterventions") }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="sass">
.q-card
  // background-image: var(--q-color-classification-gd) !important
  // *
  //   color: white
  &.text-body2
    letter-spacing: 0
    .rating
      letter-spacing: -0.01em
  &.collapsed
    > div:not(:last-of-type)
      padding-bottom: 4px
.align-chips
  margin-left: -.5em
.rating-dot
  width: .5rem
  height: .5rem
  border-radius: .25rem
</style>

<script lang="ts">
import Vue from "vue";
import Component, { mixins } from "vue-class-component";
import WarningMixin from "../mixins/WarningMixin";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";
import VueApexCharts from "vue-apexcharts";
import { Terminology } from "../helper/terminology";
import { getOutcomeAsChartData } from "../helper/apexChartData";
import { ProblemRecord } from "../models/problemRecord";

Vue.use(VueApexCharts);

const ProblemSummaryProps = Vue.extend({
  props: {
    params: Object,
    problemRecord: ProblemRecord,
    isExpandable: {
      type: Boolean,
      default: true,
    },
    isDisabled: Boolean,
  },
});

@Component({
  components: {
    apexchart: VueApexCharts,
    SimplifiedMarkdown,
  },
  watch: {
    isExpanded(this: ProblemSummary, value: boolean) {
      if (value) {
        setTimeout(() => {
          const top = this.$el.getBoundingClientRect().top;
          const y = top + window.pageYOffset + -80;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      }
    },
  },
})
export default class ProblemSummary extends mixins(
  ProblemSummaryProps,
  WarningMixin
) {
  isExpanded = false;

  get problem() {
    return this.record.problem;
  }
  get problemTitle() {
    const problemTitle = this.$t(this.problem.title);
    if (!this.isExpanded) {
      return problemTitle;
    } else {
      return this.$t("selectedProblem", { problem: problemTitle });
    }
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
  get isDraft() {
    return !this.record.createdAt;
  }
  get isInteractive() {
    return !this.isDraft && this.isExpanded && !this.isDisabled;
  }
  get outcomesForChart() {
    return getOutcomeAsChartData(this.record, this);
  }
  get sectionPadding() {
    if (this.$q.screen.lt.sm) {
      return "q-px-sm ";
    } else {
      return " ";
    }
  }
  get ratingsSummary() {
    const outcome = this.lastOutcome;
    const ratings = [outcome?.knowledge, outcome?.behaviour, outcome?.status];
    const terminologyRatings = this.terminology.problemRatingScale.ratings;

    return ratings.flatMap((rating, index) => {
      if (rating && rating.observation) {
        return [
          {
            label:
              terminologyRatings[index].scale[rating.observation - 1].title,
            colors: [0, 1, 2, 3, 4].map((value) => {
              if (value < rating.observation) {
                return "var(--q-color-outcome)";
                // return "#ffffff";
              } else if (value < rating.expectation || 0) {
                return "#cccccc";
                // return "#ff8888";
              } else {
                return "transparent";
              }
            }),
          },
        ];
      } else {
        return [];
      }
    });
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

  toggleExpansion() {
    if (this.isExpandable) {
      this.isExpanded = !this.isExpanded;
    }
  }

  prioritizeProblemRecord() {
    this.$store.direct.commit.prioritizeProblemRecord(this.params);
    this.$router.push({
      name: "problem",
      params: this.$store.direct.getters.getRouteParamsForLatestProblem(
        this.params
      ),
    });
    this.$store.direct.dispatch.saveClient(this.params);
  }

  dismissProblemRecord() {
    const dismiss = () => {
      const store = this.$store.direct;
      store.commit.dismissProblemRecord(this.params);
      store.dispatch.saveClient(this.params);
    };
    const outcome = this.lastOutcome;
    const didNotAchieveExpectations =
      outcome &&
      ((outcome.createdAt?.getTime() || 0) <
        Date.now() - 1000 * 60 * 60 * 24 * 6 ||
        outcome.knowledge.observation < outcome.knowledge.expectation ||
        outcome.behaviour.observation < outcome.behaviour.expectation ||
        outcome.status.observation < outcome.status.expectation);

    if (didNotAchieveExpectations) {
      this.showWarning(
        this.$t("problemDismissalOutcomeWarningMessage") as string
      )
        .onOk(() => {
          this.$router.push({ name: "outcome", params: this.params });
        })
        .onCancel(() => {
          dismiss();
        });
    } else {
      dismiss();
    }
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
