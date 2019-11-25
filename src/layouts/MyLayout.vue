<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="$router.currentRoute.name == 'index' && $q.screen.lt.md"
          dense
          no-caps
          flat
          icon="menu"
          aria-label="menu"
          @click="$root.$emit('toggleCustomerDrawer')"
        />
        <q-btn
          v-if="$router.currentRoute.name != 'index'"
          size="lg"
          dense
          no-caps
          flat
          icon="chevron_left"
          :ripple="false"
          @click="$router.back()"
        />
        <q-toolbar-title>
          <q-btn
            size="lg"
            dense
            no-caps
            flat
            label=""
            :ripple="false"
            to="/"
            v-if="$q.screen.gt.xs"
          />
        </q-toolbar-title>

        <q-btn-dropdown
          :label="$root.$i18n.locale.split('-')[0]"
          icon="language"
          dense
          auto-close
          flat
        >
          <q-list>
            <q-item
              clickable
              v-for="(locale, index) in $root.$i18n.availableLocales"
              :key="index"
              :active="$root.$i18n.locale === locale"
              @click="$root.$i18n.locale = locale; $root.$emit('didChangeLocale', locale);"
            >
              <q-item-section>
                <q-item-label>{{ $t(locale) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-separator
          vertical
          inset
          spaced
          dark
        />

        <q-btn
          size="md"
          dense
          no-caps
          flat
          :label="$t('feedback')"
          icon="feedback"
          :ripple="false"
          type="a"
          :href="mailto"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class MyLayout extends Vue {
  get mailto() {
    return (
      "mailto:feedback@cooperativecare.de?subject=CoopCare Feedback&body=" +
      encodeURIComponent("\n\n\n––––––––––––––––––––\n") +
      "Einige freiwillige technische Angaben, die uns beim Nachvollziehen des Feedbacks helfen:" +
      encodeURIComponent("\n\nBrowser: ") +
      this.$q.platform.userAgent +
      encodeURIComponent("\nRoute: ") +
      this.$router.currentRoute.path
    );
  }
}
</script>
