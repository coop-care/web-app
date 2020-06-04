import { Reminder } from "../models/reminder";

export class Task {
    reminder: Reminder;
    problemId: string;
    due?: Date;
    completed?: Date;

    constructor(
        reminder: Reminder,
        problemId: string,
        due?: Date,
        completed?: Date
    ) {
        this.reminder = reminder;
        this.problemId = problemId;
        this.due = due;
        this.completed = completed;
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
