<template>
  <div>
    <div class="q-mb-md">
      <div class="text-h6">{{ title }}</div>
      <div class="text-weight-light">{{ description }}</div>
    </div>

    <div class="q-mb-lg row q-col-gutter-x-xl q-col-gutter-y-lg">
      <div class="col-12 col-sm-6"> 
        <rating-scale
          v-model="observation"
          :scale="scale"
          :examples="examples"
          :titleText="$t('observedRating') + ':'"
          :titleTooltip="$t(type + 'ObservationHint')"
          color="outcome"
          buttonStyle="border-width: 2px"
        />
        <reveal-button
          :label="$t('showCommentInput')"
          :revealImmediately="!!observationComment"
          color="outcome"
          class="q-mt-sm"
          button-class="q-mt-sm q-mb-md text-center"
        >
          <q-input
            :model-value="observationComment"
            @change="observationComment = $event"
            @clear="observationComment = ''"
            :label="$t('ratingCommentLabel')"
            autogrow
            :autofocus="!observationComment"
            color="outcome"
            dense
            clearable
          />
        </reveal-button>
      </div>

      <div class="col-12 col-sm-6" style="opacity: 0.7"> 
        <rating-scale
          v-model="expectation"
          :scale="scale"
          :examples="examples"
          :titleText="$t('expectedRating') + ':'"
          :titleTooltip="$t(type + 'ExpectationHint')"
          color="outcome"
          clearable
        />
        <reveal-button
          :label="$t('showCommentInput')"
          :revealImmediately="!!expectationComment"
          color="outcome"
          class="q-mt-sm"
          button-class="q-my-sm text-center"
        >
          <q-input
            :model-value="expectationComment"
            @change="expectationComment = $event"
            @clear="expectationComment = ''"
            :label="$t('expectationCommentLabel')"
            autogrow
            :autofocus="!expectationComment"
            color="outcome"
            dense
            clearable
          />
        </reveal-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";
import { Rating } from "../models";
import RatingScale from "../components/RatingScale.vue";
import RevealButton from "./RevealButton.vue";

@Component({
  components: {
    RatingScale,
    RevealButton
  },
  emits: ["update:model-value"]
})
export default class RatingView extends Vue {
  @Prop({ type: String, required: true}) readonly title!: string;
  @Prop({ type: String, required: true}) readonly description!: string;
  @Prop({ type: String, required: true}) readonly type!: string;
  @Prop({ type: Array, required: true}) readonly scale!: string[];
  @Prop({ type: Object }) readonly rating: Rating | undefined;
  @Prop({ type: Array, default: () => []}) readonly examples!: string[];

  get observation() {
    return this.rating?.observation || 0;
  }
  set observation(value: number) {
    this.updateNewOutcome({ observation: value ?? 0 });
  }
  get expectation() {
    return this.rating?.expectation || 0;
  }
  set expectation(value: number) {
    this.updateNewOutcome({ expectation: value ?? 0 });
  }
  get observationComment() {
    return this.rating?.comment || "";
  }
  set observationComment(value: string) {
    this.updateNewOutcome({ comment: value ?? "" });
  }
  get expectationComment() {
    return this.rating?.expectationComment || "";
  }
  set expectationComment(value: string) {
    this.updateNewOutcome({ expectationComment: value ?? "" });
  }

  updateNewOutcome(changes: Partial<Rating>) {
    this.$emit("update:model-value", changes);
  }
}
</script>
