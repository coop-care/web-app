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
import { colors } from "quasar";
import { format } from "timeago.js";

const { getBrand, setBrand } = colors;

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
  id: string;
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
  details: string;
  isHighPriority: boolean;
  priorityDetails: string;
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

const selcust: Customer | null = null;

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      customers: sampleData,
      selectedCustomerId: "",
      selectedCustomer: selcust,
    },
    getters: {
      getCustomer: state => (payload: any): Customer | undefined => {
        let customer = state.selectedCustomer;

        if (customer && payload.terminology) {
          customer.problems = TerminologyData.mergeProblemRecordsAndTerminology(
            customer.problems,
            payload.terminology
          );
        }
        
        if (customer) return customer
        else return undefined;
      },
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
        let customer = Store.getters.getCustomer(payload) as
          | Customer
          | undefined;
        if (!customer) {
          return;
        }

        let problemRecord = customer.problems.find(
          problemRecord => problemRecord.id === payload.problemId
        );

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

          let group = ["summary", payload.customerId, payload.problemId].join(
            "."
          );
          let id = [group, key].join(".");

          let options: any = {
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
              custom: () => {
                return "";
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

          options = {
            chart: {
              id: id,
              group: group,
              sparkline: {
                enabled: true
              },
              events: {
                mounted: (chartContext: any, config: any) => {
                  chartContext.updateOptions({}, true, true, false);
                  ApexCharts.exec(id, "render", {});
                }
              }
            },
            colors: [getBrand("outcome"), getBrand("outcome")],
            grid: {
              show: true,
              padding: {
                top: 5,
                left: 5,
                right: 5,
                bottom: 5
              }
            },
            fill: {
              colors: [getBrand("outcome"), "#ffffff"],
              opacity: 0,
              type: ["gradient", "solid"],
              gradient: {
                shadeIntensity: 1
              }
            },
            stroke: {
              curve: "smooth",
              width: 3,
              dashArray: [0, 5]
            },
            tooltip: {
              custom: () => {
                return "";
              }
            },
            xaxis: {
              type: "datetime",
              axisTicks: {
                show: false
              },
              tooltip: {
                enabled: true,
                offsetY: -35,
                formatter: function(val: number, opts: any) {
                  return format(val, payload.locale);
                }
              }
            },
            yaxis: {
              min: 1,
              max: 5,
              forceNiceScale: true,
              labels: {
                minWidth: 1
              }
            }
          };

          let lastObservation = series[0].data[series[0].data.length - 1];
          let lastExpectation =
            ((series[1] || {}).data || [])[series[1].data.length - 1] || {};
          let lastObservationTitle =
            payload.ratings[index].scale[lastObservation.y - 1].title;
          let lastExpectationText = lastExpectation.y
            ? " / " + lastExpectation.y
            : "";
          let title =
            payload.ratings[index].title +
            " " +
            lastObservation.y +
            lastExpectationText;
          let subtitle = lastObservationTitle;

          return {
            series: series,
            options: options,
            title: title,
            subtitle: subtitle,
            //@ts-ignore
            comment: lastObservation.comment
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
        let id = generateId();
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
      setCustomer(state, customer: Customer) {
        state.selectedCustomer = customer;
        // @ts-ignore
        state.selectedCustomerId = customer._id;
      },
      editCustomer(state, payload: Customer) {
        let customer = Store.getters.getCustomer(payload) as Customer;

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
        let customer: Customer = Store.getters.getCustomer(payload);

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
        let problemRecord = Store.getters.getProblemRecordById(
          payload
        ) as ProblemRecord;

        if (!problemRecord) {
          return;
        }

        Tree.deepAssign(problemRecord, payload.path.split("."), payload.value);

        if (["problem.id", "problem.severity"].includes(payload.path)) {
          problemRecord.problem.signsAndSymptoms = [];
          problemRecord.problem.details = "";
        }
      },
      deleteDraftProblemRecord(state, payload) {
        let customer: Customer = Store.getters.getCustomer(payload);

        if (!customer) {
          return;
        }

        customer.problems = customer.problems.filter(
          (problemRecord: ProblemRecord) => {
            return (
              problemRecord.createdAt || problemRecord.id != payload.problemId
            );
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

  function generateId() {
    return Math.random()
      .toString(36)
      .substring(2, 10);
  }

  setBrand("classification", "#f44336");
  setBrand("outcome", "#009688");
  setBrand("intervention", "#ff6f00");

  // @ts-ignore
  window.download = () => {
    Download.ts(Store.state.customers, "sample1.ts");
  };

  return Store;
}
