import { defineMutations } from "direct-vuex";
import { store, StoreState } from ".";
import {
    Client,
    ProblemRecord,
    Reminder,
    Outcome,
    Rating,
    Task,
    Occurrence,
    ChangeRecord,
    Problem,
    ChangeRecordType
} from "../models";
import { classToPlain, ClassTransformOptions } from "class-transformer";

type Updatable<T> = {
    target: T;
    changes: Partial<T>;
    clientId?: string;
    problemId?: string;
};

const excludeForChangeRecord: ClassTransformOptions = {
    excludePrefixes: [
        ((key: keyof Problem | keyof Reminder | keyof Outcome) => key)(
            "occurrences"
        )
    ]
};

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

    updateObject<T>(
        state: StoreState,
        { target, changes, clientId, problemId }: Updatable<T>
    ) {
        const newValues: Record<string, any> = {};
        const oldValues: Record<string, any> = {};

        Object.keys(changes).forEach(key => {
            if ((target as any)[key] !== (changes as any)[key]) {
                newValues[key] = (changes as any)[key];
                oldValues[key] = (target as any)[key];
                (target as any)[key] = (changes as any)[key];
            }
        });

        const client = store.getters.getClient({ clientId: clientId });

        if (client && problemId && target instanceof Problem) {
            const problemRecord = client.findProblemRecord(problemId);
            if (problemRecord && problemRecord.createdAt) {
                client.changeHistory.push(
                    new ChangeRecord(
                        state.signature,
                        "ProblemModified",
                        problemId,
                        newValues,
                        oldValues
                    )
                );
            }
        }
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

    addToClientHistory(
        state,
        {
            clientId,
            problemId,
            changeType,
            newInstance,
            oldInstance
        }: {
            clientId: string;
            problemId: string;
            changeType: ChangeRecordType;
            newInstance: Problem | Reminder | Outcome;
            oldInstance?: Problem | Reminder | Outcome;
        }
    ) {
        const client = store.getters.getClient({ clientId: clientId });
        client?.changeHistory.push(
            new ChangeRecord(
                state.signature,
                changeType,
                problemId,
                classToPlain(newInstance, excludeForChangeRecord),
                classToPlain(oldInstance, excludeForChangeRecord)
            )
        );
    },

    toggleTaskCompletion(
        state,
        {
            task,
            isCompleted,
            date,
            client
        }: { task: Task; isCompleted: boolean; date: Date; client: Client }
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
                occurence.user = state.signature;
            }
        } else {
            task.reminder.occurrences = completedAt
                ? [new Occurrence(completedAt, completedAt, state.signature)]
                : [];
        }

        store.commit.setReminderCompletedAt({
            reminder: task.reminder,
            completedAt: completedAt,
            client: client,
            problemId: task.problemId
        });
    },

    setReminderCompletedAt(
        state,
        {
            reminder,
            completedAt,
            recalculateOccurences,
            client,
            problemId
        }: {
            reminder: Reminder;
            completedAt?: Date;
            recalculateOccurences?: boolean;
            client: Client;
            problemId: string;
        }
    ) {
        const wasCompletedAt = reminder.completedAt;

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

        if (reminder.completedAt != wasCompletedAt) {
            const type = reminder.completedAt
                ? "InterventionEnded"
                : "InterventionStarted";
            client.changeHistory.push(
                new ChangeRecord(
                    state.signature,
                    type,
                    problemId,
                    classToPlain(reminder, excludeForChangeRecord)
                )
            );
        }
    },

    prioritizeProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        const problemRecord = client?.findProblemRecord(payload.problemId);
        if (!client || !problemRecord) {
            return;
        }

        const newProblemRecord = problemRecord.prioritizedClone();
        client.problems.push(newProblemRecord);
        problemRecord.resolvedAt = new Date();

        client.changeHistory.push(
            new ChangeRecord(
                state.signature,
                "ProblemResolved",
                problemRecord.id,
                classToPlain(problemRecord.problem)
            )
        );
    },

    dismissProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        const problemRecord = client?.findProblemRecord(payload.problemId);
        if (!client || !problemRecord || problemRecord.resolvedAt) {
            return;
        }

        problemRecord.resolvedAt = new Date();
        client?.changeHistory.push(
            new ChangeRecord(
                state.signature,
                "ProblemResolved",
                problemRecord.id,
                classToPlain(problemRecord.problem)
            )
        );

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

        if (payload.changes.createdAt) {
            store.getters
                .getClient(payload)
                ?.changeHistory.push(
                    new ChangeRecord(
                        state.signature,
                        "OutcomeRated",
                        problemRecord.id,
                        classToPlain(target)
                    )
                );
        }
    },

    saveNewProblemRecord(state, payload) {
        const client = store.getters.getClient(payload);
        const problemRecord = client?.findProblemRecord(payload.problemId);
        if (!problemRecord) {
            return;
        }

        const now = new Date();
        problemRecord.createdAt = now;

        client?.changeHistory.push(
            new ChangeRecord(
                state.signature,
                "ProblemCreated",
                problemRecord.id,
                classToPlain(problemRecord.problem)
            )
        );

        const outcome = problemRecord.outcomes[0];
        if (outcome) {
            outcome.createdAt = now;
            outcome.user = state.signature;
            client?.changeHistory.push(
                new ChangeRecord(
                    state.signature,
                    "OutcomeRated",
                    problemRecord.id,
                    classToPlain(outcome)
                )
            );
        }

        problemRecord.interventions.forEach(intervention =>
            client?.changeHistory.push(
                new ChangeRecord(
                    state.signature,
                    "InterventionStarted",
                    problemRecord.id,
                    classToPlain(intervention, excludeForChangeRecord)
                )
            )
        );
    },

    setSignature(state, { signature }: { signature: string }) {
        window.localStorage.setItem("signature", signature);
        state.signature = signature;
    }
});
