<template>
  <q-card
    class="radius-md bg-white text-body2 collapsed"
    style="transition: all 0s; width: 100%; max-width: 320px"
  >
    <q-card-section>
      <div class="row">
        <div class="text-classification text-h6">
          {{ $t("summary") }}
        </div>
      </div>
      <k-b-s-overview-chart 
        :labels="terminologyRatings.map(item => item.title)"
        :dates="[new Date(0), new Date()]"
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
import { Component } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import KBSOverviewChart from "../components/KBSOverviewChart.vue";

@Component({
  components: {
    KBSOverviewChart
  }
})
export default class ClientInsights extends RecordMixin {
  get chartOptions() {
    return {scales: {
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
          stepSize: 1
        }
      }]
    }};
  }
  get terminologyRatings() {
    return this.terminology.problemRatingScale.ratings;
  }
}
</script>
