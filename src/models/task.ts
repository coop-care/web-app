import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer";
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
        return plainToInstance(this.constructor as ClassConstructor<this>, instanceToPlain(this));
    }
}
export class TaskGroup {
    title: string;
    tasks: Task<Reminder>[];
    limit?: number;

    constructor(title: string, tasks: Task<Reminder>[], limit?: number) {
        this.title = title;
        this.tasks = tasks;
        this.limit = limit;
    }

    get titleAndTasks(): GroupedTask[] {
        let limit = this.limit ?? this.tasks.length;
        limit = this.tasks.length - limit != 1 ? limit : limit + 1; // the difference between limit and tasks.length should be at least 2
        const title = this.title;
        const tasks = this.tasks.slice(0, limit);
        const allTasksCount = this.tasks.length;
        const remainingTasksCount = allTasksCount - tasks.length;

        return [{
            id: title,
            title,
            allTasksCount,
        } as GroupedTask].concat(tasks.map(task => {
            return {
                id: task.id,
                task,
                allTasksCount,
            }
        })).concat(
            remainingTasksCount > 0
                ? [{
                    id: title,
                    allTasksCount,
                    remainingTasksCount,
                }] 
                : []
        );
    }
}

export type GroupedTask = {
    id: string;
    title?: string;
    task?: Task<Reminder>;
    allTasksCount: number;
    remainingTasksCount?: number;
}
