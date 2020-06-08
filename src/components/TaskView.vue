<template>
  <q-item tag="label">
    <q-item-section side top>
      <q-checkbox
        :disable="!hasCheckbox"
        v-model="isCompleted"
        :color="hasCheckbox ? color : 'grey-4'"
        keep-color
      />
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
          @click="navigateToDueDate"
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
      v-if="reminderActionItems.filter(item => item.condition).length"
    >
      <action-menu :items="reminderActionItems" :color="color" />
    </q-item-section>
    <q-popup-proxy no-parent-event ref="dateProxy">
      <date-time-popup :color="color" :value="task.due" />
    </q-popup-proxy>
  </q-item>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { date, QPopupProxy } from "quasar";
import { format } from "timeago.js";
import { Client } from "../models/client";
import { Task } from "../models/task";
import { Reminder } from "../models/reminder";
import { Intervention } from "../models/intervention";
import { RatingReminder } from "../models/ratingReminder";
import ActionMenu from "components/ActionMenu.vue";
import DateTimePopup from "components/DateTimePopup.vue";

const { formatDate, subtractFromDate } = date;

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
  $refs!: { dateProxy: QPopupProxy };

  get isCompleted() {
    return !!this.task.completed;
  }
  set isCompleted(value) {
    this.$store.direct.commit.toggleTaskCompletion({
      task: this.task,
      isCompleted: value,
      date: (this.date as unknown) as Date
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
    return this.task.due && this.task.due.getTime() < Date.now();
  }
  get timeAgo() {
    if (this.isDue && this.task.due) {
      return format(this.task.due, this.$root.$i18n.locale);
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
    return [
      {
        name: this.$t("newRating") + " …",
        icon: "far fa-comment-dots",
        action: () => this.routerPush("outcome"),
        condition:
          this.reminder instanceof RatingReminder && !this.task.completed
      },
      {
        name: this.$t("skipTask"),
        icon: "redo",
        action: this.skipTask,
        condition:
          !this.reminder.isCompleted &&
          !this.task.completed &&
          !!this.task.due &&
          this.reminder.recurrenceRules?.hasNext(this.task.due)
      },
      {
        name: this.$t("moveSingleTask") + " …",
        icon: "fas fa-step-forward",
        action: this.moveSingleTask,
        condition:
          this.reminder.isScheduled &&
          !this.reminder.isCompleted &&
          !this.task.completed
      },
      {
        name: this.$t("moveFutureTasks") + " …",
        icon: "fas fa-fast-forward",
        action: this.moveFutureTasks,
        condition:
          this.reminder.isRecurring &&
          !this.reminder.isCompleted &&
          !this.task.completed
      },
      {
        name:
          this.$t("showProblem", {
            problem: this.problemName
          }) + " …",
        icon: "far fa-arrow-right",
        action: () => this.routerPush("clientReport"),
        condition:
          this.reminder instanceof Intervention && !this.record?.resolvedAt
      },
      {
        name: this.$t("editIntervention") + " …",
        icon: "fas fa-pen",
        action: () => this.routerPush("intervention"),
        condition:
          this.reminder instanceof Intervention && !this.reminder.isCompleted
      },
      {
        name: this.$t("stopRatingReminder"),
        icon: "fas fa-times-circle",
        isDestructive: true,
        action: this.endRatingReminder,
        condition:
          this.reminder instanceof RatingReminder && !this.reminder.isCompleted
      },
      {
        name: !this.reminder.isRecurring
          ? this.$t("deleteIntervention")
          : this.$t("deleteInterventionOnDate", {
              date: formatDate(this.date, "" + this.$t("dateFormat"))
            }),
        icon: "fas fa-times-circle",
        isDestructive: true,
        action: this.endIntervention,
        condition:
          this.reminder instanceof Intervention && !this.reminder.isCompleted
      }
    ];
  }

  skipTask() {}

  moveSingleTask() {
    this.$refs.dateProxy.show();
  }

  moveFutureTasks() {
    this.$refs.dateProxy.show();
  }

  endRatingReminder() {
    const changes: any = {};
    const key: keyof RatingReminder = "interval";
    changes[key] = 0;
    this.updateReminderAndSave(changes);
  }

  endIntervention() {
    const date = subtractFromDate(this.task.due || new Date(), {
      milliseconds: 1
    });
    const recurrenceRules = this.reminder.recurrenceRules?.updatingCurrentRule({
      until: date
    });
    this.updateReminder("recurrenceRules", recurrenceRules);
    this.$store.direct.commit.setReminderCompletedAt({
      reminder: this.reminder,
      completedAt: date
    });
    this.save();
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

  updateReminder(key: keyof Reminder, value: any) {
    const changes: any = {};
    changes[key] = value;
    this.$store.direct.commit.updateObject({
      target: this.reminder,
      changes: changes
    });
  }

  updateReminderAndSave(changes: any) {
    this.$store.direct.commit.updateObject({
      target: this.reminder,
      changes: changes
    });
    this.save();
  }

  save() {
    this.$store.direct.dispatch.saveClient({
      client: this.client,
      resolveOnError: true
    });
  }
}
</script>
