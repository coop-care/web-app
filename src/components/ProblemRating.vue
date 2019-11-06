<template>
  <div class="problem-rating">
    <rating-concept
      v-for="(rating, index) in ratings"
      v-bind:key="index"
      :title="rating.title"
      :description="rating.description"
      :scale="rating.scale"
    />
  </div>
</template>

<style lang="sass">
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import RatingConcept from "components/RatingConcept.vue";
import { Terminology } from "../helper/terminology";

@Component({
  components: {
    RatingConcept
  }
})
export default class ProblemRating extends Vue {
  get terminology() {
    return (this.$t("terminology") as unknown) as Terminology;
  }
  get ratings() {
    return this.terminology.problemRatingScale.ratings.map(rating => {
      return {
        title: rating.title,
        description: rating.description,
        scale: rating.scale.map(item => item.title)
      };
    });
  }
}
</script>