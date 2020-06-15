<template>
  <q-drawer
    v-model="isVisible"
    content-class="bg-grey-2 dense-avatar"
    show-if-above
  >
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
          @click="selectClient(client, 'clientReminders')"
          class="q-pl-xl"
        >
          <q-item-section>
            <q-item-label class="q-pl-sm">{{ client.name }}</q-item-label>
          </q-item-section>
          <q-item-section
            side
            v-if="client.dueTasksCount"
          >
            <q-item-label class="text-white text-weight-medium bg-grey-6 q-px-sm q-py-xs radius-lg">{{ client.dueTasksCount }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>
      <loading v-if="$store.direct.state.isLoadingClientList && !clients.length" />

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
          @click="selectClient(client, 'clientReport')"
          class="q-pl-xl"
        >
          <q-item-section>
            <q-item-label class="q-pl-sm">{{ client.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-list>
  </q-drawer>
</template>

<style lang="sass">
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Client } from "../models/client";
import Loading from "./Loading.vue";

@Component({ components: { Loading } })
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
      .filter(client => !client.leftAt)
      .sort((a: any, b: any) =>
        a.masterData.name.localeCompare(b.masterData.name)
      );
  }
  get archivedClients() {
    return this.clients
      .filter(client => !!client.leftAt)
      .sort((a: any, b: any) =>
        a.masterData.name.localeCompare(b.masterData.name)
      );
  }

  created() {
    this.$root.$on("toggleClientDrawer", () => {
      this.isVisible = !this.isVisible;
    });
  }

  beforeDestroy() {
    this.$root.$off("toggleClientDrawer");
  }

  isSelected(client: Client) {
    return this.selectedClient == client;
  }

  addClient() {
    this.$router.push({
      name: "client",
      params: { clientId: "new" } as any
    });
    this.closeDrawerIfNeeded();
  }

  selectClient(client: Client, name = "client") {
    this.$router.push({
      name: name,
      params: { clientId: client._id } as any
    });
    this.closeDrawerIfNeeded();
    this.$store.direct.dispatch.fetchClientsFromDB().catch(() => 0);
  }

  closeDrawerIfNeeded() {
    if (this.$q.screen.lt.md) {
      this.isVisible = false;
    }
  }
}
</script>
