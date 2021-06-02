<template>
  <div>
    <div class="q-mb-md">
      <div class="text-h6">{{ title }}</div>
      <div class="text-weight-light">{{ description }}</div>
    </div>

    <div class="q-mb-lg row q-col-gutter-x-xl q-col-gutter-y-lg">
      <div class="col-12 col-sm-6"> 
        <div class="rating-header column justify-center text-center q-mb-xs">
          <text-with-tooltip
            :text="$t('observedRating') + ':'"
            :tooltip="$t(type + 'ObservationHint')"
            class="text-subtitle2"
          />
          <text-with-tooltip
            :text="observationScale"
            :tooltip="observationExample"
            class="text-weight-light"
          />
        </div>
        <div class="row">
          <q-icon
            name="sentiment_very_dissatisfied"
            color="negative"
            size="lg"
          />
          <q-btn-toggle
            v-model="observation"
            spread
            no-caps
            unelevated
            toggle-color="outcome"
            rounded
            text-color="outcome"
            :options="options"
            class="q-mx-xs col border-outcome"
            style="border-width: 2px"
          >
            <template v-slot:1>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="observationMouseover = 0"
                @before-hide="observationMouseover = -1"
              />
            </template>
            <template v-slot:2>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="observationMouseover = 1"
                @before-hide="observationMouseover = -1"
              />
            </template>
            <template v-slot:3>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="observationMouseover = 2"
                @before-hide="observationMouseover = -1"
              />
            </template>
            <template v-slot:4>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="observationMouseover = 3"
                @before-hide="observationMouseover = -1"
              />
            </template>
            <template v-slot:5>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="observationMouseover = 4"
                @before-hide="observationMouseover = -1"
              />
            </template>
          </q-btn-toggle>
          <q-icon
            name="sentiment_very_satisfied"
            color="positive"
            size="lg"
          />
        </div>
        <reveal-button
          :label="$t('showCommentInput')"
          :revealImmediately="!!observationComment"
          color="outcome"
          class="q-mt-sm"
          button-class="q-mt-sm q-mb-md text-center"
        >
          <q-input
            v-model="observationComment"
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
        <div class="rating-header column justify-center text-center q-mb-xs">
          <text-with-tooltip
            :text="$t('expectedRating') + ':'"
            :tooltip="$t(type + 'ExpectationHint')"
            class="text-subtitle2"
          />
          <text-with-tooltip
            :text="expectationScale"
            :tooltip="expectationExample"
            class="text-weight-light"
          />
        </div>
        <div class="row">
          <q-icon
            name="sentiment_very_dissatisfied"
            color="negative"
            size="lg"
          />
          <q-btn-toggle
            v-model="expectation"
            spread
            no-caps
            unelevated
            toggle-color="outcome"
            rounded
            text-color="outcome"
            :options="options"
            class="q-mx-sm col border-outcome"
            clearable
          >
            <template v-slot:1>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="expectationMouseover = 0"
                @before-hide="expectationMouseover = -1"
              />
            </template>
            <template v-slot:2>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="expectationMouseover = 1"
                @before-hide="expectationMouseover = -1"
              />
            </template>
            <template v-slot:3>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="expectationMouseover = 2"
                @before-hide="expectationMouseover = -1"
              />
            </template>
            <template v-slot:4>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="expectationMouseover = 3"
                @before-hide="expectationMouseover = -1"
              />
            </template>
            <template v-slot:5>
              <q-tooltip
                v-if="$q.platform.is.desktop"
                content-class="hidden"
                @before-show="expectationMouseover = 4"
                @before-hide="expectationMouseover = -1"
              />
            </template>
          </q-btn-toggle>
          <q-icon
            name="sentiment_very_satisfied"
            color="positive"
            size="lg"
          />
        </div>
        <reveal-button
          :label="$t('showCommentInput')"
          :revealImmediately="!!expectationComment"
          color="outcome"
          class="q-mt-sm"
          button-class="q-my-sm text-center"
        >
          <q-input
            v-model="expectationComment"
            :label="$t('ratingCommentLabel')"
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

<style lang="sass">
.rating-header
  height: 2.7rem
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Rating } from "../models";
import TextWithTooltip from "./TextWithTooltip.vue";
import RevealButton from "./RevealButton.vue";

@Component({
  components: {
    TextWithTooltip,
    RevealButton
  }
})
export default class RatingView extends Vue {
  @Prop({ type: String, required: true}) readonly title!: string;
  @Prop({ type: String, required: true}) readonly description!: string;
  @Prop({ type: String, required: true}) readonly type!: string;
  @Prop({ type: Array, required: true}) readonly scale!: string[];
  @Prop(Object) readonly rating: Rating | undefined;
  @Prop({ type: Array, default: () => []}) readonly examples!: string[];

  observationMouseover = -1;
  expectationMouseover = -1;

  get observation() {
    return this.rating?.observation || 0;
  }
  set observation(value: number) {
    this.updateNewOutcome({ observation: value });
  }
  get expectation() {
    return this.rating?.expectation || 0;
  }
  set expectation(value: number) {
    this.updateNewOutcome({ expectation: value });
  }
  get observationComment() {
    return this.rating?.comment || "";
  }
  set observationComment(value: string) {
    this.updateNewOutcome({ comment: value });
  }
  get expectationComment() {
    return this.rating?.expectationComment || "";
  }
  set expectationComment(value: string) {
    this.updateNewOutcome({ expectationComment: value });
  }

  get options() {
    return [1, 2, 3, 4, 5].map(value => {
      return { label: "" + value, value: value, slot: value };
    });
  }
  get observationScale() {
    if (this.observationMouseover < 0) {
      return this.scale[this.observation - 1] || "";
    } else {
      return this.scale[this.observationMouseover];
    }
  }
  get expectationScale() {
    if (this.expectationMouseover < 0) {
      return this.scale[this.expectation - 1] || "";
    } else {
      return this.scale[this.expectationMouseover];
    }
  }
  get observationExample() {
    if (
      (this.observationMouseover < 0 ||
        this.observationMouseover == this.observation - 1) &&
      this.examples[this.observation - 1]
    ) {
      return this.$t("examplePrefix", {
        text: this.examples[this.observation - 1]
      });
    } else {
      return "";
    }
  }
  get expectationExample() {
    if (
      (this.expectationMouseover < 0 ||
        this.expectationMouseover == this.expectation - 1) &&
      this.examples[this.expectation - 1]
    ) {
      return this.$t("examplePrefix", {
        text: this.examples[this.expectation - 1]
      });
    } else {
      return "";
    }
  }

  updateNewOutcome(changes: Partial<Rating>) {
    this.$store.direct.commit.updateNewOutcome({
      ratingType: this.type,
      changes: changes,
      ...this.$route.params
    });
  }
}
</script>
