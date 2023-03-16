<template>
  <q-item
    tag="div"
    @click.prevent=""
    dense
    class="cursor-inherit"
  >
    <q-item-section
      side
      class="q-pr-xs"
    >
      <q-checkbox
        :disable="!hasCheckbox || disabled"
        v-model="isCompleted"
        :color="hasCheckbox && !disabled ? 'primary' : 'grey-4'"
        keep-color
        class="text-primary text-weight-medium"
      />
    </q-item-section>
    <q-item-section
      side
    >
      <signature
        :userId="task.user"
        :description="localizedSignature"
        has-tooltip
        class="task-signature"
      />
    </q-item-section>
    <q-item-section
      side
      class="q-pr-sm"
    >
      <div :class="'task-type bg-' + color"></div>
    </q-item-section>
    <q-item-section>
      <q-item-label
        caption
        v-if="description"
        lines="1"
      >
        {{ description }}
      </q-item-label>
      <q-item-label
        v-if="title"
        :class="[task.isDue ? 'text-negative' : '']"
      >
        <span :class="[hasDetails ? '': 'text-italic']">{{ title }}</span>
        <span
          v-if="timeAgo"
          @click.prevent="navigateToDueDate"
          class="text-caption text-weight-medium link"
        > ({{ timeAgo }})</span>
      </q-item-label>
    </q-item-section>
    <q-item-section
      v-if="extraButtons.length"
      side
    >
      <q-btn
        v-for="(button, index) in extraButtons"
        :key="'action' + index"
        :icon="button.icon"
        :title="button.name"
        round
        color="primary"
        size="13px"
        dense
        @click.prevent="button.action"
      />
    </q-item-section>
    <q-item-section
      side
      v-if="
        !disabled && reminderActionItems.filter(item => item.condition).length
      "
    >
      <action-menu
        :items="reminderActionItems"
        color="primary"
      />
    </q-item-section>
    <q-popup-proxy
      no-parent-event
      ref="dateProxy"
      max-height="99vh"
      anchor="center middle"
      self="center middle"
    >
      <date-time-popup
        :model-value="task.due"
        :format="$t('datetimeFormat')"
        :min="new Date(new Date().setHours(0, 0, 0, 0))"
        color="primary"
        @update:model-value="onTaskMove"
      />
    </q-popup-proxy>
  </q-item>
</template>

<style lang="sass">
.task-signature
  font-size: 11.7px
.task-type
  width: 3px
  height: calc(100% - 8px)
</style>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "vue-facing-decorator";
import { date, QPopupProxy } from "quasar";
import { TranslateResult } from "vue-i18n";
import {
  Client,
  Task,
  Reminder,
  Intervention,
  RatingReminder,
} from "../models";
import InterventionMixin, { InterventionMixinInterface } from "../mixins/InterventionMixin";
import ActionMenu, { ActionItem } from "components/ActionMenu.vue";
import DateTimePopup from "components/DateTimePopup.vue";
import Signature from "../components/Signature.vue";

const { formatDate, subtractFromDate, isSameDate } = date;

export const UpdateTimeoutMilliseconds = 2000;

interface TaskView extends InterventionMixinInterface {};

@Component({
  components: {
    ActionMenu,
    DateTimePopup,
    Signature
  },
  mixins: [InterventionMixin],
  emits: ["update"]
})
class TaskView extends Vue {
  @Prop({ type: Object, required: true}) readonly client!: Client;
  @Prop({ type: Object, required: true}) readonly task!: Task<Reminder>;
  @Prop({ type: Date, required: true}) readonly date!: Date;
  @Prop({ type: Boolean }) readonly hasCheckbox!: boolean;
  @Ref() readonly dateProxy!: QPopupProxy;

