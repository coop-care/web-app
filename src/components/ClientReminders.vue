<template>
  <div
    v-touch-swipe.mouse.horizontal="swipeTasks"
    style="max-width: 480px; min-height: 95vh"
  >
    <div class="row">
      <div class="q-mt-xs">
        <q-btn
          icon="fas fa-caret-left"
          color="intervention"
          flat
          round
          dense
          size="18px"
          @click="gotoPreviousDay"
        />
        <q-btn
          icon="event"
          round
          flat
          color="intervention"
        >
          <q-popup-proxy
            ref="dateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="selectedDateString"
              @input="$refs.dateProxy.hide()"
              :events="[]"
              color="intervention"
              event-color="intervention"
              mask="YYYY-MM-DDTHH:mm:ss.sssZ"
              today-btn
            />
          </q-popup-proxy>
        </q-btn>
      </div>
      <div class="q-mx-xs">
        <div class="text-h6">
          {{ formattedDate({ weekday: "long" }) }}
          {{ isToday ? $t("isTodayHint") : "" }}
        </div>
        <div
          class="text-body2"
          style="margin-top:-3px"
        >
          {{
            formattedDate({ year: "numeric", month: "long", day: "numeric" })
          }}
        </div>
      </div>
      <q-space />
      <div class="q-mt-xs">
        <q-btn
          icon="fas fa-caret-right"
          color="intervention"
          flat
          round
          dense
          size="18px"
          @click="gotoNextDay"
        />
      </div>
    </div>
    <div
      v-for="(visit, index) in tasks"
      v-bind:key="index"
    >
      <div class="text-subtitle1 text-weight-bold q-mt-lg">
        {{ visit.title }}
      </div>
      <div>
        <q-list dense>
          <task-view
            v-for="(task, index) in visit.tasks"
            v-bind:key="index"
            :client="client"
            :task="task"
            :date="selectedDate"
            :hasCheckbox="canComplete"
          />
        </q-list>
      </div>
    </div>
    <q-page-sticky
      v-if="!client.leftAt"
      position="bottom-left"
      :offset="$q.screen.lt.sm ? [16, 10] : [56, 10]"
    >
      <q-btn
        fab
        icon="add"
        color="intervention"
        :title="$t('addTask')"
        @click="addIntervention"
      />
    </q-page-sticky>
  </div>
</template>

<style lang="sass"></style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { date } from "quasar";
import { Task, TaskGroup } from "../models/task";
import TaskView from "components/TaskView.vue";

const {
  isSameDate,
  isBetweenDates,
  subtractFromDate,
  addToDate,
  startOfDate,
  endOfDate
} = date;

