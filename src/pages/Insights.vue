<template>
  <q-page
    class="limit-page-width width-md page-padding insights-page"
  >
    <pull-to-refresh refresh="refresh">
      <loading v-if="$store.direct.state.isLoadingClientList && !teams.length" />

      <central-message
        v-else-if="!$store.direct.state.isLoadingClientList && !teams.length"
        :message="$t('noData')"
      />

      <div v-else>
        <div class="row items-center">
          <q-item>
            <q-item-section side>
              <q-icon name="far fa-calendar" color="primary" size="xs"/>
            </q-item-section>
            <q-item-section>{{ $t("timePeriod") }}:</q-item-section>
          </q-item>
          <q-select
            v-model="period"
            @update:model-value="updateDates"
            :options="periodOptions"
            map-options
            emit-value
            dense
            class="q-mr-sm"
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
              @update:model-value="randomRenwewalKey = Math.random()"
            />
            <date-time-input
              v-model="endDate"
              :label="$t('until')"
              :format="$t('dateFormat')"
              required
              dense
              class="date-input"
              @update:model-value="randomRenwewalKey = Math.random()"
            />
          </div>
          <div
            v-else
            class="text-body2"
          >
            {{ $t("from") }} 
            <span class="text-body1 text-weight-bold">{{ $d(startDate) }}</span>
            {{ $t("until") }} 
            <span class="text-body1 text-weight-bold">{{ $d(endDate) }}</span>
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
          :key="section.id"
          :model-value="true"
          :label="section.name"
          :caption="section.clients.length + ' ' + $t('client', section.clients.length)"
          header-class="section-heading horizontal-caption q-mt-md q-mb-sm q-px-none dense-avatar"
          switch-toggle-side
        >
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3 insights-item">
              <k-b-s-overview-chart
                :labels="terminologyRatings.map(item => item.title)"
                :dates="dates"
                :datasets="section.lineChartDatasets"
                :title="$t('evaluationOfAllClients')"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3 insights-item column items-center justify-center">
              <k-b-s-doughnut-chart
                :dataset="section.knowledgeDataset"
                :title="terminologyRatings[0].title"
                class="insights-item-sm"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3 insights-item column items-center justify-center">
              <k-b-s-doughnut-chart
                :dataset="section.behaviourDataset"
                :title="terminologyRatings[1].title"
                class="insights-item-sm"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3 insights-item column items-center justify-center">
              <k-b-s-doughnut-chart
                :dataset="section.statusDataset"
                :title="terminologyRatings[2].title"
                class="insights-item-sm"
              />
            </div>
          </div>
        </q-expansion-item>
      </div>
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
.insights-item
  max-width: 400px !important
.insights-item-sm
  max-width: 200px
@media print
  .insights-page
    padding: 0
    canvas
      width: 100% !important
      height: auto !important
</style>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import { date } from "quasar";
import PullToRefresh from "../components/PullToRefresh.vue";
import Loading from "../components/Loading.vue";
import CentralMessage from "../components/CentralMessage.vue";
import DateTimeInput from "../components/DateTimeInput.vue";
import KBSOverviewChart from "../components/KBSOverviewChart.vue";
import KBSDoughnutChart from "../components/KBSDoughnutChart.vue";
import { TerminologyWithMaps } from "src/helper/terminology";
import { Client, Outcome, Rating } from "src/models";

const { startOfDate, endOfDate, subtractFromDate } = date;

@Component({
  components: {
    PullToRefresh,
    Loading,
    CentralMessage,
    DateTimeInput,
    KBSOverviewChart,
    KBSDoughnutChart
  },
})
export default class InsightsPage extends Vue {
  period!: number;
  startDate!: Date;
  endDate!: Date;
  clients!: Client[];
  randomRenwewalKey = 0;

  async created() {
    this.period = this.periodOptions[1].value;
    this.updateDates(this.period);
    this.clients = this.$store.direct.state.clients.slice();
    const clientIds = this.clients.map(client => client.id);

    await this.teams.forEach(async team =>  {
      const additionalClientIds = team.clients.filter(clientId => !clientIds.includes(clientId));
      const clients = await this.$ccApi.getClients(additionalClientIds);
      this.clients = this.clients.concat(clients);
    });
    this.randomRenwewalKey = Math.random();
  }

  get dates() {
    return [this.startDate, this.endDate];
  }

