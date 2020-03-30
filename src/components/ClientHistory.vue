<template>
  <q-timeline
    color="primary"
    :layout="$q.screen.gt.xs ? 'comfortable' : 'dense'"
  >
    <q-timeline-entry
      title="Event Title"
      :subtitle="day + '. February 2020'"
      v-for="(day, index) in [3, 5, 8, 13, 21]"
      v-bind:key="index"
      :color="Math.random() < 0.3 ? 'outcome' : 'intervention'"
    >
      <div>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>

<style lang="sass">
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class ClientHistory extends Vue {}
</script>
