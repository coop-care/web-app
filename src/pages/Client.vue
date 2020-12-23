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
        v-else-if="$route.params.clientId && !selectedClient"
        :message="$t('clientNotFound')"
      />

      <div
        class="client-overview q-pt-lg q-px-xl q-pb-xl"
        v-else-if="selectedClient"
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
        <q-tabs
          v-model="selectedTab"
          no-caps
          class="bg-grey-1 q-mb-md text-primary"
          :inline-label="$q.screen.gt.xs"
          :dense="!$q.screen.gt.xs"
          align="left"
        >
          <q-route-tab
            name="reminders"
            :label="$tc('task', 2)"
            icon="fas fa-tasks"
            :to="{ name: 'clientReminders', params: $route.params }"
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
            name="report"
            :label="$t('reportTitle')"
            icon="fas fa-notes-medical"
            :to="{ name: 'clientReport', params: $route.params }"
            class="text-classification"
          />
          <q-route-tab
            v-if="false"
            name="contacts"
            :label="$t('contacts')"
            icon="fas fa-address-book"
            :to="{ name: 'clientContacts', params: $route.params }"
            class="text-primary"
          />
          <q-route-tab
            v-if="false"
            name="masterData"
            :label="$t('masterDataTitle')"
            icon="fas fa-id-card"
            :to="{ name: 'clientMasterData', params: $route.params }"
            class="text-primary"
          />
        </q-tabs>
        <q-tab-panels
          animated
          v-model="selectedTab"
        >
          <q-tab-panel
            name="reminders"
            class="q-px-none"
          >
            <client-reminders />
          </q-tab-panel>
          <q-tab-panel
            name="report"
            class="q-px-none"
          >
            <client-problems />
          </q-tab-panel>
          <q-tab-panel
            name="contacts"
            class="q-px-none"
          >
            <client-master-data />
          </q-tab-panel>
          <q-tab-panel
            name="masterData"
            class="q-px-none"
          >
            <client-master-data />
          </q-tab-panel>
        </q-tab-panels>
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
import { Component, Ref } from "vue-property-decorator";
import ClientDrawer from "../components/ClientDrawer.vue";
import ContentEditable from "../components/ContentEditable.vue";
import NewClient from "../components/NewClient.vue";
import ActionMenu from "../components/ActionMenu.vue";
import ClientProblems from "../components/ClientProblems.vue";
import ClientReminders from "../components/ClientReminders.vue";
import ClientContacts from "../components/ClientContacts.vue";
import ClientMasterData from "../components/ClientMasterData.vue";
import { Client, MasterData } from "../models";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";
import PullToRefresh from "components/PullToRefresh.vue";
import ClientActionMixin from "../mixins/ClientActionMixin";

@Component({
  components: {
    ContentEditable,
    NewClient,
    ActionMenu,
    ClientDrawer,
    ClientProblems,
    ClientReminders,
    ClientContacts,
    ClientMasterData,
    Loading,
    CentralMessage,
    PullToRefresh,
  },
})
export default class ClientPage extends ClientActionMixin {
  @Ref() readonly  clientDrawer!: ClientDrawer;

  selectedTab = null;

  get firstName() {
    return this.selectedClient?.masterData.firstName || "";
  }
  set firstName(value) {
    this.updateMasterData({ firstName: value });
  }
  get lastName() {
    return this.selectedClient?.masterData.lastName || "";
  }
  set lastName(value) {
    this.updateMasterData({ lastName: value });
  }
  get clients() {
    return this.$store.direct.state.clients;
  }
  get clientActionItems() {
    const client = this.selectedClient;
    if (!client) {
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
      ...this.clientActions(client)
    ];
  }
  get dueTaskCount() {
    return this.selectedClient?.dueTasksCount || 0;
  }
  get selectedClient() {
    return this.$store.direct.getters.getClient(this.$root.$route.params);
  }
  get isDisabled() {
    return !!this.selectedClient?.leftAt;
  }

  created() {
    if (this.team) {
      this.updateClientsInAdditionalTeams();
    }

    void this.$store.direct.dispatch
      .saveClient({ client: this.selectedClient, resolveOnError: true })
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

  addClient(masterData: MasterData) {
    const client = new Client();
    client.masterData = masterData;
    this.$store.direct.dispatch
      .addClient(client)
      .then((client) => {
        void this.$router.push({
          name: "clientReport",
          params: { clientId: client._id?.toString() || "" },
        });
      })
      .catch(console.error);
  }

  updateMasterData(changes: Partial<MasterData>) {
      if (!this.selectedClient) {
        return;
      }

      this.$store.direct.commit.updateObject({
        target: this.selectedClient.masterData,
        changes: changes,
      });
      void this.$store.direct.dispatch.saveClient({
        client: this.selectedClient,
      });
  }

  pushRoute(name: string) {
    void this.$router.push({
      name: name,
      params: this.$route.params,
    });
  }
}
</script>
