<template>
  <editing-page-container
    :title="$t('newRating')"
    :is-data-available="!!record"
    @cancel="$router.back()"
    @save="save"
  >
    <problem-rating />
  </editing-page-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import EditingPageContainer from "components/EditingPageContainer.vue";
import ProblemRating from "components/ProblemRating.vue";
import { Outcome } from "../models/outcome";

const nameof = (name: keyof Outcome) => name;

@Component({
  components: {
    ProblemRating,
    EditingPageContainer
  }
})
export default class Rating extends Vue {
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }

  save() {
    const changes: any = {};
    changes[nameof("createdAt")] = new Date();
    this.$store.direct.commit.updateNewOutcome({
      changes: changes,
      ...this.$route.params
    });
    this.$store.direct.dispatch
      .saveClient(this.$route.params)
      .then(() =>
        this.$router.push({ name: "clientReport", params: this.$route.params })
      );
  }
}
</script>
