<template>
  <div class="problem-rating">
    <div class="q-gutter-md">
      <rating-view
        v-for="(rating, index) in ratings"
        v-bind:key="index"
        :title="rating.title"
        :description="rating.description"
        :scale="rating.scale"
        :examples="rating.scaleExamples"
        :type="rating.type"
        :rating="ratingForType(rating.type)"
        @input="updateRating(rating.type, $event)"
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
                color="outcome"
                v-model.number="interval"
                type="text"
                inputmode="numeric"
                pattern="[0-9]"
                dense
                input-class="text-center"
                :key="intervalKey"
                class="col-5"
                @focus="selectInputText($event.target)"
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
import { Vue, Component, Prop } from "vue-property-decorator";
import { date } from "quasar";
import { Frequency, RatingReminder, Outcome, Rating } from "../models";
import RatingView from "components/Rating.vue";
import RevealButton from "components/RevealButton.vue";
import { Terminology, UsersGuide } from "../helper/terminology";

const { formatDate } = date;

@Component({
  components: {
    RatingView,
    RevealButton
  }
})
export default class ProblemRating extends Vue {
  @Prop(Object) readonly value?: Outcome;
  @Prop(Object) readonly ratingReminder?: RatingReminder;

  private intervalKey = Math.random();

  get personRatedInPlaceOfOwner() {
    return this.value?.personRatedInPlaceOfOwner || "";
  }
  set personRatedInPlaceOfOwner(value: string) {
    if (this.value) {
      this.value.personRatedInPlaceOfOwner = value;
      this.$emit("input", this.value);
    }
  }
  get interval() {
    return this.ratingReminder?.interval || 0;
  }
  set interval(value) {
    if (!/^\d{1,3}$/.test("" + value) || value < 0) {
      value = 1;
      this.intervalKey = Math.random();
    }
    this.updateRatingReminder({ interval: value });
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
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }
  get ratings() {
    const indexToType = ["knowledge", "behaviour", "status"];
    const usersGuide = (this.$t("usersGuide") as unknown) as UsersGuide;
    const guideForProblem = usersGuide[this.record?.problem.code || ""];
    const examples = guideForProblem?.problemRatingScaleExamples.ratings || [];
    return this.terminology.problemRatingScale.ratings.map((rating, index) => {
      return {
        title: rating.title,
        description: rating.description,
        scale: rating.scale.map(item => item.title),
        scaleExamples: examples[index]?.scale.map(text => text.title) || [],
        type: indexToType[index]
      };
    });
  }
  get frequencyOptions() {
    return [
      { label: this.$tc("day", 2), value: Frequency.DAILY },
      { label: this.$tc("week", 2), value: Frequency.WEEKLY },
      { label: this.$tc("month", 2), value: Frequency.MONTHLY },
      { label: this.$tc("year", 2), value: Frequency.YEARLY }
    ];
  }

  selectInputText(input?: HTMLInputElement) {
    setTimeout(() => input?.select())
  }

  ratingForType(type: string) {
    if (this.value) {
      return (this.value as any)[type];
    } else {
      return undefined
    }
  }

  updateRating(type: string, changes: Partial<Rating>) {
    Object.assign(this.ratingForType(type), changes);
    this.$emit("input", this.value);
  }

  updateRatingReminder(changes: Partial<RatingReminder>) {
    this.$emit("change:rating-reminder", changes);
  }
}
</script>
