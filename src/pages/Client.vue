<template>
  <q-page>
    <client-drawer
      ref="clientDrawer"
      @willAddClient="addingClient = true"
      @didSelectClient="addingClient = false"
    />

    <div
      class="client-overview q-pa-xl"
      v-if="loading"
    >
      <p>{{ $t("loading") }}</p>
    </div>
    <div
      class="client-overview q-pt-lg q-px-xl q-pb-xl"
      v-else-if="addingClient"
    >
      <new-client
        @save="addClient"
        @cancel="addingClient = false"
      />
    </div>
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
          @change="changeClientName(selectedClientId, $event.value)"
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
        <q-tab
          name="reminders"
          :label="$tc('task', 2)"
          icon="fas fa-tasks"
          v-if="!isDisabled"
        >
          <q-badge
            color="red"
            floating
            :label="Math.ceil(Math.random() * 3)"
            v-if="Math.round(Math.random())"
          />
        </q-tab>
        <q-tab
          name="problems"
          :label="$tc('problem', 2)"
          icon="fas fa-book-medical"
        />
        <q-tab
          name="history"
          :label="$t('documentationHistory')"
          icon="fas fa-history"
        />
      </q-tabs>
      <q-tab-panels
        v-model="selectedTab"
        animated
      >
        <q-tab-panel name="reminders">
          <client-reminders />
        </q-tab-panel>
        <q-tab-panel name="problems">
          <client-problems />
        </q-tab-panel>
        <q-tab-panel name="history">
          <client-history />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <div
      class="client-overview q-pa-xl"
      v-else-if="!clients.length"
    >
      <p>{{ $t("noExistingClient") }}</p>
      <q-btn
        @click="addingClient = true"
        no-caps
        color="primary"
        rounded
        :label="$t('createFirstClient')"
        class="q-mt-md"
      />
    </div>
    <div
      class="client-overview q-pa-xl"
      v-else
    >
      <p>{{ $t("noSelectedClient") }}</p>
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
import { Client } from "../models/client";
import { ObjectID } from "bson";

const nameof = (name: keyof Client) => name;

@Component({
  components: {
    ContentEditable,
    NewClient,
    ActionMenu,
    ClientDrawer,
    ClientProblems,
    ClientReminders,
    ClientHistory
  }
})
export default class PageIndex extends Vue {
  addingClient = false;
  selectedTab = !this.isDisabled ? "reminders" : "history";

  get loading() {
    return (
      this.$store.direct.state.isLoadingClientList ||
      this.$store.direct.state.isLoadingClient
    );
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
    return this.$store.direct.getters.getSelectedClient();
  }
  get selectedClientId() {
    return this.$store.direct.state.selectedClientId;
  }
  get isDisabled() {
    return !!this.selectedClient?.leftAt;
  }

  created() {
    if (this.selectedClient) {
      this.$store.direct.commit.isLoadingClientList(true);
    }
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
          (this.$refs.clientDrawer as ClientDrawer).selectClientById(
            res.insertedId
          );
        });
      })
      .catch(console.error);
    this.addingClient = false;
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
    }
  }
}
</script>
