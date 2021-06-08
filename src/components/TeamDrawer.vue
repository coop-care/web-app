<template>
  <q-list>
    <navigation-section :items="navigationItems" />
  </q-list>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import NavigationSection from "./NavigationSection.vue";

@Component({
  components: {
    NavigationSection
  }
})
export default class TeamDrawer extends Vue {
  get navigationItems() {
    return [{
      label: this.$t("teamSettings"),
      icon: "fas fa-users-cog",
      route: "teamSettings",
    },{
      label: this.$t("insights"),
      icon: "fas fa-chart-line",
      route: "insights",
      visible: !!process.env.DEV
    }]
    .filter(item => item.visible != false)
  }
}
</script>
