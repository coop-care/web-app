<template>
  <q-page class="flex flex-center">
    <q-btn icon="add" color="primary" label="Problem aufnehmen" to="/problem/new"/>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class PageIndex extends Vue {}
</script>
