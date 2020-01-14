<template>
  <q-page padding>
    <div class="text-h5 q-mb-lg">
      {{ $t("newRating") }}
    </div>
    <problem-rating :params="$route.params" :isSummary="true" />
    <div class="flex justify-around q-mt-lg">
      <q-btn
        :label="$t('cancel')"
        to="/"
        color="primary"
        rounded
        flat
        class="shadow-1"
      />
      <q-btn :label="$t('save')" @click="save" color="primary" rounded />
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProblemRating from "components/ProblemRating.vue";
import { Outcome } from "../models/outcome";

const nameof = (name: keyof Outcome) => name;

@Component({
  components: {
    ProblemRating
  }
})
export default class Rating extends Vue {
  get customer() {
    return this.$store.getters.getCustomerById(this.$route.params);
  }

  save() {
    const changes: any = {};
    changes[nameof("createdAt")] = new Date();
    this.$store.direct.commit.updateNewOutcome({
      changes: changes,
      ...this.$route.params
    });
    this.$router.push({ name: "index" });
  }
}
</script>
