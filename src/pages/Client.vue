<template>
  <q-page>
    <client-drawer ref="clientDrawer" />

    <loading v-if="$store.direct.state.isLoadingClientList && !clients.length" />

    <div
      v-else-if="!$store.direct.state.isLoadingClientList && !clients.length && !$route.params.clientId"
      class="fit"
    >
      <div class="q-pa-md absolute-center vertical-middle column items-center full-width">
        <div class="text-center text-body2">{{ $t("noExistingClient") }}</div>
        <q-btn
          @click="$router.push({name: 'client', params: {clientId: 'new'}})"
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
      <div class="q-pa-md absolute-center full-width vertical-middle text-center text-body2 ">{{ $t("noSelectedClient") }}</div>
    </div>

    <div
      v-else-if="$route.params.clientId == 'new'"
      class="fit"
    >
      <new-client
        class="q-py-xl q-px-lg"
        @save="addClient"
        @cancel="$router.push({name: 'client'})"
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
        <content-editable
          ref="clientName"
          class="col q-mt-sm q-mb-xl q-py-sm text-h2"
          v-text="selectedClient.name"
          :contenteditable="!isDisabled"
          @change="changeClientName($route.params.clientId, $event.value)"
        />
        <div>
          <action-menu
            :items="clientActionItems"
            class="on-right q-mt-sm"
          />
        </div>
      </div>
      <q-tabs
        v-model="selectedTab"
        dense
        no-caps
        class="text-primary q-mb-md"
        :inline-label="$q.screen.gt.xs"
        align="left"
      >
        <q-route-tab
          name="reminders"
          :label="$tc('task', 2)"
          icon="fas fa-tasks"
          v-if="!isDisabled"
          :to="{ name: 'clientReminders', params: $route.params }"
        >
          <q-badge
            color="red"
            floating
            :label="Math.ceil(Math.random() * 3)"
            v-if="Math.round(Math.random())"
          />
        </q-route-tab>
        <q-route-tab
          name="report"
          :label="$t('reportTitle')"
          icon="fas fa-notes-medical"
          :to="{ name: 'clientReport', params: $route.params }"
        />
        <q-route-tab
          name="history"
          :label="$t('documentationHistory')"
          icon="fas fa-history"
          :to="{ name: 'clientHistory', params: $route.params }"
        />
        <q-route-tab
          name="masterData"
          :label="$t('masterDataTitle')"
          icon="fas fa-address-book"
          :to="{ name: 'clientMasterData', params: $route.params }"
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
          name="history"
          class="q-px-none"
        >
          <client-history />
        </q-tab-panel>
        <q-tab-panel
          name="masterData"
          class="q-px-none"
        >
          <client-master-data />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style lang="sass">
.client-overview
  @media (max-width: $breakpoint-xs-max)
    padding: 15px
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ClientDrawer from "../components/ClientDrawer.vue";
import ContentEditable from "../components/ContentEditable.vue";
import NewClient from "../components/NewClient.vue";
import ActionMenu from "../components/ActionMenu.vue";
import ClientProblems from "../components/ClientProblems.vue";
import ClientReminders from "../components/ClientReminders.vue";
import ClientHistory from "../components/ClientHistory.vue";
import ClientMasterData from "../components/ClientMasterData.vue";
import { Client } from "../models/client";
import { ObjectID } from "bson";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";

const nameof = (name: keyof Client) => name;

@Component({
  components: {
    ContentEditable,
    NewClient,
    ActionMenu,
    ClientDrawer,
    ClientProblems,
    ClientReminders,
    ClientHistory,
    ClientMasterData,
    Loading,
    CentralMessage
  }
})
export default class PageIndex extends Vue {
  selectedTab = null;

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
        name: this.$t("clientDischarge"),
        icon: "fas fa-archive",
        action: this.archiveClient,
        condition: !client.leftAt
      },
      {
        name: this.$t("clientReadmission"),
        icon: "fas fa-folder-open",
        action: this.unarchiveClient,
        condition: !!client.leftAt
      },
      {
        name: this.$t("deleteClient"),
        icon: "delete_forever",
        action: this.deleteClient,
        condition:
          !!client.leftAt ||
          (!client.problems.length && !client.masterDataHistory.length),
        isDestructive: true
      }
    ];
  }
  get selectedClient() {
    return this.$store.direct.getters.getClient(this.$root.$route.params);
  }
  get isDisabled() {
    return !!this.selectedClient?.leftAt;
  }

  created() {
    this.$store.direct.dispatch
      .saveClient({ client: this.selectedClient, resolveOnError: true })
      .then(() => this.$store.direct.dispatch.fetchClientsFromDB());
  }

  addClient(name: string) {
    const client = new Client(this.$stitchApi.userId(), name);
    this.$stitchApi
      .createClient(client)
      .then(res => {
        this.$store.direct.dispatch.fetchClientsFromDB().then(() => {
          this.$router.push({
            name: "clientReport",
            params: { clientId: res.insertedId }
          });
        });
      })
      .catch(console.error);
  }

  changeClientName(clientId: ObjectID | undefined, name: string) {
    this.updateClient(client => {
      const changes: any = {};
      changes[nameof("name")] = name;
      this.$store.direct.commit.updateObject({
        target: client,
        changes: changes
      });
    });
  }

  archiveClient() {
    this.updateClient(client =>
      this.$store.direct.commit.archiveClient(client)
    );
    (this.$refs
      .clientDrawer as ClientDrawer).archivedClientsExpansionState = true;
  }

  unarchiveClient() {
    this.updateClient(client =>
      this.$store.direct.commit.unarchiveClient(client)
    );
    (this.$refs
      .clientDrawer as ClientDrawer).activeClientsExpansionState = true;
  }

  updateClient(mutate: (client: Client) => void) {
    setTimeout(() => {
      const client = this.selectedClient;
      if (!client) {
        return;
      }

      mutate(client);
      this.$store.direct.dispatch.saveClient({
        client: this.selectedClient
      });
    }, 0);
  }

  deleteClient() {
    if (this.selectedClient) {
      this.$store.direct.dispatch.deleteClient(this.selectedClient);
      this.$router.push({ name: "client" });
    }
  }
}
</script>
