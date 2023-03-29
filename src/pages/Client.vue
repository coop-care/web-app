<template>
  <q-page class="limit-page-width">
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
          @click="$bus.emit('new-client');"
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
        pullToRefresh
        @refresh="updateClientsInAdditionalTeams"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import RecordMixin, { RecordMixinInterface } from "../mixins/RecordMixin";
import ClientActionMixin, { ClientActionMixinInterface } from "../mixins/ClientActionMixin";
import ActionMenu from "../components/ActionMenu.vue";
import { Client, Contact } from "../models";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import TabView from "../components/TabView.vue";

interface ClientPage extends RecordMixinInterface, ClientActionMixinInterface {};

@Component({
  components: {
    ActionMenu,
    Loading,
    CentralMessage,
    TabView
  },
  mixins: [RecordMixin, ClientActionMixin],
})
class ClientPage extends Vue {
  get clients() {
    return this.$store.direct.state.clients;
  }
  get tabs() {
    return [{
      label: this.$t("masterDataTitle") as string,
      route: "clientMasterData",
      icon: "fas fa-user-friends",
    },{
      label: this.$t("task", 2),
      route: "clientReminders",
      icon: "fas fa-tasks",
      color: "intervention",
      badge: !this.isDisabled
        ? this.client?.dueTasksCount ?? 0
        : 0,
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

    this.$bus.on("did-delete-client", this.deselectClient);
    this.$bus.on("did-remove-client-from-team", this.deselectClient);
    this.$bus.on("did-move-client-to-team", this.deselectClient);
  }

  unmounted() {
    this.$bus.off("did-delete-client");
    this.$bus.off("did-remove-client-from-team");
    this.$bus.off("did-move-client-to-team");
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
      this.$bus.emit("open-drawer");
    }
  }
}

export default ClientPage;
</script>
