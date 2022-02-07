import "reflect-metadata";
import { Type, plainToClass } from "class-transformer";
import { ProblemRecord, Intervention, Contact, Reminder, ChangeRecord, IdentifiableObject, CustomField, Outcome } from ".";
import { LabeledValue } from "./types";
import { ObjectID } from "bson";

export class ClientHealthInformation {
    static readonly asstiveTechnologyTypes = ["nursingCareBedType", "toiletChairType", "raisedToiletSeatType", "rollatorType", "mobilityAidsType", "hearingAidsType", "glassesType", "upperDentureType", "lowerDentureType"];
    static readonly predefinedTypes = [...new Set(ClientHealthInformation.asstiveTechnologyTypes)];

    diagnoses: string[] = [];
    diabetes = "";
    anticoagulant = "";
    pain = "";
    allergies: string[] = [];
    assistiveTechnology: string[] = [];
    existingAdvanceHealthcareDirective: boolean | null = null;
    existingHealthcareProxy: boolean | null = null;
    likes = "";
    dislikes = "";
    biography = "";
    notes = "";
};
export class ClientAgreements {
    @Type(() => Date)
    initialInterview?: Date = undefined;
    @Type(() => Date)
    initialCare?: Date = undefined;
    @Type(() => Date)
    contractHandover?: Date = undefined;
    @Type(() => Date)
    costEstimateHandover?: Date = undefined;
    @Type(() => Date)
    documentationCreated?: Date = undefined;
    @Type(() => Date)
    carePlanCreated?: Date = undefined;
    existingInitialPrescription: boolean | null = null;
    keyHandoverRequired: boolean | null = null;
};

export class ShiftNote {
    user: string;
    @Type(() => Date)
    created: Date;
    text: string;

    constructor(user: string, text: string) {
        this.user = user;
        this.text = text;
        this.created = new Date();
    }
};
export class Client extends IdentifiableObject {
    @Type(() => Contact)
    contact: Contact = new Contact();
    @Type(() => ProblemRecord)
    problems: ProblemRecord[] = [];
    @Type(() => Intervention)
    unrelatedReminders: Intervention[] = [];
    @Type(() => Contact)
    informalContacts: Contact[] = [];
    @Type(() => Contact)
    formalContacts: Contact[] = [];
    @Type(() => ClientHealthInformation)
    healthInformation = new ClientHealthInformation();
    @Type(() => ClientAgreements)
    agreements = new ClientAgreements();
    customFields: CustomField<any>[] = [];
    @Type(() => Date)
    createdAt = new Date();
    @Type(() => Date)
    leftAt?: Date = undefined;
    @Type(() => ShiftNote)
    shiftNotes: ShiftNote[] = [];
    @Type(() => ChangeRecord)
    changeHistory: ChangeRecord[] = [];

    static fromObject(object: any): Client | Client[] {
        return plainToClass(Client, object);
    }

    static sortByLastName(a: Client, b: Client) {
        return a.contact.lastName.localeCompare(b.contact.lastName) ||
            a.contact.firstName.localeCompare(b.contact.firstName);
    }
    static sortByActiveAndLastName(a: Client, b: Client) {
        if (!!a.leftAt && !b.leftAt) {
            return 1;
        } else if (!a.leftAt && !!b.leftAt) {
            return -1;
        } else {
            return Client.sortByLastName(a, b);
        }
    }
    static sortByLabel(a: LabeledValue<any>, b: LabeledValue<any>) {
        return a.label.localeCompare(b.label);
    }

    get name() {
        return this.contact.name;
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
    get firstOutcome(): Outcome | undefined {
        return this.outcomesByDate[0];
    }
    get lastOutcome(): Outcome | undefined {
        return this.outcomesByDate[this.outcomesByDate.length - 1];
    }
    private get outcomesByDate() {
        return this.problems
            .flatMap(problem => problem.outcomes.filter(outcome => !!outcome.createdAt && problem.createdAt <= outcome.createdAt))
            .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
    }

    findProblemRecord(id?: string) {
        return !!id ? this.problems.find(problem => problem.id == id) : undefined;
    }

    findContact(id?: string | ObjectID) {
        return !!id ? this.informalContacts.find(contact => contact.id.equals(id)) : undefined;
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

    outcomesAtEndOfDay(date: Date) {
        const day = new Date(date);
        day.setUTCHours(23, 59, 59, 999);

        return this.problems.flatMap(problem =>
            problem.createdAt < day && (!problem.resolvedAt || problem.resolvedAt > day)
                ? problem.outcomes.slice().reverse().find(outcome => outcome.createdAt && outcome.createdAt < day) || []
                : []
        )
    }
}
