import "reflect-metadata";
import { Type, plainToClass, classToPlain } from "class-transformer";
import { ObjectID } from "bson";
import { MasterData, ProblemRecord, Reminder, ChangeRecord } from ".";

export class Client {
    // optional properties need an initial value because Vue does not detect the addition or removal of a property
    _id?: ObjectID = undefined;
    user_id = "";
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

    static fromObject(object: unknown): Client | Client[] {
        return plainToClass(Client, object);
    }

    constructor(userId: string) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        this.user_id = userId;
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

    equals(client: Client) {
        return this._id?.equals(client._id || "") || false;
    }

    toJSON() {
        return classToPlain(this);
    }
}
