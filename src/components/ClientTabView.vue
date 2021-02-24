<template>
  <div>
    <q-tabs
      v-model="selectedTab"
      no-caps
      class="client-tabs border-bottom-grey q-mb-md text-primary"
      :inline-label="$q.screen.gt.xs"
      :dense="!$q.screen.gt.xs"
      align="center"
      right-icon=" "
      left-icon=" "
    >
      <q-route-tab
        v-if="routesPerTab.length > 0"
        :name="0"
        :label="$t('masterDataTitle')"
        icon="fas fa-id-card"
        :to="routesPerTab[0]"
        class="text-primary"
      />
      <q-route-tab
        v-if="routesPerTab.length > 1"
        :name="1"
        :label="$tc('task', 2)"
        icon="fas fa-tasks"
        :to="routesPerTab[1]"
        class="text-intervention"
      >
        <q-badge
          color="intervention"
          floating
          :label="dueTaskCount"
          v-if="dueTaskCount"
          class="radius-lg text-weight-medium"
        />
      </q-route-tab>
      <q-route-tab
        v-if="routesPerTab.length > 2"
        :name="2"
        :label="$t('reportTitle')"
        icon="fas fa-notes-medical"
        :to="routesPerTab[2]"
        class="text-classification"
      />

      <q-tab
        :name="3"
        :ripple="false"
        disable
        class="more-tab q-pa-none"
        content-class="q-pa-none full-width"
      >
        <q-btn-dropdown 
          :label="$t('moreButton')"
          auto-close
          stretch
          flat
          no-caps
          :dense="!$q.screen.gt.xs"
          :ripple="false"
          color="primary"
          class="full-width full-height"
          content-class="radius-md shadow-5 text-primary"
        >
          <q-list>
            <q-item
              v-for="(item, index) in moreTabItems"
              :key="'moreTabItem' + index"
              clickable
              v-ripple
              @click="item.action"
            >
              <q-item-section side>
                <q-icon 
                  :name="item.icon"
                  color="primary"
                />
              </q-item-section>
              <q-item-section>
                {{ item.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-tab>
    </q-tabs>

    <div class="overflow-hidden">
      <div class="relative-position">
        <transition
          :enter-active-class="'full-width animated ' + tabPanelEnterClass"
          :leave-active-class="'full-width absolute animated ' + tabPanelLeaveClass"
        >
          <router-view :key="$route.path.split('/')[3]"/>
        </transition>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.client-tabs
  .q-tabs__content--align-left .q-tab
    flex: 1 1 auto
  .q-tab
    @media screen and (max-width: $breakpoint-xs-max)
      padding: 0
  .more-tab.disabled
    opacity: 1 !important
    cursor: pointer !important
    *
      cursor: pointer !important
    .q-btn-dropdown--simple * + .q-btn-dropdown__arrow
      margin-left: 0
      margin-right: -8px
.client-overview
  @media (max-width: $breakpoint-xs-max)
    padding: 8px
</style>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import { Route } from "vue-router";

@Component
export default class ClientPage extends RecordMixin {
  selectedTab = this.initiallySelectedTab;
  routesPerTab: Partial<Route>[] = this.childrenRouteNames.map(name => {
    return {name: name, params: this.$route.params}
  });
  tabPanelEnterClass = "slideInRight";
  tabPanelLeaveClass = "slideOutLeft";

  @Watch("$route")
  onRouteChange(newRoute: Route, oldRoute: Route) {
    const newRouteName = this.findChildrenRouteName(newRoute);
    const oldRouteName = this.findChildrenRouteName(oldRoute);
    const newIndex = this.childrenRouteNames.indexOf(newRouteName);
    const oldIndex = this.childrenRouteNames.indexOf(oldRouteName);

    if (oldIndex >= 0 && newIndex >= 0) {
      if (oldIndex < newIndex) {
        this.tabPanelEnterClass = "slideInRight";
        this.tabPanelLeaveClass = "slideOutLeft";
      } else if (newIndex < oldIndex) {
        this.tabPanelEnterClass = "slideInLeft";
        this.tabPanelLeaveClass = "slideOutRight";
      }

      this.routesPerTab[newIndex] = newRoute;

      if (newIndex > 2) {
        this.selectedTab = this.tabCount;
      }
    }
  }
  get dueTaskCount() {
    return this.client?.dueTasksCount || 0;
  }
  get childrenRouteNames() {
    return ["clientMasterData", "clientReminders", "clientReport", "clientProofOfPerformance", "clientHistory"];
  }
  get tabCount() {
    return 3;
  }
  get moreTabItems() {
    if (!this.client) {
      return [];
    }

    return [
      {
        name: this.$t("showProofOfPerformance"),
        icon: "fas fa-clipboard",
        action: () => this.pushRoute("clientProofOfPerformance"),
      },
      {
        name: this.$t("documentationHistory"),
        icon: "fas fa-history",
        action: () => this.pushRoute("clientHistory"),
      }
    ];
  }
  get initiallySelectedTab() {
    return Math.max(
      0, 
      Math.min(
        this.childrenRouteNames.indexOf(
          this.findChildrenRouteName(this.$route, this.childrenRouteNames)
        ),
        this.tabCount
      )
    );
  }

  findChildrenRouteName(route: Route, childrenRouteNames = this.childrenRouteNames) {
    return route.matched.find(route => 
      childrenRouteNames.includes(route.name || "")
    )?.name || "";
  }
}
</script>
