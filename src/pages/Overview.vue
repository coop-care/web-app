<template>
  <q-page>
    <q-drawer v-model="drawerShown" content-class="bg-grey-2">
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label
              class="q-pl-none"
              header
            >{{ $tc("customer", 2) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-for="client in clients"
          :key="client.id"
          v-ripple
          :active="selectedClient == client"
          @click="selectedClient = client"        
        >
          <q-item-section>
            <q-item-label class="q-pl-md">{{ client.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <debug-overview :client="selectedClient" />
    <!-- <h1>ja!</h1> -->
  </q-page>
</template>

<style lang="sass">

</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import DebugOverview from "components/DebugOverview.vue";
import * as Api from "ts-api-client";

console.log("hallooo1");

@Component({
  components: {
    DebugOverview,
  }
})
export default class Overview extends Vue {
  drawerShown = true;
  api = new Api.DefaultApi();
  clients: Api.Client[] = [];
  data(): {
    selectedClient: Api.Client | undefined 
    } {
    return {
      selectedClient: undefined
    }
  }

  mounted() {
    console.log("mounted Overview");
    this.api.appGetClients()
      .then((r) => {
        console.log("clients:", r)
        this.clients = r;
      })
      .catch((e) => {
        console.log("clienterr:", e)
      });
  }
}
</script>
