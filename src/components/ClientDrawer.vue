<template>
  <q-list>
    <q-expansion-item
      switch-toggle-side
      v-model="activeClientsExpansionState"
      expand-separator
      header-class="text-subtitle1"
    >
      <template v-slot:header>
        <q-item-section>
          <q-item-label class="q-pl-none">{{
            $t("client", 2)
          }}</q-item-label>
          <q-item-label 
            v-if="teamname"
            class="q-pl-none text-caption q-item__label--caption"
          >{{ teamname }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="add"
            round
            outline
            size="10.5px"
            color="primary"
            @click.stop="addClient"
            :title="$t('newClient')"
            class="shadow-1"
          />
        </q-item-section>
      </template>

      <q-item
        clickable
        v-for="(client, index) in activeClients"
        :key="'active' + index"
        v-ripple
        :active="isSelected(client)"
        active-class="text-primary active-hover-background"
        @click="selectClient(client)"
        class="q-pl-xl"
      >
        <q-item-section>
          <q-item-label class="q-pl-sm">{{ client.name }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="client.dueTasksCount">
          <q-item-label
            class="text-white text-weight-medium bg-grey-6 q-px-sm q-py-xs radius-lg"
            >{{ client.dueTasksCount }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <loading
      v-if="$store.direct.state.isLoadingClientList && !clients.length"
      class="q-mt-xl"
    />

    <q-expansion-item
      v-if="archivedClients.length"
      v-model="archivedClientsExpansionState"
      switch-toggle-side
      :label="$t('clientArchive')"
      :caption="teamname"
      header-class="text-subtitle1"
    >
      <q-item
        clickable
        v-for="(client, index) in archivedClients"
        :key="'archived' + index"
        v-ripple
        :active="isSelected(client)"
        active-class="text-primary active-hover-background"
        @click="selectClient(client)"
        class="q-pl-xl"
      >
        <q-item-section>
          <q-item-label class="q-pl-sm">{{ client.name }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <navigation-section :items="additionalItems" class="q-mt-lg" />
  </q-list>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import { Client } from "../models/client";
import Loading from "components/Loading.vue";
import NavigationSection from "./NavigationSection.vue";

@Component({
  components: {
    Loading,
    NavigationSection
  }
})
export default class ClientDrawer extends Vue {
  activeClientsExpansionState = true;
  archivedClientsExpansionState = false;

  get selectedClient() {
    const client = this.$store.direct.getters.getClient(this.$route.params);
    
    if (client && !!this.archivedClients.find(({ id }) => id == client.id)) {
      this.archivedClientsExpansionState = true;
    }

    return client;
  }
  get clients() {
    return this.$store.direct.state.clients;
  }
  get activeClients() {
    return this.clients
      .filter((client) => !client.leftAt)
      .sort(Client.sortByLastName);
  }
  get archivedClients() {
    return this.clients
      .filter((client) => !!client.leftAt)
      .sort(Client.sortByLastName);
  }
  get teamname() {
    const team = this.$store.direct.getters.currentTeam;
    return team
      ? this.$t("team") + " " + team.name
      : "";
  }
  get additionalItems() {
    return [{
      label: this.$t("insights"),
      icon: "fas fa-chart-line",
      route: "insights"
    }]
  }

  isSelected(client: Client) {
    return this.selectedClient == client;
  }
  addClient() {
    this.$bus.emit("new-client");
    this.$bus.emit("close-drawer");
  }
  selectClient(client: Client) {
    void this.$router.push({
      name: "client",
      params: { clientId: client._id?.toHexString() || "" },
    });
    this.$bus.emit("close-drawer");
    void this.$store.direct.dispatch.fetchClientsFromDB();
  }

  created() {
    this.$bus.on("did-archive-client", () => 
      this.archivedClientsExpansionState = true
    );
    this.$bus.on("did-unarchive-client", () => 
      this.activeClientsExpansionState = true
    );
  }
  unmounted() {
    this.$bus.off("did-archive-client");
    this.$bus.off("did-unarchive-client");
  }
}
</script>
