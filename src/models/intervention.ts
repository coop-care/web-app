import "reflect-metadata";
import { Type } from "class-transformer";
import { Reminder } from ".";
import { Term } from "./term";

export class Intervention extends Reminder {
    categoryCode = "";
    targetCode = "";
    detailsCode = "";
    details = "";
    comment?: string;
    assignee?: string;
    receiver?: string;
    @Type(() => Intervention)
    arrangedIntervention?: Intervention;

    static fromCode(code: string) {
        const codes = code.split(".");
        if (codes.length != 2) {
            throw new Error(
                "code is not in the format CC.TT with C for Category Code and T for Target Code"
            );
        }
        const intervention = new Intervention();
        intervention.categoryCode = codes[0];
        intervention.targetCode = codes[1];
        return intervention;
    }

    get code() {
        return this.categoryCode + "." + this.targetCode;
    }
    get category() {
        if (this.categoryCode) {
            const term = new Term("terminology.categoryByCode." + this.categoryCode);
            term.shortTitle = "categoryShortTitle" + this.categoryCode;
            return term;
        } else {
            return new Term("");
        }
    }
    get target() {
        if (this.targetCode) {
            return new Term("terminology.targetByCode." + this.targetCode);
        } else {
            return new Term("");
        }
    }
    get intervention() {
        return this.arrangedIntervention || this;
    }
}
