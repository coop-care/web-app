<template>
  <div class="problem-rating row q-col-gutter-lg" v-if="record">
    <div class="col-12 col-md-9 q-gutter-lg">
      <rating
        v-for="(rating, index) in ratings"
        v-bind:key="index"
        :title="rating.title"
        :description="rating.description"
        :scale="rating.scale"
        :type="rating.type"
        :rating="outcome[rating.type] || {}"
      />
      <div class="q-mt-lg">
        <q-btn
          v-if="!showPersonRatedInPlaceOfOwner && !personRatedInPlaceOfOwner"
          @click="showPersonRatedInPlaceOfOwner = true"
          :label="$t('showPersonRatedInPlaceOfOwnerInput')"
          flat
          dense
          no-caps
          size="md"
          color="teal"
        />
        <div v-else class="q-mt-xs q-mb-md">
          <q-input
            v-model="personRatedInPlaceOfOwner"
            :label="$t('personRatedInPlaceOfOwnerLabel')"
            autogrow
            :autofocus="
              showPersonRatedInPlaceOfOwner && !personRatedInPlaceOfOwner
            "
            color="teal"
            filled
            dense
          />
        </div>
      </div>
    </div>
    <div class="col-12 col-md-3">
      <problem-summary :params="$route.params" :isSummary="true" />
    </div>
  </div>
</template>

<style lang="sass"></style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Rating from "components/Rating.vue";
import ProblemSummary from "../components/ProblemSummary.vue";
import { Terminology } from "../helper/terminology";

@Component({
  components: {
    Rating,
    ProblemSummary
  }
})
export default class ProblemRating extends Vue {
  showPersonRatedInPlaceOfOwner = false;

  get personRatedInPlaceOfOwner() {
    return this.outcome.personRatedInPlaceOfOwner || "";
  }
  set personRatedInPlaceOfOwner(value: string) {
    this.$store.commit("updateNewOutcome", {
      path: "personRatedInPlaceOfOwner",
      value: value,
      ...this.$route.params
    });
  }

  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get record() {
    return this.$store.getters.getProblemRecordById(this.$route.params);
  }
  get outcome() {
    return this.record.outcomes[this.record.outcomes.length - 1] || {};
  }
  get ratings() {
    let indexToType = ["knowledge", "behaviour", "status"];
    return this.terminology.problemRatingScale.ratings.map((rating, index) => {
      return {
        title: rating.title,
        description: rating.description,
        scale: rating.scale.map(item => item.title),
        type: indexToType[index]
      };
    });
  }
}
</script>
