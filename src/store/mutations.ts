import { defineMutations } from "direct-vuex";
import { store, StateInterface } from ".";
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
    ChangeRecordType,
    User,
    Team,
    TeamMember,
    TeamInvitation
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

export default defineMutations<StateInterface>()({

    setCurrentUser(state, user?: User) {
        state.currentUser = user;
    },

    updateCurrentUser(state, updater: (user: User) => void) {
        if (state.currentUser) {
            updater(state.currentUser)
        }
    },

    setTeams(state, teams: Team[]) {
        state.teams = teams;
    },

    setTeam(state, updatedTeam: Team) {
        state.teams = state.teams.map(team => {
            if (team.equals(updatedTeam)) {
                return updatedTeam;
            } else {
                return team;
            }
        });
    },

    setTeamMembers(state, teamMembers: TeamMember[]) {
        state.teamMembers = state.teams
            .flatMap(team => team.alumni)
            .concat(teamMembers)
            .reduce((result: Record<string, TeamMember>, member) => {
                result[member.userId] = member
                return result;
            }, {});
    },

    updateTeamMember(state, teamMember: TeamMember) {
        const id = teamMember._id?.toHexString();
        if (id) {
            state.teamMembers[id] = teamMember;
        }
    },

    setClients(state, clients: Client[]) {
        state.clients = clients;
    },

    updateClient(state, updatedClient: Client) {
        state.clients = state.clients.map(client => {
            if (client.equals(updatedClient)) {
                return updatedClient;
            } else {
                return client;
            }
        });
    },

    isLoadingClientList(state, isLoading: boolean) {
        state.isLoadingClientList = isLoading;
    },

    setRedirectPath(state, redirectPath: string) {
        state.redirectPath = redirectPath;
    },

    calculateOccurrences(state, client: Client) {
        client.calculateOccurrences();
    },

    createProblemRecord(state, payload) {
        store.getters
            .getClient(payload)
            ?.problems.push(payload.problemRecord || new ProblemRecord());
    },

    updateObject<T>(
        state: StateInterface,
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
                        store.getters.userId,
                        "ProblemModified",
                        problemId,
                        newValues,
                        oldValues
                    )
                );
            }
        }
    },

    updateClientObject(
        state: StateInterface,
        payload: {
            target: Client;
            changes: Partial<Client>;
        }
    ) {
        store.commit.updateObject(payload);
    },

    updateReminder(
        state: StateInterface,
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
            payload.target.recalculateOccurrencesAfterUpdate(
                payload.updateFrom
            );
        }
    },

    acceptTeamInvitation(state, payload: TeamInvitation) {
        store.commit.updateObject({
            target: payload,
            changes: {
                acceptedAt: new Date()
            }
        });
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
                store.getters.userId,
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
            date = new Date(),
            client
        }: { task: Task<Reminder>; isCompleted: boolean; date?: Date; client: Client }
    ) {
        let completedAt: Date | undefined = undefined;

        if (isCompleted) {
            completedAt = date;
            task.completed = completedAt;
        }

        if (task.reminder.isScheduled) {
            const occurrence = task.reminder.occurrences.find(
                item => item.due.getTime() == task.due?.getTime()
            );

            if (occurrence) {
                occurrence.completed = completedAt;
                occurrence.user = store.getters.userId;
            }
        } else {
            task.reminder.occurrences = completedAt
                ? [
                    new Occurrence(
                        completedAt,
                        completedAt,
                        store.getters.userId
                    )
                ]
                : [];
        }

        store.commit.setReminderFinishedAt({
            reminder: task.reminder,
            finishedAt: completedAt,
            client: client,
            problemId: task.problemId
        });
    },

    setReminderFinishedAt(
        state,
        {
            reminder,
            finishedAt,
            recalculateOccurrences,
            client,
            problemId
        }: {
            reminder: Reminder;
            finishedAt?: Date;
            recalculateOccurrences?: boolean;
            client: Client;
            problemId?: string;
        }
    ) {
        const wasFinishedAt = reminder.finishedAt;

        if (reminder.isScheduled) {
            const hasUncompleted =
                reminder.occurrences.filter(
                    item =>
                        !item.completed &&
                        (!finishedAt ||
                            item.due.getTime() <= finishedAt?.getTime())
                ).length > 0;
            const date = reminder.lastOccurrenceDate;

            if (!hasUncompleted && !reminder.recurrenceRules?.hasNext(date)) {
                reminder.finishedAt = finishedAt;
            } else {
                reminder.finishedAt = undefined;
            }

            if (recalculateOccurrences) {
                reminder.recalculateOccurrencesAfterUpdate(finishedAt);
            }
        } else {
            reminder.finishedAt = finishedAt;
        }

        if (reminder.finishedAt != wasFinishedAt) {
            const type = reminder.finishedAt
                ? "InterventionEnded"
                : "InterventionStarted";
            client.changeHistory.push(
                new ChangeRecord(
                    store.getters.userId,
                    type,
                    problemId || "",
                    classToPlain(reminder, excludeForChangeRecord),
                    undefined,
                    reminder.finishedAt
                )
            );
        }
    },

    endReminder(state, { task, client }: { task: Task<Reminder>; client: Client }) {
        const due = task.due || new Date();
        const date = new Date(due.getTime() - 1);

        if (task.reminder.isRecurring) {
            const recurrenceRules = task.reminder.recurrenceRules?.endingRules(date);
            store.commit.updateReminder({
                target: task.reminder,
                changes: { recurrenceRules: recurrenceRules }
            });
        }

        store.commit.setReminderFinishedAt({
            reminder: task.reminder,
            finishedAt: date,
            recalculateOccurrences: true,
            client: client,
            problemId: task.problemId,
        });
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
                store.getters.userId,
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
                store.getters.userId,
                "ProblemResolved",
                problemRecord.id,
                classToPlain(problemRecord.problem)
            )
        );

        // trigger change detection on array
        client.problems = client.problems.concat([]);
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
                        store.getters.userId,
                        "OutcomeRated",
                        problemRecord.id,
                        classToPlain(target),
                        undefined,
                        payload.changes.createdAt
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

        const now = payload.now as Date || new Date();

        client?.changeHistory.push(
            new ChangeRecord(
                store.getters.userId,
                "ProblemCreated",
                problemRecord.id,
                classToPlain(problemRecord.problem),
                undefined,
                now
            )
        );

        const outcome = problemRecord.outcomes[0];
        if (outcome) {
            outcome.createdAt = now;
            outcome.user = store.getters.userId;
            client?.changeHistory.push(
                new ChangeRecord(
                    store.getters.userId,
                    "OutcomeRated",
                    problemRecord.id,
                    classToPlain(outcome),
                    undefined,
                    now
                )
            );
        }

        problemRecord.interventions.forEach(intervention => {
            intervention.createdAt = now;
            client?.changeHistory.push(
                new ChangeRecord(
                    store.getters.userId,
                    "InterventionStarted",
                    problemRecord.id,
                    classToPlain(intervention, excludeForChangeRecord),
                    undefined,
                    now
                )
            );
        });
    }
});
