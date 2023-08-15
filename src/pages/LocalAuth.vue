<template>
  <div class="fullscreen bg-primary column">
    <q-toolbar class="fixed text-white self-start window-draggable" style="z-index: 100">
      <q-space />
      <q-btn
        :label="$i18n.locale.split('-')[0]"
        icon="fas fa-globe"
        stretch
        flat
        class="hide-arrow"
      >
        <language-menu />
      </q-btn>
    </q-toolbar>
    <div class="scroll full-width full-height row items-center">
      <div class="q-pa-md col column items-center">
        <auth/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Auth from "src/components/Auth.vue";
import LanguageMenu from "src/components/LanguageMenu.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoginPage",

  components: {
    Auth,
    LanguageMenu
  },

  mounted() {
    document.body.classList.add("bg-primary");
  },

  unmounted() {
    document.body.classList.remove("bg-primary");
  }
});
</script>