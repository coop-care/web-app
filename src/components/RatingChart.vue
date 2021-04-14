<script lang="ts">
import { Component, Prop, Ref, Watch, Mixins } from "vue-property-decorator";
import { Line, mixins } from "vue-chartjs";
import { ChartOptions, ChartData, ChartDataSets, ChartTooltipModel } from "chart.js";
import { colors } from "quasar";

const { getBrand, textToRgb, rgbToHex } = colors;

export type Rating = {
  type: 0 | 1 | 2;
  createdAt: Date;
  observation: number;
  expectation: number;
  comment: string;
  personRatedInPlaceOfOwner: string;
  user: string;
};

@Component({
    extends: Line, // this is important to add the functionality to your component
    mixins: [mixins.reactiveProp]
})
export default class RatingChart extends Mixins(mixins.reactiveProp, Line) {
  @Prop({type: Number, default: -1}) readonly value!: number;
  @Prop({type: Object, default: () => {{}}}) readonly chartData!: ChartData;
  @Prop({type: Array, default: () => []}) readonly ratings!: Rating[];
  @Prop({type: String, default: "primary"}) readonly color!: string;
  @Ref() readonly canvas!: HTMLCanvasElement;

  @Watch("ratings")
  onDataChanged() {
    this.redrawData();
  }
  @Watch("value")
  onValueChanged() {
    this.onHoverPoint();
  }
  @Watch("color")
  onColorChanged() {
    this.redrawData();
  }

  get options(): ChartOptions {
    return {
      responsive: true,
      legend: {
        display: false
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
      spanGaps: true,
      cubicInterpolationMode: "monotone",
      pointBackgroundColor: this.colorValue
    }
  }
  get ratingData(): ChartData {
    const ratings = this.ratings.slice();

    if (ratings.length == 1) {
      const duplicateRating = {...ratings[0]};
      duplicateRating.createdAt = new Date(duplicateRating.createdAt.getTime() + 1);
      ratings.push(duplicateRating);
    }

    return {
      labels: ratings.map(item => item.createdAt).concat([new Date()]),
      datasets: [{
        label: "Beobachtung",
        fill: true,
        borderColor: this.colorValue,
        backgroundColor: this.makeGradient(),
        data: ratings.map(item => item.observation),
        pointHoverRadius: 0,
        pointRadius: 0,
        ...this.datasetOptions
      }, {
        label: "Erwartung",
        fill: false,
        borderDash: [5, 5],
        borderColor: this.colorValue,
        backgroundColor: this.colorValue,
        data: ratings.map(item => item.expectation),
        pointHoverRadius: 0,
        pointRadius: 0,
        ...this.datasetOptions
      }]
    }
  }
  get colorValue() {
    return getBrand(this.color) || this.color;
  }
  get context() {
    return this.canvas.getContext("2d");
  }
  get chart() {
    return this.$data._chart as Chart | undefined;
  }
  
  makeGradient() {
    const gradient = this.context?.createLinearGradient(0,0,0,this.canvas.offsetHeight);
    const colorObject = textToRgb(this.colorValue);
    colorObject.a = 50;
    gradient?.addColorStop(0, rgbToHex(colorObject));
    gradient?.addColorStop(1, "rgba(255,255,255,0.25)");
    return gradient;
  }
  onTooltip(tooltip: ChartTooltipModel) {
    if (tooltip.dataPoints?.length) {
      this.$emit("input", tooltip.dataPoints[0].index);
    } else {
      this.$emit("input", -1);
    }
  }
  onHoverPoint() {
    const pointRadii = Array.from(
      {length: Math.max(this.ratings.length, 2)}, 
      (_ , index) => index != this.value ? 0 : 5
    );

    this.chart?.data.datasets?.forEach(item => {
      item.pointRadius = pointRadii;
      item.pointHoverRadius = pointRadii;
    });
    this.chart?.update({duration: 300});
  }
  onResize() {
    const datasets = this.chart?.data.datasets;

    if (datasets && datasets[0]) {
      datasets[0].backgroundColor = this.makeGradient();
      this.chart?.update();
    }
  }
  redrawData() {
    if (this.chart) {
      this.chart.data = this.ratingData;
      this.chart.update({duration: 0});
    }
  }

  mounted () {
    this.renderChart(this.ratingData, this.options);
    this.onResize();
  }
}
</script>