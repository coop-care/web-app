import Vue from "vue";
import Vuex from "vuex";
import Tree from "../helper/tree";
import TerminologyData, {
  Terminology,
  HasTitleCode
} from "../helper/terminology";
import { Download } from "../helper/download";
import sampleData from "../data/sample1";
import ApexCharts from "apexcharts";

Vue.use(Vuex);

export interface Term {
  id: string;
  title?: string;
  description?: string;
}
export interface Customer extends Term {
  name: string;
  problems: ProblemRecord[];
  createdAt: Date;
  leftAt?: Date;
}
export interface ProblemRecord {
  assessment: Note[];
  problem: Problem;
  interventions: Intervention[];
  outcomes: Outcome[];
  createdAt: Date | undefined;
  resolvedAt: Date | undefined;
  ratingIntervalInDays: number;
}
export interface Problem extends Term {
  scope: number;
  severity: number;
  signsAndSymptoms: Term[];
  otherSignsAndSymptoms: string;
  details: string;
  isHighPriority: boolean;
  lowPriorityReason: string;
  titles?: ProblemTextExtension;
  descriptions?: ProblemTextExtension;
}
export interface ProblemTextExtension {
  scope: string;
  severity: string;
  priorityKey: string;
}
export interface Intervention {
  category: Term;
  target: Term;
  details: Note[];
  startedAt: Date | undefined;
  endedAt: Date | undefined;
}
export interface Outcome {
  createdAt: Date | undefined;
  knowledge: Rating;
  behaviour: Rating;
  status: Rating;
  personRatedInPlaceOfOwner: string;
}
export interface Rating {
  observation: number;
  expectation: number;
  comment: string;
  title?: string;
  description?: string;
}
export interface Note {
  text: string;
  createdAt: Date;
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      customers: sampleData,
      selectedCustomerId: ""
    },
    getters: {
      getCustomerById: state => (payload: any): Customer | undefined => {
        let customer = state.customers.find(
          customer => customer.id === payload.customerId
        );

        if (customer && payload.terminology) {
          customer.problems = TerminologyData.mergeProblemRecordsAndTerminology(
            customer.problems,
            payload.terminology
          );
        }

        return customer;
      },
      getProblemRecordById: state => (
        payload: any
      ): ProblemRecord | undefined => {
        let customer = Store.getters.getCustomerById(payload) as
          | Customer
          | undefined;
        if (!customer) {
          return;
        }

        let problemRecord = customer.problems[payload.problemIndex];

        if (problemRecord && payload.terminology) {
          return TerminologyData.mergeProblemRecordsAndTerminology(
            [problemRecord],
            payload.terminology
          )[0];
        } else {
          return problemRecord;
        }
      },
      getOutcomeAsChartData: state => (payload: any): any[] => {
        let problemRecord = Store.getters.getProblemRecordById(
          payload
        ) as ProblemRecord;

        if (
          !problemRecord ||
          !payload.ratings ||
          !problemRecord.createdAt ||
          !problemRecord.outcomes.length
        ) {
          return [];
        }

        // clone array because original needs to be preserved
        let outcomes = problemRecord.outcomes.concat([]);

        if (outcomes.length == 1) {
          let clone = JSON.parse(JSON.stringify(outcomes[0]));
          outcomes.push(clone);
        }

        return ["knowledge", "behaviour", "status"].map((key, index) => {
          let series = [
            {
              name: payload.ratings[index].title,
              data: outcomes
                .filter((outcome: Outcome) => outcome.createdAt)
                .map((outcome: Outcome) => {
                  let value = (outcome as any)[key];
                  return {
                    x: outcome.createdAt,
                    y: value.observation,
                    comment: value.comment
                  };
                })
            },
            {
              name: payload.expectation,
              data: outcomes.map((outcome: any) => {
                let value = outcome[key];
                return {
                  x: outcome.createdAt || new Date(),
                  y: value.expectation
                };
              })
            }
          ];

          let group = [
            "summary",
            payload.customerId,
            payload.problemIndex
          ].join(".");
          let id = [group, key].join(".");

          let options = {
            chart: {
              id: id,
              group: group,
              events: {
                mounted: (chartContext: any, config: any) => {
                  chartContext.updateOptions({}, true, true, false);
                  ApexCharts.exec(id, "render", {});
                },
                mouseMove: (
                  event: MouseEvent,
                  chartContext: any,
                  config: any
                ) => {}
              },
              toolbar: {
                show: false
              },
              sparkline: {
                enabled: false
              },
              zoom: {
                enabled: false
              }
            },
            dataLabels: {
              enabled: false
            },
            legend: {
              show: false
            },
            stroke: {
              curve: "smooth",
              width: 2
            },
            tooltip: {
              enabled: true,
              shared: true,
              fixed: {
                enabled: false
              },
              y: {
                formatter: (
                  value: any,
                  { series, seriesIndex, dataPointIndex, w }: any
                ) => {
                  let comment =
                    w.config.series[seriesIndex].data[dataPointIndex].comment;
                  if (false) {
                    return "" + value + ": " + comment;
                  } else {
                    return value;
                  }
                }
              }
            },
            xaxis: {
              labels: {
                show: false
              },
              type: "datetime"
            },
            yaxis: {
              min: 1,
              max: 5,
              opposite: true,
              forceNiceScale: true,
              labels: {
                minWidth: 1,
                formatter: (value: number) => value
              }
            }
          };

          return {
            series: series,
            options: options,
            title: payload.ratings[index].title
          };
        });
      },

      symptomsForProblemCode: state => ({
        problemCode,
        terminology
      }: {
        problemCode: string;
        terminology: Terminology;
      }): any[] => {
        let problemTerminology = TerminologyData.flattenedProblems(
          terminology
        ).find(problem => problem.code == problemCode);

        if (!problemTerminology) {
          return [];
        }
        return problemTerminology.signsAndSymptoms.map(symptom => {
          return { label: symptom.title, value: symptom.code };
        });
      },
      otherSymptomForProblemCode: state => (payload: any) => {
        let symptoms = Store.getters.symptomsForProblemCode(
          payload
        ) as HasTitleCode[];
        return symptoms[symptoms.length - 1];
      }
    },
    mutations: {
      addCustomer(state, { name }) {
        let id = Math.random()
          .toString(36)
          .substring(2, 10);
        let customer = {
          id: id,
          name: name,
          problems: [],
          createdAt: new Date()
        };
        state.customers.push(customer);
        state.selectedCustomerId = id;
      },
      selectCustomer(state, customer: Customer) {
        state.selectedCustomerId = customer.id;
      },
      editCustomer(state, payload: Customer) {
        let customer = Store.getters.getCustomerById(payload) as Customer;

        if (!customer) {
          return;
        }

        for (let [key, value] of Object.entries(payload)) {
          if (["name"].includes(key)) {
            (customer as any)[key] = value;
          }
        }
      },
      createProblemRecord(state, payload) {
        let customer: Customer = Store.getters.getCustomerById(payload);

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
            details: "",
            isHighPriority: true,
            lowPriorityReason: ""
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
        let problemRecord = Store.getters.getProblemRecordById(
          payload
        ) as ProblemRecord;

        if (!problemRecord) {
          return;
        }

        Tree.deepAssign(problemRecord, payload.path.split("."), payload.value);

        if (["problem.id", "problem.severity"].includes(payload.path)) {
          problemRecord.problem.signsAndSymptoms = [];
          problemRecord.problem.otherSignsAndSymptoms = "";
        }
      },
      deleteDraftProblemRecord(state, payload) {
        let customer: Customer = Store.getters.getCustomerById(payload);

        if (!customer) {
          return;
        }

        customer.problems = customer.problems.filter(
          (problemRecord: ProblemRecord, index: number) => {
            return problemRecord.createdAt || index != payload.problemIndex;
          }
        );
      },
      updateNewOutcome(state, payload) {
        let problemRecord = Store.getters.getProblemRecordById(
          payload
        ) as ProblemRecord;

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
        let problemRecord = Store.getters.getProblemRecordById(
          payload
        ) as ProblemRecord;

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
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV === "true"
  });

  // @ts-ignore
  window.download = () => {
    Download.ts(Store.state.customers, "sample1.ts");
  };

  return Store;
}
