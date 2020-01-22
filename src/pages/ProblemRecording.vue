<template>
  <q-page>
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
        :title="$t('stateProblemStep')"
        prefix="1"
        :done="step > 1"
        :header-nav="step > 1"
        active-color="classification"
        done-color="classification"
      >
        <problem-classification />
      </q-step>

      <q-step
        :name="2"
        v-if="isHighPriority"
        :title="$q.screen.lt.md ? $tc('rating', 1) : $t('admissionRatingStep')"
        prefix="2"
        :done="step > 2"
        :header-nav="step > 2"
        done-color="outcome"
        active-color="outcome"
      >
        <problem-rating />
      </q-step>

      <q-step
        :name="3"
        v-if="isHighPriority"
        :title="$t('planInterveneStep')"
        prefix="3"
        icon="add_comment"
        :header-nav="step > 3"
        done-color="intervention"
        active-color="intervention"
      >
        <intervention />
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex justify-around">
          <q-btn
            v-if="step == 1"
            flat
            color="primary"
            rounded
            to="/"
            :label="$t('cancel')"
            class="shadow-1 q-ml-sm"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            rounded
            @click="$refs.stepper.previous()"
            :label="$t('back')"
            class="shadow-1 q-ml-sm"
          />
          <q-btn
            v-if="step < 3 && isHighPriority"
            @click="$refs.stepper.next()"
            color="primary"
            rounded
            :label="$t('continue')"
          />
          <q-btn
            v-if="step == 3 || !isHighPriority"
            @click="saveProblemRecord"
            to="/"
            color="primary"
            rounded
            :label="$t('save')"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-page>
</template>

<style lang="sass">
.q-stepper__header--standard-labels .q-stepper__tab:first-child
  justify-content: flex-start !important
</style>

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
  get customer() {
    return this.$store.getters.getCustomer(this.$route.params);
  }
  get record() {
    return this.$store.getters.getProblemRecordById(this.$route.params);
  }
  get isHighPriority() {
    return this.record.problem.isHighPriority;
  }

  beforeCreate() {
    if (!this.$store.getters.getProblemRecordById(this.$route.params)) {
      this.$router.push({ name: "customer" });
    }
  }

  scrollToTop() {
    scroll.setScrollPosition(window, 0, 200);
  }

  saveProblemRecord() {
    this.$store.direct.commit.saveNewProblemRecord(this.$route.params);
    this.$stitchApi.saveCustomer(this.customer);
  }
}
</script>
