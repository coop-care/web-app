<template>
  <q-page
    padding
    class="limit-page-width width-sm insights-page"
  >
    <pull-to-refresh @refresh="refresh">
      <div class="q-mb-md text-center text-subtitle2">Hinweis: die angezeigten Daten sind zufällig und noch ohne Bezug zu gespeicherten Klientendaten</div>
      <div class="row items-center">
        <q-item>
          <q-item-section side>
            <q-icon name="far fa-calendar" color="primary" size="xs"/>
          </q-item-section>
          <q-item-section>{{ $t("timePeriod") }}:</q-item-section>
        </q-item>
        <q-select
          v-model="period"
          :options="periodOptions"
          map-options
          emit-value
          dense
          class="q-mr-sm"
          @input="updateDates"
        />
        <div
          v-if="period == 0"
          class="row items-center"
        >
          <date-time-input
            v-model="startDate"
            :label="$t('from')"
            :format="$t('dateFormat')"
            required
            dense
            class="date-input q-mr-sm"
            @input="randomRenwewalKey = Math.random()"
          />
          <date-time-input
            v-model="endDate"
            :label="$t('until')"
            :format="$t('dateFormat')"
            required
            dense
            class="date-input"
            @input="randomRenwewalKey = Math.random()"
          />
        </div>
        <div
          v-else
          class="text-body2"
        >
          vom 
          <span class="text-body1 text-weight-bold">{{ formatDate(startDate) }}</span>
          bis zum
          <span class="text-body1 text-weight-bold">{{ formatDate(endDate) }}</span>
        </div>
      </div>
      <div 
        v-if="false"
        class="row items-center"
      >
        <q-item>
          <q-item-section side>
            <q-icon name="fas fa-sliders-h" color="primary" size="xs"/>
          </q-item-section>
          <q-item-section>{{ $t("filter") }}:</q-item-section>
        </q-item>
      </div>
      <q-expansion-item
        v-for="section in sections"
        :key="section.id + '-' + randomRenwewalKey"
        :value="true"
        :label="section.name"
        :caption="section.clientCount + ' ' + $tc('client', section.clientCount)"
        header-class="section-heading horizontal-caption q-mt-md q-mb-sm q-px-none dense-avatar"
        switch-toggle-side
      >
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-sm-6 col-md-3">
            <k-b-s-overview-chart
              :labels="terminologyRatings.map(item => item.title)"
              :dates="[startDate, endDate]"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <k-b-s-doughnut-chart
              :title="terminologyRatings[0].title"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <k-b-s-doughnut-chart
              :title="terminologyRatings[1].title"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <k-b-s-doughnut-chart
              :title="terminologyRatings[2].title"
            />
          </div>
        </div>
      </q-expansion-item>
    </pull-to-refresh>
  </q-page>
</template>

<style lang="sass">
.horizontal-caption
  .q-item__section
    align-items: center
    flex-direction: row
    justify-content: start
    .text-caption
      margin-left: 12px
.insights-page
  .date-input
    max-width: 140px
  @media print
    canvas
      width: 100% !important
      height: auto !important
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { date } from "quasar";
import PullToRefresh from "../components/PullToRefresh.vue";
import DateTimeInput from "../components/DateTimeInput.vue";
import KBSOverviewChart from "../components/KBSOverviewChart.vue";
import KBSDoughnutChart from "../components/KBSDoughnutChart.vue";
import { TerminologyWithMaps } from "src/helper/terminology";

const { startOfDate, endOfDate, subtractFromDate } = date;

/* ToDo:
 * - real data
 * - adjustments for print 
 * - i18n
 */

@Component({
  components: {
    PullToRefresh,
    DateTimeInput,
    KBSOverviewChart,
    KBSDoughnutChart
  },
})
export default class InsightsPage extends Vue {
  period = this.periodOptions[0].value;
  startDate = subtractFromDate(startOfDate(new Date(), "day", false), {month: this.period});
  endDate = endOfDate(new Date(), "day", false);

  randomRenwewalKey = Math.random();

  get sections() {
    return [{
      name: "Alle Teams",
      id: "allTeams",
      clientCount: this.teams.reduce((result, team) => result + team.clients.length, 0)
    }].concat(this.teams.map(team => ({
      name: this.$t("team") + " " + team.name,
      id: team.id,
      clientCount: team.clients.length
    })))
  }
  get teams() {
    return this.$store.direct.state.teams;
  }
  get periodOptions() {
    return [1, 3, 6, 12].map(value => ({
      label: value + " " + this.$tc("month", value),
      value
    })).concat({
      label: "Eigener …",
      value: 0
    });
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as TerminologyWithMaps;
  }
  get terminologyRatings() {
    return this.terminology.problemRatingScale.ratings;
  }

  updateDates(value: number) {
    if (value) {
      this.startDate = subtractFromDate(startOfDate(new Date(), "day", false), {month: value});
      this.endDate = endOfDate(new Date(), "day", false);
      this.randomRenwewalKey = Math.random();
    }
  }
  formatDate(date: Date) {
    const locale = this.$root.$i18n.locale;
    return date.toLocaleDateString(locale)
  }
  refresh() {

  }
}
</script>
