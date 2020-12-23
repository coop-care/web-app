import "reflect-metadata";
import { Type, plainToClass } from "class-transformer";
import { MasterData, ProblemRecord, Reminder, ChangeRecord, IdentifiableObject } from ".";

export class Client extends IdentifiableObject {
    @Type(() => MasterData)
    masterData: MasterData = new MasterData();
    @Type(() => ProblemRecord)
    problems: ProblemRecord[] = [];
    @Type(() => Date)
    createdAt = new Date();
    @Type(() => Date)
    leftAt?: Date = undefined;
    @Type(() => ChangeRecord)
    changeHistory: ChangeRecord[] = [];

    static fromObject(object: any): Client | Client[] {
        return plainToClass(Client, object);
    }

    static sortByLastName(a: Client, b: Client) {
        return a.masterData.lastName.localeCompare(b.masterData.lastName) ||
            a.masterData.firstName.localeCompare(b.masterData.firstName);
    }

    get name() {
        return this.masterData.name;
    }
    get dueTasksCount() {
        let count = 0;
        const before = Date.now();
        this.forActiveReminders(reminder => {
            count += reminder.occurrences.filter(
                item => !item.completed && item.due.getTime() < before
            ).length;
        });
        return count;
    }
    get activeProblemCount() {
        return this.problems.filter(problem => !problem.resolvedAt).length;
    }

    findProblemRecord(id: string) {
        return this.problems.find(problem => problem.id == id);
    }

    findReminder(id: string) {
        return this.problems
            .flatMap(problem => problem.reminders)
            .find(reminder => reminder.id == id);
    }

    forAllReminders(
        method: (reminder: Reminder, problem: ProblemRecord) => any
    ) {
        this.problems.forEach(problem => {
            if (!problem.createdAt) {
                return;
            }
            problem.reminders.forEach(reminder => {
                method(reminder, problem);
            });
        });
    }

    forActiveReminders(
        method: (reminder: Reminder, problem: ProblemRecord) => any
    ) {
        this.problems.forEach(problem => {
            if (
                !problem.createdAt ||
                !!problem.resolvedAt ||
                !problem.problem.isHighPriority
            ) {
                return;
            }

            problem.reminders.forEach(reminder => {
                if (reminder.isCompleted) {
                    return;
                }

                method(reminder, problem);
            });
        });
    }

    calculateOccurrences() {
        if (this.leftAt) {
            return;
        }

        this.forActiveReminders((reminder, problem) =>
            reminder.calculateOccurrences(
                !!this.leftAt ||
                !!problem.resolvedAt ||
                !problem.problem.isHighPriority
            )
        );
    }
}
