<template>
  <q-page
    padding
    class="limit-page-width width-sm"
  >
    <div
      v-if="backofficeOptions.length == 1"
      class="q-mt-lg"
    >
      <div>{{ $t("noExistingBackOffices") }}</div>
      <q-btn 
        v-if="isTeamAdmin"
        :label="$t('addBackoffice')"
        rounded
        no-caps
        color="primary"
        class="q-mt-md"
        @click="setBackofficeId('new')"
      />
    </div>
    <div v-else>
      <q-select
        :model-value="backofficeId"
        @update:model-value="setBackofficeId"
        :options="backofficeOptions"
        :label="$t('backoffice')"
        emit-value
        map-options
        class="text-h6 q-mb-lg"
      />
      <central-message
        v-if="!backoffice" 
        :message="$t('backofficeNotFound')"
      />
      <div
        class="backoffice-overview q-pt-lg"
        v-else-if="isBackofficeAdmin"
      >
        <tab-view
          :key="$route.params.backofficeId || ''"
          :tabs="tabs"
          pullToRefresh
        />
      </div>
      <div v-else></div>
    </div>
  </q-page>
</template>

<style lang="sass">
.backoffice-overview
  @media (max-width: $breakpoint-sm-max)
    padding: 8px
  @media print
    padding: .75cm 0 0
</style>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import BackofficeMixin, { BackofficeMixinInterface } from "../mixins/BackofficeMixin";
import TeamMixin, { TeamMixinInterface } from "../mixins/TeamMixin";
import { BackOffice, Client } from "../models";
import CentralMessage from "components/CentralMessage.vue";
import TabView from "../components/TabView.vue";
import { incrementalName } from "src/helper/utils";
import { countryCodes as referralCountryCodes } from "components/BackofficeReferral/index.vue";

interface BackofficePage extends BackofficeMixinInterface, TeamMixinInterface {};

@Component({
  components: {
    CentralMessage,
    TabView
  },
  mixins: [BackofficeMixin, TeamMixin]
})
class BackofficePage extends Vue {
  get backofficeOptions() {
    const options = this.$store.direct.state.backoffices.map(item => ({
      label: item.name,
      value: item.id
    })).sort(Client.sortByLabel);

    if (this.isTeamAdmin || this.isBackofficeAdmin) {
      options.push({
        label: this.$t("addBackoffice") as string,
        value: "new"
      });
    }
    
    return options;
  }
  get tabs() {
    return [{
      label: this.$t("invoice", 2),
      route: "backofficeInvoice",
      icon: "fas fa-file-invoice",
    },{
      label: this.$t("costEstimate", 2),
      route: "backofficeCostEstimate",
      icon: "fas fa-tag",
    },
    referralCountryCodes.includes(this.backofficeCountryComponent) 
      ? {
          label: this.$t("de.medicalReferral", 2),
          route: "backofficeReferral",
          icon: "fas fa-file-medical",
        } 
      : undefined,
    {
      label: this.$t("settingsTitle") as string,
      route: "backofficeSettings",
      icon: "fas fa-file-signature",
    }].filter(Boolean);
  }

  setBackofficeId(value: string) {
    if (value == "new") {
      const userId = this.$store.direct.state.currentUser?.userId;

      if (userId && (this.isTeamAdmin || this.isBackofficeAdmin)) {
        const name = incrementalName(
          this.$t("newBackOffice").toString(),
          this.$store.direct.state.backoffices.map(item => item.name)
        );
        const backoffice = new BackOffice(name, userId);
        void this.$store.direct.dispatch.addBackoffice(backoffice)
          .then(backoffice => this.$router.replace({
            name: "backofficeGeneralSettings",
            params: {
              backofficeId: backoffice.id
            }
          }));
      }
    } else {
      this.showBackoffice(value);
    }
  }
  showBackoffice(backofficeId: string) {
    void this.$router.replace({
      name: "backoffice", 
      params: { backofficeId }
    });
  }
}

export default BackofficePage;
</script>
