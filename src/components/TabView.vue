<template>
  <div>
    <q-tabs
      v-model="selectedTab"
      no-caps
      class="tab-view border-bottom-grey q-mb-md text-primary print-hide"
      :inline-label="$q.screen.gt.xs"
      :dense="!$q.screen.gt.xs"
      align="center"
      right-icon=" "
      left-icon=" "
    >
      <q-route-tab
        v-for="(item, index) in regularTabs"
        :key="'regularTab' + index"
        :name="index"
        :label="item.label"
        :icon="item.icon"
        :to="routesPerTab[index]"
        :class="'text-' + (item.color || 'primary')"
      >
        <q-badge
          v-if="item.badge"
          :label="item.badge"
          :color="item.color || 'primary'"
          floating
          class="radius-lg text-weight-medium"
        />
      </q-route-tab>

      <q-tab
        v-if="additionalTabs.length"
        :name="tabCount - 1"
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
              v-for="(item, index) in additionalTabs"
              :key="'additionalTab' + index"
              clickable
              v-ripple
              :to="routesPerTab[tabCount - 1 + index]"
            >
              <q-item-section
                v-if="item.icon" 
                side
              >
                <q-icon 
                  :name="item.icon"
                  :color="item.color || 'primary'"
                />
              </q-item-section>
              <q-item-section>
                {{ item.label }}
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
          <router-view :key="'tab' + selectedTab"/>
        </transition>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.tab-view
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
</style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Route } from "vue-router";

export type Tab = {
  label: string;
  route: string;
  icon?: string;
  color?: string;
  badge?: string;
};

@Component
export default class TabView extends Vue {
  @Prop({type: Array, default: []}) readonly tabs!: Tab[];
  @Prop({type: Number, default: 4}) readonly tabCount!: number;
  selectedTab = this.initiallySelectedTab;
  routesPerTab: Partial<Route>[] = this.childrenRouteNames.map(name => ({
    name, 
    params: this.$route.params
  }));
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

      if (newIndex >= this.tabCount - 1) {
        this.selectedTab = this.tabCount - 1;
      }
    }
  }
  @Watch("tabs")
  onTabsChange() {
    this.routesPerTab = this.childrenRouteNames.map(name => ({
      name, 
      params: this.$route.params
    }));
  }
  get childrenRouteNames() {
    return this.tabs.map(tab => tab.route);
  }
  get regularTabs() {
    return this.tabs.slice(0, this.tabs.length > this.tabCount ? this.tabCount - 1 : this.tabCount);
  }
  get additionalTabs() {
    return this.tabs.length > this.tabCount
      ? this.tabs.slice(this.tabCount - 1)
      : [];
  }
  get initiallySelectedTab() {
    return Math.max(
      0, 
      Math.min(
        this.childrenRouteNames.indexOf(
          this.findChildrenRouteName(this.$route, this.childrenRouteNames)
        ),
        this.tabCount - 1
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
