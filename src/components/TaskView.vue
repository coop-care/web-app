<template>
  <q-item tag="label" @click.prevent="">
    <q-item-section side top :class="task.user ? 'q-pr-xs' : ''">
      <q-checkbox
        :disable="!hasCheckbox || disabled"
        v-model="isCompleted"
        :color="hasCheckbox && !disabled ? color : 'grey-4'"
        keep-color
        :class="'text-' + color + ' text-weight-medium'"
      />
    </q-item-section>
    <q-item-section v-if="task.user" side class="">
      <div
        :class="'signature bg-' + color + '-light text-' + color"
        style="border: 1px solid; font-size: 11.7px"
      >
        {{ task.user }}
      </div>
    </q-item-section>
    <q-item-section>
      <q-item-label
        :class="'text-weight-medium ' + (isDue ? 'text-negative' : '')"
      >
        {{ title }}
      </q-item-label>
      <q-item-label caption v-if="description || timeAgo" lines="2">
        <span
          v-if="timeAgo"
          @click.prevent="navigateToDueDate"
          class="link text-negative text-weight-medium"
          >{{ timeAgo }}</span
        >
        <span v-if="timeAgo && description">, </span>
        <span v-if="description">{{ description }}</span>
      </q-item-label>
    </q-item-section>
    <q-item-section v-if="primaryAction" side>
      <q-btn
        :icon="primaryAction.icon"
        :title="primaryAction.name"
        round
        :color="color"
        size="13px"
        dense
        @click.prevent="primaryAction.action"
      />
    </q-item-section>
    <q-item-section
      side
      v-if="
        !disabled && reminderActionItems.filter(item => item.condition).length
      "
    >
      <action-menu :items="reminderActionItems" :color="color" />
    </q-item-section>
    <q-popup-proxy
      no-parent-event
      ref="dateProxy"
      max-height="99vh"
      anchor="center middle"
      self="center middle"
    >
      <date-time-popup
        :value="task.due"
        :format="$t('datetimeFormat')"
        :min="new Date(new Date().setHours(0, 0, 0, 0))"
        :color="color"
        @input="onTaskMove"
      />
    </q-popup-proxy>
  </q-item>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { date, QPopupProxy } from "quasar";
import { DateTime } from "luxon";
import {
  Client,
  Task,
  Reminder,
  Intervention,
  RatingReminder
} from "../models";
import ActionMenu from "components/ActionMenu.vue";
import DateTimePopup from "components/DateTimePopup.vue";

const { formatDate, subtractFromDate, isSameDate } = date;

const TaskViewProps = Vue.extend({
  props: {
    client: Client,
    task: Task,
    date: Date,
    hasCheckbox: Boolean
  }
});

@Component({
  components: {
    ActionMenu,
    DateTimePopup
  }
})
export default class TaskView extends TaskViewProps {
  moveTaskMode: "single" | "future" | "none" = "none";
  $refs!: { dateProxy: QPopupProxy };

