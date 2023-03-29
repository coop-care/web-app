<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <q-icon
        name="fas fa-kiwi-bird"
        size="24vh"
      />

      <div class="text-h2 title-404" style="opacity:.6;">
        {{ $t("error404") }}
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="primary"
        unelevated
        rounded
        style="width:200px;"
        :label="$t('back')"
        no-caps
        :size="$q.screen.gt.xs ? 'lg' : 'md'"
        @click="$router.back()"
      />
    </div>
  </div>
</template>

<style lang="sass">
.title-404
  @media (max-width: $breakpoint-sm-max)
    font-size: 3rem
  @media (max-width: $breakpoint-xs-max)
    font-size: 2rem
    line-height: 2.5rem
</style>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound"
});
</script>
