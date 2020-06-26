<template>
  <q-menu
    auto-close
    :anchor="anchor"
    :self="self"
    :fit="fit"
  >
    <q-list class="text-body2">
      <q-item
        clickable
        v-for="(locale, index) in $root.$i18n.availableLocales"
        :key="index"
        :active="$root.$i18n.locale === locale"
        @click="changeLocale(locale)"
      >
        <q-item-section>
          <q-item-label>{{ $t(locale) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const LanguageMenuProps = Vue.extend({
  props: {
    anchor: String,
    self: String,
    fit: Boolean
  }
});

@Component
export default class LanguageMenu extends LanguageMenuProps {
  changeLocale(locale: string) {
    this.$root.$i18n.locale = locale;
    this.$loadLangPack(locale);
    this.$root.$emit("didChangeLocale", locale);
  }
}
</script>
