import { defineMutations } from "direct-vuex";
import { store, StoreState } from ".";
import {
    Client,
    ProblemRecord,
    Reminder,
    Outcome,
    Rating,
    Task,
    Occurrence
} from "../models";

type Updatable<T> = { target: T; changes: Partial<T> };

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

    updateObject<T>(state: StoreState, { target, changes }: Updatable<T>) {
        // maybe check for each key if new value is really differs first? And consider array equality at least for empty arrays?
        Object.assign(target, changes);
    },

    updateReminder(
        state: StoreState,
        payload: {
            target: Reminder;
            changes: Partial<Reminder>;
            updateFrom?: Date;
        }
    ) {
        store.commit.updateObject(payload);

        if (
            ((key: keyof Reminder) => key)("recurrenceRules") in payload.changes
        ) {
            payload.target.recalculateOccurencesAfterUpdate(payload.updateFrom);
        }
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
                new Date(date).setHours(
                    now.getHours(),
                    now.getMinutes(),
                    now.getSeconds(),
                    now.getMilliseconds()
                )
            );
        }

        if (task.reminder.isScheduled) {
            const occurence = task.reminder.occurrences.find(
                item => item.due.getTime() == task.due?.getTime()
            );

            if (occurence) {
                occurence.completed = completedAt;
            }
        } else {
            task.reminder.occurrences = completedAt
                ? [new Occurrence(completedAt, completedAt)]
                : [];
        }

        store.commit.setReminderCompletedAt({
            reminder: task.reminder,
            completedAt: completedAt
        });
    },

    setReminderCompletedAt(
        state,
        {
            reminder,
            completedAt,
            recalculateOccurences
        }: {
            reminder: Reminder;
            completedAt?: Date;
            recalculateOccurences?: boolean;
        }
    ) {
        if (reminder.isScheduled) {
            const hasUncompleted =
                reminder.occurrences.filter(
                    item =>
                        !item.completed &&
                        (!completedAt ||
                            item.due.getTime() <= completedAt?.getTime())
                ).length > 0;
            const date = reminder.lastOccurrenceDate;

            if (!hasUncompleted && !reminder.recurrenceRules?.hasNext(date)) {
                reminder.completedAt = completedAt;
            } else {
                reminder.completedAt = undefined;
            }

            if (recalculateOccurences) {
                reminder.recalculateOccurencesAfterUpdate(completedAt);
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
