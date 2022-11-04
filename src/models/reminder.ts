import "reflect-metadata";
import { RRuleSet } from "./rrule";
import { Type, Transform } from "class-transformer";
import { Base } from "./base";

export class Occurrence {
    @Type(() => Date)
    due: Date;
    @Type(() => Date)
    completed?: Date = undefined;
    user?: string = undefined;

    static sortByDueDate(a: Occurrence, b: Occurrence) {
        return (a.due?.getTime() || 0) - (b.due?.getTime() || 0);
    }

    constructor(due: Date, completed?: Date, user?: string) {
        this.due = due;
        this.completed = completed;
        this.user = user;
    }
}

export class Reminder extends Base {
    id = this.generateId();
    @Transform(({ value }) => (value as RRuleSet)?.toJSON(), { toPlainOnly: true })
    @Transform(({ value }) => RRuleSet.fromJSON(value), { toClassOnly: true })
    recurrenceRules?: RRuleSet = undefined;
    @Type(() => Occurrence)
    occurrences: Occurrence[] = [];
    @Type(() => Date)
    createdAt = new Date();
    @Type(() => Date)
    finishedAt?: Date = undefined;

    get isScheduled() {
        return !!this.recurrenceRules;
    }
    get isRecurring() {
        return this.recurrenceRules?.isRecurring || false;
    }
    get isFinished() {
        return !!this.finishedAt;
    }
    get completedOccurrences() {
        return this.occurrences.filter(item => !!item.completed);
    }
    get hasCompletedOccurences() {
        return this.completedOccurrences.length > 0;
    }
    get startDateOfRecurrenceRules() {
        if (this.recurrenceRules) {
            const lastOccurrence = this.occurrences[
                this.occurrences.length - 1
            ];
            return lastOccurrence?.due || this.recurrenceRules.initialStartDate;
        }
    }
    get lastOccurrenceDate() {
        return this.startDateOfRecurrenceRules || this.createdAt;
    }

    calculateOccurrences() {
        const start = this.startDateOfRecurrenceRules;

        if (start && this.recurrenceRules) {
            const hasLastOccurrence = this.occurrences.length > 0;
            const end = new Date(new Date().setHours(23, 59, 59, 999));
            const due =
                this.recurrenceRules
                    .between(start, end, !hasLastOccurrence)
                    .map(date => new Occurrence(date)) || [];
            this.occurrences = this.occurrences.concat(due);
        }

        if (this.isFinished) {
            const completedOccurrences = this.completedOccurrences;
            if (completedOccurrences.length < this.occurrences.length) {
                this.occurrences = completedOccurrences;
            }
        }
    }

    recalculateOccurrencesAfterUpdate(from = new Date()) {
        if (this.recurrenceRules) {
            const start = new Date(from).setHours(0, 0, 0, 0);
            const endOfToday = new Date().setHours(23, 59, 59, 999);
            const pastOccurrences = this.occurrences.filter(
                item => item.due.getTime() < start
            );

            if (pastOccurrences.length == this.occurrences.length) {
                return this.calculateOccurrences();
            }

            const completedSinceStartOccurrences = this.occurrences.filter(
                item => !!item.completed && item.due.getTime() > start
            );

            if (!completedSinceStartOccurrences.length) {
                this.occurrences = pastOccurrences;
                return this.calculateOccurrences();
            }

            const dueSinceStartOccurrences = this.recurrenceRules
                .between(new Date(start), new Date(endOfToday), true)
                .filter(
                    date =>
                        !completedSinceStartOccurrences.find(
                            item => item.due.getTime() == date.getTime()
                        )
                )
                .map(date => new Occurrence(date));
            const sortedNewOccurrences = completedSinceStartOccurrences
                .concat(dueSinceStartOccurrences)
                .sort(Occurrence.sortByDueDate);

            this.occurrences = pastOccurrences.concat(sortedNewOccurrences);
        } else {
            this.occurrences = this.completedOccurrences;
        }
    }

    clone() {
        const reminder = super.clone();
        reminder.id = this.generateId();
        reminder.createdAt = new Date();
        reminder.occurrences = [];
        return reminder;
    }
}
