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
    createdAt: Date;
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
        oldValues?: Record<string, any>,
        createdAt = new Date()
    ) {
        this.user = user;
        this.type = type;
        this.problemId = problemId;
        this.newValues = newValues;
        this.oldValues = oldValues;
        this.createdAt = createdAt;
    }
}
