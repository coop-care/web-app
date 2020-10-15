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
        <q-item-section side>
          <q-icon
            :name="$root.$i18n.locale === locale ? 'fas fa-circle' : ''"
            color="primary"
            size="10px"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t(locale) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class LanguageMenu extends Vue {
  @Prop(String) readonly anchor: string | undefined;
  @Prop(String) readonly self: string | undefined;
  @Prop(Boolean) readonly fit!: boolean;

  changeLocale(locale: string) {
    this.$root.$i18n.locale = locale;
    this.$loadLangPack(locale);
    this.$root.$emit("did-change-locale", locale);
  }
}
</script>