@Component({
  components: {
    TaskView
  }
})
export default class ClientReminders extends Vue {
  get selectedDate() {
    return parseInt(this.$root.$route.params.day)
      ? new Date(parseInt(this.$root.$route.params.day))
      : new Date();
  }
  set selectedDate(value) {
    this.$router.push({
      name: this.$route.name || undefined,
      params: {
        day: "" + value.getTime(),
        clientId: this.$route.params.clientId
      }
    });
  }
  get selectedDateString() {
    return this.selectedDate.toISOString();
  }
  set selectedDateString(value: string) {
    this.selectedDate = new Date(value);
  }
  get tasks() {
    return this.tasksForDay(this.selectedDate);
  }
  get canComplete() {
    return isBetweenDates(this.selectedDate, this.selectedDate, new Date(), {
      inclusiveFrom: true,
      inclusiveTo: true,
      onlyDate: true
    });
  }
  get isToday() {
    return isSameDate(this.selectedDate, new Date(), "day");
  }
  get timeFormatter() {
    return new Intl.DateTimeFormat(this.$root.$i18n.locale, {
      hour: "numeric",
      minute: "numeric"
    });
  }
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }

  formattedDate(options: Intl.DateTimeFormatOptions) {
    return this.selectedDate.toLocaleDateString(
      this.$root.$i18n.locale,
      options
    );
  }

  swipeTasks({ direction }: any) {
    if (direction == "left") {
      this.gotoNextDay();
    } else if (direction == "right") {
      this.gotoPreviousDay();
    }
  }

  gotoNextDay() {
    this.selectedDate = addToDate(this.selectedDate, { days: 1 });
  }

  gotoPreviousDay() {
    this.selectedDate = subtractFromDate(this.selectedDate, { days: 1 });
  }

  tasksForDay(day: Date) {
    const startOfDay = startOfDate(day, "day");
    const endOfDay = endOfDate(day, "day");
    const startOfDayTimestamp = startOfDay.getTime();
    const endOfDayTimestamp = endOfDay.getTime();
    const startOfTodayTimestamp = new Date().setHours(0, 0, 0, 0);
    const endOfTodayTimestamp = new Date().setHours(23, 59, 59, 999);
    const pastDueTimestamp = Math.min(
      startOfDayTimestamp,
      startOfTodayTimestamp
    );
    const isFuture = endOfTodayTimestamp < startOfDayTimestamp;
    const isPresentOrPast = startOfDayTimestamp <= startOfTodayTimestamp;
    const pastDueTasks: Task[] = [];
    const anytimeTasks: Task[] = [];
    let scheduledTasks: Task[] = [];
    const groupedTasks: TaskGroup[] = [];

    this.client?.forAllReminders((reminder, problem) => {
      const isReminderActiveAndUncompleted =
        !problem.resolvedAt &&
        problem.problem.isHighPriority &&
        !reminder.isCompleted &&
        !this.client?.leftAt;

      reminder.occurrences.forEach(item => {
        if (
          isPresentOrPast &&
          isReminderActiveAndUncompleted &&
          !item.completed &&
          item.due.getTime() < pastDueTimestamp
        ) {
          pastDueTasks.push(
            new Task(reminder, problem.id, item.due, item.completed)
          );
        } else if (
          (isReminderActiveAndUncompleted || item.completed) &&
          isBetweenDates(item.due, startOfDayTimestamp, endOfDayTimestamp)
        ) {
          scheduledTasks.push(
            new Task(reminder, problem.id, item.due, item.completed)
          );
        }
      });

      if (reminder.recurrenceRules) {
        if (isReminderActiveAndUncompleted && isFuture) {
          scheduledTasks = scheduledTasks.concat(
            reminder.recurrenceRules
              .between(startOfDay, endOfDay, true)
              .map(date => new Task(reminder, problem.id, date))
          );
        }
      } else {
        if (
          (isReminderActiveAndUncompleted &&
            reminder.createdAt.getTime() <= endOfDayTimestamp) ||
          (reminder.completedAt &&
            isBetweenDates(
              reminder.completedAt,
              startOfDayTimestamp,
              endOfDayTimestamp
            ))
        ) {
          anytimeTasks.push(
            new Task(reminder, problem.id, undefined, reminder.completedAt)
          );
        }
      }
    });

    if (pastDueTasks.length) {
      groupedTasks.push(
        new TaskGroup("" + this.$t("pastDueTitle"), pastDueTasks)
      );
    }

    if (anytimeTasks.length) {
      groupedTasks.push(
        new TaskGroup("" + this.$t("anytimeTitle"), anytimeTasks)
      );
    }

    scheduledTasks
      .sort((a, b) => (a.due?.getTime() || 0) - (b.due?.getTime() || 0))
      .forEach(task => {
        const title = this.timeFormatter.format(task.due);
        const group = groupedTasks.find(group => group.title == title);

        if (group) {
          group.tasks.push(task);
        } else {
          groupedTasks.push(new TaskGroup(title, [task]));
        }
      });

    return groupedTasks;
  }

  addIntervention() {
    let name: string;
    let params = this.$route.params;

    if (this.client?.problems.length) {
      name = "newIntervention";
    } else {
      this.$store.direct.commit.createProblemRecord(this.$route.params);
      name = "problem";
      params = this.$store.direct.getters.getRouteParamsForLatestProblem(
        params
      );
    }

    this.$router.push({
      name: name,
      params: params
    });
  }
}
</script>
