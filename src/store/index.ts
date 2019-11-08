import Vue from "vue";
import Vuex from "vuex";
import Tree from "../helper/tree";

Vue.use(Vuex);

interface Customer {
  id: string;
  name: string;
  problems: ProblemRecord[];
}
interface ProblemRecord {
  assessment: Note[];
  problem: Problem;
  interventions: Intervention[];
  outcomes: Outcome[];
  created: Date | undefined;
  resolved: Date | undefined;
  ratingIntervalInDays: number;
}
interface Problem {
  id: string;
  scope: number;
  severity: number;
  signsAndSymptoms: string[];
  otherSignsAndSymptoms: string;
  details: string;
}
interface Intervention {
  id: string;
  details: Note[];
  started: Date;
  ended: Date | undefined;
}
interface Outcome {
  created: Date;
  observation: Rating;
  expectation: Rating;
  ratedWhoInsteadOfOwner: string;
  comment: string;
}
interface Rating {
  status: number;
  knowledge: number;
  behaviour: number;
}
interface Note {
  text: string;
  created: Date;
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      customers: [] as Customer[],
      selectedCustomerId: ""
    },
    getters: {
      getCustomerById: state => (id: string) => {
        return state.customers.filter(customer => customer.id === id)[0];
      },
      getProblemRecordById: state => ({
        customerId,
        problemIndex
      }: {
        customerId: string;
        problemIndex: number;
      }) => {
        let customer = Store.getters.getCustomerById(customerId);
        if (!customer) {
          return;
        }

        return customer.problems[problemIndex];
      }
    },
    mutations: {
      addCustomer(state, { name }) {
        let id = Math.random()
          .toString(36)
          .substring(2, 10);
        let customer = { id: id, name: name, problems: [] };
        state.customers.push(customer);
        state.selectedCustomerId = id;
      },
      selectCustomer(state, customer: Customer) {
        state.selectedCustomerId = customer.id;
      },
      editCustomer(state, payload: Customer) {
        let customer = Store.getters.getCustomerById(payload.id);
        if (!customer) {
          return;
        }

        for (let [key, value] of Object.entries(payload)) {
          if (["name"].includes(key)) {
            (customer as any)[key] = value;
          }
        }
      },
      createProblemRecord(state, { customerId }: { customerId: number }) {
        let customer: Customer = Store.getters.getCustomerById(customerId);
        if (!customer) {
          return;
        }

        let problemRecord: ProblemRecord = {
          assessment: [],
          problem: {
            id: "",
            scope: 0,
            severity: 2,
            signsAndSymptoms: [],
            otherSignsAndSymptoms: "",
            details: ""
          },
          interventions: [],
          outcomes: [],
          created: undefined,
          resolved: undefined,
          ratingIntervalInDays: 28
        };
        customer.problems.push(problemRecord);
      },
      updateProblemRecord(state, payload) {
        let problemRecord = Store.getters.getProblemRecordById(payload);
        if (!problemRecord) {
          return;
        }

        Tree.deepAssign(problemRecord, payload.path.split("."), payload.value);

        if (["problem.id", "problem.severity"].includes(payload.path)) {
          problemRecord.problem.signsAndSymptoms = [];
          problemRecord.problem.otherSignsAndSymptoms = "";
        }
      },
      addOutcome(state, payload) {
        let customer = state.customers[payload.customerId];
        if (!customer) {
          return;
        }

        let problem = customer.problems[payload.problemId];
        if (!problem) {
          return;
        }

        problem.outcomes.push(payload.outcome);
      }
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV === "true"
  });

  return Store;
}
