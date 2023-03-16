<template>
  <q-item
    class="column non-selectable q-pr-xs"
    dense
    clickable
    @click="isEditing = true"
  >
    <div class="row items-center">
      <div class="q-pr-xs">
        <q-checkbox
          :disable="isDisabled"
          :model-value="!!task.completed"
          @update:model-value="toggleTaskCompletion"
          :color="!isDisabled ? 'primary' : 'grey-4'"
          keep-color
          class="text-primary text-weight-medium"
        />
      </div>
      <div class="q-pr-sm">
        <signature
          :userId="task.user"
          :description="localizedSignature"
          has-tooltip
          class="task-signature"
        />
      </div>
      <div class="col">
        <q-item-label caption>{{ description }}</q-item-label>
        <q-item-label :class="[title ? '' : 'text-italic']">{{ title || $t("notSpecified") }}</q-item-label>
      </div>
      <div
        v-if="!isDisabled"
        class="q-pl-sm"
      >
        <q-btn
          v-if="!isEditing"
          icon="edit"
          :title="$t('edit')"
          round
          outline
          color="primary"
          size="10.5px"
          class="bg-white"
          @click="isEditing = true"
        />
        <q-btn 
          v-else
          :label="$t('done')"
          rounded
          no-caps
          dense
          :outline="!intervention.intervention.details"
          color="primary"
          class="q-px-sm"
          @click.stop="validate('' + customWarnings, () => isEditing = false)"
        />
      </div>
    </div>
    <div
      v-if="isEditing && !isDisabled"
      class="q-pl-xl"
    >
      <warning
        v-model="showWarning"
        :messages="customWarnings"
        margin="q-mt-sm"
      />
      <div
        v-if="intervention.arrangedIntervention"
        class="column"
      >
        <q-input
          :model-value="intervention.intervention.details"
          @update:model-value="update(intervention.arrangedIntervention, {details: $event})"
          @change="saveClient"
          :label="$t('careSupportActivity')"
          :hint="$t('supportGivenDescription')"
          hide-bottom-space
          class="q-mb-xs"
        />
        <recurrence-rule-editor
          :model-value="intervention.intervention.recurrenceRules"
          :rule-index="0"
          noFrequencyKey="NeverOrSporadic"
          hide-start
          hide-end
          @update:model-value="didUpdateRule"
        />
      </div>
      <div
        v-else
        class="column"
      >
        <intervention-category-select
          :model-value="intervention.categoryCode"
          @update:model-value="updateAndSave(intervention, {categoryCode: $event})"
          class="q-mt-xs"
        />
        <intervention-target-select
          v-if="intervention.categoryCode"
          :model-value="intervention.targetCode"
          @update:model-value="updateAndSave(intervention, {targetCode: $event})"
          :categoryCode="intervention.categoryCode"
        />
        <q-input
          :model-value="intervention.details"
          @update:model-value="update(intervention, {details: $event})"
          @change="saveClient"
          :label="$t('supportNeeds')"
          :hint="$t('supportNeededDescription')"
          hide-bottom-space
          class="q-mb-md"
        />
      </div>
      <div class="row justify-start q-mb-lg">
        <q-btn 
          v-if="!intervention.isFinished"
          :label="$t('cancelRequest')"
          icon="fas fa-times"
          rounded
          outline
          no-caps
          dense
          color="negative"
          class="q-px-sm shadow-1 bg-white"
          @click="endIntervention"
        />
        <q-btn 
          v-else-if="intervention.arrangedIntervention && !intervention.arrangedIntervention.isFinished"
          :label="$t('careActivityWasCompleted')"
          icon="fas fa-stop-circle"
          rounded
          outline
          no-caps
          dense
          color="negative"
          class="q-px-sm shadow-1 bg-white"
          @click="endArrangedIntervention"
        />
      </div>
    </div>
  </q-item>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-facing-decorator";
