<template>
  <editing-sheet
    ref="editingSheet"
    :title="title"
    :is-data-available="!!(client && editableOutcome)"
    :paramsToRemoveOnClose="['problemId']"
    :hasPendingChanges="hasPendingChanges"
  >
    <problem-rating
      v-model="editableOutcome"
      :problem-code="problemCode"
      :rating-reminder="editableRatingReminder"
      @change:rating-reminder="updateRatingReminder"
    />
    <warning
      v-model="showWarning"
      :messages="ratingWarnings(editableOutcome)"
    />
    <div class="q-mt-lg row justify-center">
      <q-btn
        @click="validate(ratingWarnings(editableOutcome), save)"
        color="primary"
        rounded
        unelevated
        no-caps
        :outline="!!ratingWarnings(editableOutcome)"
        :label="addButtonLabel"
        class="done-button"
      />
    </div>
  </editing-sheet>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "vue-facing-decorator";
import RecordValidator, { RecordValidatorInterface } from "../mixins/RecordValidator";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import ProblemRating from "components/ProblemRating.vue";
import Warning from "components/Warning.vue";
import { Outcome, RatingReminder } from "src/models";
import EditingSheet from "../components/EditingSheet.vue";

interface Rating extends RecordValidatorInterface {};

@Component({
  components: {
    ProblemSummaryContainer,
    ProblemRating,
    Warning,
    EditingSheet,
  },
  mixins: [RecordValidator]
})
class Rating extends Vue {
  @Ref() readonly editingSheet!: EditingSheet;
  editableOutcome = new Outcome(); // value is replaced with actual value in created hook, but needs a value here for reactivity to work
  editableRatingReminder = new RatingReminder(0, 0); // value is replaced with actual value in created hook, but needs a value here for reactivity to work
  ratingReminderChanges: Partial<RatingReminder> = {};

  get title() {
    return [
      this.client?.contact.name,
      this.record?.problem.title
        ? this.$t(this.record?.problem.title)
        : "",
      this.$t("newRating")
    ].filter(Boolean).join(": ")
  }
  get lastOutcome() {
    return this.record?.outcomes.at(-1) ?? new Outcome();
  }
  get ratingReminder() {
    return this.record?.ratingReminder ?? new RatingReminder(4, 2);
  }
  get problemCode() {
    return this.record?.problem.code ?? ""
  }

  hasPendingChanges() {
    return !this.editableOutcome.equals(this.lastOutcome) 
      || Object.keys(this.ratingReminderChanges).length > 0;
  }

  updateRatingReminder(changes: Partial<RatingReminder>) {
    this.ratingReminderChanges = {...this.ratingReminderChanges, ...changes};

    // delete changes that equal currently stored value
    Object.entries(this.ratingReminderChanges)
      .forEach(([key, value]) => {
        if (value == (this.ratingReminder as any)[key]) {
          delete (this.ratingReminderChanges as any)[key]
        }
      })

    Object.assign(this.editableRatingReminder, changes);
  }

  save() {
    this.editableOutcome.createdAt = new Date();
    this.editableOutcome.user = this.$store.direct.getters.userId;
    this.$store.direct.commit.updateNewOutcome({
      changes: this.editableOutcome,
      ...this.$route.params,
    });
    this.$store.direct.commit.updateReminder({
      target: this.ratingReminder,
      changes: this.ratingReminderChanges
    });
    void this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.editingSheet.confirm());
  }

  created() {
    this.editableOutcome = this.lastOutcome.clone();
    this.editableRatingReminder = this.ratingReminder.clone();
  }
}

export default Rating;
</script>
