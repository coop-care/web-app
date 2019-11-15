<template>
  <q-page class="">
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      header-nav
      animated
      flat
      :contracted="$q.screen.lt.sm"
      @before-transition="scrollToTop"
    >
      <q-step
        :name="1"
        :title="$q.screen.lt.md ? $tc('problem', 1) : terminology.problemClassificationScheme.title"
        prefix="1"
        :done="step > 1"
        :header-nav="step > 1"
        active-color="red"
        done-color="red"
      >
        <problem-classification />
      </q-step>

      <q-step
        :name="2"
        :title="$q.screen.lt.md ? $tc('rating', 1) : terminology.problemRatingScale.title"
        prefix="2"
        :done="step > 2"
        :header-nav="step > 2"
        done-color="teal"
        active-color="teal"
      >
        <problem-rating />
      </q-step>

      <q-step
        :name="3"
        :title="$q.screen.lt.md ? $tc('intervention', 2)  : terminology.interventionScheme.title"
        prefix="3"
        icon="add_comment"
        :header-nav="step > 3"
        done-color="amber-10"
        active-color="amber-10"
      >
        <intervention />
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex justify-around">
          <q-btn
            v-if="step == 1"
            flat
            color="primary"
            to="/"
            :label="$t('cancel')"
            class="q-ml-sm"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            :label="$t('back')"
            class="q-ml-sm"
          />
          <q-btn
            v-if="step < 3"
            @click="$refs.stepper.next()"
            color="primary"
            :label="$t('continue')"
          />
          <q-btn
            v-if="step == 3"
            @click="$store.commit('saveNewProblemRecord', $route.params)"
            to="/"
            color="primary"
            :label="$t('save')"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { scroll } from "quasar";
import ProblemClassification from "components/ProblemClassification.vue";
import ProblemRating from "components/ProblemRating.vue";
import Intervention from "components/Intervention.vue";

@Component({
  components: {
    ProblemClassification,
    ProblemRating,
    Intervention
  }
})
export default class ProblemRecording extends Vue {
  step = 1;

  get terminology() {
    return this.$t("terminology");
  }

  beforeCreate() {
    if (!this.$store.getters.getProblemRecordById(this.$route.params)) {
      this.$router.push({ name: "index" });
    }
  }

  scrollToTop() {
    scroll.setScrollPosition(window, 0, 200);
  }
}
</script>
