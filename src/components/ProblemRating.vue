<template>
  <div class="problem-rating">
    <rating-concept
      v-for="(rating, index) in ratings"
      v-bind:key="index"
      :title="rating.title"
      :description="rating.description"
      :scale="rating.scale"
      :type="rating.type"
    />
    <problem-summary :params="$route.params" :isSummary="true"/>
  </div>
</template>

<style lang="sass">
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import RatingConcept from "components/RatingConcept.vue";
import ProblemSummary from "../components/ProblemSummary.vue";
import { Terminology } from "../helper/terminology";

@Component({
  components: {
    RatingConcept,
    ProblemSummary
  }
})
export default class ProblemRating extends Vue {
  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
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