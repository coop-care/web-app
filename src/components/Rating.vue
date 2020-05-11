<template>
  <div>
    <div class="q-mb-md">
      <div class="text-h6">{{ title }}</div>
      <div class="text-weight-light">{{ description }}</div>
    </div>
    <div class="row custom-gutter">
      <div class="col-12 col-sm-9 col-md-7">
        <div class="row q-pb-sm q-pa-xxs-none">
          <div class="col-12-xxs col-3 text-subtitle2 text-right q-pr-md q-pt-sm">
            {{ $t("observation") }}
          </div>
          <div class="col-12-xxs col-9">
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
                class="q-mx-sm col"
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
            <text-with-tooltip
              :text="observationScale"
              :tooltip="observationExample"
              class="text-center text-weight-light q-my-xs"
            />
          </div>
        </div>

        <div
          class="row"
          style="opacity: 0.7"
        >
          <div class="col-12-xxs col-3 text-subtitle2 text-right q-pr-md q-pt-sm">
            {{ $t("expectation") }}
          </div>
          <div class="col-12-xxs col-9">
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
                class="q-mx-sm col"
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
            <text-with-tooltip
              :text="expectationScale"
              :tooltip="expectationExample"
              class="text-center text-weight-light q-my-xs"
            />
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-3 col-md-5">
        <q-btn
          v-if="!showComment && !comment"
          @click="showComment = true"
          :label="$t('showCommentInput')"
          flat
          no-caps
          size="md"
          color="outcome"
          dense
          class="q-mt-xs"
        />
        <div v-else>
          <q-input
            v-model="comment"
            :label="$t('ratingCommentLabel')"
            autogrow
            :autofocus="showComment && !comment"
            color="outcome"
            filled
            dense
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.q-btn-toggle
  border-color: $outcome
  border-color: var(--q-color-outcome)
.custom-gutter
  margin-top: -24px
  margin-left: -24px
  @media (max-width: $breakpoint-sm-max)
    margin-top: -16px
    margin-left: -16px
  @media (max-width: $breakpoint-xs-max)
    margin-top: -8px
    margin-left: -8px
  &> *
    padding-top: 24px
    padding-left: 24px
    @media (max-width: $breakpoint-sm-max)
      padding-top: 16px
      padding-left: 16px
    @media (max-width: $breakpoint-xs-max)
      padding-top: 8px
      padding-left: 8px
.row > .col-12-xxs
  @media (max-width: 400px)
    width: 100%
    padding: 0 0 4px
    &.text-right
      text-align: center
.q-pa-xxs-none
  @media (max-width: 400px)
    padding: 0
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Rating } from "../models/rating";
import TextWithTooltip from "./TextWithTooltip.vue";

const nameof = (name: keyof Rating) => name;

const RatingViewProps = Vue.extend({
  props: {
    title: String,
    description: String,
    scale: Array,
    type: String,
    rating: Object,
    examples: {
      type: Array,
      default: () => []
    }
  }
});

@Component({
  components: {
    TextWithTooltip
  }
})
export default class RatingView extends RatingViewProps {
  observationMouseover = -1;
  expectationMouseover = -1;
  showComment = false;

  get observation() {
    return this.rating.observation || 0;
  }
  set observation(value: number) {
    this.updateNewOutcome(nameof("observation"), value);
  }
  get expectation() {
    return this.rating.expectation || 0;
  }
  set expectation(value: number) {
    this.updateNewOutcome(nameof("expectation"), value);
  }
  get comment() {
    return this.rating.comment || "";
  }
  set comment(value: string) {
    this.updateNewOutcome(nameof("comment"), value);
  }

  get options() {
    return [1, 2, 3, 4, 5].map(value => {
      return { label: "" + value, value: value, slot: value };
    });
  }
  get observationScale() {
    if (this.observationMouseover < 0) {
      return this.scale[this.observation - 1] || " ";
    } else {
      return this.scale[this.observationMouseover];
    }
  }
  get expectationScale() {
    if (this.expectationMouseover < 0) {
      return this.scale[this.expectation - 1] || " ";
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

  updateNewOutcome(key: string, value: any) {
    const changes: any = {};
    changes[key] = value;
    this.$store.direct.commit.updateNewOutcome({
      ratingType: this.type,
      changes: changes,
      ...this.$route.params
    });
  }
}
</script>
