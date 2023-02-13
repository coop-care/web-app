<template>
  <q-layout view="hHh Lpr lff">
    <q-header class="bg-white print-hide">
      <q-toolbar
        :class="'shadow-3 bg-primary ' + ($q.screen.lt.sm ? 'q-px-none' : '')"
        style="z-index: 1000"
      >
        <q-btn
          v-if="hasMenuButton($router.currentRoute.name || '')"
          flat
          icon="menu"
          aria-label="menu"
          @click="$root.$emit('toggle-drawer')"
        />
        <q-btn
          v-if="hasBackButton($router.currentRoute.name || '')"
          size="lg"
          dense
          no-caps
          flat
          icon="chevron_left"
          :ripple="false"
          @click="$router.back()"
        />
        <div 
          v-if="!hasMenuButton($router.currentRoute.name || '') && !hasBackButton($router.currentRoute.name || '')"
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

    <navigation-drawer v-if="hasDrawer($router.currentRoute.name || '')" />

    <q-page-container>
      <div class="print-only text-black text-center text-subtitle2 border-bottom-grey">
        {{ title }}
      </div>
      <router-view />
      <component :is="modalSheetComponent" />
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
import { Vue, Component } from "vue-property-decorator";
import UserMenu from "../components/UserMenu.vue";
import LanguageMenu from "../components/LanguageMenu.vue";
import Banner from "../components/Banner.vue";
import NavigationDrawer from "../components/NavigationDrawer.vue";
import EditingSheet from "../components/EditingSheet.vue";

@Component({
  components: {
    UserMenu,
    LanguageMenu,
    Banner,
    NavigationDrawer,
    EditingSheet
  },
  meta() {
    return {
      title: "CoopCare" + (this.$store.direct.getters.isDemo ? " – " + this.$t("demoAppTitle") : " App" ),
      meta: {
        description: { name: "description", content: this.$t("appDescription") },
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
        return this.selectedClient.contact.name;
      } else {
        return this.$tc("client", 2);
      }
    } else if (this.$te(route.name || "")) {
      return this.$t(route.name || "");
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
    const sheet = this.$route.params.sheet;
    return this.$route.meta?.sheets?.[sheet];
  }

  hasDrawer(routeName: string) {
    return !this.noDrawerRoutes.includes(routeName);
  }
  hasMenuButton(routeName: string) {
    return this.hasDrawer(routeName) && this.$q.screen.lt.md;
  }
  hasBackButton(routeName: string) {
    return this.backButtonRoutes.includes(routeName);
  }
  showOnboardingForDemoVersion() {
    if (
      this.$store.direct.getters.isDemo &&
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
