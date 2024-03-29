<template>
  <div
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
            self="center middle"
          >
            <q-date
              v-model="selectedDateString"
              @update:model-value="dateProxy.hide()"
              :events="[]"
              color="primary"
              event-color="primary"
              mask="YYYY-MM-DD"
              today-btn
            />
          </q-popup-proxy>
        </q-btn>
      </div>
      <div class="q-mr-sm selected-date print-hide">
        <div class="text-h6 ellipsis">
          {{ $d(selectedDate, "WeekdayLong") }}
          {{ isToday ? $t("isTodayHint") : "" }}
        </div>
        <div class="text-body2">
          {{
            $d(selectedDate, "DateMed")
          }}
        </div>
      </div>
      <div class="text-h6 print-only">
        {{ $t("tasksForDay") }}
        {{ $d(selectedDate, "DateHuge") }}
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

    <!-- <time-recording
      v-if="canComplete"
      :date="selectedDate"
      class="q-mt-sm"
    /> -->

    <q-list
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
            @update="updateTasks"
          />
          <div
            v-else
            class="text-subtitle1 text-weight-bold q-pt-lg"
          >
            {{ taskOrTitle.title }}
          </div>
        </div>

        <div
          v-if="!tasks.length"
          key="noTasks"
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

        <shift-notes-day-view
          key="shiftnotes"
          :date="selectedDate"
          :canAddNote="isToday"
          :class="['q-pb-xl', $q.screen.gt.xs ? 'q-px-md' : '']"
        />
      </transition-group>
    </q-list>

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
    max-width: 600px
  .thin-button
    width: 32px
  .selected-date
    width: 184px
    div:first-of-type
      margin-bottom: -5px
body.desktop .task-list .q-hoverable:hover > .q-focus-helper
  background-color: var(--q-primary)
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
.shift-notes
  margin-top: 64px
</style>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-facing-decorator";
import { date, QPopupProxy } from "quasar";
import { Task, TaskGroup, Reminder, GroupedTask } from "../models";
import RecordMixin, { RecordMixinInterface } from "../mixins/RecordMixin";
import TaskView, { UpdateTimeoutMilliseconds } from "components/TaskView.vue";
import ShiftNotesDayView from "components/ShiftNotesDayView.vue";
import TimeRecording from "components/TimeRecording.vue";

interface ClientReminders extends RecordMixinInterface {};

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
    ShiftNotesDayView,
    TimeRecording
  },
  mixins: [RecordMixin]
})
class ClientReminders extends Vue {
  @Ref() readonly dateProxy!: QPopupProxy;
  tasks: GroupedTask[] = [];
  isToday = true;
  startOfTodayTimer = 0;
  endOfTodayTimer = 0;

  @Watch("$route")
  onRouteChange() {
    this.updateTasks();
    this.updatedIsToday();  
  }

  get selectedDate() {
    return new Date(parseInt(this.$route.params.day as string) || Date.now());
  }
  set selectedDate(value) {
    void this.$router.push({
      name: this.$route.name || undefined,
      params: { 
        ...this.$route.params, 
        day: "" + value.getTime()
      },
    });
    this.updateTasks();
    this.updatedIsToday();
    this.setTodayTimers();
  }
  get selectedDateString() {
    return this.selectedDate.toISOString();
  }
  set selectedDateString(value: string) {
    if (value) {
      this.selectedDate = new Date(value + "T00:00:00.000Z");
    }
  }
  get canComplete() {
    return isBetweenDates(
      this.selectedDate,
      this.selectedDate,
      new Date(),
      allInclusive
    );
  }
  get hasActiveProblems() {
    return this.client && this.client.activeProblems.length > 0
  }
  get taskListTransitionGroupKey() {
    return [
      "task.list", 
      this.client?._id?.toHexString() || "no-client-id", 
      this.$route.params.day || "today"
    ].join(".");
  }

  updatedIsToday() {
    return this.isToday = isSameDate(this.selectedDate, Date.now(), "day");
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

  updateTasks(animated?: boolean) {
    this.tasks = this.tasksForDay(this.selectedDate, animated)
  }

  tasksForDay(day: Date, animated = false) {
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
    const pastDueCompletedTimestamp = Date.now() - (animated ? UpdateTimeoutMilliseconds : 0);
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
        const title = task.due ? this.$d(task.due, "TimeSimple") : "";
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
      params: { sheet: "newIntervention" },
    });
  }

  addProblem() {
    void this.$router.push({
      name: "clientReport", 
      params: { sheet: "newProblem" }
    });
  }

  visibilityDidChange() {
    if (document.visibilityState == "visible") {
      setTimeout(() => {
        this.updateTasks();
        this.updatedIsToday();  
      }, 2000); // give fetch data some time to load everything
    }
  }

  setTodayTimers() {
    this.clearTodayTimers();
    const timeUntilSelectedDateBecomesToday = startOfDate(this.selectedDate, "day", false).getTime() + 1000 - Date.now();
    const timeUntilSelectedDateWasToday = endOfDate(this.selectedDate, "day", false).getTime() + 1000 - Date.now();

    if (timeUntilSelectedDateBecomesToday > 0) {
      this.startOfTodayTimer = window.setTimeout(this.updatedIsToday, timeUntilSelectedDateBecomesToday);
    }

    if (timeUntilSelectedDateWasToday > 0) {
      this.endOfTodayTimer = window.setTimeout(this.updatedIsToday, timeUntilSelectedDateWasToday);
    }
  } 

  clearTodayTimers() {
    window.clearTimeout(this.startOfTodayTimer);
    this.startOfTodayTimer = 0;
    
    window.clearTimeout(this.endOfTodayTimer);
    this.endOfTodayTimer = 0;
  }

  created() {
    this.tasks = this.tasksForDay(this.selectedDate);
    window.addEventListener("visibilitychange", this.visibilityDidChange);
    this.updateTasks();
    this.updatedIsToday();
    this.setTodayTimers();
  }

  unmounted() {
    window.removeEventListener("visibilitychange", this.visibilityDidChange);
    this.clearTodayTimers();
  }
}

export default ClientReminders;
</script>