  moveTaskMode: "single" | "future" | "none" = "none";
  forceUpdateTimeoutHandler = 0;

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
      client: this.client,
    });
    this.$emit("update", true);
    void this.$store.direct.dispatch.saveClient({ client: this.client });

    if (this.isPastDue) {
      window.clearTimeout(this.forceUpdateTimeoutHandler || undefined);
      this.forceUpdateTimeoutHandler = window.setTimeout(
        () => this.$emit("update", true),
        UpdateTimeoutMilliseconds
      );
    }
  }
  get isPastDue() {
      return !!this.task.due && 
        this.task.due.getTime() < new Date(this.date).setHours(0, 0, 0, 0);
  }
  get completionDate() {
    return this.task.completed 
      ? this.$d(this.task.completed, "DateTimeShort") 
      : "";
  }
  get localizedSignature() {
    if (!this.intervention?.receiver) {
      return this.completionDate;
    } else {
      const values = {
        date: this.completionDate,
        name: this.receiverName
      }

      if (this.intervention.arrangedIntervention) {
        return this.$t("agreementWithNameAndDate", values);
      } else {
        return this.$t("receivingWithNameAndDate", values);
      }
    }
  }
  get hasDetails() {
    return !this.intervention || !!this.intervention.intervention.details;
  }
  get title() {
    if (this.reminder instanceof Intervention) {
      const details = this.reminder.intervention.details || this.$t("notSpecified");

      if (!this.receiverName) {
        return details;
      } else {
        let prefix: TranslateResult;
        let suffix = "";
        const arrangedIntervention = this.intervention?.arrangedIntervention;
        const values = {name: this.receiverName};

        if (arrangedIntervention) {
          if (this.isCompleted) {
            prefix = this.$t("agreementWithContact", values);
          } else {
            prefix = this.$t("requestInterventionFromContact", values);
          }

          suffix = this.localizeRecurrenceRule(arrangedIntervention.recurrenceRules);
          
          if (suffix) {
            suffix = " (" + suffix + ")"
          }
        } else {
          prefix = this.$t("supportForContact", values);
        }
        return [prefix, details + suffix].filter(Boolean).join(": ");
      }
    } else if (this.reminder instanceof RatingReminder) {
      return this.$t("interimRating") + " " + 
        this.$t("forProblem", {problem: this.problemName});
    } else {
      return this.$t("notSpecified");
    }
  }
  get description() {
    if (this.reminder instanceof Intervention) {
      return this.interventionDescription(this.reminder);
    } else {
      return "";
    }
  }
  get timeAgo() {
    const selectedDate = (this.date as unknown) as Date;

    if (
      this.task.isDue &&
      this.task.due &&
      !isSameDate(selectedDate, this.task.due, "day")
    ) {
      const startOfDayTimestamp = new Date().setHours(0, 0, 0, 0);
      const sevenDaysAgo = subtractFromDate(startOfDayTimestamp, {
        days: 7,
      }).getTime();
      const format = this.task.due.getTime() > sevenDaysAgo
        ? "WeekdayLong"
        : "DateShort";
      return this.$t("sinceDate", { date: this.$d(this.task.due, format) });
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
  get intervention() {
    if (this.reminder instanceof Intervention) {
      return this.reminder;
    } else {
      return undefined;
    }
  }
  get problemName() {
    return this.record?.problem.title
      ? this.$t(this.record?.problem.title)
      : "";
  }
  get receiverName() {
    return this.findContactName(this.intervention?.receiver, this.client);
  }
  get record() {
    return this.client.findProblemRecord(this.task.problemId);
  }
  get extraButtons() {
    return [] as ActionItem[];
  }
  get reminderActionItems() {
    const isIntervention = this.reminder instanceof Intervention;
    const isRatingReminder = this.reminder instanceof RatingReminder;
    const isReminderUnfinished = !this.reminder.isFinished;
    const isTaskUncompleted = !this.task.completed;
    const isUncompleted = isReminderUnfinished && isTaskUncompleted;
    let endInterventionLabel: TranslateResult;
    const clientId = this.client._id?.toHexString() || "";
    const problemId = this.task.problemId || "0";
    const interventionId = this.reminder.id;
    const params = { clientId, problemId, interventionId };

    if (!!this.intervention?.receiver) {
      endInterventionLabel = this.$t("cancelRequest");
    } else {
      if (this.reminder.isRecurring) {
        endInterventionLabel = this.$t("deleteInterventionOnDate", {
          date: formatDate(this.task.due, "" + this.$t("datetimeFormat")),
        });
      } else {
        endInterventionLabel = this.$t("deleteIntervention")
      }
    }

    return [
      {
        name: this.$t("newRating") + " …",
        icon: "far fa-comment-dots",
        action: () => this.$router.push({params: {...params, sheet: "newOutcome"}}),
        condition: isRatingReminder && isTaskUncompleted,
      },
      {
        name: this.$t("skipTask"),
        icon: "redo",
        action: this.skipTask,
        condition: isUncompleted && !!this.task.due,
      },
      {
        name: this.$t("moveSingleTask") + " …",
        icon: "fas fa-step-forward",
        action: this.moveSingleTask,
        condition: this.reminder.isScheduled && isUncompleted,
      },
      {
        name: this.$t("moveFutureTasks") + " …",
        icon: "fas fa-fast-forward",
        action: this.moveFutureTasks,
        condition: this.reminder.isRecurring && isUncompleted,
      },
      {
        name: this.$t("showProblem", {
            problem: this.problemName,
          }) + " …",
        icon: "far fa-arrow-right",
        action: () => this.$router.push({name: "clientReport", params: {clientId, expandedIds: problemId}}),
        condition: isIntervention && !!this.record && !this.record.resolvedAt,
      },
      {
        name: this.$t("editIntervention") + " …",
        icon: "fas fa-pen",
        action: () => this.$router.push({params: {...params, sheet: "editIntervention"}}),
        condition: isIntervention && isReminderUnfinished,
      },
      {
        name: this.$t("stopRatingReminder"),
        icon: "far fa-stop-circle",
        isDestructive: true,
        action: this.endRatingReminder,
        condition: isRatingReminder && isReminderUnfinished,
      },
      {
        name: endInterventionLabel,
        icon: "far fa-stop-circle",
        isDestructive: true,
        action: this.endIntervention,
        condition: isIntervention && isReminderUnfinished,
      },
    ];
  }

  skipTask() {
    const due = this.task.due;
    const recurrenceRules = this.reminder.recurrenceRules;
    const next = due ? recurrenceRules?.next(due, false) : undefined;

    if (due && next) {
      this.updateReminder({
        recurrenceRules: recurrenceRules?.movingRules(due, next),
      });
      this.save();
    } else {
      if (this.reminder instanceof RatingReminder) {
        this.endRatingReminder();
      } else {
        this.endIntervention();
      }
    }
  }

  moveSingleTask() {
    this.moveTaskMode = "single";
    this.dateProxy.show();
  }

  moveFutureTasks() {
    this.moveTaskMode = "future";
    this.dateProxy.show();
  }

  endIntervention() {
    this.$store.direct.commit.endReminder({
      task: this.task,
      client: this.client
    });
    this.$emit("update");
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
      void this.$router.push({
        name: "clientReminders",
        params: {
          day: "" + this.task.due.getTime(),
          clientId: this.$route.params.clientId,
        },
      });
    }
  }

  updateReminder(changes: Partial<Reminder>) {
    this.$store.direct.commit.updateReminder({
      target: this.reminder,
      changes: changes,
      updateFrom: this.task.due,
    });
    this.$emit("update");
  }

  updateRatingReminder(changes: Partial<RatingReminder>) {
    this.updateReminder(changes);
  }

  save() {
    void this.$store.direct.dispatch.saveClient({
      client: this.client,
      resolveOnError: true,
    });
  }
}

export default TaskView;
</script>
