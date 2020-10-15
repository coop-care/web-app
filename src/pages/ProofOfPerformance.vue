<template>
  <q-page
    padding
    class="limit-page-width"
  >
    <loading v-if="$store.direct.state.isLoadingClientList && !client" />

    <central-message
      v-else-if="!$store.direct.state.isLoadingClientList && !client"
      :message="$t('clientNotFound')"
    />
    <div v-else>
      <div class="flex justify-center q-mb-xl">
        <div class="row q-col-gutter-md">
          <div>
            <div class="text-h6 q-mt-sm">{{ $t("proofOfPerformance") }}</div>
          </div>
          <date-time-input
            v-model="startDate"
            :label="$t('from')"
            :format="$t('dateFormat')"
            required
            dense
          />
          <date-time-input
            v-model="endDate"
            :label="$t('until')"
            :format="$t('dateFormat')"
            required
            dense
          />
        </div>
      </div>
      <div :class="$q.screen.gt.xs ? 'flex justify-center' : ''">
        <table
          v-if="tasks.length"
          class="proof-of-performance text-left"
        >
          <thead>
            <tr>
              <th>{{ $t("occurrence") }}</th>
              <th>{{ $t("interventionCategoryAndTarget") }}</th>
              <th>{{ $t("interventionDetails") }}</th>
              <th>{{ $t("datesOfConduction") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in tasks"
              :key="task.id"
              class="vertical-top"
            >
              <td class="text-right">{{ task.count }}</td>
              <td>{{ task.description }}</td>
              <td>{{ task.title }}</td>
              <td>
                <ol class="no-bullet column-2-sm">
                  <li
                    v-for="(date, index) in task.dates"
                    :key="index"
                  >{{ date }}</li>
                </ol>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-else
          class="row text-center text-body2"
        >{{ $t("noCompletedTasksFound")}}</div>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass">
.proof-of-performance
  -webkit-border-horizontal-spacing: 0px
  td, th
    padding: 2px 11px
    border-bottom: 1px solid #ccc
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { date } from "quasar";
import { Intervention } from "../models";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import DateTimeInput from "../components/DateTimeInput.vue";

const { isBetweenDates, startOfDate, endOfDate } = date;

@Component({
  components: {
    Loading,
    CentralMessage,
    DateTimeInput,
  },
})
export default class ProofOfPerformancePage extends Vue {
  startDate = startOfDate(new Date(), "month");
  endDate = endOfDate(new Date(), "month");

  get tasks() {
    const tasks: {
      id: string;
      title: string;
      description: string;
      count: number;
      dates: string[];
    }[] = [];
    const locale = this.$root.$i18n.locale;
    const options = { inclusiveFrom: true, inclusiveTo: true, onlyDate: true };

    this.client?.forAllReminders((reminder) => {
      const completed = reminder.occurrences.filter(
        (item) =>
          !!item.completed &&
          isBetweenDates(item.completed, this.startDate, this.endDate, options)
      );

      if (reminder instanceof Intervention && completed.length > 0) {
        const description =
          this.$t(reminder.category.title) +
          ": " +
          this.$t(reminder.target.title);

        const dates = completed.map(
          (item) =>
            item.completed?.toLocaleString(locale, {
              day: "numeric",
              month: "short",
            }) +
            " " +
            item.completed?.toLocaleString(locale, {
              hour: "numeric",
              minute: "numeric",
            }) +
            (item.signature ? " (" + item.signature + ")" : "")
        );
        tasks.push({
          id: reminder.id,
          title: reminder.details,
          description: description,
          count: completed.length || 1,
          dates: dates,
        });
      }
    });

    return tasks;
  }
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
}
</script>
