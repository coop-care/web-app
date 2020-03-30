import { createGetters } from "direct-vuex";
import { store, StoreState } from ".";
import { Client } from "../models/client";
import { ProblemRecord } from "../models/problemRecord";
import { Outcome } from "../models/outcome";
import { format } from "timeago.js";
import { colors } from "quasar";
import ApexCharts from "apexcharts";

const { getBrand } = colors;

export default createGetters<StoreState>()({
    getClient: state => (payload: any): Client | undefined => {
        if (payload.clientId) {
            return state.clients.find(
                client => client._id?.equals(payload.clientId) || false
            );
        } else {
            return;
        }
    },

    getProblemRecordById: () => (payload: any): ProblemRecord | undefined => {
        return store.getters
            .getClient(payload)
            ?.findProblemRecord(payload.problemId);
    },

    getOutcomeAsChartData: () => (payload: any): any[] => {
        const problemRecord = store.getters.getProblemRecordById(payload);

        if (
            !problemRecord ||
            !payload.ratings ||
            !problemRecord.createdAt ||
            !problemRecord.outcomes.length
        ) {
            return [];
        }

        // clone array because original needs to be preserved
        const outcomes = problemRecord.outcomes
            .concat([])
            .filter(outcome => outcome.createdAt);

        if (outcomes.length == 1) {
            const clone = outcomes[0].clone();
            clone.createdAt = new Date(
                (clone.createdAt?.getTime() || 0) + 1000
            );
            outcomes.push(clone);
        }

        return ["knowledge", "behaviour", "status"].map((key, index) => {
            const series = [
                {
                    name: payload.ratings[index].title,
                    data: outcomes.map((outcome: Outcome) => {
                        const value = (outcome as any)[key];
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
                        const value = outcome[key];
                        return {
                            x: outcome.createdAt || new Date(),
                            y: value.expectation
                        };
                    })
                }
            ];

            const group = ["summary", payload.clientId, payload.problemId].join(
                "."
            );
            const id = [group, key].join(".");

            let options: any = {
                chart: {
                    id: id,
                    group: group,
                    events: {
                        mounted: (chartContext: any) => {
                            chartContext.updateOptions({}, true, true, false);
                            ApexCharts.exec(id, "render", {});
                        },
                        mouseMove: () => {}
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
                            { seriesIndex, dataPointIndex, w }: any
                        ) => {
                            const comment =
                                w.config.series[seriesIndex].data[
                                    dataPointIndex
                                ].comment;
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
                        mounted: (chartContext: any) => {
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
                        formatter: function(val: number) {
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

            const lastObservation = series[0].data[series[0].data.length - 1];

            if (lastObservation.y == 0) {
                return;
            }

            const lastExpectation =
                ((series[1] || {}).data || [])[series[1].data.length - 1] || {};
            const lastObservationTitle =
                payload.ratings[index].scale[lastObservation.y - 1].title;
            const lastExpectationText = lastExpectation.y
                ? " / " + lastExpectation.y
                : "";
            const title =
                payload.ratings[index].title +
                ": " +
                lastObservation.y +
                lastExpectationText;
            const subtitle = lastObservationTitle;

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

    getRouteParamsForLatestProblem: () => (payload: any): any => {
        const client = store.getters.getClient(payload);
        if (!client) {
            return {};
        }

        return {
            clientId: client._id,
            problemId: client.problems[client.problems.length - 1].id
        };
    }
});
