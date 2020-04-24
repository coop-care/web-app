<template>
  <intervention-editor />
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import InterventionEditor from "./InterventionEditor.vue";

@Component({
  components: {
    InterventionEditor
  }
})
export default class EditableIntervention extends Vue {}
</script>
