<template>
  <div class="fit">
    <div class="q-pa-md absolute-center vertical-middle text-center text-body2 full-width">{{ message }}</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const CentralMessageProps = Vue.extend({
  props: {
    message: String
  }
});

@Component
export default class CentralMessage extends CentralMessageProps {}
</script>
