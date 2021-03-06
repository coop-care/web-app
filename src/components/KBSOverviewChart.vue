<template>
  <div class="full-width non-selectable relative-position">
    <canvas ref="canvas" :height="height"></canvas>
    <div class="text-subtitle2 text-weight-bold text-center">Evaluation aller Klienten</div>
    <div
      v-for="(dataset, index) in randomData"
      :key="dataset.label"
      class="row"
    >
      <div :class="['col text-right text-weight-medium', 'text-' + colors[index]]">{{dataset.label}}</div>
      <div class="col q-pl-sm text-left">{{ legend(dataset.data) }}</div>
    </div>
    <div class="row">
      <div class="col text-right text-caption"></div>
      <div class="col q-pl-sm text-left text-caption">{{ date }}</div>
    </div>
  </div>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Component, Prop, Ref, Watch, Vue } from "vue-property-decorator";
import { Chart, ChartOptions, ChartData, ChartDataSets, ChartTooltipModel } from "chart.js";
import { getColor } from "../helper/color";

@Component
export default class KBSOverviewChart extends Vue {
  @Prop({type: Array, default: () => []}) readonly labels!: string[];
  @Prop({type: Array, default: () => []}) readonly dates!: Date[];
  @Prop({type: Object, default: () => ({})}) readonly chartOptions!: ChartOptions;
  @Prop({type: Object, default: () => ({})}) readonly chartData!: ChartData;
  @Prop({type: Array, default: () => []}) readonly datasets!: number[][];
  @Prop({type: Number, default: 150}) readonly height!: number;
  @Ref() readonly canvas!: HTMLCanvasElement;

  _chart: Chart | null = null;
  hoverIndex = -1;

  @Watch("chartData")
  onChartDataChanged() {
    if (this.chart) {
      this.chart.data = this.actualChartData;
      this.chart.update();
    }
  }

  get chart() {
    if (!this._chart) {
      this._chart = new Chart(this.canvas, {
        type: "line",
        data: this.actualChartData,
        options: this.options
      });
    }
    return this._chart;
  }

  get options(): ChartOptions {
    return {
      responsive: true,
      legend: {
        display: false,
      },
      layout: {
        padding: {
          right: 6,
        }
      },
      scales: {
        xAxes: [{
          type: "time",
          distribution: "series",
          gridLines: {
            display: false
          },
          ticks: {
            display: false
          }
        }],
        yAxes: [{
          ticks: {
            min: 1,
            max: 5,
            stepSize: 1
          }
        }]
      },
      tooltips: {
        enabled: false,
        mode: "index",
        intersect: false,
        custom: this.onTooltip
      },
      hover: {
        mode: "index",
        intersect: false
      },
      onResize: this.onResize
    }
  }
  get datasetOptions(): ChartDataSets {
    return {
      fill: false,
      spanGaps: true,
      cubicInterpolationMode: "monotone",
      pointHoverRadius: 5,
      pointRadius: 0,
    }
  }
  get actualChartData(): ChartData {
    return {
      labels: this.dates,
      datasets: this.randomData.map(item => ({
        ...item,
        ...this.datasetOptions
      }))
    }
  }
  get colors() {
    return ["classification", "intervention", "outcome"];
  }
  get colorValues() {
    return this.colors.map(name => getColor(name) || "#cccccc");
  }
  get legend() {
    return (values: number[]) => {
      const locale = this.$root.$i18n.locale;
      const options = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

      if (this.hoverIndex < 0) {
        const delta = values[values.length - 1] - values[0];
        const sign = delta >= 0 ? "+" : "-";
        return sign + delta.toLocaleString(locale, options);
      } else {
        return values[this.hoverIndex].toLocaleString(locale, options);
      }
    }
  }
  get date() {
    return this.hoverIndex >= 0
      ? this.dates[this.hoverIndex].toLocaleDateString(this.$root.$i18n.locale)
      : "";
  }
  get context() {
    return this.canvas.getContext("2d");
  }
  get randomData() {
    return this.labels.map((label, index) => {
      const data = [this.random(), this.random()].sort();
      return {
        label,
        data,
        borderColor: this.colorValues[index],
        backgroundColor: this.colorValues[index],
      }
    });
  }

  onResize() {
    const datasets = this.chart?.data.datasets;

    if (datasets && datasets[0]) {
      this.chart?.update();
    }
  }
  onTooltip(tooltip: ChartTooltipModel) {
    if (tooltip.dataPoints?.length) {
      this.hoverIndex = tooltip.dataPoints[0].index || 0;
    } else {
      this.hoverIndex = -1;
    }
  }
  random() {
    return 2 + 2 * Math.random();
  }

  mounted () {
    this.onChartDataChanged();
  }
}
</script>