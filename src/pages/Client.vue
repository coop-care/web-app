<template>
  <q-page class="limit-page-width">
    <client-drawer ref="clientDrawer" />

    <pull-to-refresh @refresh="updateClientsInAdditionalTeams">
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
          @cancel="$router.push({ name: 'client' })"
        />
      </div>

      <central-message
        v-else-if="$route.params.clientId && !client"
        :message="$t('clientNotFound')"
      />

      <div
        class="client-overview q-pt-lg q-px-xl"
        v-else-if="client"
      >
        <div class="row">
          <div class="col row q-mt-sm q-mb-xl">
            <content-editable
              class="q-py-sm q-mr-md text-h2"
              v-text="firstName"
              :contenteditable="!isDisabled"
              @change="firstName = $event.value"
            />
            <content-editable
              class="q-py-sm text-h2"
              v-text="lastName"
              :contenteditable="!isDisabled"
              @change="lastName = $event.value"
            />
          </div>
          <div>
            <action-menu
              :items="clientActionItems"
              class="on-right q-mt-sm q-mr-sm"
            />
          </div>
        </div>
        
        <client-tab-view :key="$route.params.clientId || ''" />
      </div>
    </pull-to-refresh>
  </q-page>
</template>

<style lang="sass">
.client-overview
  @media (max-width: $breakpoint-xs-max)
    padding: 8px
</style>

<script lang="ts">
import { Component, Ref, Mixins } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import ClientActionMixin from "../mixins/ClientActionMixin";
import ClientDrawer from "../components/ClientDrawer.vue";
import ContentEditable from "../components/ContentEditable.vue";
import NewClient from "../components/NewClient.vue";
import ActionMenu from "../components/ActionMenu.vue";
import { Client, Contact } from "../models";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import PullToRefresh from "components/PullToRefresh.vue";
import ClientTabView from "../components/ClientTabView.vue";


@Component({
  components: {
    ContentEditable,
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

  get firstName() {
    return this.client?.contact.firstName || "";
  }
  set firstName(value) {
    this.updateContact({ firstName: value });
  }
  get lastName() {
    return this.client?.contact.lastName || "";
  }
  set lastName(value) {
    this.updateContact({ lastName: value });
  }
  get clients() {
    return this.$store.direct.state.clients;
  }
  get clientActionItems() {
    if (!this.client) {
      return [];
    }

    return [
      {
        name: this.$t("showProofOfPerformance") + " …",
        icon: "fas fa-clipboard",
        action: () => this.pushRoute("proofOfPerformance"),
      },
      {
        name: this.$t("documentationHistory") + " …",
        icon: "fas fa-history",
        action: () => this.pushRoute("clientHistory"),
      },
      {
        name: "-",
        action: () => undefined
      },
      ...this.clientActions(this.client)
    ];
  }

  created() {
    if (this.team) {
      this.updateClientsInAdditionalTeams();
    }

    void this.saveClient()
      .then(() => this.$store.direct.dispatch.fetchClientsFromDB());

    this.$on("did-archive-client", () => 
      this.clientDrawer.archivedClientsExpansionState = true
    );
    this.$on("did-unarchive-client", () => 
      this.clientDrawer.activeClientsExpansionState = true
    );
    this.$on("did-delete-client", this.deselectClient);
    this.$on("did-remove-client-from-team", this.deselectClient);
    this.$on("did-move-client-to-team", this.deselectClient);
  }

  beforeDestroy() {
    this.$off("did-archive-client");
    this.$off("did-unarchive-client");
    this.$off("did-delete-client");
    this.$off("did-remove-client-from-team");
    this.$off("did-move-client-to-team");
  }

  deselectClient() {
    void this.$router.push({ name: "client" });
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

  updateContact(changes: Partial<Contact>) {
    this.updateAndSave(this.client?.contact, changes);
  }

  pushRoute(name: string) {
    void this.$router.push({
      name: name,
      params: this.$route.params,
    });
  }
}
</script>
