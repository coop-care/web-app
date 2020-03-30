<template>
  <div class="fit">
    <div class="q-pa-md absolute-center vertical-middle text-center text-body2">{{ message }}</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({ props: { message: String } })
export default class CentralMessage extends Vue {}
</script>
