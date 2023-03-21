<template>
  <q-page class="column items-center justify-evenly">
    <auth/>
  </q-page>
</template>

<script lang="ts">
import Auth from "src/components/Auth.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoginPage",

  components: {
    Auth
  }
});
</script>