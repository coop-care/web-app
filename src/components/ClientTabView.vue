<template>
  <div>
    <q-tabs
      v-model="selectedTab"
      no-caps
      class="bg-grey-1 q-mb-md text-primary"
      :inline-label="$q.screen.gt.xs"
      :dense="!$q.screen.gt.xs"
      align="center"
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

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import { Route } from "vue-router";

@Component
export default class ClientPage extends RecordMixin {
  selectedTab = 0;
  routesPerTab: Partial<Route>[] = this.childrenRouteNames.map(name => {
    return {name: name, params: this.$route.params}
  });
  tabPanelEnterClass = "slideInRight";
  tabPanelLeaveClass = "slideOutLeft";

  @Watch("$route")
  onRouteChange(newRoute: Route, oldRoute: Route) {
    const newRouteName = newRoute.matched.find(route => 
      this.childrenRouteNames.includes(route.name || "")
    )?.name || "";
    const oldRouteName = oldRoute.matched.find(route => 
      this.childrenRouteNames.includes(route.name || "")
    )?.name || "";
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
    }
  }
  get dueTaskCount() {
    return this.client?.dueTasksCount || 0;
  }
  get childrenRouteNames() {
    return ["clientMasterData", "clientReminders", "clientReport"];
  }
}
</script>
