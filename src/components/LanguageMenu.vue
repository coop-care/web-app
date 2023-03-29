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
        v-for="(locale, index) in $i18n.availableLocales"
        :key="index"
        :active="$i18n.locale === locale"
        @click="changeLocale(locale)"
      >
        <q-item-section side>
          <q-icon
            :name="$i18n.locale === locale ? 'fas fa-circle' : ''"
            color="primary"
            size="10px"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t(locale.toLowerCase()) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";

@Component
export default class LanguageMenu extends Vue {
  @Prop({ type: String, default: "bottom middle"}) readonly anchor!: string;
  @Prop({ type: String, default: "top middle"}) readonly self!: string;
  @Prop({ type: Boolean }) readonly fit!: boolean;

  changeLocale(locale: string) {
    if (this.$store.direct.state.currentUser) {
      void this.$store.direct.dispatch.saveCurrentUser((user) => {
        user.locale = locale;
      }).then(() => {
        this.$bus.emit("did-change-locale", locale);
      })
    } else {
      this.$i18n.locale = locale;
      this.$loadLangPack(locale);
      this.$bus.emit("did-change-locale", locale);
    }
  }
}
</script>
