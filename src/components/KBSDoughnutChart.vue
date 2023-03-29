<template>
  <div class="full-width non-selectable relative-position">
    <Doughnut 
      ref="chart"
      :data="chartData" 
      :options="options" 
      :height="200" 
      @mouseenter="active = true"
      @mouseleave="onMouseLeave"
    />
    <div class="doughnutchart-caption text-body2 column justify-center no-wrap" style="margin-top: -10px">
      <div :class="['keyfigure', 'text-' + colors[hoverIndex]]">
        <span>{{ keyFigure }}</span> %
      </div>
      <simplified-markdown
        :text="description"
      />
      <div class="text-subtitle1 text-weight-bold text-center">{{ title }}</div>
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
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";
import { Doughnut } from "vue-chartjs";
import { Chart, DoughnutController, ArcElement, ChartOptions, ChartData } from "chart.js";
import { getColor } from "../helper/color";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

Chart.register(DoughnutController, ArcElement);

export type ClientProgress = {
  ratio: number,
  change: number
}

@Component({
  components: {
    Doughnut,
    SimplifiedMarkdown
  }
})
export default class KBSDoughnutChart extends Vue {
  @Prop({type: Array, default: () => []}) readonly dataset!: ClientProgress[];
  @Prop({type: Object, default: () => ({})}) readonly chartOptions!: ChartOptions;
  @Prop({type: String, required: true}) readonly title!: string;
  @Prop({type: Number, default: 300}) readonly height!: number;

  active = false;
  hoverIndex = this.defaultHoverIndex;

  @Watch("dataset")
  onDatasetChanged() {
    if (!this.active) {
      this.hoverIndex = this.defaultHoverIndex;
    }
  }

  get options(): ChartOptions<"doughnut"> {
    return {
      responsive: true,
      maintainAspectRatio: false, // remove this and :height="200" and set .insights-item-sm to max-width: 240px when bug in chart.js 4.x is resolved (https://github.com/chartjs/Chart.js/issues/11005)
      layout: {},
      cutout: "80%",
      spacing: 1,
      animations: {
        borderWidth: {
          duration: 300
        },
      },
      plugins: {
        tooltip: {
          enabled: false // there is a weird bug that shows tooltips when tooltip plugin was loaded by a different component
        }
      },
      onHover: (event, elements) =>{
        const element = elements?.[0];

        if (element?.element.active && element?.index != this.hoverIndex && this.active) {
          this.hoverIndex = element.index;
        }
      },
    }
  }
  get chartData(): ChartData<"doughnut"> {
    return {
      labels: [new Date("2021-05-01"), new Date()],
      datasets: [{
        data: this.dataset.map(item => item.ratio),
        backgroundColor: this.colorValues,
        borderWidth: this.borderWidth,
        // hoverBackgroundColor: this.colorValues, // prevent color change on hover
        hoverBorderColor: "#ffffff",
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

  onMouseLeave() {
    this.active = false;
    this.hoverIndex = this.defaultHoverIndex;
  }
}
</script>