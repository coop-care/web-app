<template>
  <div class="full-width non-selectable relative-position">
    <Line 
      ref="chart" 
      :data="chartData" 
      :options="options" 
      :height="height" 
      @mouseleave="hoverIndex = -1"
    />
    <div class="text-subtitle2 text-weight-bold text-center one-line">{{ title }}</div>
    <div :class="[dense ? 'row justify-around' : '']">
      <div
        v-for="(dataset, index) in formattedDatasets"
        :key="dataset.label"
        class="row"
      >
        <div :class="['text-right text-weight-medium', 'text-' + colors[index], dense ? '' : 'col']">{{dataset.label}}</div>
        <div :class="['text-left', dense ? 'q-pl-xs' : 'col q-pl-sm']">{{ legend(dataset.data) }}</div>
      </div>
    </div>
    <div
      v-if="!dense"
      class="row"
    >
      <div class="col text-right text-caption"></div>
      <div class="col q-pl-sm text-left text-caption">{{ date }}</div>
    </div>
    <div
      v-else
      class="text-center text-caption"
    >{{ date }}</div>
  </div>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { Chart, ChartOptions, ChartData, LineElement, PointElement, LineController, TimeSeriesScale, LinearScale, ChartEvent, ActiveElement } from "chart.js";
import { Line } from "vue-chartjs";
import { getColor } from "../helper/color";
import "chartjs-adapter-luxon";

Chart.register(LineController, LineElement, PointElement, TimeSeriesScale, LinearScale)

@Component({
  components: {
    Line
  }
})
export default class KBSOverviewChart extends Vue {
  @Prop({type: Array, default: () => []}) readonly labels!: string[];
  @Prop({type: Array, default: () => []}) readonly dates!: Date[];
  @Prop({type: Array, default: () => []}) readonly datasets!: number[][];
  @Prop({type: Object, default: () => ({})}) readonly chartOptions!: ChartOptions;
  @Prop({type: String, default: ""}) readonly title!: string;
  @Prop({ type: Boolean }) readonly dense!: boolean;
  @Prop({type: Number, default: 150}) readonly height!: number;

  hoverIndex = -1;

  get options() {
    return {
      responsive: true,
      scales: {
        x: {
          type: "timeseries",
          grid: {
            display: false
          },
          ticks: {
            display: false
          }
        },
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      },
      hover: {
        mode: "index",
        intersect: false
      },
      plugins: {
        tooltip: {
          enabled: false // there is a weird bug that shows tooltips when tooltip plugin was loaded by a different component
        }
      },
      onHover: (event: ChartEvent, elements: ActiveElement[]) =>{
        const element = elements?.[0];

        if (element?.element.active && element?.index != this.hoverIndex) {
          this.hoverIndex = element.index;
        }
      },
      ...this.chartOptions
    }
  }
  get chartData(): ChartData<"line"> {
    return {
      labels: this.duplicateSingleDate(this.dates),
      datasets: this.formattedDatasets.map(item => ({
        ...item,
        fill: false,
        spanGaps: true,
        cubicInterpolationMode: "monotone",
        pointHoverRadius: 5,
        pointRadius: 0,
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
      if (values.length == 0) {
        return "–"
      }
      const options = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

      if (this.hoverIndex < 0) {
        const delta = values[values.length - 1] - values[0];
        const sign = delta >= 0 ? "+" : "-";
        return sign + this.$n(delta, options);
      } else {
        return this.$n(values[this.hoverIndex], options);
      }
    }
  }
  get date() {
    return this.hoverIndex >= 0
      ? this.$d(this.duplicateSingleDate(this.dates)[this.hoverIndex])
      : " ";
  }
  get formattedDatasets() {
    return this.labels.map((label, index) => ({
      label,
      data: this.duplicateSingleValue(this.datasets[index] || []),
      borderColor: this.colorValues[index],
      backgroundColor: this.colorValues[index],
    }));
  }

  duplicateSingleValue(list: any[]) {
    return list.length == 1
      ? [list[0], list[0]]
      : list;
  }
  duplicateSingleDate(list: Date[]) {
    return list.length == 1 || (list.length == 2 && list[0].getTime() == list[1].getTime()) 
      ? [list[0], new Date(list[0].getTime() + 1)]
      : list;
  }
}
</script>