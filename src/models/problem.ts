import { Term } from "./term";
import { TerminologyWithMaps } from "../helper/terminology";
import { Base } from "./base";
import { Type } from "class-transformer";

export class Symptom {
    code = "";
    other?: string = undefined;
    @Type(() => Date)
    addedDate?: Date = undefined;
    @Type(() => Date)
    removedDate?: Date = undefined;
}

export class Problem extends Base {
    code = "";
    scopeCode = 0;
    severityCode = 2;
    @Type(() => Symptom)
    symptomsList: Symptom[] = [];
    isHighPriority = true;
    potentialRiskDetails = "";
    healthPromotionDetails = "";
    priorityDetails = "";

    get title() {
        if (this.code) {
            return "terminology.problemByCode." + this.code + ".title";
        } else {
            return "unspecifiedProblem";
        }
    }
    get description() {
        if (this.code) {
            return "terminology.problemByCode." + this.code + ".description";
        } else {
            return "";
        }
    }
    get terminology() {
        return "terminology.problemByCode." + this.code;
    }
    get scope() {
        return new Term(
            "terminology.problemClassificationScheme.modifiers.scope." +
                this.scopeCode
        );
    }
    get severity() {
        return new Term(
            "terminology.problemClassificationScheme.modifiers.severity." +
                this.severityCode
        );
    }
    get severityLongTitle() {
        if (this.severityCode == 0) {
            return "clientRequestForHealthPromotionTitle";
        } else if (this.severityCode == 1) {
            return "potentialRiskFactorsTitle";
        } else {
            return "actualSignsAndSymptomsTitle";
        }
    }
    get priority() {
        return new Term(this.isHighPriority ? "highPriority" : "lowPriority");
    }
    /**
     * @deprecated only for ClientHistoryEntry
     */
    get otherSignAndSymptom() {
        return this.severityCode == 2 ? this.currentSymptoms().filter(item => !!item.other).join(", ") : "";
    }
    /**
     * @deprecated only for ClientHistoryEntry
     */
    get signsAndSymptomsCodes() {
        return this.currentSymptoms().map(item => item.code);
    }
    /**
     * @deprecated only for data migration from old data model
     */
    set signsAndSymptomsCodes(values: string[]) {
        this.symptomsList = values.map(code => {
            const item = new Symptom();
            item.code = code;
            return item;
        })
    }
    /**
     * @deprecated only for data migration from old data model
     */
    set signsAndSymptomsList(values: Symptom[]) {
        this.symptomsList = values;
    }
    /**
     * @deprecated only for ClientHistoryEntry
     */
    get details() {
        if (this.severityCode == 2) {
            return this.symptomsList.filter(item => !!item.other).join(", ");
        } else if (this.severityCode == 1) {
            return this.potentialRiskDetails;
        } else if (this.severityCode == 0) {
            return this.healthPromotionDetails;
        } else {
            return "";
        }
    }
    /**
     * @deprecated only for data migration from old data model
     */
    set details(value: string) {
        if (!!value) {
            if (this.severityCode == 2) {
                const item = new Symptom();
                item.other = value;
                this.symptomsList.push(item);
            } else if (this.severityCode == 1) {
                this.potentialRiskDetails = value;
            } else if (this.severityCode == 0) {
                this.healthPromotionDetails = value;
            }
        }
    }

    currentSymptoms() {
        const now = new Date();

        return this.symptomsList.filter(symptom => 
            !symptom.removedDate || now < symptom.removedDate
        );
    }
    removedSymptoms() {
        const now = new Date();

        return this.symptomsList.filter(symptom => 
            symptom.removedDate && now >= symptom.removedDate
        );
    }
    scopeIcon(terminology: TerminologyWithMaps) {
        return terminology.icons.scope[this.scopeCode];
    }
    severityIcon(terminology: TerminologyWithMaps) {
        return terminology.icons.severity[this.severityCode];
    }
    priorityIcon(terminology: TerminologyWithMaps) {
        return terminology.icons.priority[this.isHighPriority ? 1 : 0];
    }
}
