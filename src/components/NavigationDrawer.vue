<template>
  <q-drawer
    v-model="isVisible"
    content-class="no-scroll non-selectable bg-grey-2 dense-avatar"
    show-if-above
    no-swipe-close
    :breakpoint="1020"
    class="navigation-drawer print-hide"
  >
    <pull-to-refresh class="fit">
      <div class="fit column no-wrap">
        <q-tabs
          v-model="selectedTab"
          no-caps
          class="border-bottom-grey q-mt-sm text-grey-8"
          dense
          align="justify"
          active-color="primary"
        >
          <q-tab
            name="clients"
            :ripple="false"
            :label="$tc('client', 2)"
            icon="fas fa-house-user"
          />
          <q-tab
            name="team"
            :ripple="false"
            :label="$t('team')"
            icon="fas fa-users"
          />
          <q-tab
            name="user"
            :ripple="false"
            :label="$t('myApp')"
            icon="fas fa-user-circle"
          />
        </q-tabs>
        <div
          style="height:16px"
          @click="closeDrawer"
        ></div>
        <q-tab-panels
          v-model="selectedTab"
          animated
          swipeable
          class="col scroll bg-transparent"
        >
          <q-tab-panel
            name="clients"
            class="q-pa-none column no-wrap"
          >
            <client-drawer/>
            <q-space @click="closeDrawer"/>
          </q-tab-panel>
          <q-tab-panel
            name="team"
            class="q-pa-none column no-wrap"
          >
            <team-drawer/>
            <q-space @click="closeDrawer"/>
          </q-tab-panel>
          <q-tab-panel
            name="user"
            class="q-pa-none column no-wrap"
          >
            <my-account-drawer/>
            <q-space @click="closeDrawer"/>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </pull-to-refresh>
  </q-drawer>
</template>

<style lang="sass">
.navigation-drawer
  .q-pull-to-refresh__content
    height: 100%
    width: 100%
  .q-tab
    flex: 10000 1 0%
    padding: 0 4px
    width: auto
    min-width: 0
    max-width: 100%
    .q-tab__label
      width: 100%
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import PullToRefresh from "components/PullToRefresh.vue";
import ClientDrawer from "components/ClientDrawer.vue";
import TeamDrawer from "components/TeamDrawer.vue";
import MyAccountDrawer from "components/MyAccountDrawer.vue";

@Component({
  components: {
    PullToRefresh,
    ClientDrawer,
    TeamDrawer,
    MyAccountDrawer,
  }
})
export default class NavigationDrawer extends Vue {
  selectedTab = this.initialTab;
  isVisible = this.$q.screen.gt.sm;

  get initialTab() {
    const name = this.$route.name || "";
    const section = this.$route.meta?.section || "";

    if (section == "client" || name.startsWith("client")) {
      return "clients";
    } else if (section == "team" || name.startsWith("team")) {
      return "team";
    } else {
      return "user";
    }
  }

  closeDrawer() {
    if (!this.$q.screen.gt.sm) {
      this.isVisible = false;
    }
  }

  created() {
    this.$root.$on("toggle-drawer", () => this.isVisible = !this.isVisible);
    this.$root.$on("open-drawer", () => this.isVisible = true);
    this.$root.$on("close-drawer", this.closeDrawer);
  }
  beforeDestroy() {
    this.$root.$off("toggle-drawer");
    this.$root.$off("open-drawer");
    this.$root.$off("close-drawer");
  }
}
</script>
