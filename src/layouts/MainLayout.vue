<template>
  <q-layout view="hHh Lpr lff">
    <q-header class="bg-white print-hide">
      <q-toolbar
        :class="'shadow-3 bg-primary ' + ($q.screen.lt.sm ? 'q-px-none' : '')"
        style="z-index: 1000"
      >
        <q-btn
          v-if="hasMenuButton($router.currentRoute.value)"
          flat
          icon="menu"
          aria-label="menu"
          @click="$bus.emit('toggle-drawer')"
        />
        <q-btn
          v-if="hasBackButton($router.currentRoute.value)"
          size="lg"
          dense
          no-caps
          flat
          icon="chevron_left"
          :ripple="false"
          @click="$router.back()"
        />
        <div 
          v-if="!hasMenuButton($router.currentRoute.value) && !hasBackButton($router.currentRoute.value)"
          style="width: 60px"
        ></div>

        <q-toolbar-title class="text-center">
          <div
            class="ellipsis title-text"
          >
            {{ title }}
          </div>
        </q-toolbar-title>

        <user-menu v-if="$ccApi.isLoggedIn" />

        <q-btn
          v-else
          :label="$i18n.locale.split('-')[0]"
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

    <navigation-drawer v-if="hasDrawer($router.currentRoute.value)" />

    <q-page-container>
      <div class="print-only text-black text-center text-subtitle2 border-bottom-grey">
        {{ title }}
      </div>
      <router-view />
      <component :is="modalSheetComponent" />
      <new-client-sheet/>
      <user-settings-sheet/>
    </q-page-container>
  </q-layout>
</template>

<style lang="sass">
.q-btn-dropdown.hide-arrow
  .q-btn-dropdown__arrow
    display: none
.title-text
  line-height: 1.4rem
  &.text-caption
    font-size: 0.8rem
</style>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import UserMenu from "../components/UserMenu.vue";
import LanguageMenu from "../components/LanguageMenu.vue";
import Banner from "../components/Banner.vue";
import NavigationDrawer from "../components/NavigationDrawer.vue";
import NewClientSheet from "../components/NewClientSheet.vue";
import UserSettingsSheet from "../components/UserSettingsSheet.vue";
import { RouteLocation } from "vue-router";
import { createMetaMixin } from "quasar";

@Component({
  components: {
    UserMenu,
    LanguageMenu,
    Banner,
    NavigationDrawer,
    NewClientSheet,
    UserSettingsSheet,
  },
  mixins: [
    createMetaMixin(function() {
      return {
        title: "CoopCare" + (this.$store.direct.getters.isDemo ? " – " + this.$t("demoAppTitle") : " App" ),
        meta: {
          description: { name: "description", content: this.$t("appDescription") },
          google: { name: "google", content: "notranslate" },
          contentLanguage: {
            "http-equiv": "Content-Language",
            content: this.$i18n.locale
          }
        }
      }
    })
  ],
})
export default class MainLayout extends Vue {
  get title() {
    const route = this.$route;
    const routeName = route.name?.toString() ?? "";

    if (route.path.startsWith("/client")) {
      if (this.selectedClient) {
        return this.selectedClient.contact.name;
      } else {
        return this.$t("client", 2);
      }
    } else if (routeName.length > 0 && this.$te(routeName)) {
      return this.$t(routeName);
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
  get backButtonRoutes() {
    return ["register", "confirm", "requestPasswordReset", "resetPassword"];
  }
  get noDrawerRoutes() {
    return this.backButtonRoutes.concat("login");
  }
  get modalSheetComponent() {
    const sheet = this.$route.params.sheet as string;
    return (this.$route.meta.sheets as Record<string, any>)?.[sheet];
  }

  hasDrawer(route: RouteLocation) {
    return !route.meta.noAuth;
  }
  hasMenuButton(route: RouteLocation) {
    return this.hasDrawer(route) && this.$q.screen.lt.md;
  }
  hasBackButton(route: RouteLocation) {
    return !!route.meta.noAuth && route.name != "login";
  }
  showOnboardingForDemoVersion() {
    if (
      this.$store.direct.getters.isDemo &&
      !this.$store.direct.state.currentUser?.isOnboardingCompleted
    ) {
      void import("../components/DemoOnboarding.vue").then(component => {
        this.$q.dialog({
          component: component.default
        });
      });
    }
  }

  mounted() {
    this.showOnboardingForDemoVersion();
  }
}
</script>
