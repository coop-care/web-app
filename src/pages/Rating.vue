<template>
  <q-page padding>
    <div class="text-h6">{{$t('newRating')}}</div>
    <div class="text-subtitle-1">{{ }}</div>
    <problem-rating
      :params="$route.params"
      :isSummary="true"
    />
    <div class="flex justify-around q-mt-lg">
      <q-btn
        :label="$t('cancel')"
        @click="$store.commit('updateNewOutcome', {path: 'created', value: new Date(), ...$route.params}); $router.push({name: 'index'})"
        to="/"
        flat
        color="primary"
      />
      <q-btn
        :label="$t('save')"
        @click="$store.commit('updateNewOutcome', {path: 'created', value: new Date(), ...$route.params}); $router.push({name: 'index'})"
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
export default class Rating extends Vue {}
</script>
