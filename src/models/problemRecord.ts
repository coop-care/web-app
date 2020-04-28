import "reflect-metadata";
import { Type } from "class-transformer";
import { Base } from "./base";
import { Problem } from "./problem";
import { Reminder } from "./reminder";
import { Outcome } from "./outcome";
import { Note } from "./note";
import { Intervention } from "./intervention";

export class ProblemRecord extends Base {
    id = this.generateId();
    @Type(() => Note)
    assessment: Note[] = [];
    @Type(() => Problem)
    problem = new Problem();
    @Type(() => Reminder, {
        discriminator: {
            property: "__type",
            subTypes: [
                { value: Intervention, name: "intervention" },
                // @ts-ignore
                { value: Intervention, name: undefined }
            ]
        }
    })
    reminders: Reminder[] = [];
    @Type(() => Outcome)
    outcomes: Outcome[] = [];
    @Type(() => Date)
    // optional properties need an initial value because Vue does not detect the addition or removal of a property
    createdAt?: Date = undefined;
    @Type(() => Date)
    resolvedAt?: Date = undefined;

    get interventions() {
        return this.reminders.filter(
            reminder => reminder instanceof Intervention
        ) as Intervention[];
    }
    get editableOutcome() {
        let lastOutcome = this.outcomes[this.outcomes.length - 1];

        if (!lastOutcome || lastOutcome.createdAt) {
            const newOutcome = new Outcome();

            if (lastOutcome) {
                newOutcome.knowledge = lastOutcome.knowledge.clone();
                newOutcome.behaviour = lastOutcome.behaviour.clone();
                newOutcome.status = lastOutcome.status.clone();
            }
            this.outcomes.push(newOutcome);
            lastOutcome = newOutcome;
        }

        return lastOutcome;
    }

    clone() {
        const clone = super.clone();
        clone.id = this.generateId();
        return clone;
    }

    prioritizedClone() {
        const clone = this.clone();
        clone.createdAt = undefined;
        clone.problem.isHighPriority = true;
        clone.problem.priorityDetails = "";
        return clone;
    }
}
