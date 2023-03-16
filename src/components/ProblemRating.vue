<template>
  <div class="problem-rating">
    <div class="q-gutter-md">
      <rating-view
        v-for="(rating, index) in ratings"
        :key="index"
        :title="rating.title"
        :description="rating.description"
        :scale="rating.scale"
        :examples="rating.scaleExamples"
        :type="rating.type"
        :rating="value ? value[rating.type] : undefined"
        @update:model-value="updateRating(rating.type, $event)"
        class="q-mb-xl"
      />
      <reveal-button
        :label="$t('showPersonRatedInPlaceOfOwnerInput')"
        :revealImmediately="!!personRatedInPlaceOfOwner"
        color="outcome"
      >
        <q-input
          v-model="personRatedInPlaceOfOwner"
          :label="$t('personRatedInPlaceOfOwnerLabel')"
          dense
          autogrow
          :autofocus="!personRatedInPlaceOfOwner"
          color="outcome"
        />
      </reveal-button>
      <div>
        <div class="row">
          <div class="text-subtitle2 q-pr-md q-pt-sm q-mt-xs">
            {{ $t("remindOfInterimRatingEvery") }}
          </div>
          <div>
            <div class="row">
              <q-input
                :model-value="interval"
                @update:model-value="onUpdateNumeric3Digits($event, () => interval = $event)"
                @change="interval = $event"
                type="text"
                inputmode="numeric"
                pattern="[0-9]"
                dense
                color="outcome"
                input-class="text-center"
                :key="intervalKey"
                class="col-5"
              >
              </q-input>
              <q-select
                v-model="frequency"
                :options="frequencyOptions"
                options-dense
                color="outcome"
                dense
                options-cover
                map-options
                emit-value
                class="col-7 q-pl-xs"
                popup-content-class="text-center"
              >
                <template v-slot:selected>
                  <div class="text-center full-width">
                    {{
                      (
                        frequencyOptions.find(
                          option => option.value == frequency
                        ) || {}
                      ).label || ""
                    }}
                  </div>
                </template>
              </q-select>
            </div>
            <div class="text-caption text-italic q-mt-xs line-height-11">
              {{ nextRatingDate }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass"></style>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-facing-decorator";
import { date } from "quasar";
import { Frequency, RatingReminder, Outcome, Rating } from "../models";
import RatingView from "components/Rating.vue";
import RevealButton from "components/RevealButton.vue";
import { Terminology, UsersGuide } from "../helper/terminology";

const { formatDate } = date;
const ratingTypes = ["knowledge", "behaviour", "status"] as const;
type RatingType = (typeof ratingTypes)[number];

@Component({
  components: {
    RatingView,
    RevealButton
  },
  emits: ["update:model-value", "change:rating-reminder"]
})
export default class ProblemRating extends Vue {
  @Model({ type: Object }) readonly value?: Outcome;
  @Prop({ type: String, default: "" }) readonly problemCode!: string;
  @Prop({ type: Object }) readonly ratingReminder?: RatingReminder;

  private intervalKey = Math.random();

  get personRatedInPlaceOfOwner() {
    return this.value?.personRatedInPlaceOfOwner || "";
  }
  set personRatedInPlaceOfOwner(value: string) {
    if (this.value) {
      this.value.personRatedInPlaceOfOwner = value;
      this.$emit("update:model-value", this.value);
    }
  }
  get interval() {
    return "" + (this.ratingReminder?.interval ?? 0);
  }
  set interval(value) {
    if (!this.isNumeric3Digits(value)) {
      value = this.interval;
      this.intervalKey = Math.random();
    }
    this.updateRatingReminder({ interval: parseInt(value) });
  }
  get frequency() {
    return this.ratingReminder?.frequency || 0;
  }
  set frequency(value) {
    this.updateRatingReminder({ frequency: value });
  }
 /**
  * nextRatingDate is calculated with current frequency and interval from startdate
  * when the ratingReminder (and problem record) where created. That's why nextRatingDate
  * appears to "randomly" jump when frequency and interval is changed, as the start date
  * is not right now, but probably a while ago.
  * 
  * Note to future self: to improve the clarity for the user it might be helpful to use 
  * today as start date by adding a new rating reminder rule and ending the previous one.
  */
  get nextRatingDate() {
    const date = this.ratingReminder?.nextRating;
    if (date) {
      return this.$t("nextReminderOnDate", {
        date: formatDate(date, "" + this.$t("weekdayDateFormat"))
      });
    } else {
      return this.$t("noScheduledReminder");
    }
  }

  get terminology() {
    return (this.$tm("terminology") as unknown) as Terminology;
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }
  get ratings() {
    const usersGuide = (this.$tm("usersGuide") as unknown) as UsersGuide;
    const guideForProblem = usersGuide[this.problemCode || ""];
    const examples = guideForProblem?.problemRatingScaleExamples.ratings || [];
    return this.terminology.problemRatingScale.ratings.map((rating, index) => {
      return {
        title: rating.title,
        description: rating.description,
        scale: rating.scale.map(item => item.title),
        scaleExamples: examples[index]?.scale.map(text => text.title) || [],
        type: ratingTypes[index]
      };
    });
  }
  get frequencyOptions() {
    return [
      { label: this.$t("day", 2), value: Frequency.DAILY },
      { label: this.$t("week", 2), value: Frequency.WEEKLY },
      { label: this.$t("month", 2), value: Frequency.MONTHLY },
      { label: this.$t("year", 2), value: Frequency.YEARLY }
    ];
  }

  isNumeric3Digits(value: string) {
    return /^\d{1,3}$/.test("" + value) && parseInt(value) >= 0;
  }

  onUpdateNumeric3Digits(value: string, next: () => void) {
    if (this.isNumeric3Digits(value)) {
      next();
    }
  }

  updateRating(type: RatingType, changes: Partial<Rating>) {
    if (this.value) {
      Object.assign(this.value[type], changes);
      this.$emit("update:model-value", this.value);
    }
  }

  updateRatingReminder(changes: Partial<RatingReminder>) {
    this.$emit("change:rating-reminder", changes);
  }
}
</script>
