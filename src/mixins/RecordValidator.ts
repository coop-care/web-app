import { Component } from "vue-property-decorator";
import { TranslateResult } from "vue-i18n";
import RecordMixin from "./RecordMixin";
import { ProblemRecord, Intervention } from "../models";

@Component
export default class RecordValidator extends RecordMixin {
    showWarning = false;
    lastWarning = "";

    get warnings() {
        return {
            problemSelection: this.problemSelectionWarnings,
            problemClassification: this.problemClassificationWarnings,
            rating: this.ratingWarnings,
            intervention: this.interventionWarnings
        };
    }
    get temporaryRecord(): ProblemRecord | undefined {
        return undefined;
    }
    get continueButtonLabel() {
        return !this.showWarning
            ? this.$t("continue")
            : this.$t("continueAnyway");
    }
    get doneButtonLabel() {
        return !this.showWarning ? this.$t("done") : this.$t("finishAnyway");
    }

    private get problemSelectionWarnings() {
        const code = (this.record || this.temporaryRecord)?.problem.code;

        if (!code) {
            return this.$t("noProblemWarning") as string;
        } else if (
            this.client?.problems.find(
                record =>
                    code == record.problem.code &&
                    record.id != this.record?.id &&
                    !record.resolvedAt
            )
        ) {
            return this.$t("duplicateProblemWarning") as string;
        } else {
            return "";
        }
    }

    private get problemClassificationWarnings() {
        const problem = this.record?.problem;
        const warnings: TranslateResult[] = [];

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
    }

    private get ratingWarnings() {
        const outcome = this.record?.outcomes[0];
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
    }

    private get interventionWarnings() {
        const interventions = this.record?.interventions || [];
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
                this.$tc("noInterventionCategoryWarning", noCategoryCount)
            );
        }
        if (noTargetCount) {
            warnings.push(
                this.$tc("noInterventionTargetWarning", noTargetCount)
            );
        }
        if (noDetailsCount) {
            warnings.push(
                this.$tc("noInterventionDetailsWarning", noDetailsCount)
            );
        }

        return warnings.join("\n");
    }

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
    }

    warningsForIntervention(intervention: Intervention) {
        const warnings: TranslateResult[] = [];

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
    }
}
