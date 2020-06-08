<template>
  <q-btn
    v-if="$ccApi.isLoggedIn"
    icon="account_circle"
    flat
    stretch
    style="max-width:44px"
  >
    <q-menu max-width="240px">
      <q-list
        class="text-body2"
        style="width: 240px"
      >
        <q-item-label
          header
          class="text-black"
        >
          <div>{{ $t("accountWelcomeMessage") }}</div>
          <div class="q-mt-xs text-weight-medium">
            {{ $ccApi.username }}
          </div>
        </q-item-label>

        <q-separator />

        <q-item clickable>
          <q-item-section side>
            <q-icon name="fas fa-globe" />
          </q-item-section>
          <q-item-section>{{ $t("selectLanguage", {language: $t($root.$i18n.locale)}) }}</q-item-section>
          <q-item-section side>
            <q-icon name="fas fa-angle-right" />
          </q-item-section>
          <language-menu
            :anchor="$q.screen.gt.xs ? 'top left' : ''"
            :self="$q.screen.gt.xs ? 'top right' : ''"
            :fit="true"
          />
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="$router.push({name: 'userSettings'})"
        >
          <q-item-section side>
            <q-icon name="fas fa-user-cog" />
          </q-item-section>
          <q-item-section>{{ $t("userSettings") }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="$router.push({name: 'teamSettings'})"
        >
          <q-item-section side>
            <q-icon name="fas fa-users-cog" />
          </q-item-section>
          <q-item-section>{{ $t("teamSettings") }}</q-item-section>
        </q-item>

        <q-separator />

        <q-item
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

        <q-item class="column q-px-none text-grey-7">
          <q-btn
            :label="$t('contributeAndOpenSource')"
            flat
            no-caps
            class="text-caption"
            type="a"
            href="https://github.com/coop-care/web-app"
            target="_blank"
            icon-right="fab fa-github"
            v-close-popup
          />
          <q-btn
            :label="$t('aboutUs')"
            flat
            no-caps
            class="text-caption"
          />
          <q-btn
            :label="$t('privacyPolicy')"
            flat
            no-caps
            class="text-caption"
          />
        </q-item>

      </q-list>
    </q-menu>
  </q-btn>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import LanguageMenu from "./LanguageMenu.vue";

@Component({
  components: {
    LanguageMenu
  }
})
export default class UserMenu extends Vue {
  logout() {
    this.$ccApi.logout().then(() => this.$router.push({ name: "login" }));
  }
}
</script>
