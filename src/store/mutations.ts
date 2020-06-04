import { defineMutations } from "direct-vuex";
import { store, StoreState } from ".";
import { Client } from "../models/client";
import { ProblemRecord } from "../models/problemRecord";
import { Reminder } from "../models/reminder";
import { Outcome } from "../models/outcome";
import { Rating } from "src/models/rating";
import { Task } from "src/models/task";

export default defineMutations<StoreState>()({
    setClients(state, clients: Client[]) {
        state.clients = clients;
    },

    isLoadingClientList(state, isLoading: boolean) {
        state.isLoadingClientList = isLoading;
    },

    calculateOccurences(state, client: Client) {
        client.calculateOccurrences();
    },

    archiveClient(state, client: Client) {
        client.leftAt = new Date();
    },

    unarchiveClient(state, client: Client) {
        client.leftAt = undefined;
    },

    createProblemRecord(state, payload) {
        store.getters
            .getClient(payload)
            ?.problems.push(payload.problemRecord || new ProblemRecord());
    },

    updateObject(
        state,
        { target, changes }: { target: any; changes: { [key: string]: any } }
    ) {
        // maybe check for each key if new value is really differs first? And consider array equality at least for empty arrays?
        Object.assign(target, changes);
    },

    toggleTaskCompletion(
        state,
        {
            task,
            isCompleted,
            date
        }: { task: Task; isCompleted: boolean; date: Date }
    ) {
        const now = new Date();
        let completedAt: Date | undefined = undefined;

        if (isCompleted) {
            completedAt = new Date(
                date.setHours(
                    now.getHours(),
                    now.getMinutes(),
                    now.getSeconds(),
                    now.getMilliseconds()
                )
            );
        }

        if (task.due) {
            const occurence = task.reminder.occurrences.find(
                item => item.due.getTime() == task.due?.getTime()
            );

            if (occurence) {
                occurence.completed = completedAt;
            }
        }

        store.commit.setReminderCompletedAt({
            reminder: task.reminder,
            completedAt: completedAt
        });
    },

    setReminderCompletedAt(
        state,
        { reminder, completedAt }: { reminder: Reminder; completedAt?: Date }
    ) {
        if (reminder.isScheduled) {
            const hasUncompleted =
                reminder.occurrences.filter(item => !item.completed).length > 0;
            const date = reminder.lastOccurrenceCalculationAt;

            if (!hasUncompleted && !reminder.recurrenceRules?.hasNext(date)) {
                reminder.completedAt = completedAt;
            } else {
                reminder.completedAt = undefined;
            }
        } else {
            reminder.completedAt = completedAt;
        }
    },

    prioritizeProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        const problemRecord = client?.findProblemRecord(payload.problemId);
        if (!problemRecord) {
            return;
        }

        client?.problems.push(problemRecord.prioritizedClone());
        problemRecord.resolvedAt = new Date();
    },

    dismissProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        const problemRecord = client?.findProblemRecord(payload.problemId);
        if (!client || !problemRecord || problemRecord.resolvedAt) {
            return;
        }

        problemRecord.resolvedAt = new Date();
        // trigger change detection on array
        client.problems = client.problems.concat([]);
    },

    deleteDraftProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        if (!client) {
            return;
        }
        client.problems = client.problems.filter(
            (problemRecord: ProblemRecord) => {
                return (
                    problemRecord.createdAt ||
                    problemRecord.id != payload.problemId
                );
            }
        );
    },

    updateNewOutcome(state, payload) {
        const problemRecord = store.getters.getProblemRecordById(payload);
        if (!problemRecord) {
            return;
        }

        let target: Outcome | Rating = problemRecord.editableOutcome;

        if (payload.ratingType) {
            target = (target as any)[payload.ratingType];
        }

        Object.assign(target, payload.changes);
    },

    saveNewProblemRecord(state, payload) {
        const problemRecord = store.getters.getProblemRecordById(payload);
        if (!problemRecord) {
            return;
        }

        const now = new Date();
        problemRecord.createdAt = now;
        (problemRecord.outcomes[0] || {}).createdAt = now;
    }
});
