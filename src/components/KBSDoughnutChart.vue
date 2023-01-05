<template>
  <div class="full-width non-selectable">
    <div class="relative-position" @mouseout="onTooltip">
      <canvas ref="canvas" :height="height"></canvas>
      <div class="doughnutchart-caption text-body2 column justify-center no-wrap">
        <div :class="['keyfigure', 'text-' + colors[hoverIndex]]">
          <span class="">{{ keyFigure }}</span> %
        </div>
        <simplified-markdown
          :text="description"
        />
        <div class="text-subtitle1 text-weight-bold text-center">{{ title }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.doughnutchart-caption
  pointer-events: none
  position: absolute
  top: 12%
  bottom: 8%
  left: 15%
  right: 15%
  border-radius: 50%
  text-align: center
  vertical-align: middle
  -webkit-print-color-adjust: exact
  container-type: inline-size
  &> *
    @container (max-width: 132px)
      line-height: 1rem
  .keyfigure
    margin-bottom: .2rem
    font-weight: bold
    font-size: 1.3rem
    span
      font-size: 2.6rem
      @container (max-width: 120px)
        font-size: 2rem
  &> span
    @container (max-width: 110px)
      font-size: 0.75rem
@media print
  .doughnutchart-caption
    font-size: .8rem
    line-height: 1.2rem
    .keyfigure
      margin-bottom: 0
      font-size: 1rem
      span
        font-size: 1.8rem
    .text-subtitle1
      font-size: .8rem
      line-height: inherit
</style>

<script lang="ts">
import { Component, Prop, Ref, Watch, Vue } from "vue-property-decorator";
import { Chart, ChartOptions, ChartData, ChartTooltipModel } from "chart.js";
import { getColor } from "../helper/color";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

export type ClientProgress = {
  ratio: number,
  change: number
}

@Component({
  components: {
    SimplifiedMarkdown
  }
})
export default class KBSDoughnutChart extends Vue {
  @Prop({type: Array, default: () => []}) readonly dataset!: ClientProgress[];
  @Prop({type: Object, default: () => ({})}) readonly chartOptions!: ChartOptions;
  @Prop({type: String, required: true}) readonly title!: string;
  @Prop({type: Number, default: 300}) readonly height!: number;
  @Ref() readonly canvas!: HTMLCanvasElement;

  _chart: Chart | null = null;
  hoverIndex = this.defaultHoverIndex;

  @Watch("dataset")
  onDatasetChanged() {
    if (this.chart) {
      this.chart.data = this.chartData;
      this.hoverIndex = this.defaultHoverIndex;
      this.chart.update();
    }
  }

  @Watch("chartOptions")
  onChartOptionsChanged() {
    if (this.chart) {
      this.chart.options = this.options;
      this.chart.update();
    }
  }

  get chart() {
    if (!this._chart) {
      this._chart = new Chart(this.canvas, {
        type: "doughnut",
        data: this.chartData,
        options: this.options
      });
    }
    return this._chart;
  }
  get options(): ChartOptions {
    return {
      responsive: true,
      legend: {
        display: false
      },
      tooltips: {
        enabled: false,
        custom: this.onTooltip
      },
      onResize: this.onResize,
      cutoutPercentage: 80,
    }
  }
  get chartData(): ChartData {
    return {
      labels: [new Date("2021-05-01"), new Date()],
      datasets: [{
        data: this.dataset.map(item => item.ratio),
        backgroundColor: this.colorValues,
        borderWidth: this.borderWidth,
      }]
    }
  }
  get colors() {
    return ["positive", "grey", "negative"];
  }
  get colorValues() {
    return this.colors.map(name => getColor(name) || "#cccccc");
  }
  get borderWidth() {
    return [0, 0, 0].map((_, index) => index == this.hoverIndex ? 0 : 5);
  }
  get keyFigure() {
    return Math.round(this.dataset[this.hoverIndex]?.ratio * 100);
  }
  get description() {
    const options = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    return [
      this.$t("clientRatioPositiveHealthChange", {value: this.$n(this.dataset[0]?.change, options)}) as string,
      this.$t("clientRatioNoHealthChange"),
      this.$t("clientRatioNegativeHealthChange", {value: this.$n(this.dataset[2]?.change, options)}) as string,
    ][this.hoverIndex]
  }
  get defaultHoverIndex() {
    return Math.max(this.dataset.findIndex(item => item.ratio > 0), 0);
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
      this.hoverIndex = this.defaultHoverIndex;
    }

    if (this.chart.data.datasets) {
      this.chart.data.datasets[0].borderWidth = this.borderWidth;
      this.chart?.update({duration: 500});
    }
  }

  mounted () {
    this.onDatasetChanged();
  }
}
</script>