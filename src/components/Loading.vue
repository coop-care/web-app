<template>
  <div class="fit">
    <div class="q-pa-md absolute-center vertical-middle">
      <q-spinner
        size="5em"
        color="primary"
        :thickness="7"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class Loading extends Vue {}
</script>
