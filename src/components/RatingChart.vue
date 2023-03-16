<template>
  <Line
    ref="chart" 
    :data="ratingData" 
    :options="options"
    @touchstart="active = true"
    @mouseenter="active = true"
    @mouseleave="onMouseLeave"
  />
</template>

<script lang="ts">
import { Component, Prop, Ref, Model, Vue } from "vue-facing-decorator";
import { Chart, LineController, LineElement, PointElement, TimeSeriesScale, LinearScale, ChartOptions, ChartData, Filler, ChartDataset, ScriptableContext } from "chart.js";
import { Line } from "vue-chartjs";
import { colors, getCssVar } from "quasar";

Chart.register(LineController, LineElement, PointElement, TimeSeriesScale, LinearScale, Filler);

const { textToRgb, rgbToHex } = colors;

export type Rating = {
  type: 0 | 1 | 2;
  createdAt: Date;
  observation: number;
  expectation: number;
  comment: string;
  expectationComment: string;
  personRatedInPlaceOfOwner: string;
  user: string;
};

@Component({
  components: {
    Line
  },
  emits: ["update:model-value"]
})
export default class RatingChart extends Vue {
  @Model({type: Number, default: -1}) readonly value!: number;
  @Prop({type: Array, default: () => []}) readonly ratings!: Rating[];
  @Prop({type: String, default: "primary"}) readonly color!: string;
  @Ref() readonly chart!: Chart<"line">;

  active = false;
  previousX: number | null = 0;
  previousY: number | null = 0;

  get options(): ChartOptions<"line"> {
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
      plugins: {
        tooltip: {
          enabled: false, // there is a weird bug that shows tooltips when tooltip plugin was loaded by a different component
        },
      },
      hover: {
        mode: "index",
        intersect: false
      },
      animations: {
        radius: {
          duration: 300
        },
      },
      onHover: (event, elements) => {
        if (elements[0]?.index != this.value && this.active && (event.x != this.previousX || event.y != this.previousY)) {
          /* as soon as the area between index 0 and to is surfaced, onHover is firing with intermitting index values (like 0, 1, 0, 1, 0, …)
             for the same x and y event coordinates and won't stop firing. So we need to check the coordinates to throttle events 
             for performance reasons. The reson is probably caused by having a variable point radius based on hover/active state,
             so that two points claim intermittingly to be closest to the event coordinates. A fixed point radius solves the problem as well. */
          this.previousX = event.x;
          this.previousY = event.y;
          this.$emit("update:model-value", elements[0].index);
        }
      },
    }
  }
  get datasetOptions(): Partial<ChartDataset<"line">> {
    return {
      spanGaps: true,
      cubicInterpolationMode: "monotone",
      pointBackgroundColor: this.colorValue
    }
  }
  get ratingData(): ChartData<"line"> {
    const ratings = this.ratings.slice();

    if (ratings.length == 1) {
      const duplicateRating = {...ratings[0]};
      duplicateRating.createdAt = new Date(duplicateRating.createdAt.getTime() + 1);
      ratings.push(duplicateRating);
    }

    return {
      labels: ratings.map(item => item.createdAt).concat([new Date()]),
      datasets: [{
        label: this.$t("observedRating").toString(),
        fill: true,
        borderColor: this.colorValue,
        backgroundColor: this.makeGradient,
        data: ratings.map(item => item.observation),
        pointHoverBackgroundColor: this.colorValue,
        pointHoverRadius: this.pointRadii,
        pointRadius: this.pointRadii,
        ...this.datasetOptions,
      }, {
        label: this.$t("expectedRating").toString(),
        fill: false,
        borderDash: [5, 5],
        borderColor: this.colorValue,
        backgroundColor: this.colorValue,
        data: ratings.map(item => item.expectation),
        pointHoverBackgroundColor: this.colorValue,
        pointHoverRadius: this.pointRadii,
        pointRadius: this.pointRadii,
        ...this.datasetOptions
      }]
    }
  }
  get colorValue() {
    return getCssVar(this.color) || this.color;
  }
  get pointRadii() {
    return Array.from(
      {length: Math.max(this.ratings.length, 2)}, 
      (_ , index) => index != this.value ? 0 : 5
    );
  }
  
  makeGradient(context: ScriptableContext<"line">) {
    const gradient =  context.chart.ctx?.createLinearGradient(0,0,0, context.chart.canvas.offsetHeight ?? 0);
    const colorObject = textToRgb(this.colorValue);
    colorObject.a = 50;
    gradient?.addColorStop(0, rgbToHex(colorObject));
    gradient?.addColorStop(1, "rgba(255,255,255,0.25)");
    return gradient;
  }

  onMouseLeave() {
    this.active = false
    this.$emit("update:model-value", -1)
  }
}
</script>