<template>
  <div>
    <div class="proof-of-performance flex justify-center q-mb-xl">
      <div class="row justify-center">
        <div class="q-mr-md">
          <div class="text-h6 q-mt-sm">{{ $t("proofOfPerformance") }}</div>
        </div>
        <div class="row">
          <date-time-input
            v-model="startDate"
            :label="$t('from')"
            :format="$t('dateFormat')"
            required
            dense
            class="date-input q-mr-sm"
          />
          <date-time-input
            v-model="endDate"
            :label="$t('until')"
            :format="$t('dateFormat')"
            required
            dense
            class="date-input"
          />
        </div>
      </div>
    </div>
    <div :class="$q.screen.gt.xs ? 'flex justify-center' : ''">
      <table
        v-if="tasks.length"
        class="proof-of-performance text-left hyphen"
      >
        <thead>
          <tr>
            <th style="width: 12%">{{ $t("occurrence") }}</th>
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
</template>

<style lang="sass">
.proof-of-performance .date-input
  max-width: 140px
table.proof-of-performance
  -webkit-border-horizontal-spacing: 0px
  td, th
    padding: 2px 11px
    border-bottom: 1px solid #ccc
</style>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { date } from "quasar";
import { Intervention } from "../models";
import InterventionMixin from "../mixins/InterventionMixin";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import DateTimeInput from "../components/DateTimeInput.vue";
import PullToRefresh from "components/PullToRefresh.vue";

const { isBetweenDates, startOfDate, endOfDate } = date;

@Component({
  components: {
    Loading,
    CentralMessage,
    DateTimeInput,
    PullToRefresh
  },
})
export default class ProofOfPerformancePage extends InterventionMixin {
  startDate = startOfDate(new Date(), "month", false);
  endDate = endOfDate(new Date(), "month", false);

  get tasks() {
    const tasks: {
      id: string;
      title: string;
      description: string;
      count: number;
      dates: string[];
    }[] = [];
    const options = { inclusiveFrom: true, inclusiveTo: true, onlyDate: true };
    const teamMembers = this.$store.direct.state.teamMembers;

    this.client?.forAllReminders((reminder) => {
      const completed = reminder.occurrences.filter((item) =>
        !!item.completed &&
        isBetweenDates(item.completed, this.startDate, this.endDate, options)
      );

      if (reminder instanceof Intervention && completed.length > 0) {
        let prefix = "";
        const receiverName = this.findContactName(reminder.receiver, this.client);

        if (receiverName) {
          const arrangedIntervention = reminder.arrangedIntervention;
          const values = {name: receiverName};

          if (arrangedIntervention) {
            prefix = this.$t("agreementWithContact", values) as string;
          } else {
            prefix = this.$t("supportForContact", values) as string;
          }
        }

        const title = [prefix, reminder.intervention.details].filter(Boolean).join(": ");
        const dates = completed.map(
          (item) => {
            const signature = teamMembers[item.user || ""]?.signature;
            return this.$d(item.completed || 0, "DayMonthShort") + " " +
              this.$d(item.completed || 0, "TimeSimple") +
              (signature ? " (" + signature + ")" : "");
        });

        tasks.push({
          id: reminder.id,
          title: title,
          description: this.interventionDescription(reminder),
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
