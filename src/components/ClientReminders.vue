<template>
  <div
    v-touch-swipe.mouse.horizontal="swipeTasks"
    class="client-reminders min-height column items-center"
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
      <div class="q-mr-sm selected-date print-hide">
        <div class="text-h6 ellipsis">
          {{ formattedDate({ weekday: "long" }) }}
          {{ todayHint }}
        </div>
        <div class="text-body2">
          {{
            formattedDate({ year: "numeric", month: "long", day: "numeric" })
          }}
        </div>
      </div>
      <div class="text-h6 print-only">
        {{ $t("tasksForDay") }}
        {{ formattedDate({ weekday: "long",  year: "numeric", month: "long", day: "numeric" }) }}
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

    <q-list 
      v-if="tasks.length"
      class="q-mb-xl full-width"
      dense
    >
      <transition-group 
        name="task-list" 
        tag="div"
        :key="taskListTransitionGroupKey"
        class="task-list"
        @before-leave="beforeLeaveTaskList"
      >
        <div
          v-for="taskOrTitle in tasks"
          :key="taskOrTitle.title"
          class="task-list-item no-padding-xs full-width"
        >
          <task-view
            v-if="taskOrTitle.task"
            :client="client"
            :task="taskOrTitle.task"
            :date="selectedDate"
            :hasCheckbox="canComplete"
            @force-update="recompute = Math.random()"
          />
          <div
            v-else
            class="text-subtitle1 text-weight-bold q-pt-lg"
          >
            {{ taskOrTitle.title }}
          </div>
        </div>
      </transition-group>
    </q-list>

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
          v-if="!isDisabled"
          :label="$t('problemAdmission')"
          flat
          no-caps
          rounded
          size="md"
          color="classification"
          class="q-mt-xs text-normal"
          @click="addProblem"
        />
      </div>
    </div>

    <q-page-sticky
      v-if="!isDisabled && hasActiveProblems"
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
  &> *
    max-width: 560px
  .thin-button
    width: 32px
  .selected-date
    width: 184px
    div:first-of-type
      margin-bottom: -5px
body.desktop .task-list .q-hoverable:hover > .q-focus-helper
  background-color: var(--q-color-primary)
.task-list
  position: relative
.task-list-item
  transition: opacity 1s ease-in-out
.task-list-leave-active
  position: absolute
.task-list-leave-to
  opacity: 0
.task-list-move
  transition: opacity 1s ease-in-out, transform .3s ease-in-out .7s
</style>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { date, QPopupProxy } from "quasar";
import { Task, TaskGroup, Reminder } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import TaskView, { UpdateTimeoutMilliseconds } from "components/TaskView.vue";

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
export default class ClientReminders extends RecordMixin {
  @Ref() readonly dateProxy!: QPopupProxy;

  recompute = Math.random();

  get selectedDate() {
    const timestamp = parseInt(this.$root.$route.params.day)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const recompute = this.recompute
    return !isNaN(timestamp)
      ? new Date(timestamp)
      : new Date();
  }
  set selectedDate(value) {
    this.$route.params.day = "" + value.getTime();
    void this.$router.push({
      name: this.$route.name || undefined,
      params: this.$route.params,
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
  get timeFormatter() {
    return new Intl.DateTimeFormat(this.$root.$i18n.locale, {
      hour: "numeric",
      minute: "numeric",
    });
  }
  get todayHint() {
    if (isSameDate(this.selectedDate, new Date(), "day")) {
      return this.$t("isTodayHint");
    } else {
      return "";
    }
  }
  get hasActiveProblems() {
    return this.client && this.client.activeProblemCount > 0
  }
  get taskListTransitionGroupKey() {
    return [
      "task.list", 
      this.client?._id?.toHexString() || "no-client-id", 
      this.$root.$route.params.day || "today"
    ].join(".");
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
    const startOfDay = startOfDate(day, "day", false);
    const endOfDay = endOfDate(day, "day", false);
    const startOfDayTimestamp = startOfDay.getTime();
    const endOfDayTimestamp = endOfDay.getTime();
    const startOfTodayTimestamp = new Date().setHours(0, 0, 0, 0);
    const endOfTodayTimestamp = new Date().setHours(23, 59, 59, 999);
    const pastDueTimestamp = Math.min(
      startOfDayTimestamp,
      startOfTodayTimestamp
    );
    const pastDueCompletedTimestamp = Date.now() - UpdateTimeoutMilliseconds;
    const isFuture = endOfTodayTimestamp < startOfDayTimestamp;
    const isPresentOrPast = startOfDayTimestamp <= startOfTodayTimestamp;
    const pastDueTasks: Task<Reminder>[] = [];
    const anytimeTasks: Task<Reminder>[] = [];
    let scheduledTasks: Task<Reminder>[] = [];
    const groupedTasks: TaskGroup[] = [];

    this.client?.forAllReminders((reminder, problem) => {
      const isReminderActiveAndUncompleted =
        (!problem || !problem.resolvedAt) &&
        (!problem || problem.problem.isHighPriority) &&
        !reminder.isFinished &&
        !this.client?.leftAt;

      reminder.occurrences.forEach((item) => {
        if (
          isPresentOrPast &&
          isReminderActiveAndUncompleted &&
          item.due.getTime() < pastDueTimestamp &&
          (!item.completed || (pastDueCompletedTimestamp < item.completed.getTime()))
        ) {
          pastDueTasks.push(new Task(reminder, problem?.id, item));
        } else if (
          (isReminderActiveAndUncompleted || item.completed) &&
          isBetweenDates(
            item.due,
            startOfDayTimestamp,
            endOfDayTimestamp,
            allInclusive
          )
        ) {
          const task = new Task(reminder, problem?.id, item);
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
              .map((date) => new Task(reminder, problem?.id, date))
          );
        }
      } else {
        if (
          isReminderActiveAndUncompleted &&
          reminder.createdAt.getTime() <= endOfDayTimestamp
        ) {
          anytimeTasks.push(new Task(reminder, problem?.id));
        }
      }
    });

    if (pastDueTasks.length) {
      pastDueTasks.sort(Task.sortByDueDate);
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
      .sort(Task.sortByDueDate)
      .forEach((task) => {
        const title = this.timeFormatter.format(task.due);
        const group = groupedTasks.find((group) => group.title == title);

        if (group) {
          group.tasks.push(task);
        } else {
          groupedTasks.push(new TaskGroup(title, [task]));
        }
      });

    return groupedTasks.flatMap(group => group.titleAndTasks);
  }

  beforeLeaveTaskList(el: HTMLElement) {
    const {marginTop} = window.getComputedStyle(el);
    el.style.top = el.offsetTop - parseFloat(marginTop) + "px";
  }

  addIntervention() {
    void this.$router.push({
      name: "clientNewIntervention",
    });
  }

  addProblem() {
    void this.$router.push({
      name: "clientProblem",
      params: { problemId: "new" },
    });
  }

  visibilityDidChange() {
    if (document.visibilityState == "visible") {
      this.recompute = Math.random();
    }
  }

  created() {
    window.addEventListener("visibilitychange", this.visibilityDidChange);
  }

  beforeDestroy() {
    window.removeEventListener("visibilitychange", this.visibilityDidChange);
  }
}
</script>
