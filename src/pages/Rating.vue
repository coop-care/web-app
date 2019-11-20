<template>
  <q-page padding>
    <div class="text-h5 q-mb-lg">
      {{ $t("newRating") }}
    </div>
    <problem-rating
      :params="$route.params"
      :isSummary="true"
    />
    <div class="flex justify-around q-mt-lg">
      <q-btn
        :label="$t('cancel')"
        to="/"
        flat
        color="primary"
      />
      <q-btn
        :label="$t('save')"
        @click="save"
        color="primary"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProblemRating from "components/ProblemRating.vue";

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
    this.$store.commit("updateNewOutcome", {
      path: "created",
      value: new Date(),
      ...this.$route.params
    });
    this.$router.push({ name: "index" });
  }
}
</script>
