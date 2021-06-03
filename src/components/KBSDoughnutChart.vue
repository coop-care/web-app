<template>
  <div class="full-width non-selectable">
    <div class="relative-position" @mouseout="onTooltip">
      <canvas ref="canvas" :height="height"></canvas>
      <div class="doughnutchart-caption text-body2 column justify-center">
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
  top: 0
  bottom: 0
  left: 15%
  right: 15%
  border-radius: 50%
  text-align: center
  vertical-align:middle
  .keyfigure
    margin-bottom: .2rem
    font-weight: bold
    font-size: 1.3rem
    span
      font-size: 2.6rem
</style>

<script lang="ts">
import { Component, Prop, Ref, Watch, Vue } from "vue-property-decorator";
import { Chart, ChartOptions, ChartData, ChartTooltipModel } from "chart.js";
import { getColor } from "../helper/color";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

@Component({
  components: {
    SimplifiedMarkdown
  }
})
export default class KBSDoughnutChart extends Vue {
  @Prop({type: String, required: true}) readonly title!: string;
  @Prop({type: Object, default: () => ({})}) readonly chartOptions!: ChartOptions;
  @Prop({type: Object, default: () => ({})}) readonly chartData!: ChartData;
  @Prop({type: Array, default: () => []}) readonly datasets!: number[][];
  @Prop({type: Number, default: 300}) readonly height!: number;
  @Ref() readonly canvas!: HTMLCanvasElement;

  _chart: Chart | null = null;
  hoverIndex = 0;

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
        type: "doughnut",
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
  get actualChartData(): ChartData {
    return {
      labels: [new Date("2021-05-01"), new Date()],
      datasets: [{
        data: this.randomData,
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
    const data = (this.actualChartData.datasets || [])[0].data as number[];
    return Math.round(data[this.hoverIndex] * 100);
  }
  get description() {
    const locale = this.$root.$i18n.locale;
    const options = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    const value = 0.1 + Math.random() * 1.5;
    const sign = this.hoverIndex < 2 ? "+" : "-";
    const formattedValue = sign + value.toLocaleString(locale, options);
    return [
      "der Klienten verbesserten sich um **ø " + formattedValue + "** beim",
      "der Klienten zeigten keine Veränderung beim",
      "der Klienten verschlechterten sich um **ø " + formattedValue + "** beim"
    ][this.hoverIndex]
  }
  get randomData() {
    const positive = Math.round((0.1 + Math.random() / 3) * 100) / 100;
    const negative = Math.round((Math.random() / 9) * 100) / 100;
    return [positive, 1 - positive - negative, negative];
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
      this.hoverIndex = 0;
    }

    if (this.chart.data.datasets) {
      this.chart.data.datasets[0].borderWidth = this.borderWidth;
      this.chart?.update({duration: 500});
    }
  }

  mounted () {
    this.onChartDataChanged();
  }
}
</script>