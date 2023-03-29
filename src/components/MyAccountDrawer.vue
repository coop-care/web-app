<template>
  <q-list>
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
        </q-item-label>
      </q-item-section>
    </q-item>

    <navigation-section :items="userItems" />

    <q-separator class="q-my-lg"/>

    <navigation-section :items="appItems" />
  </q-list>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import SimplifiedMarkdown from "./SimplifiedMarkdown.vue";
import Signature from "./Signature.vue";
import NavigationSection from "./NavigationSection.vue";

@Component({
  components: {
    SimplifiedMarkdown,
    Signature,
    NavigationSection
  },
})
export default class MyAccountDrawer extends Vue {
  get user() {
    return this.$store.direct.state.currentUser;
  }
  get userItems() {
    return [{
      label: this.$t("userSettings"),
      icon: "fas fa-user-cog",
      route: "userSettings",
    },{
      label: this.$t("logout"),
      icon: "fas fa-sign-out-alt",
      action: this.logout,
      visible: !this.$store.direct.getters.isDemo
    }];
  }
  get appItems() {
    return [{
      label: this.$t("feedback"),
      icon: "far fa-comment",
      action: this.feedback,
    },{
      label: this.$t("contribute"),
      icon: "fab fa-github",
      action: () => {
        const win = window.open("https://www.coopcare.de/en/contributing/", "_blank");

        if (win) {
          win.opener = null;
        }
      },
    },{
      label: this.$t("license"),
      icon: "fas fa-handshake",
      route: "license",
    },{
      label: this.$t("acknowledgements"),
      icon: "far fa-heart",
      route: "acknowledgements",
    },{
      label: this.$t("privacyPolicy"),
      icon: "fas fa-shield-alt",
      route: "privacyPolicy",
    },{
      label: this.$t("legalNotice"),
      icon: "fas fa-info",
      route: "legalNotice",
    }];
  }

  feedback() {
    location.href = "mailto:feedback@coopcare.de?subject=Feedback";
  }

  logout() {
    // first to login page, then logout to prevent redirectPath being set to current path
    void this.$router.replace({name: "login"})
      .then(() => this.$store.direct.dispatch.logout())
  }
}
</script>
