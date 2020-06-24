import "reflect-metadata";
import { Type } from "class-transformer";

export type ChangeRecordType =
    | "ProblemCreated"
    | "ProblemModified"
    | "ProblemResolved"
    | "InterventionStarted"
    | "InterventionModified"
    | "InterventionEnded"
    | "OutcomeRated";

export class ChangeRecord {
    @Type(() => Date)
    createdAt = new Date();
    user: string;
    type: ChangeRecordType;
    problemId: string;
    newValues: Record<string, any>;
    oldValues?: Record<string, any>;

    constructor(
        user: string,
        type: ChangeRecordType,
        problemId: string,
        newValues: Record<string, any>,
        oldValues?: Record<string, any>
    ) {
        this.user = user;
        this.type = type;
        this.problemId = problemId;
        this.newValues = newValues;
        this.oldValues = oldValues;
    }

    get username() {
        return this.user;
    }
}
