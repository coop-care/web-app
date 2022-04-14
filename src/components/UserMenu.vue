<template>
  <q-btn
    v-if="$ccApi.isLoggedIn"
    icon="account_circle"
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
        <q-item v-if="user">
          <q-item-section side>
            <signature
              :user="user"
              color="white"
              class="usermenu-signature bg-grey-7"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <simplified-markdown :text="$t('accountWelcomeMessage', { name: user.username })" />
              <div class="q-mt-xs text-caption text-weight-medium">
                {{ user.email }}
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="!$store.direct.getters.isDemo"
          clickable
          v-close-popup
          @click="logout"
        >
          <q-item-section side>
            <q-icon name="fas fa-sign-out-alt" />
          </q-item-section>
          <q-item-section>{{ $t("logout") }}</q-item-section>
        </q-item>

        <q-separator />

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
          @click="$router.push({ name: 'userSettings' })"
        >
          <q-item-section side>
            <q-icon name="fas fa-user-cog" />
          </q-item-section>
          <q-item-section>{{ $t("userSettings") }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="$router.push({ name: 'teamSettings' })"
        >
          <q-item-section side>
            <q-icon name="fas fa-users-cog" />
          </q-item-section>
          <q-item-section>{{ $t("teamSettings") }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="$router.push({ name: 'insights' })"
        >
          <q-item-section side>
            <q-icon name="fas fa-chart-line" />
          </q-item-section>
          <q-item-section>{{ $t("insights") }}</q-item-section>
        </q-item>

        <q-separator />

        <q-item
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

        <q-separator />

        <q-item clickable>
          <q-item-section side>
            <q-icon name="fas fa-info-circle" />
          </q-item-section>
          <q-item-section>{{
            $t("aboutCoopCare")
          }}</q-item-section>
          <q-item-section side>
            <q-icon name="fas fa-angle-right" />
          </q-item-section>
          <q-menu
            auto-close
            :anchor="$q.screen.gt.xs ? 'top left' : 'bottom middle'"
            :self="$q.screen.gt.xs ? 'top right' : 'top middle'"
            :fit="true"
          >
            <q-list class="text-body2">
              <q-item
                clickable
                v-close-popup
                @click="openMail"
              >
                <q-item-section side>
                  <q-icon name="feedback" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t("feedback") }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                tag="a"
                href="https://www.coopcare.de/en/contributing/"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <q-item-section side>
                  <q-icon name="fab fa-github" />
                </q-item-section>
                <q-item-section>{{ $t("contribute") }}</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="$router.push({ name: 'license' })"
              >
                <q-item-section side>
                  <q-icon name="fas fa-handshake" />
                </q-item-section>
                <q-item-section>{{ $t("license") }}</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="$router.push({ name: 'acknowledgements' })"
              >
                <q-item-section side>
                  <q-icon name="fas fa-heart" />
                </q-item-section>
                <q-item-section>{{ $t("acknowledgements") }}</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="$router.push({ name: 'privacyPolicy' })"
              >
                <q-item-section side>
                  <q-icon name="fas fa-shield-alt" />
                </q-item-section>
                <q-item-section>{{ $t("privacyPolicy") }}</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="$router.push({ name: 'legalNotice' })"
              >
                <q-item-section side>
                  <q-icon name="fas fa-info" />
                </q-item-section>
                <q-item-section>{{ $t("legalNotice") }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

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
import SimplifiedMarkdown from "./SimplifiedMarkdown.vue";
import Signature from "./Signature.vue";

@Component({
  components: {
    LanguageMenu,
    SimplifiedMarkdown,
    Signature
  },
})
export default class UserMenu extends Vue {
  get user() {
    return this.$store.direct.state.currentUser;
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
