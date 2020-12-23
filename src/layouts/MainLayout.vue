<template>
  <q-layout view="hHh Lpr lff">
    <q-header class="bg-white">
      <q-toolbar
        :class="'shadow-3 bg-primary ' + ($q.screen.lt.sm ? 'q-px-none' : '')"
        style="z-index: 1000"
      >
        <q-btn
          v-if="
            ($router.currentRoute.name || '').startsWith('client') && $q.screen.lt.md
          "
          flat
          icon="menu"
          aria-label="menu"
          @click="$root.$emit('toggle-client-drawer')"
        />
        <q-btn
          v-if="hasBackButton(this.$router.currentRoute.name)"
          size="lg"
          dense
          no-caps
          flat
          icon="chevron_left"
          :ripple="false"
          @click="$router.back()"
        />

        <q-toolbar-title class="text-center">
          <div
            :class="'ellipsis title-text ' + (subtitle ? 'has-subtitle' : '')"
          >
            {{ title }}
          </div>
          <div class="ellipsis text-caption title-text">{{ subtitle }}</div>
        </q-toolbar-title>

        <user-menu v-if="$ccApi.isLoggedIn" />
        <dev-menu v-if="$ccApi.isLoggedIn" />

        <q-btn
          v-else
          :label="$root.$i18n.locale.split('-')[0]"
          icon="fas fa-globe"
          stretch
          flat
          class="hide-arrow"
        >
          <language-menu />
        </q-btn>
      </q-toolbar>
      <banner />
      <div
        class="absolute-full overflow-hidden no-pointer-events"
        style="bottom: -10px"
      ></div>
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
.title-text
  line-height: 1.4rem
  &.has-subtitle
    font-size: 1.25rem
  &.text-caption
    font-size: 0.8rem
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import UserMenu from "../components/UserMenu.vue";
import LanguageMenu from "../components/LanguageMenu.vue";
import DevMenu from "../components/DevMenu.vue";
import Banner from "../components/Banner.vue";

@Component({
  components: {
    UserMenu,
    LanguageMenu,
    DevMenu,
    Banner
  },
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
export default class MainLayout extends Vue {
  get title() {
    const route = this.$route;

    if (route.path.startsWith("/client")) {
      if (this.selectedClient) {
        return this.selectedClient.masterData.name;
      } else if (route.params.clientId == "new") {
        return this.$t("newClient");
      } else {
        return this.$tc("client", 2);
      }
    } else if (
      ["userSettings", "teamSettings", "legalNotice", "privacyPolicy"].includes(
        route.name || ""
      )
    ) {
      return this.$t(route.name || "");
    } else {
      return "";
    }
  }
  get subtitle() {
    const route = this.$route;

    if (
      this.record &&
      [
        "problem",
        "classification",
        "outcome",
        "intervention",
        "interventions"
      ].includes(route.name || "")
    ) {
      return this.$t(this.record.problem.title);
    } else if (route.name == "problemsByDiagnosis") {
      return this.$t("problemAdmissionByDiagnosis");
    } else {
      return "";
    }
  }
  get selectedClient() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
  get record() {
    return this.$store.direct.getters.getProblemRecordById(this.$route.params);
  }

  hasBackButton(routeName: string | null | undefined) {
    return ![
      "client",
      "clientReminders",
      "clientReport",
      "clientContacts",
      "clientMasterData",
      "login"
    ].includes(routeName || "");
  }
  showOnboardingForDemoVersion() {
    if (
      process.env.BACKEND == "demo" &&
      !this.$store.direct.state.currentUser?.isOnboardingCompleted
    ) {
      void import("../components/DemoOnboarding.vue").then(component => {
        this.$q.dialog({
          component: component.default,
          parent: this
        });
      });
    }
  }

  mounted() {
    this.showOnboardingForDemoVersion();
  }
}
</script>
