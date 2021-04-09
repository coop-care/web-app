import { classToClass } from "class-transformer";
import { Reminder, Occurrence } from "../models";

export class Task<T extends Reminder> {
    reminder: T;
    problemId?: string;
    due?: Date;
    completed?: Date;
    user?: string;

    static sortByDueDate(a: Task<Reminder>, b: Task<Reminder>) {
        return (a.due?.getTime() || 0) - (b.due?.getTime() || 0);
    }
    static sortByCreatedAt(a: Task<Reminder>, b: Task<Reminder>) {
        return a.reminder.createdAt.getTime() - b.reminder.createdAt.getTime();
    }

    constructor(
        reminder: T,
        problemId?: string,
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
    get id() {
        return this.reminder.id + (this.reminder.isScheduled ? (this.due?.getTime() || "") : "");
    }
    get isDue() {
        return !!this.due && !this.completed && this.due.getTime() < Date.now();
    }

    clone() {
        return classToClass(this);
    }
}
export class TaskGroup {
    title: string;
    tasks: Task<Reminder>[];

    constructor(title: string, tasks: Task<Reminder>[]) {
        this.title = title;
        this.tasks = tasks;
    }

    get titleAndTasks(): GroupedTask[] {
        return [{
            title: this.title
        }].concat(this.tasks.map(task => {
            return {
                title: task.id,
                task: task
            }
        }));
    }
}

type GroupedTask = {
    title: string;
    task?: Task<Reminder>;
}
