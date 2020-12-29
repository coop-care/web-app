import { classToClass } from "class-transformer";
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
    get id() {
        return this.reminder.id + (this.due?.getTime() || "");
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
    tasks: Task[];

    constructor(title: string, tasks: Task[]) {
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
    task?: Task;
}
