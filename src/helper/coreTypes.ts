import { ObjectID } from 'bson';

export interface CoreCustomer {
    _id: ObjectID;
    name: string;
}
export interface UnsavedCustomer {
    user_id: string;
    name: string;
    problems: ProblemRecord[];
    createdAt: Date;
    leftAt?: Date;
}
export interface Customer extends UnsavedCustomer {
    _id: ObjectID;
}
export interface Term {
    id: string;
    title?: string;
    description?: string;
}
export interface ProblemRecord {
    id: string;
    assessment: Note[];
    problem: Problem;
    interventions: Intervention[];
    outcomes: Outcome[];
    createdAt: Date | undefined;
    resolvedAt: Date | undefined;
    ratingIntervalInDays: number;
}
export interface Problem extends Term {
    scope: number;
    severity: number;
    signsAndSymptoms: Term[];
    details: string;
    isHighPriority: boolean;
    priorityDetails: string;
    titles?: ProblemTextExtension;
    descriptions?: ProblemTextExtension;
}
export interface ProblemTextExtension {
    scope: string;
    severity: string;
    priorityKey: string;
}
export interface Intervention {
    category: Term;
    target: Term;
    details: Note[];
    startedAt: Date | undefined;
    endedAt: Date | undefined;
}
export interface Outcome {
    createdAt: Date | undefined;
    knowledge: Rating;
    behaviour: Rating;
    status: Rating;
    personRatedInPlaceOfOwner: string;
}
export interface Rating {
    observation: number;
    expectation: number;
    comment: string;
    title?: string;
    description?: string;
}
export interface Note {
    text: string;
    createdAt: Date;
}
