<template>
  <q-drawer
    v-model="isVisible"
    content-class="bg-grey-2 dense-avatar"
    show-if-above
  >
    <pull-to-refresh>
      <q-list>
        <q-expansion-item
          switch-toggle-side
          v-model="activeClientsExpansionState"
          expand-separator
          header-class="q-pt-md text-subtitle1"
        >
          <template v-slot:header>
            <q-item-section>
              <q-item-label class="q-pl-none">{{
                $tc("client", 2)
              }}</q-item-label>
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
            active-class="text-primary"
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
        />

        <q-expansion-item
          v-if="archivedClients.length"
          v-model="archivedClientsExpansionState"
          switch-toggle-side
          :label="$t('clientArchive')"
          header-class="text-subtitle1"
        >
          <q-item
            clickable
            v-for="(client, index) in archivedClients"
            :key="'archived' + index"
            v-ripple
            :active="isSelected(client)"
            active-class="text-primary"
            @click="selectClient(client)"
            class="q-pl-xl"
          >
            <q-item-section>
              <q-item-label class="q-pl-sm">{{ client.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </pull-to-refresh>
  </q-drawer>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Client } from "../models/client";
import Loading from "./Loading.vue";
import PullToRefresh from "components/PullToRefresh.vue";

@Component({
  components: {
    Loading,
    PullToRefresh
  }
})
export default class ClientDrawer extends Vue {
  isVisible = this.$q.screen.gt.sm;
  activeClientsExpansionState = true;
  archivedClientsExpansionState = false;

  get selectedClient() {
    return this.$store.direct.getters.getClient(this.$route.params);
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

  created() {
    this.$root.$on("toggle-client-drawer", () => {
      this.isVisible = !this.isVisible;
    });
  }

  beforeDestroy() {
    this.$root.$off("toggle-client-drawer");
  }

  isSelected(client: Client) {
    return this.selectedClient == client;
  }

  addClient() {
    void this.$router.push({
      name: "client",
      params: { clientId: "new" } as any,
    });
    this.closeDrawerIfNeeded();
  }

  selectClient(client: Client) {
    void this.$router.push({
      name: "clientMasterData",
      params: { clientId: client._id?.toHexString() || "" },
    });
    this.closeDrawerIfNeeded();
    void this.$store.direct.dispatch.fetchClientsFromDB();
  }

  closeDrawerIfNeeded() {
    if (this.$q.screen.lt.md) {
      this.isVisible = false;
    }
  }
}
</script>
