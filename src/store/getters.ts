import { createGetters } from "direct-vuex";
import { store, StoreState } from ".";
import { Customer, ProblemRecord, Outcome, CoreCustomer } from "../helper/coreTypes";
import TerminologyData, {
    Terminology,
    HasTitleCode
} from "../helper/terminology";
import { format } from "timeago.js";
import { colors } from "quasar";
import ApexCharts from "apexcharts";


const { getBrand } = colors;

export default createGetters<StoreState>()({

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

    getProblemRecordById: state => (payload: any): ProblemRecord | undefined => {
        let customer = store.getters.getCustomer(payload);
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
        let problemRecord = store.getters.getProblemRecordById(payload);

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
        let symptoms = store.getters.symptomsForProblemCode(
        payload
        ) as HasTitleCode[];
        return symptoms[symptoms.length - 1];
    },

})