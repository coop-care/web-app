import "reflect-metadata";
import { Type } from "class-transformer";
import { Base } from "./base";
import { Problem, Reminder, Outcome, Intervention, RatingReminder } from ".";

export class ProblemRecord extends Base {
    id = this.generateId();
    @Type(() => Problem)
    problem = new Problem();
    @Type(() => Intervention)
    interventions: Intervention[] = [];
    @Type(() => Outcome)
    outcomes: Outcome[] = [];
    @Type(() => RatingReminder)
    ratingReminder = new RatingReminder(4, 2);
    @Type(() => Date)
    createdAt = new Date();
    @Type(() => Date)
    // optional properties need an initial value because Vue does not detect the addition or removal of a property
    resolvedAt?: Date = undefined;
    tag = "";

    static sortByPriorityAndCreatedAt(a: ProblemRecord, b: ProblemRecord) {
        // sort order: high priority before low priority, then latest creation first
        return Number(!a.problem.isHighPriority) - Number(!b.problem.isHighPriority) ||
            (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    }

    get isActive(): boolean {
        return !!this.createdAt && !this.resolvedAt && !!this.problem.isHighPriority;
    }
    get reminders(): Reminder[] {
        if (this.ratingReminder) {
            return (this.interventions as Reminder[]).concat([
                this.ratingReminder
            ]);
        } else {
            return this.interventions;
        }
    }
    get diagnosisName() {
        return this.tag ? "diagnosisNames." + this.tag : "noDiagnosis";
    }

    duplicate() {
        const clone = super.clone();
        clone.id = this.generateId();
        clone.createdAt = new Date();
        return clone;
    }

    prioritizedDuplicate() {
        const duplicate = this.duplicate();
        duplicate.problem.isHighPriority = true;
        duplicate.problem.priorityDetails = "";
        duplicate.ratingReminder = new RatingReminder(4, 2);
        return duplicate;
    }
}
