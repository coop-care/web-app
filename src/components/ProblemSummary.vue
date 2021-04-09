<template>
  <q-card
    :class="['radius-md bg-white text-body2', (isExpanded ? 'expanded' : 'collapsed')]"
    :style="
      'transition: all 0s; width: 100%; ' +
        (isExpanded ? 'max-width: calc(100% - 16px)' : 'max-width: 320px')
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
          @click.prevent.stop=""
        >
          <action-menu
            :items="actionMenuItems"
            color="classification"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section :class="sectionPadding">
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
        >
          <div
            v-for="(rating, index) in ratingsSummary"
            v-bind:key="index"
            class="rating row no-wrap"
          >
            <div class="row no-wrap items-center q-mr-xs print-color">
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
          <rating-chart-group 
            :outcomes="outcomes"
            :teamMembers="teamMembers"
          />
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
          bold-class="text-intervention"
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
import { Component, Prop, Watch, Mixins } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import WarningMixin from "../mixins/WarningMixin";
import ActionMenu from "../components/ActionMenu.vue";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";
import RatingChartGroup from "../components/RatingChartGroup.vue";
import { ProblemRecord, Problem } from "../models";

@Component({
  components: {
    ActionMenu,
    SimplifiedMarkdown,
    RatingChartGroup
  }
})
export default class ProblemSummary extends Mixins(WarningMixin, RecordMixin) {
  @Prop({type: Object, default: {}}) readonly params!: Record<string, string>;
  @Prop(Object) readonly problemRecord: ProblemRecord | undefined;
  @Prop({type: Boolean, default: true}) readonly isExpandable!: boolean;
  isExpanded = false;

  @Watch("isExpanded")
  onIsExpandedChanged(value: boolean) {
      if (value) {
        setTimeout(() => {
          const top = this.$el.getBoundingClientRect().top;
          const y = top + window.pageYOffset + -80;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      }
  }

  get problem() {
    return this.record?.problem || new Problem();
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
    return this.record?.interventions || [];
  }
  get lastOutcome() {
    if (this.outcomes.length) {
      return this.outcomes[this.outcomes.length - 1];
    } else {
      return undefined;
    }
  }
  get isInteractive() {
    return this.isExpanded && !this.isDisabled;
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
  get actionMenuItems() {
    return [
      {
        name: this.$t("prioritizeProblem"),
        icon: "fas fa-arrow-up",
        action: this.prioritizeProblemRecord,
        condition: !this.problem.isHighPriority
      },
      {
        name: this.$t("problemDismissal"),
        icon: "fas fa-check",
        action: this.dismissProblemRecord,
        condition: !!this.record && !this.record.resolvedAt
      },
      {
        name: this.$t("deleteNewProblem"),
        icon: "fas fa-trash",
        action: this.deleteProblemRecord,
        condition: !!this.record && 
          (Date.now() - 24 * 60 * 60 * 1000 < this.record.createdAt.getTime()),
        isDestructive: true
      }
    ]
  }

  get record() {
    return this.problemRecord || this.getRecordFromStore();
  }
  get outcomes() {
    return this.record?.outcomes || [];
  }

  toggleExpansion() {
    if (this.isExpandable) {
      this.isExpanded = !this.isExpanded;
    }
  }

  prioritizeProblemRecord() {
    this.$store.direct.commit.prioritizeProblemRecord(this.params);
    void this.$router.push({
      name: "problem",
      params: this.$store.direct.getters.getRouteParamsForLatestProblem(
        this.params
      ),
    });
    void this.$store.direct.dispatch.saveClient(this.params);
  }

  dismissProblemRecord() {
    const dismiss = () => {
      const store = this.$store.direct;
      store.commit.dismissProblemRecord(this.params);
      void store.dispatch.saveClient(this.params);
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
          void this.$router.push({ name: "outcome", params: this.params });
        })
        .onCancel(() => {
          dismiss();
        });
    } else {
      dismiss();
    }
  }

  deleteProblemRecord() {
    if (this.record && this.client) {
      const recordId = this.record.id;
      this.updateAndSave(this.client, {
        problems: this.client?.problems.filter(record => record.id != recordId)
      });
    }
  }

  getRecordFromStore() {
    return this.$store.direct.getters.getProblemRecordById(this.params);
  }
}
</script>
