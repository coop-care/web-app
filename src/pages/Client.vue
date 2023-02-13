<template>
  <q-page class="limit-page-width">

    <pull-to-refresh
      @refresh="updateClientsInAdditionalTeams"
      :disable="disablePullToRefresh"
    >
      <loading v-if="$store.direct.state.isLoadingClientList && !clients.length" />

      <div
        v-else-if="
          !$store.direct.state.isLoadingClientList &&
            !clients.length &&
            !$route.params.clientId
        "
        class="fit"
      >
        <div class="q-pa-md absolute-center vertical-middle column items-center full-width">
          <div class="text-center text-body2">{{ $t("noExistingClient") }}</div>
          <q-btn
            @click="$root.$emit('new-client');"
            no-caps
            color="primary"
            rounded
            :label="$t('createFirstClient')"
            class="q-mt-md"
          />
        </div>
      </div>

      <div
        v-else-if="clients.length && !$route.params.clientId"
        class="fit"
      >
        <div class="q-pa-md absolute-center full-width vertical-middle text-center text-body2 ">
          {{ $t("noSelectedClient") }}
        </div>
      </div>

      <central-message
        v-else-if="$route.params.clientId && !client"
        :message="$t('clientNotFound')"
      />

      <div
        class="tabview-padding"
        v-else-if="client"
      >
        <tab-view
          :key="$route.params.clientId || ''"
          :tabs="tabs"
          :tabCount="5"
        />
      </div>
    </pull-to-refresh>
    <new-client-sheet/>
  </q-page>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import ClientActionMixin from "../mixins/ClientActionMixin";
import NewClientSheet from "../components/NewClientSheet.vue";
import ActionMenu from "../components/ActionMenu.vue";
import { Client, Contact } from "../models";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import PullToRefresh from "components/PullToRefresh.vue";
import TabView from "../components/TabView.vue";

@Component({
  components: {
    NewClientSheet,
    ActionMenu,
    Loading,
    CentralMessage,
    PullToRefresh,
    TabView
  },
})
export default class ClientPage extends Mixins(RecordMixin, ClientActionMixin) {
  get clients() {
    return this.$store.direct.state.clients;
  }
  get tabs() {
    return [{
      label: this.$t("masterDataTitle") as string,
      route: "clientMasterData",
      icon: "fas fa-user-friends",
    },{
      label: this.$tc("task", 2),
      route: "clientReminders",
      icon: "fas fa-tasks",
      color: "intervention",
      badge: this.client?.dueTasksCount || 0,
    },{
      label: this.$t("reportTitle") as string,
      route: "clientReport",
      icon: "fas fa-notes-medical",
      color: "classification",
    },{
      label: this.$t("shiftNotesTitle") as string,
      route: "clientConversation",
      icon: "fas fa-comments",
      color: "primary",
    },{
      label: this.$t("showProofOfPerformance") as string,
      route: "clientProofOfPerformance",
      icon: "fas fa-clipboard",
    },{
      label: this.$t("documentationHistory") as string,
      route: "clientHistory",
      icon: "fas fa-history",
    }];
  }
  get disablePullToRefresh() {
    return this.$route.meta?.disablePullToRefresh == true;
  }

  created() {
    void this.saveClient()
      .then(() => this.$store.direct.dispatch.fetchClientsFromDB());

    this.$root.$on("did-delete-client", this.deselectClient);
    this.$root.$on("did-remove-client-from-team", this.deselectClient);
    this.$root.$on("did-move-client-to-team", this.deselectClient);
  }

  beforeDestroy() {
    this.$root.$off("did-delete-client");
    this.$root.$off("did-remove-client-from-team");
    this.$root.$off("did-move-client-to-team");
  }

  deselectClient() {
    void this.$router.push({ name: "clientNoneSelected" });
  }

  addClient(contact: Contact) {
    const client = new Client();
    client.contact = contact;
    this.$store.direct.dispatch
      .addClient(client)
      .then((client) => {
        void this.$router.push({
          name: "client",
          params: { clientId: client._id?.toString() || "" },
        });
      })
      .catch(console.error);
  }

  mounted() {
    // no client is selected
    if (this.clients.length > 0 && !this.$route.params.clientId) {
      this.$root.$emit("open-drawer");
    }
  }
}
</script>
