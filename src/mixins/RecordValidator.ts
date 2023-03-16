import { defineComponent } from "vue";
import { TranslateResult } from "vue-i18n";
import RecordMixin, { RecordMixinInterface } from "./RecordMixin";
import { Intervention, Outcome, Problem, Client } from "../models";

export interface RecordValidatorInterface extends RecordMixinInterface {
    showWarning: boolean;
    lastWarning: string;
    continueButtonLabel: string;
    doneButtonLabel: string;
    addButtonLabel: string;
    problemSelectionWarnings(problem: Problem | null, id?: string, client?: Client): string;
    problemClassificationWarnings(problem: Problem | null): string;
    ratingWarnings(outcome: Outcome): string;
    interventionListWarnings(interventions: Intervention[]): string;
    interventionWarnings(intervention: Intervention | null): string;
    validate(warnings: string, next: () => void): void;
};

export default defineComponent({
    extends: RecordMixin,

    data() {
        return {
            showWarning: false,
            lastWarning: "",
        }
    },
  
    computed: {
        continueButtonLabel() {
            return !this.showWarning
                ? this.$t("continue")
                : this.$t("continueAnyway");
        },
        doneButtonLabel() {
            return !this.showWarning ? this.$t("apply") : this.$t("applyAnyway");
        },
        addButtonLabel() {
            return !this.showWarning ? this.$t("add") : this.$t("addAnyway");
        },
    },

    methods: {
        problemSelectionWarnings(problem: Problem | null, id?: string, client?: Client) {
            if (!problem?.code) {
                return this.$t("noProblemWarning") as string;
            } else if (
                client?.problems.find(record =>
                    problem.code == record.problem.code
                        && id != record.id
                        && !record.resolvedAt
                )
            ) {
                return this.$t("duplicateProblemWarning") as string;
            } else {
                return "";
            }
        },

        problemClassificationWarnings(problem: Problem | null) {
            const warnings: TranslateResult[] = [];

            if (!problem) {
                return "";
            }

            if (
                problem &&
                problem.code &&
                problem.severityCode == 2 &&
                problem.signsAndSymptomsCodes.length == 0
            ) {
                warnings.push(this.$t("noSymptomsWarning"));
            } else if (problem && problem.severityCode == 1 && !problem.details) {
                warnings.push(this.$t("noPotentialRiskFactorsWarning"));
            } else if (problem && problem.severityCode == 0 && !problem.details) {
                warnings.push(this.$t("noClientWishForHealthPromotionWarning"));
            }

            if (problem && !problem.isHighPriority && !problem.priorityDetails) {
                warnings.push(this.$t("noLowPriorityDetailsWarning"));
            }

            return warnings.join("\n");
        },

        ratingWarnings(outcome: Outcome) {
            const warnings: TranslateResult[] = [];

            if (!outcome || outcome.knowledge.observation == 0) {
                warnings.push(this.$t("noKnowledgeRatingWarning"));
            }
            if (
                outcome &&
                outcome.knowledge.expectation &&
                outcome.knowledge.observation > outcome.knowledge.expectation
            ) {
                warnings.push(this.$t("exceedingKnowledgeRatingWarning"));
            }

            if (!outcome || outcome.behaviour.observation == 0) {
                warnings.push(this.$t("noBehaviourRatingWarning"));
            }
            if (
                outcome &&
                outcome.behaviour.expectation &&
                outcome.behaviour.observation > outcome.behaviour.expectation
            ) {
                warnings.push(this.$t("exceedingBehaviourRatingWarning"));
            }

            if (!outcome || outcome.status.observation == 0) {
                warnings.push(this.$t("noStatusRatingWarning"));
            }
            if (
                outcome &&
                outcome.status.expectation &&
                outcome.status.observation > outcome.status.expectation
            ) {
                warnings.push(this.$t("exceedingStatusRatingWarning"));
            }

            if (
                outcome &&
                outcome.knowledge.observation == 5 &&
                outcome.behaviour.observation == 5 &&
                outcome.status.observation == 5
            ) {
                warnings.push(this.$t("unimprovableRatingsWarning"));
            }

            return warnings.join("\n");
        },

        interventionListWarnings(interventions: Intervention[]) {
            const noCategoryCount = interventions.filter(
                intervention => !intervention.categoryCode
            ).length;
            const noTargetCount = interventions.filter(
                intervention => !intervention.targetCode
            ).length;
            const noDetailsCount = interventions.filter(
                intervention => !intervention.details
            ).length;
            const warnings: TranslateResult[] = [];

            if (interventions.length == 0) {
                warnings.push(this.$t("noInterventionsWarning"));
            }
            if (noCategoryCount) {
                warnings.push(
                    this.$t("noInterventionCategoryWarning", noCategoryCount)
                );
            }
            if (noTargetCount) {
                warnings.push(
                    this.$t("noInterventionTargetWarning", noTargetCount)
                );
            }
            if (noDetailsCount) {
                warnings.push(
                    this.$t("noInterventionDetailsWarning", noDetailsCount)
                );
            }

            return warnings.join("\n");
        },

        interventionWarnings(intervention: Intervention | null) {
            const warnings: TranslateResult[] = [];

            if (!intervention) {
                return "";
            }

            if (!intervention.categoryCode) {
                warnings.push(this.$t("noInterventionCategorySpecificWarning"));
            }
            if (!intervention.targetCode) {
                warnings.push(this.$t("noInterventionTargetSpecificWarning"));
            }
            if (!intervention.details) {
                warnings.push(this.$t("noInterventionDetailsSpecificWarning"));
            }

            return warnings.join("\n");
        },

        validate(warnings: string, next: () => void) {
            if (this.showWarning && this.lastWarning.includes(warnings)) {
                this.showWarning = false;
                next();
            } else if (warnings) {
                this.showWarning = true;
                this.lastWarning = warnings;
            } else {
                next();
            }
        },
    },
});
