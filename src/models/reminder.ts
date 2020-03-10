import "reflect-metadata";
import { Type } from "class-transformer";
import { Base } from "./base";
import { RecurrenceRule } from "./recurrenceRule";

export class Reminder extends Base {
    id = this.generateId();
    @Type(() => Date)
    startDate?: Date = undefined;
    @Type(() => RecurrenceRule)
    recurrenceRules: RecurrenceRule[] = [];
    useRecurrenceRulesFromReminder?: string = undefined;
    @Type(() => Date)
    completionDate?: Date = undefined;

    get hasRecurrenceRules() {
        return this.recurrenceRules.length > 0;
    }
    get isCompleted() {
        return this.completionDate != undefined;
    }
}
