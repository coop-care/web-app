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
    get lastOccurrenceDate() {
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
        if (this.recurrenceRules) {
            const lastOccurrence = this.occurrences[
                this.occurrences.length - 1
            ];
            const start = lastOccurrence?.due || this.recurrenceRules.startDate;
            const end = new Date(new Date().setHours(23, 59, 59, 999));
            const due =
                this.recurrenceRules
                    .between(start, end, !lastOccurrence)
                    .map(date => new Occurrence(date)) || [];
            this.occurrences = this.occurrences.concat(due);
        }

        if (isInactive || this.isCompleted) {
            const completedOccurences = this.completedOccurrences;
            if (completedOccurences.length < this.occurrences.length) {
                this.occurrences = completedOccurences;
            }
        }
    }

    recalculateOccurencesAfterUpdate() {
        if (this.recurrenceRules) {
            const startOfToday = new Date().setHours(0, 0, 0, 0);
            const endOfToday = new Date().setHours(23, 59, 59, 999);
            const pastOccurrences = this.occurrences.filter(
                item => item.due.getTime() < startOfToday
            );

            if (pastOccurrences.length == this.occurrences.length) {
                return; // no merging required, can be solved by calculateOccurrences later
            }

            const completedTodayOccurences = this.occurrences.filter(
                item => !!item.completed && item.due.getTime() > startOfToday
            );

            if (!completedTodayOccurences.length) {
                return; // no merging required, can be solved by calculateOccurrences later
            }

            const dueTodayOccurences = this.recurrenceRules
                .between(new Date(startOfToday), new Date(endOfToday), true)
                .filter(
                    date =>
                        !completedTodayOccurences.find(
                            item => item.due.getTime() == date.getTime()
                        )
                )
                .map(date => new Occurrence(date));
            const sortedTodayOccurences = completedTodayOccurences
                .concat(dueTodayOccurences)
                .sort((a, b) => a.due.getTime() - b.due.getTime());

            this.occurrences = pastOccurrences.concat(sortedTodayOccurences);
        }
    }
}
