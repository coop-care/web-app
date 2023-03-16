<template>
  <div class="relative-position" style="height: 5em">
    <div class="absolute-center vertical-middle full-width column items-center">
      <q-spinner
        size="5em"
        color="primary"
        :thickness="7"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";

@Component
export default class Loading extends Vue {}
</script>
