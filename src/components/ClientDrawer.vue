<template>
  <q-drawer
    v-model="isVisible"
    content-class="bg-grey-2 client-drawer"
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
          @click="selectClient(client)"
          class="q-pl-xl"
        >
          <q-item-section>
            <q-item-label class="q-pl-sm">{{ client.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>

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
  </q-drawer>
</template>

<style lang="sass">
.client-drawer .q-item__section--avatar
  min-width: inherit
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ObjectID } from "bson";
import { Client } from "../models/client";

@Component
export default class ClientDrawer extends Vue {
  isVisible = this.$q.screen.gt.sm;
  activeClientsExpansionState = true;
  archivedClientsExpansionState = false;

  get selectedClient() {
    return this.$store.direct.getters.getSelectedClient();
  }
  get clients() {
    return this.$store.direct.state.clients;
  }
  get activeClients() {
    return this.clients
      .filter(client => !client.leftAt)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
  get archivedClients() {
    return this.clients
      .filter(client => !!client.leftAt)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
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
    this.$emit("willAddClient");
    this.closeDrawerIfNeeded();
  }

  selectClient(client: Client) {
    this.selectClientById(client._id);
    this.closeDrawerIfNeeded();
  }

  selectClientById(id: ObjectID | undefined) {
    if (!id) {
      return;
    }

    this.$emit("didSelectClient");
    if (this.selectedClient) {
      this.$store.direct.commit.isLoadingClient(true);
    }
    this.$store.direct.dispatch
      .saveClient({ client: this.selectedClient, resolveOnError: true })
      .then(() => this.loadClientFromDB(id));
  }

  loadClientFromDB(id: ObjectID) {
    this.$store.direct.commit.isLoadingClient(true);
    this.$stitchApi
      .getClientById(id)
      .then(client => {
        this.$store.direct.commit.replaceClientInList(client);
        this.$store.direct.commit.setSelectedClient(client);
        this.$store.direct.commit.isLoadingClient(false);
      })
      .catch(err => {
        console.error(`Failed: ${err}`);
        this.$store.direct.commit.isLoadingClient(false);
      });
  }

  closeDrawerIfNeeded() {
    if (this.$q.screen.lt.md) {
      this.isVisible = false;
    }
  }
}
</script>
