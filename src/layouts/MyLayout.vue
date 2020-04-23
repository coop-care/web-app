<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="$router.currentRoute.name.startsWith('client')  && $q.screen.lt.md"
          dense
          no-caps
          flat
          icon="menu"
          aria-label="menu"
          @click="$root.$emit('toggleClientDrawer')"
        />
        <q-btn
          v-if="!['client', 'clientReminders', 'clientReport', 'clientHistory', 'clientMasterData', 'login'].includes($router.currentRoute.name)"
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
            class="hidden"
          />
        </q-toolbar-title>

        <q-btn-dropdown
          v-if="$ccApi.isLoggedIn"
          icon="account_circle"
          no-caps
          flat
          dense
          auto-close
          class="hide-arrow"
        >
          <q-list>
            <q-item-label header>
              <div>{{ $t("accountWelcomeMessage") }}</div>
              <div class="q-mt-xs text-bold">
                {{ $ccApi.username }}
              </div>
            </q-item-label>
            <q-item
              clickable
              v-ripple
              @click="logout"
            >
              <q-item-section>{{ $t("logout") }}</q-item-section>
            </q-item>

            <q-separator />

            <q-item-label header>{{ $t("databaseTestSettings") }}</q-item-label>
            <q-item
              clickable
              @click="addSamplesToDB"
            >
              <q-item-section>{{ $t("databaseInsertSamples") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              @click="clearDB"
            >
              <q-item-section>{{ $t("databaseClearAll") }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-separator
          v-if="$ccApi.isLoggedIn"
          vertical
          inset
          spaced
          dark
        />

        <q-btn-dropdown
          :label="$root.$i18n.locale.split('-')[0]"
          icon="language"
          dense
          auto-close
          flat
          class="hide-arrow"
        >
          <q-list>
            <q-item
              clickable
              v-for="(locale, index) in $root.$i18n.availableLocales"
              :key="index"
              :active="$root.$i18n.locale === locale"
              @click="
                $root.$i18n.locale = locale;
                $loadLangPack(locale);
                $root.$emit('didChangeLocale', locale);
              "
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

<style lang="sass">
.q-btn-dropdown.hide-arrow
  .q-btn-dropdown__arrow
    display: none
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  meta() {
    return {
      meta: {
        google: { name: "google", content: "notranslate" },
        contentLanguage: {
          "http-equiv": "Content-Language",
          content: this.$root.$i18n.locale
        }
      }
    };
  }
})
export default class MyLayout extends Vue {
  get mailto() {
    return (
      "mailto:feedback@coopcare.de?subject=CoopCare Feedback&body=" +
      encodeURIComponent("\n\n\n––––––––––––––––––––\n") +
      "Einige freiwillige technische Angaben, die uns beim Nachvollziehen des Feedbacks helfen:" +
      encodeURIComponent("\n\nBrowser: ") +
      this.$q.platform.userAgent +
      encodeURIComponent("\nRoute: ") +
      this.$router.currentRoute.path
    );
  }

  logout() {
    this.$ccApi.logout().then(() => this.$router.push({ name: "login" }));
  }

  addSamplesToDB() {
    this.$store.dispatch("addSamplesToDB");
  }

  clearDB() {
    this.$store.dispatch("clearDB");
    this.$router.push({ name: "client" });
  }
}
</script>
