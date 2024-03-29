import "reflect-metadata";
import { Type, Transform, TransformFnParams } from "class-transformer";
import { Reminder } from ".";
import { Term } from "./term";
import { ObjectId } from "bson";

const fromObjectID = ({ value }: TransformFnParams) => 
    (value as ObjectId)?.toHexString();

const toObjectID = ({ value }: TransformFnParams) =>
    value != undefined 
        ? new ObjectId((value as string).padStart(12)) 
        : undefined;

export class Intervention extends Reminder {
    categoryCode = "";
    targetCode = "";
    detailsCode = "";
    details = "";
    comment?: string = undefined;
    @Transform(fromObjectID, { toPlainOnly: true })
    @Transform(toObjectID, { toClassOnly: true })
    assignee?: ObjectId = undefined;
    @Transform(fromObjectID, { toPlainOnly: true })
    @Transform(toObjectID, { toClassOnly: true })
    receiver?: ObjectId = undefined;
    @Type(() => Intervention)
    arrangedIntervention?: Intervention = undefined;

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
    get intervention(): Intervention {
        return this.arrangedIntervention || this;
    }
}
