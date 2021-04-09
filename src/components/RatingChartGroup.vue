<template>
  <div class="rating-chart-group row q-col-gutter-md">
    <div
      v-for="(ratings, index) in ratingsList"
      :key=""
      class="col-12 col-sm-4"
    >
      <div
        v-if="$q.platform.has.touch" 
        class="q-pl-lg text-body2 rating-caption column justify-end"
      >
        <simplified-markdown
          :text="makeChartTitle(index)"
          class="block"
        />
      </div>
      <rating-chart
        :ratings="ratings"
        :height="200"
        v-model="outcomeIndex"
        color="outcome"
        class="full-width non-selectable"
      />
      <div class="relative-position">
        <div 
          v-if="observation(index)" 
          class="rating-overlay text-outcome text-weight-medium non-selectable"
        >
          <span>{{ observation(index) }}</span>
          <span v-if="expectation(index)">/{{ expectation(index) }}</span>
        </div> 
      </div>
      <div 
        v-if="!$q.platform.has.touch" 
        class="q-pl-lg text-body2 rating-caption column justify-start"
      >
        <simplified-markdown
          :text="makeChartTitle(index)"
          class="block"
        />
      </div>
    </div>
  </div>
</div>
</template>

<style lang="sass">
.rating-chart-group
  .rating-overlay
    position: absolute
    top: -36px
    right: 0
    pointer-events: none
    letter-spacing: 3px
    :nth-child(1)
      font-size: 2.4rem
    :nth-child(2)
      font-size: 1.2rem
  .rating-caption
    height: 6rem
    overflow: hidden
    line-height: 1.2rem
    :nth-child(1)
      :nth-child(1)
        font-size: 0.75rem
  @media print
    canvas
      width: 100% !important
      height: auto !important
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { format } from "timeago.js";
import { Outcome, TeamMember } from "src/models";
import { Rating as RatingTerminology } from "src/helper/terminology";
import RatingChart, { Rating } from "../components/RatingChart.vue";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

@Component({
  components: {
    SimplifiedMarkdown,
    RatingChart
  }
})
export default class RatingChartGroup extends Vue {
  @Prop({ type: Array, default: []}) readonly outcomes!: Outcome[];
  @Prop({ type: Object, default: () => ({})}) readonly teamMembers!: Record<string, TeamMember>;
  outcomeIndex = -1;

  get ratingsList() {
    return [
      this.outcomes.map(outcome => ({
        createdAt: outcome.createdAt || new Date(),
        personRatedInPlaceOfOwner: outcome.personRatedInPlaceOfOwner,
        user: outcome.user,
        ...outcome.knowledge
      })),
      this.outcomes.map(outcome => ({
        createdAt: outcome.createdAt || new Date(),
        personRatedInPlaceOfOwner: outcome.personRatedInPlaceOfOwner,
        user: outcome.user,
        ...outcome.behaviour
      })),
      this.outcomes.map(outcome => ({
        createdAt: outcome.createdAt || new Date(),
        personRatedInPlaceOfOwner: outcome.personRatedInPlaceOfOwner,
        user: outcome.user,
        ...outcome.status
      })),
    ] as Rating[][];
  }
  get ratingTerminology() {
    return this.$t("terminology.problemRatingScale.ratings") as unknown as RatingTerminology[];
  }

  rating(ratingType: number) {
    const ratings = this.ratingsList[ratingType] || [];
    return ratings[this.outcomeIndex] || ratings[ratings.length - 1];
  }
  observation(ratingType: number) {
    return this.rating(ratingType).observation || 0;
  }
  expectation(ratingType: number) {
    return this.rating(ratingType).expectation || 0;
  }
  makeChartTitle(ratingType: number) {
    const rating = this.rating(ratingType);
    const ratingTexts = this.ratingTerminology[ratingType].scale;
    const obersationText = ratingTexts[rating.observation - 1].title;
    const expectationText = ratingTexts[rating.expectation - 1].title;
    const username = this.teamMembers[rating.user]?.signature;
    const locale = this.$root.$i18n.locale;

    return [
      format(rating.createdAt, locale) + " (" + username + "):",
      "**" + obersationText + "**" + 
      (rating.comment ? ", ***" + this.$t("quotedText", {quote: rating.comment}) + "***" : ""), 
      (rating.expectation != rating.observation
        ? this.$t("expectedRatingShortTitle") + ": " + expectationText
        : "")
    ].filter(Boolean).join("\n");
  }
}
</script>