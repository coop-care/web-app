import { Term } from "./term";

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
}