  get sections() {
    // workaround to trigger reactive recalculation of sections, because changes to startDate and endDate are not detected
    this.randomRenwewalKey + 1;

    const teams = this.teams.map(team => ({
      name: this.$t("team") + " " + team.name,
      id: team.id,
      clients: (team.clients
        .map(clientId => this.clients.find(client => client.id == clientId))
        .filter(client => 
          !!client 
          && client.createdAt < this.endDate 
          && (!client.leftAt || this.startDate < client.leftAt)
        ) as Client[])
        .map(client => {
          let outcomesAtStart = client.outcomesAtEndOfDay(this.startDate);
          let outcomesAtEnd = client.outcomesAtEndOfDay(this.endDate);

          if (outcomesAtStart.length == 0 
              && !!client.firstOutcome?.createdAt && client.firstOutcome.createdAt <= this.endDate) {
            outcomesAtStart = client.outcomesAtEndOfDay(client.firstOutcome.createdAt);
          }

          if (outcomesAtEnd.length == 0 
              && !!client.lastOutcome?.createdAt && client.lastOutcome.createdAt >= this.startDate) {
            outcomesAtEnd = client.outcomesAtEndOfDay(client.lastOutcome.createdAt);
          }

          const outcomesOverTime = [outcomesAtStart, outcomesAtEnd];

          return {
            id: client.id,
            knowledge: this.getAverageRatings(outcomesOverTime, outcome => outcome.knowledge),
            behaviour: this.getAverageRatings(outcomesOverTime, outcome => outcome.behaviour),
            status: this.getAverageRatings(outcomesOverTime, outcome => outcome.status),
          }
        })
    }));

    return [
      ...(teams.length > 1 
        ? [{
          name: this.$t("allTeams"),
          id: "allTeams",
          clients: teams.flatMap(team => team.clients)
            // filter duplicates
            .filter((client, index, clients) => !clients.slice(0, index).find(item => item.id == client.id))
        }]
        : []),
      ...teams
    ].map(section => ({
      ...section,
      lineChartDatasets: [
        this.getLineChartDataset(section.clients.map(client => client.knowledge)),
        this.getLineChartDataset(section.clients.map(client => client.behaviour)),
        this.getLineChartDataset(section.clients.map(client => client.status)),
      ],
      knowledgeDataset: this.groupRatingsByProgress(section.clients.map(client => client.knowledge)),
      behaviourDataset: this.groupRatingsByProgress(section.clients.map(client => client.behaviour)),
      statusDataset: this.groupRatingsByProgress(section.clients.map(client => client.status)), // debug with random data: this.randomRatings()
    }))
  }

  getLineChartDataset(clientValues: number[][]) {
    return this.dates
      .map((_, index) => 
        this.getAverage(
          clientValues
            .map(values => values[index])
            ?.filter(value => value != undefined) || []
        )
      ).filter(value => !isNaN(value));
  }
  get teams() {
    return this.$store.direct.state.teams;
  }
  get periodOptions() {
    return [1, 3, 6, 12].map(value => ({
      label: value + " " + this.$t("month", value),
      value
    })).concat({
      label: this.$t("customInterval") as string,
      value: 0
    });
  }
  get terminology() {
    return (this.$tm("terminology") as unknown) as TerminologyWithMaps;
  }
  get terminologyRatings() {
    return this.terminology.problemRatingScale.ratings;
  }

  getAverage(values: number[]) {
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  getAverageRatings(outcomesOverTime: Outcome[][], chooseKBS: (_: Outcome) => Rating) {
    return outcomesOverTime.map(outcomes =>
      this.getAverage(
        outcomes
          .map(outcome => chooseKBS(outcome).observation || NaN)
          .filter(value => !isNaN(value))
      )
    ).filter(value => !isNaN(value));
  }
  groupRatingsByProgress(ratingsList: number[][]) {
    return [
      ratingsList.filter(ratings => ratings.length > 1 && ratings[0] < ratings[ratings.length - 1]),
      ratingsList.filter(ratings => ratings.length < 2 || ratings[0] == ratings[ratings.length - 1]),
      ratingsList.filter(ratings => ratings.length > 1 && ratings[0] > ratings[ratings.length - 1]),
    ].map((ratingsGroup, index) => ({
      ratio: ratingsList.length
        ? (ratingsGroup.length / ratingsList.length) || 0
        : index != 1 
          ? 0 
          : 1,
      change: index != 1
        ? this.getAverage(ratingsGroup.map(ratings => ratings[ratings.length - 1] - ratings[0])) || 0
        : 0
    }))
  }
  randomRatings() {
    const ratio1 = Math.random();
    const ratio2 = (1 - ratio1) * Math.random();
    const ratio3 = 1 - ratio1 - ratio2;

    return [ratio1, ratio2, ratio3].map(ratio => ({
      ratio,
      change: Math.random()
    }))
  }
  updateDates(value: number) {
    if (value > 0) {
      this.startDate = subtractFromDate(startOfDate(new Date(), "day", false), {months: value});
      this.endDate = endOfDate(new Date(), "day", false);
    }

    this.randomRenwewalKey = Math.random();
  }
  async refresh() {
    this.clients = await this.$store.direct.dispatch.fetchClientsOfAllTeamsFromDB();
  }
  mounted() {
    void this.refresh();
  }
}
</script>
