import { Term } from "./term";
import { TerminologyWithMaps } from "../helper/terminology";

export class Problem {
    code = "";
    scopeCode = 0;
    severityCode = 2;
    signsAndSymptomsCodes: string[] = [];
    details = "";
    isHighPriority = true;
    priorityDetails = "";

    get title() {
        if (this.code) {
            return "terminology.problemByCode." + this.code + ".title";
        } else {
            return "unspecifiedProblem";
        }
    }
    get description() {
        return "terminology.problemByCode." + this.code + ".description";
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
    get priority() {
        return new Term(this.isHighPriority ? "highPriority" : "lowPriority");
    }
    get signsAndSymptoms() {
        return this.signsAndSymptomsCodes.map(code => {
            return new Term(
                "terminology.symptomByCode." + this.code + "_" + code
            );
        });
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
