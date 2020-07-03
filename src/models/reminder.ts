import "reflect-metadata";
import { RRuleSet } from "./rrule";
import { Type, Transform } from "class-transformer";
import { Base } from "./base";

export class Occurrence {
    @Type(() => Date)
    due: Date;
    @Type(() => Date)
    completed?: Date;
    user?: string;

    constructor(due: Date, completed?: Date, user?: string) {
        this.due = due;
        this.completed = completed;
        this.user = user;
    }

    get signature() {
        return this.user;
    }
}

export class Reminder extends Base {
    id = this.generateId();
    @Transform((value?: RRuleSet) => value?.toJSON(), { toPlainOnly: true })
    @Transform((value: any) => RRuleSet.fromJSON(value), { toClassOnly: true })
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
        return this.recurrenceRules?.isRecurring || false;
    }
    get isCompleted() {
        return !!this.completedAt;
    }
    get completedOccurrences() {
        return this.occurrences.filter(item => !!item.completed);
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

    calculateOccurrences(isInactive: boolean) {
        const start = this.startDateOfRecurrenceRules;

        if (start && this.recurrenceRules) {
            const hasLastOccurence = this.occurrences.length > 0;
            const end = new Date(new Date().setHours(23, 59, 59, 999));
            const due =
                this.recurrenceRules
                    .between(start, end, !hasLastOccurence)
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

    recalculateOccurencesAfterUpdate(from = new Date()) {
        if (this.recurrenceRules) {
            const start = new Date(from).setHours(0, 0, 0, 0);
            const endOfToday = new Date().setHours(23, 59, 59, 999);
            const pastOccurrences = this.occurrences.filter(
                item => item.due.getTime() < start
            );

            if (pastOccurrences.length == this.occurrences.length) {
                return this.calculateOccurrences(false);
            }

            const completedSinceStartOccurences = this.occurrences.filter(
                item => !!item.completed && item.due.getTime() > start
            );

            if (!completedSinceStartOccurences.length) {
                this.occurrences = pastOccurrences;
                return this.calculateOccurrences(false);
            }

            const dueSinceStartOccurences = this.recurrenceRules
                .between(new Date(start), new Date(endOfToday), true)
                .filter(
                    date =>
                        !completedSinceStartOccurences.find(
                            item => item.due.getTime() == date.getTime()
                        )
                )
                .map(date => new Occurrence(date));
            const sortedNewOccurences = completedSinceStartOccurences
                .concat(dueSinceStartOccurences)
                .sort((a, b) => a.due.getTime() - b.due.getTime());

            this.occurrences = pastOccurrences.concat(sortedNewOccurences);
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
