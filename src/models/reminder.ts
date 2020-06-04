import "reflect-metadata";
import { RRuleSet } from "./rrule";
import { Type, Transform } from "class-transformer";
import { Base } from "./base";

export class Occurrence {
    @Type(() => Date)
    due: Date;
    @Type(() => Date)
    completed?: Date;

    constructor(due: Date, completed?: Date) {
        this.due = due;
        this.completed = completed;
    }
}

export class Reminder extends Base {
    id = this.generateId();
    @Transform((value: RRuleSet | undefined) => value?.toString(), {
        toPlainOnly: true
    })
    @Transform(
        (value: string | undefined) =>
            typeof value == "string" ? RRuleSet.fromString(value) : undefined,
        { toClassOnly: true }
    )
    recurrenceRules?: RRuleSet = undefined;
    @Type(() => Occurrence)
    occurrences: Occurrence[] = [];
    @Type(() => Date)
    createdAt = new Date();
    @Type(() => Date)
    completedAt?: Date = undefined;

    get isScheduled() {
        return !!this.recurrenceRules;
    }
    get isRecurring() {
        return !!this.recurrenceRules?.currentRule;
    }
    get isCompleted() {
        return !!this.completedAt;
    }
    get completedOccurrences() {
        return this.occurrences.filter(item => !!item.completed);
    }
    get lastOccurrenceCalculationAt() {
        if (this.recurrenceRules) {
            const lastOccurrence = this.occurrences[
                this.occurrences.length - 1
            ];
            return lastOccurrence?.due || this.recurrenceRules?.startDate;
        } else {
            return this.createdAt;
        }
    }

    calculateOccurrences(isInactive: boolean) {
        // console.log(this.details, isInactive, this.occurrences);
        // this.occurrences = [];
        if (this.recurrenceRules) {
            const lastOccurrence = this.occurrences[
                this.occurrences.length - 1
            ];
            const start = lastOccurrence?.due || this.recurrenceRules.startDate;
            const due =
                this.recurrenceRules
                    .between(start, new Date(), !lastOccurrence)
                    .map(date => new Occurrence(date)) || [];
            this.occurrences = this.occurrences.concat(due);
        }

        if (isInactive || this.isCompleted) {
            const completedOccurences = this.completedOccurrences;
            if (completedOccurences.length < this.occurrences.length) {
                this.occurrences = completedOccurences;
            }
        }
        // console.log(this.details, this.occurrences);
    }
}
