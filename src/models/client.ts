import "reflect-metadata";
import { Type, plainToClass } from "class-transformer";
import { MasterData, ProblemRecord, Intervention, Contact, Reminder, ChangeRecord, IdentifiableObject } from ".";

export class Client extends IdentifiableObject {
    @Type(() => MasterData)
    masterData: MasterData = new MasterData();
    @Type(() => ProblemRecord)
    problems: ProblemRecord[] = [];
    @Type(() => Intervention)
    unrelatedReminders: Intervention[] = [];
    @Type(() => Contact)
    contacts: Contact[] = [];
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
    static sortByActiveAndLastName(a: Client, b: Client) {
        if (!!a.leftAt && !b.leftAt) {
            return 1;
        } else if (!a.leftAt && !!b.leftAt) {
            return -1;
        } else {
            return this.sortByLastName(a, b);
        }
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

    findProblemRecord(id?: string) {
        return !!id ? this.problems.find(problem => problem.id == id) : undefined;
    }

    findContact(id?: string) {
        return !!id ? this.contacts.find(contact => contact.id == id) : undefined;
    }

    findReminder(id: string) {
        return this.problems
            .flatMap(problem => problem.reminders)
            .concat(this.unrelatedReminders)
            .find(reminder => reminder.id == id);
    }

    forAllReminders(
        method: (reminder: Reminder, problem?: ProblemRecord) => any
    ) {
        this.problems.forEach(problem => {
            if (!problem.createdAt) {
                return;
            }
            problem.reminders.forEach(reminder => {
                method(reminder, problem);
            });
        });
        this.unrelatedReminders.forEach(reminder => method(reminder));
    }

    forActiveReminders(
        method: (reminder: Reminder, problem?: ProblemRecord) => any
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
                if (!reminder.isFinished) {
                    method(reminder, problem);
                }
            });
        });
        this.unrelatedReminders.forEach(reminder => {
            if (!reminder.isFinished) {
                method(reminder);
            }
        });
    }

    calculateOccurrences() {
        if (this.leftAt) {
            return;
        }

        this.forActiveReminders((reminder, problem) =>
            reminder.calculateOccurrences(
                !!this.leftAt ||
                (!!problem &&
                    (!!problem.resolvedAt ||
                        !problem.problem.isHighPriority))
            )
        );
    }
}
