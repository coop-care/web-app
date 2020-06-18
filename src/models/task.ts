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
        dueOrOccurence?: Date | Occurrence
    ) {
        this.reminder = reminder;
        this.problemId = problemId;

        if (dueOrOccurence instanceof Date) {
            this.due = dueOrOccurence;
        } else if (dueOrOccurence instanceof Occurrence) {
            this.due = dueOrOccurence.due;
            this.completed = dueOrOccurence.completed;
            this.user = dueOrOccurence.user;
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
