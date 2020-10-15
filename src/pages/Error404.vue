<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">{{ $t("error404") }} <strong>(404)</strong></p>
    <q-btn
      color="primary"
      rounded
      style="width:200px;"
      to="/"
      :label="$t('back')"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Error404 extends Vue {}
</script>
