<template>
  <div
    v-touch-swipe.mouse.horizontal="swipeTasks"
    class="client-reminders min-height"
  >
    <div class="row">
      <q-space />
      <div class="q-mt-xs">
        <q-btn
          icon="fas fa-caret-left"
          color="primary"
          flat
          dense
          size="18px"
          @click="gotoPreviousDay"
          class="text-left thin-button"
        />
      </div>
      <div class="q-mt-xs">
        <q-btn
          icon="event"
          round
          flat
          color="primary"
        >
          <q-popup-proxy
            ref="dateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="selectedDateString"
              @input="dateProxy.hide()"
              :events="[]"
              color="primary"
              event-color="primary"
              mask="YYYY-MM-DDTHH:mm:ss.sssZ"
              today-btn
            />
          </q-popup-proxy>
        </q-btn>
      </div>
      <div class="q-mr-sm selected-date">
        <div class="text-h6 ellipsis">
          {{ formattedDate({ weekday: "long" }) }}
          {{ isToday ? $t("isTodayHint") : "" }}
        </div>
        <div class="text-body2">
          {{
            formattedDate({ year: "numeric", month: "long", day: "numeric" })
          }}
        </div>
      </div>
      <div class="q-mt-xs">
        <q-btn
          icon="fas fa-caret-right"
          color="primary"
          flat
          dense
          size="18px"
          class="thin-button"
          @click="gotoNextDay"
        />
      </div>
      <q-space />
    </div>

    <div v-if="tasks.length">
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
    </div>

    <div
      v-else
      class="text-center text-body2 q-mt-xl"
    >
      <div class="text-italic">{{$t("noTasksPlanned")}}</div>
      <div
        v-if="!hasActiveProblems"
        class="q-mt-lg"
      >
        <div class="text-italic">{{ $t("noProblemForNewIntervention") }}</div>
        <q-btn
          :label="$t('problemAdmission')"
          flat
          no-caps
          size="md"
          color="classification"
          class="q-mt-xs text-normal"
          @click="addProblem"
        />
      </div>
    </div>

    <q-page-sticky
      v-if="isActiveClient && hasActiveProblems"
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

<style lang="sass">
.client-reminders
  max-width: 540px
  .thin-button
    width: 32px
  .selected-date
    width: 184px
    div:first-of-type
      margin-bottom: -5px
</style>

<script lang="ts">
import { Vue, Component, Ref } from "vue-property-decorator";
import { date, QPopupProxy } from "quasar";
import { Task, TaskGroup } from "../models/task";
import TaskView from "components/TaskView.vue";

const {
  isSameDate,
  isBetweenDates,
  subtractFromDate,
  addToDate,
  startOfDate,
  endOfDate,
} = date;
const allInclusive = {
  inclusiveFrom: true,
  inclusiveTo: true,
  onlyDate: true,
};

@Component({
  components: {
    TaskView,
  },
})
export default class ClientReminders extends Vue {
  @Ref() readonly dateProxy!: QPopupProxy;

  get selectedDate() {
    return parseInt(this.$root.$route.params.day)
      ? new Date(parseInt(this.$root.$route.params.day))
      : new Date();
  }
  set selectedDate(value) {
    void this.$router.push({
      name: this.$route.name || undefined,
      params: {
        day: "" + value.getTime(),
        clientId: this.$route.params.clientId,
      },
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
    return isBetweenDates(
      this.selectedDate,
      this.selectedDate,
      new Date(),
      allInclusive
    );
  }
  get isToday() {
    return isSameDate(this.selectedDate, new Date(), "day");
  }
  get timeFormatter() {
    return new Intl.DateTimeFormat(this.$root.$i18n.locale, {
      hour: "numeric",
      minute: "numeric",
    });
  }
  get hasActiveProblems() {
    return this.client && this.client.activeProblemCount > 0
  }
  get isActiveClient() {
    return !this.client?.leftAt
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

      reminder.occurrences.forEach((item) => {
        if (
          isPresentOrPast &&
          isReminderActiveAndUncompleted &&
          !item.completed &&
          item.due.getTime() < pastDueTimestamp
        ) {
          pastDueTasks.push(new Task(reminder, problem.id, item));
        } else if (
          (isReminderActiveAndUncompleted || item.completed) &&
          isBetweenDates(
            item.due,
            startOfDayTimestamp,
            endOfDayTimestamp,
            allInclusive
          )
        ) {
          const task = new Task(reminder, problem.id, item);
          if (reminder.isScheduled) {
            scheduledTasks.push(task);
          } else {
            anytimeTasks.push(task);
          }
        }
      });

      if (reminder.recurrenceRules) {
        if (isReminderActiveAndUncompleted && isFuture) {
          scheduledTasks = scheduledTasks.concat(
            reminder.recurrenceRules
              .between(startOfDay, endOfDay, true)
              .map((date) => new Task(reminder, problem.id, date))
          );
        }
      } else {
        if (
          isReminderActiveAndUncompleted &&
          reminder.createdAt.getTime() <= endOfDayTimestamp
        ) {
          anytimeTasks.push(new Task(reminder, problem.id));
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
      .forEach((task) => {
        const title = this.timeFormatter.format(task.due);
        const group = groupedTasks.find((group) => group.title == title);

        if (group) {
          group.tasks.push(task);
        } else {
          groupedTasks.push(new TaskGroup(title, [task]));
        }
      });

    return groupedTasks;
  }

  addIntervention() {
    void this.$router.push({
      name: "newIntervention",
    });
  }

  addProblem() {
    void this.$router.push({
      name: "problem",
      params: { problemId: "new" },
    });
  }
}
</script>
