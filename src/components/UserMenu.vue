<template>
  <q-btn
    v-if="$ccApi.isLoggedIn"
    icon="share"
    flat
    stretch
    style="max-width:44px"
  >
    <q-menu
      max-width="260px"
      max-height="calc(96vh - 50px)"
    >
      <q-list
        class="text-body2"
        style="width: 260px"
      >
        <q-item clickable>
          <q-item-section side>
            <q-icon name="fas fa-globe" />
          </q-item-section>
          <q-item-section>{{
            $t("selectLanguage", { language: $t($root.$i18n.locale) })
          }}</q-item-section>
          <q-item-section side>
            <q-icon name="fas fa-angle-right" />
          </q-item-section>
          <language-menu
            :anchor="$q.screen.gt.xs ? 'top left' : 'bottom middle'"
            :self="$q.screen.gt.xs ? 'top right' : 'top middle'"
            :fit="true"
          />
        </q-item>

        <q-item
          clickable
          v-close-popup
          @click="openMail"
        >
          <q-item-section side>
            <q-icon name="far fa-comment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("feedback") }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="!$q.platform.is.electron"
          clickable
          v-close-popup
          @click="print"
        >
          <q-item-section side>
            <q-icon name="fas fa-print" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("print") }}</q-item-label>
          </q-item-section>
        </q-item>

        <div v-if="isDev">
          <q-separator />
          <q-item clickable>
            <q-item-section side>
              <q-icon name="fas fa-tools" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ $q.platform.is.name }} – {{ $q.platform.is.platform }},
                Version {{ $q.platform.is.versionNumber }} ({{ $q.platform.is.version }})
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="fas fa-angle-right" />
            </q-item-section>
            <dev-menu
              :anchor="$q.screen.gt.xs ? 'top left' : 'bottom middle'"
              :self="$q.screen.gt.xs ? 'top right' : 'top middle'"
            />
          </q-item>
        </div>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style lang="sass">
.usermenu-signature
  font-size: 10px
  line-height: 2.4em
  border: 0 none
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import LanguageMenu from "./LanguageMenu.vue";
import DevMenu from "./DevMenu.vue";

@Component({
  components: {
    LanguageMenu,
    DevMenu
  },
})
export default class UserMenu extends Vue {
  get isDemo() {
    return process.env.BACKEND == "demo";
  }
  get isDev() {
    return process.env.DEV;
  }
  print() {
    if (this.$q.platform.is.cordova && (cordova?.plugins as any)?.printer) {
      (cordova?.plugins as any)?.printer?.print?.();
    } else if (this.$q.platform.is.electron) {
      window.print();
    } else {
      window.print();
    }
  }
  openMail() {
    location.href = "mailto:feedback@coopcare.de?subject=Feedback";
  }
  logout() {
    // first to login page, then logout to prevent redirectPath being set to current path
    void this.$router.replace({name: "login"})
      .then(() => this.$store.direct.dispatch.logout())
  }
}
</script>
