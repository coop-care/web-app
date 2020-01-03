import { createMutations } from "direct-vuex";
import { store, StoreState, generateId } from ".";
import { Customer, ProblemRecord, CoreCustomer } from "../helper/coreTypes";
import Tree from "../helper/tree";

export default createMutations<StoreState>()({
    setCustomer(state, customer: Customer | null | undefined) {
        if (customer) state.selectedCustomer = customer;
        else state.selectedCustomer = null;
    },

    createProblemRecord(state, payload) {
        let customer: Customer | undefined = store.getters.getCustomer(payload);
        if (!customer) {
            return;
        }
        let problemRecord: ProblemRecord = {
            id: generateId(),
            assessment: [],
            problem: {
                id: "",
                scope: 0,
                severity: 2,
                signsAndSymptoms: [],
                details: "",
                isHighPriority: true,
                priorityDetails: ""
            },
            interventions: [],
            outcomes: [],
            createdAt: undefined,
            resolvedAt: undefined,
            ratingIntervalInDays: 28
        };
        customer.problems.push(problemRecord);
    },

    updateProblemRecord(state, payload) {
        let problemRecord = store.getters.getProblemRecordById(payload);
        if (!problemRecord) {
            return;
        }
        Tree.deepAssign(problemRecord, payload.path.split("."), payload.value);
        if (["problem.id", "problem.severity"].includes(payload.path)) {
            problemRecord.problem.signsAndSymptoms = [];
            problemRecord.problem.details = "";
        }
    },

    prioritizeProblemRecord(state, payload) {
        let problemRecord = store.getters.getProblemRecordById(payload);
        if (!problemRecord) {
            return;
        }

        let customer: Customer | undefined = store.getters.getCustomer(payload);
        if (!customer) {
            return;
        }

        let newProblemRecord = JSON.parse(JSON.stringify(problemRecord));
        newProblemRecord.id = generateId();
        newProblemRecord.createdAt = undefined;
        newProblemRecord.problem.isHighPriority = true;
        newProblemRecord.problem.priorityDetails = "";
        customer.problems.push(newProblemRecord);

        problemRecord.resolvedAt = new Date();
    },

    deleteDraftProblemRecord(state, payload) {
        let customer = store.getters.getCustomer(payload);
        if (!customer) {
            return;
        }
        customer.problems = customer.problems.filter(
            (problemRecord: ProblemRecord) => {
                return (
                    problemRecord.createdAt ||
                    problemRecord.id != payload.problemId
                );
            }
        );
    },

    updateNewOutcome(state, payload) {
        let problemRecord = store.getters.getProblemRecordById(payload);

        if (!problemRecord) {
            return;
        }

        let outcome = problemRecord.outcomes[problemRecord.outcomes.length - 1];

        if (!outcome || outcome.createdAt) {
            let defaultValue = outcome || {
                status: {},
                knowledge: {},
                behaviour: {}
            };
            outcome = {
                createdAt: undefined,
                knowledge: {
                    observation: defaultValue.knowledge.observation || 0,
                    expectation: defaultValue.knowledge.expectation || 0,
                    comment: ""
                },
                behaviour: {
                    observation: defaultValue.behaviour.observation || 0,
                    expectation: defaultValue.behaviour.expectation || 0,
                    comment: ""
                },
                status: {
                    observation: defaultValue.status.observation || 0,
                    expectation: defaultValue.status.expectation || 0,
                    comment: ""
                },
                personRatedInPlaceOfOwner:
                    defaultValue.personRatedInPlaceOfOwner || ""
            };
            problemRecord.outcomes.push(outcome);
        }
        Tree.deepAssign(outcome, payload.path.split("."), payload.value);
    },

    saveNewProblemRecord(state, payload) {
        let problemRecord = store.getters.getProblemRecordById(payload);

        if (!problemRecord) {
            return;
        }

        let now = new Date();
        problemRecord.createdAt = now;
        (problemRecord.outcomes[0] || {}).createdAt = now;
        problemRecord.interventions.forEach(intervention => {
            intervention.startedAt = now;
        });
    },

    customers(state, customers: CoreCustomer[]) {
        state.customers = customers;
    },

    isLoadingCustomer(state, isLoading: boolean) {
        state.isLoadingCustomer = isLoading;
    },

    isLoadingCustomerList(state, isLoading: boolean) {
        state.isLoadingCustomerList = isLoading;
    }
});
