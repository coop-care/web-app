<template>
  <q-page padding>
    <loading v-if="$store.direct.state.isLoadingClientList && !client" />

    <central-message
      v-else-if="!$store.direct.state.isLoadingClientList && !client"
      :message="$t('clientNotFound')"
    />

    <div v-else>
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
          :to="{name: 'clientProblems', params: $route.params}"
          color="primary"
          rounded
          flat
          class="shadow-1"
        />
        <q-btn
          :label="$t('save')"
          @click="save"
          color="primary"
          rounded
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProblemRating from "components/ProblemRating.vue";
import { Outcome } from "../models/outcome";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";

const nameof = (name: keyof Outcome) => name;

@Component({
  components: {
    ProblemRating,
    Loading,
    CentralMessage
  }
})
export default class Rating extends Vue {
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
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
      .then(() => this.$router.push({ name: "clientProblems" }));
  }
}
</script>
