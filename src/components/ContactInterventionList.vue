<template>
  <div
    v-if="contact"
    :class="[$q.screen.gt.xs ? 'q-px-md' : 'q-px-xs']"
  >
    <q-list class="hover-primary no-padding-xs">
      <q-item class="q-pl-none q-pr-xs q-pt-lg q-pb-sm">
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-bold">
            <text-with-tooltip 
              :text="$t('supportGivenTitle')"
              :tooltip="$t('supportGivenDescription')"
              icon-class="text-grey-7"
            />
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn 
            v-if="!isDisabled"
            icon="add"
            round
            outline
            color="primary"
            size="10.5px"
            @click="addGivenSupport"
            :title="$t('addGivenSupport')"
            class="shadow-1"
          />
        </q-item-section>
      </q-item>
      <no-data-item
        v-if="!tasks.giving.length"
        :text-label="$t('nonePlanned')"
        button-classes="text-weight-regular"
        :hide-button="isDisabled"
        @click="addGivenSupport"
      />
      <contact-task-view
        v-for="task in tasks.giving"
        :key="task.id"
        :task="task"
        ref="givingTaskView"
      />

      <q-item class="q-pl-none q-pr-xs q-pt-lg q-pb-sm">
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-bold">
            <text-with-tooltip 
              :text="$t('supportNeededTitle')"
              :tooltip="$t('supportNeededDescription')"
              icon-class="text-grey-7"
            />
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn 
            v-if="!isDisabled"
            icon="add"
            round
            outline
            color="primary"
            size="10.5px"
            @click="addNeededSupport"
            :title="$t('addNeededSupport')"
            class="shadow-1"
          />
        </q-item-section>
      </q-item>
      <no-data-item
        v-if="!tasks.receiving.length"
        :text-label="$t('nonePlanned')"
        button-classes="text-weight-regular"
        :hide-button="isDisabled"
        @click="addNeededSupport"
      />
      <contact-task-view
        v-for="task in tasks.receiving"
        :key="task.id"
        :task="task"
        ref="receivingTaskView"
      />
    </q-list>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import { Contact, Task, Intervention } from "../models";
import NoDataItem from "../components/NoDataItem.vue";
import ContactTaskView from "../components/ContactTaskView.vue";
import TextWithTooltip from "../components/TextWithTooltip.vue";
import RecurrenceRuleEditor from "../components/RecurrenceRuleEditor.vue";

@Component({
  components: {
    NoDataItem,
    ContactTaskView,
    TextWithTooltip,
    RecurrenceRuleEditor
  }
})
export default class ContactInterventionList extends RecordMixin {
  @Prop(Object) readonly contact!: Contact;
  @Ref() readonly givingTaskView!: ContactTaskView[];
  @Ref() readonly receivingTaskView!: ContactTaskView[];
  
  get tasks() {
    const givingTasks: Task<Intervention>[] = [];
    const receivingTasks: Task<Intervention>[] = [];

    this.client?.forAllReminders((reminder, problem) => {
      if (reminder instanceof Intervention && 
          (reminder.receiver == this.contact.id) && 
          (!reminder.isFinished || reminder.hasCompletedOccurences)) {
        const task = new Task(reminder, problem?.id, reminder.occurrences[0]);

        if (reminder.arrangedIntervention) {
          if (!reminder.arrangedIntervention.isFinished) {
            givingTasks.push(task);
          }
        } else {
          receivingTasks.push(task);
        }
      }
    });

    return {
      giving: givingTasks.sort(Task.sortByCreatedAt),
      receiving: receivingTasks.sort(Task.sortByCreatedAt)
    }
  }

  addGivenSupport() {
    const intervention = Intervention.fromCode("03.60"); // case management: support system
    intervention.receiver = this.contact.id;
    intervention.arrangedIntervention = new Intervention()
    intervention.arrangedIntervention.assignee = this.contact.id;
    const reminders = this.client?.unrelatedReminders || [];
    this.update(this.client, {unrelatedReminders: reminders.concat([intervention]) })
    void this.saveClient();
  }
  addNeededSupport() {
    const intervention = new Intervention();
    intervention.receiver = this.contact.id;
    const reminders = this.client?.unrelatedReminders || [];
    this.update(this.client, {unrelatedReminders: reminders.concat([intervention]) })
    void this.saveClient();
  }
}
</script>