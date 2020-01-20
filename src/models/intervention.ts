import "reflect-metadata";
import { Type } from "class-transformer";
import { Note } from "./note";
import { Term } from "./term";

export class Intervention {
    categoryCode = "";
    targetCode = "";
    @Type(() => Note)
    details: Note[] = [];
    @Type(() => Date)
    startedAt: Date | undefined;
    @Type(() => Date)
    endedAt: Date | undefined;

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
        return new Term("terminology.categoryByCode." + this.categoryCode);
    }
    get target() {
        return new Term("terminology.targetByCode." + this.targetCode);
    }
}