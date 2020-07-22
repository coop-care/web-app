import { Reminder, Occurrence } from "../models";

export class Task {
    reminder: Reminder;
    problemId: string;
    due?: Date;
    completed?: Date;
    user?: string;

    constructor(
        reminder: Reminder,
        problemId: string,
        dueOrOccurrence?: Date | Occurrence
    ) {
        this.reminder = reminder;
        this.problemId = problemId;

        if (dueOrOccurrence instanceof Date) {
            this.due = dueOrOccurrence;
        } else if (dueOrOccurrence instanceof Occurrence) {
            this.due = dueOrOccurrence.due;
            this.completed = dueOrOccurrence.completed;
            this.user = dueOrOccurrence.user;
        }
    }

    get signature() {
        return this.user;
    }
}

export class TaskGroup {
    title: string;
    tasks: Task[];

    constructor(title: string, tasks: Task[]) {
        this.title = title;
        this.tasks = tasks;
    }
}