  get disabled() {
    return !!this.client.leftAt;
  }
  get isCompleted() {
    return !!this.task.completed;
  }
  set isCompleted(value) {
    this.$store.direct.commit.toggleTaskCompletion({
      task: this.task,
      isCompleted: value,
      date: (this.date as unknown) as Date,
      client: this.client
    });
    this.$store.direct.dispatch.saveClient({ client: this.client });
  }
  get title() {
    if (this.reminder instanceof Intervention) {
      return this.reminder.details;
    } else if (this.reminder instanceof RatingReminder) {
      return this.$t("interimRating");
    } else {
      return "";
    }
  }
  get description() {
    let description: string;
    if (this.reminder instanceof Intervention) {
      description =
        this.$t(this.reminder.category.title) +
        ": " +
        this.$t(this.reminder.target.title);
    } else if (this.reminder instanceof RatingReminder) {
      description = this.$t("forProblem", {
        problem: this.problemName
      }).toString();
    } else {
      description = "";
    }

    return description;
  }
  get isDue() {
    return (
      this.task.due &&
      !this.task.completed &&
      this.task.due.getTime() < Date.now()
    );
  }
  get timeAgo() {
    const selectedDate = (this.date as unknown) as Date;

    if (
      this.isDue &&
      this.task.due &&
      !isSameDate(selectedDate, this.task.due, "day")
    ) {
      const locale = this.$root.$i18n.locale;
      const startOfDayTimestamp = new Date().setHours(0, 0, 0, 0);
      const sevenDaysAgo = subtractFromDate(startOfDayTimestamp, {
        days: 7
      }).getTime();
      if (this.task.due.getTime() > sevenDaysAgo) {
        return this.$t("sinceDate", {
          date: this.task.due.toLocaleString(locale, { weekday: "long" })
        });
      } else {
        return this.$t("sinceDate", {
          date: this.task.due.toLocaleString(locale, DateTime.DATE_SHORT)
        });
      }
    } else {
      return undefined;
    }
  }
  get color() {
    if (this.reminder instanceof Intervention) {
      return "intervention";
    } else if (this.reminder instanceof RatingReminder) {
      return "outcome";
    } else {
      return "intervention";
    }
  }
  get reminder() {
    return this.task.reminder;
  }
  get problemName() {
    return this.$t(this.record?.problem.title || "");
  }
  get record() {
    return this.client.findProblemRecord(this.task.problemId);
  }
  get primaryAction() {
    return undefined;
  }
  get reminderActionItems() {
    const isIntervention = this.reminder instanceof Intervention;
    const isRatingReminder = this.reminder instanceof RatingReminder;
    const isReminderUncompleted = !this.reminder.isCompleted;
    const isTaskUncompleted = !this.task.completed;
    const isUncompleted = isReminderUncompleted && isTaskUncompleted;
    return [
      {
        name: this.$t("newRating") + " …",
        icon: "far fa-comment-dots",
        action: () => this.routerPush("outcome"),
        condition: isRatingReminder && isTaskUncompleted
      },
      {
        name: this.$t("skipTask"),
        icon: "redo",
        action: this.skipTask,
        condition: isUncompleted && !!this.task.due
      },
      {
        name: this.$t("moveSingleTask") + " …",
        icon: "fas fa-step-forward",
        action: this.moveSingleTask,
        condition: this.reminder.isScheduled && isUncompleted
      },
      {
        name: this.$t("moveFutureTasks") + " …",
        icon: "fas fa-fast-forward",
        action: this.moveFutureTasks,
        condition: this.reminder.isRecurring && isUncompleted
      },
      {
        name:
          this.$t("showProblem", {
            problem: this.problemName
          }) + " …",
        icon: "far fa-arrow-right",
        action: () => this.routerPush("clientReport"),
        condition: isIntervention && !this.record?.resolvedAt
      },
      {
        name: this.$t("editIntervention") + " …",
        icon: "fas fa-pen",
        action: () => this.routerPush("intervention"),
        condition: isIntervention && isReminderUncompleted
      },
      {
        name: this.$t("stopRatingReminder"),
        icon: "fas fa-times-circle",
        isDestructive: true,
        action: this.endRatingReminder,
        condition: isRatingReminder && isReminderUncompleted
      },
      {
        name: !this.reminder.isRecurring
          ? this.$t("deleteIntervention")
          : this.$t("deleteInterventionOnDate", {
              date: formatDate(this.task.due, "" + this.$t("datetimeFormat"))
            }),
        icon: "fas fa-times-circle",
        isDestructive: true,
        action: this.endReminder,
        condition: isIntervention && isReminderUncompleted
      }
    ];
  }

  skipTask() {
    const due = this.task.due;
    const recurrenceRules = this.reminder.recurrenceRules;
    const next = due ? recurrenceRules?.next(due, false) : undefined;

    if (due && next) {
      this.updateReminder({
        recurrenceRules: recurrenceRules?.movingRules(due, next)
      });
      this.save();
    } else {
      if (this.reminder instanceof RatingReminder) {
        this.endRatingReminder();
      } else {
        this.endReminder();
      }
    }
  }

  moveSingleTask() {
    this.moveTaskMode = "single";
    this.$refs.dateProxy.show();
  }

  moveFutureTasks() {
    this.moveTaskMode = "future";
    this.$refs.dateProxy.show();
  }

  endReminder() {
    const due = this.task.due || new Date();
    const date = subtractFromDate(due, { milliseconds: 1 });

    if (this.reminder.isRecurring) {
      const recurrenceRules = this.reminder.recurrenceRules?.endingRules(date);
      this.updateReminder({ recurrenceRules: recurrenceRules });
    }

    this.$store.direct.commit.setReminderCompletedAt({
      reminder: this.reminder,
      completedAt: date,
      recalculateOccurrences: true,
      client: this.client,
      problemId: this.task.problemId
    });
    this.save();
  }

  endRatingReminder() {
    this.updateRatingReminder({ interval: 0 });
    this.save();
  }

  onTaskMove(date: Date) {
    if (!this.task.due || this.moveTaskMode == "none") {
      return;
    }

    const recurrenceRules = this.reminder.recurrenceRules?.movingRules(
      this.task.due,
      date,
      this.moveTaskMode == "single"
    );
    this.updateReminder({ recurrenceRules: recurrenceRules });
    this.save();
    this.moveTaskMode = "none";
  }

  navigateToDueDate() {
    if (this.task.due) {
      this.$router.push({
        name: "clientReminders",
        params: {
          day: "" + this.task.due.getTime(),
          clientId: this.$route.params.clientId
        }
      });
    }
  }

  routerPush(name: string) {
    this.$router.push({
      name: name,
      params: {
        clientId: this.client._id,
        problemId: this.task.problemId,
        interventionId: this.reminder.id
      } as any
    });
  }

  updateReminder(changes: Partial<Reminder>) {
    this.$store.direct.commit.updateReminder({
      target: this.reminder,
      changes: changes,
      updateFrom: this.task.due
    });
  }

  updateRatingReminder(changes: Partial<RatingReminder>) {
    this.updateReminder(changes);
  }

  save() {
    this.$store.direct.dispatch.saveClient({
      client: this.client,
      resolveOnError: true
    });
  }
}
</script>
