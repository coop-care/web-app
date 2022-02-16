<template>
  <q-page class="limit-page-width">
    <client-drawer ref="clientDrawer" />

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
            @click="$router.push({ name: 'client', params: { clientId: 'new' } })"
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

      <div
        v-else-if="$route.params.clientId == 'new'"
        class="fit"
      >
        <new-client
          class="q-py-xl q-px-lg"
          @save="addClient"
          @cancel="$router.push({ name: 'clientNoneSelected' })"
        />
      </div>

      <central-message
        v-else-if="$route.params.clientId && !client"
        :message="$t('clientNotFound')"
      />

      <div
        class="page-padding client-overview"
        v-else-if="client"
      >
        <client-tab-view :key="$route.params.clientId || ''" />
      </div>
    </pull-to-refresh>
  </q-page>
</template>

<style lang="sass">
.client-overview
  @media print
    padding: .75cm 0 0
</style>

<script lang="ts">
import { Component, Ref, Mixins } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import ClientActionMixin from "../mixins/ClientActionMixin";
import ClientDrawer from "../components/ClientDrawer.vue";
import NewClient from "../components/NewClient.vue";
import ActionMenu from "../components/ActionMenu.vue";
import { Client, Contact } from "../models";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import PullToRefresh from "components/PullToRefresh.vue";
import ClientTabView from "../components/ClientTabView.vue";

@Component({
  components: {
    NewClient,
    ActionMenu,
    ClientDrawer,
    Loading,
    CentralMessage,
    PullToRefresh,
    ClientTabView
  },
})
export default class ClientPage extends Mixins(RecordMixin, ClientActionMixin) {
  @Ref() readonly  clientDrawer!: ClientDrawer;

  get clients() {
    return this.$store.direct.state.clients;
  }
  get disablePullToRefresh() {
    return this.$route.meta?.disablePullToRefresh == true;
  }

  created() {
    void this.saveClient()
      .then(() => this.$store.direct.dispatch.fetchClientsFromDB());

    this.$root.$on("did-archive-client", () => 
      this.clientDrawer.archivedClientsExpansionState = true
    );
    this.$root.$on("did-unarchive-client", () => 
      this.clientDrawer.activeClientsExpansionState = true
    );
    this.$root.$on("did-delete-client", this.deselectClient);
    this.$root.$on("did-remove-client-from-team", this.deselectClient);
    this.$root.$on("did-move-client-to-team", this.deselectClient);
  }

  beforeDestroy() {
    this.$root.$off("did-archive-client");
    this.$root.$off("did-unarchive-client");
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
    // no client is selected and the client drawer is not visible
    if (!this.clientDrawer?.isVisible && this.clients.length > 0 && !this.$route.params.clientId) {
      this.$root.$emit("toggle-client-drawer");
    }
  }
}
</script>
