<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar>
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
            label="„CoopCare”"
            :ripple="false"
            to="/"
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
              v-for="(option, index) in supportedLocales"
              :key="index"
              :active="$root.$i18n.locale === option.value"
              @click="$root.$i18n.locale = option.value"
            >
              <q-item-section>
                <q-item-label>{{ option.label }}</q-item-label>
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
          label="Feedback"
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
  supportedLocales = [
    { label: "English", value: "en-us" },
    { label: "Deutsch", value: "de-de" }
  ];
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
