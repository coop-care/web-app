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
              />
              <q-icon
                name="sentiment_very_satisfied"
                color="positive"
                size="lg"
              />
            </div>
            <div class="text-center text-weight-light q-my-xs">
              {{ scale[observation - 1] || "&nbsp;" }}
            </div>
          </div>
        </div>

        <div class="row">
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
              />
              <q-icon
                name="sentiment_very_satisfied"
                color="positive"
                size="lg"
              />
            </div>
            <div class="text-center text-weight-light q-my-xs">
              {{ scale[expectation - 1] || "&nbsp;" }}
            </div>
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

@Component({
  props: {
    title: String,
    description: String,
    scale: Array,
    type: String,
    rating: Object
  }
})
export default class Rating extends Vue {
  showComment = false;

  get observation() {
    return this.$props.rating.observation || 0;
  }
  set observation(value: number) {
    this.updateNewOutcome("observation", value);
  }
  get expectation() {
    return this.$props.rating.expectation || 0;
  }
  set expectation(value: number) {
    this.updateNewOutcome("expectation", value);
  }
  get comment() {
    return this.$props.rating.comment || "";
  }
  set comment(value: string) {
    this.updateNewOutcome("comment", value);
  }

  get options() {
    return [1, 2, 3, 4, 5].map(value => {
      return { label: "" + value, value: value };
    });
  }

  updateNewOutcome(path: string, value: any) {
    this.$store.commit("updateNewOutcome", {
      path: this.$props.type + "." + path,
      value: value,
      ...this.$route.params
    });
  }
}
</script>
