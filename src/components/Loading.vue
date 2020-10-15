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
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Loading extends Vue {}
</script>
