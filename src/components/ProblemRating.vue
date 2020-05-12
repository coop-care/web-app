<template>
  <problem-summary-container class="problem-rating">
    <div class="q-gutter-md">
      <rating-view
        v-for="(rating, index) in ratings"
        v-bind:key="index"
        :title="rating.title"
        :description="rating.description"
        :scale="rating.scale"
        :examples="rating.scaleExamples"
        :type="rating.type"
        :rating="(outcome || {})[rating.type] || {}"
      />
      <div>
        <q-btn
          v-if="!showPersonRatedInPlaceOfOwner && !personRatedInPlaceOfOwner"
          @click="showPersonRatedInPlaceOfOwner = true"
          :label="$t('showPersonRatedInPlaceOfOwnerInput')"
          flat
          dense
          no-caps
          size="md"
          color="outcome"
        />
        <div
          v-else
          class="q-mt-xs q-mb-md"
        >
          <q-input
            v-model="personRatedInPlaceOfOwner"
            :label="$t('personRatedInPlaceOfOwnerLabel')"
            autogrow
            :autofocus="
                showPersonRatedInPlaceOfOwner && !personRatedInPlaceOfOwner
              "
            color="outcome"
            filled
            dense
          />
        </div>
      </div>
    </div>
  </problem-summary-container>
</template>

<style lang="sass"></style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import RatingView from "components/Rating.vue";
import ProblemSummaryContainer from "components/ProblemSummaryContainer.vue";
import { Terminology, UsersGuide } from "../helper/terminology";
import { Outcome } from "../models/outcome";

const nameof = (name: keyof Outcome) => name;

@Component({
  components: {
    RatingView,
    ProblemSummaryContainer
  }
})
export default class ProblemRating extends Vue {
  showPersonRatedInPlaceOfOwner = false;

  get personRatedInPlaceOfOwner() {
    return this.outcome?.personRatedInPlaceOfOwner || "";
  }
  set personRatedInPlaceOfOwner(value: string) {
    const changes: any = {};
    changes[nameof("personRatedInPlaceOfOwner")] = value;
    this.$store.direct.commit.updateNewOutcome({
      changes: changes,
      ...this.$route.params
    });
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
}
</script>
