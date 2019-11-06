<template>
  <q-page padding>
    <div class="text-h5">Bewertung des Problems Mental health von Erika B.</div>
    <problem-rating />
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
