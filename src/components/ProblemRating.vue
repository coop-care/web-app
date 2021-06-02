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
        <div class="row custom-gutter">
          <div class="row col-12 col-sm-9 col-md-7">
            <div class="text-subtitle2 q-pr-md q-pt-sm q-mt-xs">
              {{ $t("remindOfInterimRatingEvery") }}
            </div>
            <div class="row col-sm col-12">
              <q-input
                color="outcome"
                v-model.number="interval"
                type="number"
                dense
                step="1"
                input-class="text-center"
                :key="intervalKey"
                class="col"
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
                class="col"
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
          </div>
          <div class="text-caption text-italic q-pt-md q-mt-sm line-height-15">
            {{ nextRatingDate }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass"></style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { date } from "quasar";
import { Frequency, RatingReminder, Outcome } from "../models";
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
  intervalKey = Math.random();

  get personRatedInPlaceOfOwner() {
    return this.outcome?.personRatedInPlaceOfOwner || "";
  }
  set personRatedInPlaceOfOwner(value: string) {
    const changes: any = {};
    const key: keyof Outcome = "personRatedInPlaceOfOwner";
    changes[key] = value;
    this.$store.direct.commit.updateNewOutcome({
      changes: changes,
      ...this.$route.params
    });
  }
  get interval() {
    return this.record?.ratingReminder.interval || 0;
  }
  set interval(value) {
    if (!/^\d{1,3}$/.test("" + value) || value < 0) {
      value = 1;
      this.intervalKey = Math.random();
    }
    this.updateRatingReminder({ interval: value });
  }
  get frequency() {
    return this.record?.ratingReminder.frequency || 0;
  }
  set frequency(value) {
    this.updateRatingReminder({ frequency: value });
  }
  get nextRatingDate() {
    const date = this.record?.ratingReminder.nextRating;
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
  get outcome() {
    return this.record?.outcomes[this.record.outcomes.length - 1];
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

  ratingForType(type: string) {
    if (this.outcome) {
      return (this.outcome as any)[type];
    } else {
      return undefined
    }
  }

  updateRatingReminder(changes: Partial<RatingReminder>) {
    const reminder = this.record?.ratingReminder;
    if (!reminder) {
      return;
    }

    this.$store.direct.commit.updateReminder({
      target: reminder,
      changes: changes
    });
  }
}
</script>