import { TranslateResult } from "vue-i18n";
import { Intervention, Task, RRuleSet } from "../models";
import InterventionMixin, { InterventionMixinInterface } from "../mixins/InterventionMixin";
import RecordValidator, { RecordValidatorInterface } from "../mixins/RecordValidator";
import Signature from "../components/Signature.vue";
import RecurrenceRuleEditor from "../components/RecurrenceRuleEditor.vue";
import Warning from "../components/Warning.vue";
import InterventionCategorySelect from "../components/InterventionCategorySelect.vue";
import InterventionTargetSelect from "../components/InterventionTargetSelect.vue";

interface ContactTaskView extends RecordValidatorInterface, InterventionMixinInterface {};

@Component({
  components: {
    Signature,
    RecurrenceRuleEditor,
    Warning,
    InterventionCategorySelect,
    InterventionTargetSelect
  },
  mixins: [RecordValidator, InterventionMixin]
})
class ContactTaskView extends Vue {
  @Prop({ type: Object, required: true}) readonly task!: Task<Intervention>;

  isEditing = Date.now() < this.task.reminder.createdAt.getTime() + 1000;

  get intervention() {
    return this.task.reminder;
  }
  get recurrenceRules() {
    return this.intervention.intervention.recurrenceRules;
  }
  get title() {
    const arrangedIntervention = this.intervention?.arrangedIntervention;
    const details = this.intervention.intervention.details;

    if (arrangedIntervention) {
      let prefix: TranslateResult | undefined;
      let suffix = "";

      if (details) {
        if (this.intervention.hasCompletedOccurences) {
          prefix = this.$t("agreementTitle");
        } else {
          prefix = this.$t("requestInterventionTitle");
        }
      }

      suffix = this.localizeRecurrenceRule(arrangedIntervention.recurrenceRules);
      
      if (suffix) {
        suffix = " (" + suffix + ")"
      }

      return [prefix, details + suffix].filter(Boolean).join(": ");
    } else {
      return details;
    }
  }
  get description() {
    if (this.intervention.arrangedIntervention) {
      return "";
    } else {
      return this.interventionDescription(this.intervention);
    }
  }
  get localizedRecurrenceRule() {
    return this.localizeRecurrenceRule(this.recurrenceRules, 0);
  }
  get localizedSignature() {
    const values = {
      date: this.task.completed 
        ? this.$d(this.task.completed, "DateTimeShort")
        : "",
      name: this.findContactName(this.intervention.receiver, this.client)
    }

    if (this.intervention.arrangedIntervention) {
      return this.$t("agreementWithNameAndDate", values);
    } else {
      return this.$t("receivingWithNameAndDate", values);
    }
  }
  get customWarnings() {
    if (!this.intervention.intervention.details) {
      if (this.intervention.arrangedIntervention) {
        return this.$t("noCareSupportActivityDetailsWarning")
      } else {
        return this.$t("noSupportNeedsDetailsWarning")
      }
    } else {
      return ""
    }
  }

  toggleTaskCompletion(value: boolean) {
    if (!this.client) {
      return;
    }

    this.$store.direct.commit.toggleTaskCompletion({
      task: this.task,
      isCompleted: value,
      client: this.client
    });
    void this.saveClient();
  }
  endIntervention() {
    if (!this.client) {
      return;
    }

    this.$store.direct.commit.endReminder({
      task: this.task,
      client: this.client
    });
    void this.saveClient();
  }
  endArrangedIntervention() {
    if (!this.client || !this.intervention.arrangedIntervention) {
      return;
    }

    this.$store.direct.commit.endReminder({
      task: new Task(this.intervention.arrangedIntervention, this.task.problemId),
      client: this.client
    });
    void this.saveClient();
  }
  didUpdateRule(value?: RRuleSet) {
    if (!!value && value._rrule.length == 0 && value._rdate.length > 0) {
      value = undefined;
    }
    
    this.updateAndSave(this.intervention.arrangedIntervention, {recurrenceRules: value});
  }
}

export default ContactTaskView;
</script>