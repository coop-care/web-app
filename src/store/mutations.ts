import { createMutations } from "direct-vuex";
import { store, StoreState } from ".";
import { Customer } from "../models/customer";
import { ProblemRecord } from "../models/problemRecord";
import { Outcome } from "../models/outcome";
import { Rating } from "src/models/rating";

export default createMutations<StoreState>()({
    setCustomer(state, customer: Customer | undefined) {
        state.selectedCustomer = customer;
    },

    setCustomers(state, customers: Customer[]) {
        state.customers = customers;
    },

    isLoadingCustomer(state, isLoading: boolean) {
        state.isLoadingCustomer = isLoading;
    },

    isLoadingCustomerList(state, isLoading: boolean) {
        state.isLoadingCustomerList = isLoading;
    },

    createProblemRecord(state, payload) {
        store.getters.getCustomer(payload)?.problems.push(new ProblemRecord());
    },

    updateObject(
        state,
        { target, changes }: { target: any; changes: { [key: string]: any } }
    ) {
        Object.assign(target, changes);
    },

    prioritizeProblemRecord(state, payload) {
        let customer = store.getters.getCustomer(payload);
        let problemRecord = customer?.findProblemRecord(payload.problemId);
        if (!problemRecord) {
            return;
        }

        customer?.problems.push(problemRecord.prioritizedClone());
        problemRecord.resolvedAt = new Date();
    },

    dismissProblemRecord(state, payload) {
        let customer = store.getters.getCustomer(payload);
        let problemRecord = customer?.findProblemRecord(payload.problemId);
        if (!customer || !problemRecord || problemRecord.resolvedAt) {
            return;
        }

        problemRecord.resolvedAt = new Date();
        // trigger change detection on array
        customer.problems = customer.problems.concat([]);
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

        let target: Outcome | Rating = problemRecord.editableOutcome;

        if (payload.ratingType) {
            target = (target as any)[payload.ratingType];
        }

        Object.assign(target, payload.changes);
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
    }
});
