<template>
  <split-view
    class="min-height"
    ref="splitView"
    @update:is-collapsed="isCollapsed = $event"
    @did-show-before="isBeforeVisible = true"
    @did-show-after="isBeforeVisible = false"
  >
    <template v-slot:before>
      <q-list 
        class="text-size-adjust-md q-mb-xl"
      >
        <navigation-items
          :items="settingsItems"
          type="splitview"
          @did-route="splitView.showAfter()"
        />
        <backoffice-compensation-agreement-list
          @did-route="splitView.showAfter()"
        />
      </q-list>
    </template>

    <template v-slot:after>
      <router-view/>
    </template>
  </split-view>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import BackofficeMixin from "src/mixins/BackofficeMixin";
import SplitView from "components/SplitView.vue";
import NavigationItems from "components/NavigationItems.vue";
import BackofficeCompensationAgreementList from "components/BackofficeCompensationAgreementList/index.vue";

@Component({
  components: {
    SplitView,
    NavigationItems,
    BackofficeCompensationAgreementList
  },
})
export default class BackofficeSettings extends BackofficeMixin {
  isCollapsed = false;
  isBeforeVisible = true;
  @Ref() readonly splitView!: SplitView;
  
  get settingsItems() {
    return [{
      label: this.$t("generalSettings"),
      route: "backofficeGeneralSettings",
      active: this.$route.name == "backofficeGeneralSettings" && 
        (!this.isCollapsed || !this.isBeforeVisible)
    }]
  }
}
</script>
