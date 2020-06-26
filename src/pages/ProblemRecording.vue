<template>
  <q-page class="limit-page-width">
    <loading v-if="$store.direct.state.isLoadingClientList && !record" />

    <central-message
      v-else-if="!$store.direct.state.isLoadingClientList && !record"
      :message="$t('clientNotFound')"
    />

    <q-stepper
      v-else
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
        <intervention-view />
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="flex justify-around">
          <q-btn
            v-if="step == 1"
            flat
            color="primary"
            rounded
            @click="$router.back()"
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
import InterventionView from "components/InterventionV2.vue";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";

@Component({
  components: {
    ProblemClassification,
    ProblemRating,
    InterventionView,
    Loading,
    CentralMessage
  },
  watch: {
    step(this: ProblemRecording, value: number) {
      this.$route.params.step = "" + value;
      this.$router.replace({
        name: this.$route.name || undefined,
        params: this.$route.params
      });
    }
  }
})
export default class ProblemRecording extends Vue {
  step = parseInt(this.$root.$route.params.step) || 1;

  get terminology() {
    return this.$t("terminology");
  }
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }
  get isHighPriority() {
    return this.record?.problem.isHighPriority || false;
  }

  scrollToTop() {
    scroll.setScrollPosition(window, 0, 200);
  }

  saveProblemRecord() {
    this.$store.direct.commit.saveNewProblemRecord(this.$route.params);
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() => this.$router.back());
  }
}
</script>
