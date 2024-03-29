import "reflect-metadata";
import { Type, plainToInstance } from "class-transformer";
import { ProblemRecord, Intervention, Contact, Reminder, ChangeRecord, IdentifiableObject, CustomField, Outcome } from ".";
import { LabeledValue } from "./types";
import { ObjectId } from "bson";
import { DateTime } from "luxon";

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

    static sortByCreated(a: ShiftNote, b: ShiftNote) {
        return a.created.getTime() - b.created.getTime();
    }

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
        return plainToInstance(Client, object);
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
    get activeProblems() {
        return this.problems.filter(problem => 
            !!problem.createdAt && !problem.resolvedAt && problem.problem.isHighPriority
        );
    }
    get firstOutcome(): Outcome | undefined {
        return this.outcomesByDate[0];
    }
    get lastOutcome(): Outcome | undefined {
        return this.outcomesByDate.at(-1);
    }
    private get outcomesByDate() {
        return this.problems
            .flatMap(problem => problem.outcomes.filter(outcome => !!outcome.createdAt && problem.createdAt <= outcome.createdAt))
            .sort((a, b) =>
                a.createdAt && b.createdAt
                    ? a.createdAt.getTime() - b.createdAt.getTime()
                    : 0
            )
    }

    age(date = new Date()) {
        return this.contact.birthday
            ? Math.floor(
                DateTime.fromJSDate(date)
                    .diff(DateTime.fromJSDate(this.contact.birthday), "years").years
            ) : undefined;
    }

    hasBirthday(date = new Date()) {
        return this.contact.birthday &&
            this.contact.birthday.getMonth() == date.getMonth() &&
            this.contact.birthday.getDate() == date.getDate();
    }

    findProblemRecord(id?: string) {
        return !!id ? this.problems.find(problem => problem.id == id) : undefined;
    }

    findContact(id?: string | ObjectId) {
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
            if (!problem.isActive) {
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

        this.forActiveReminders((reminder) =>
            reminder.calculateOccurrences()
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

    customField(label: string) {
        return this.customFields.find(field => field.label == label);
    }
    customValue(label: string) {
        return this.customField(label)?.value;
    }
    updatedCustomField(label: string, value: any) {
        return [{
            ...this.customField(label),
            label,
            value,
        }].concat(this.customFields.filter(field => field.label != label));
    }
}
