<template>
  <q-card
    v-if="startDate && outcomesOverTime.length"
    class="radius-md bg-white text-body2 collapsed"
    style="transition: all 0s; width: 100%; max-width: 320px"
  >
    <q-card-section class="q-px-sm">
      <div class="row q-px-sm">
        <div class="text-classification text-h6">
          {{ $t("summary") }}
        </div>
      </div>
      <k-b-s-overview-chart 
        :labels="terminologyRatings.map(item => item.title)"
        :dates="dates"
        :datasets="datasets"
        dense
        :chart-options="chartOptions"
        :height="100"
      />
    </q-card-section>
  </q-card>
</template>

<style lang="sass">
.q-card
  &.collapsed
    > div:not(:last-of-type)
      padding-bottom: 4px
</style>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import RecordMixin, { RecordMixinInterface } from "../mixins/RecordMixin";
import KBSOverviewChart from "../components/KBSOverviewChart.vue";
import { Outcome, Rating } from "src/models";

interface ClientInsights extends RecordMixinInterface {}

@Component({
  components: {
    KBSOverviewChart
  },
  mixins: [RecordMixin]
})
class ClientInsights extends Vue {
  get chartOptions() {
    return {
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
          ticks: {
            stepSize: 1
          }
        }
      }
    };
  }
  get terminologyRatings() {
    return this.terminology.problemRatingScale.ratings;
  }
  get startDate() {
    return this.client?.firstOutcome?.createdAt;
  }
  get dates() {
    return this.startDate
      ? [this.startDate, new Date()]
      : [new Date()]
  }
  get outcomesOverTime() {
    return this.dates
        .map(date => this.client?.outcomesAtEndOfDay(date) || [])
        .filter(outcomes => outcomes.length > 0)
  }
  get datasets() {
    return ([
      outcome => outcome.knowledge,
      outcome => outcome.behaviour,
      outcome => outcome.status,
    ] as ((_: Outcome) => Rating)[])
      .map(this.getAverageRatings)
      
  }
  getAverage(values: number[]) {
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  getAverageRatings(chooseKBS: (_: Outcome) => Rating) {
    return this.outcomesOverTime.map(outcomes =>
      this.getAverage(
        outcomes
          .map(outcome => chooseKBS(outcome).observation || NaN)
          .filter(value => !isNaN(value))
      )
    ).filter(value => !isNaN(value));
  }
  /* when the available width is smaller than the maxWidth of 320px, 
     the canvas width needs to be reduced accordingly */
  adjustWidthIfNeeded() {
    const margin = 16;
    const negativeHorizontalOffsetByGutter = 2 * margin;
    const maxWidth = 320 - margin;
    const requiredWidth = Math.min(
      (this.$el.parentElement?.clientWidth ?? 200) - negativeHorizontalOffsetByGutter, 
      maxWidth
    );
    const canvas = this.$el.querySelector("canvas");

    if (canvas) {
      canvas.style.width = requiredWidth + "px";
    }
  }

  mounted() {
    this.adjustWidthIfNeeded();
  }
}

export default ClientInsights;
</script>
