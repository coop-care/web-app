<template>
  <q-page
    padding
    class="limit-page-width"
  >
    <pull-to-refresh>
      <loading v-if="$store.direct.state.isLoadingClientList && !client" />

      <central-message
        v-else-if="!$store.direct.state.isLoadingClientList && !client"
        :message="$t('clientNotFound')"
      />

      <q-timeline
        v-else-if="changeRecords.length"
        color="primary"
        :layout="$q.screen.gt.xs ? 'comfortable' : 'dense'"
      >
        <client-history-entry
          v-for="(changeRecord, index) in changeRecords"
          v-bind:key="index"
          :change-record="changeRecord"
        />
      </q-timeline>

      <div
        v-else
        class="text-body2 text-italic q-mt-lg q-px-lg"
      >{{$t("noClientHistoryEntries")}}</div>
    </pull-to-refresh>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import ClientHistoryEntry from "../components/ClientHistoryEntry.vue";
import PullToRefresh from "components/PullToRefresh.vue";
import Loading from "components/Loading.vue";
import CentralMessage from "components/CentralMessage.vue";

@Component({
  components: {
    ClientHistoryEntry,
    PullToRefresh,
    Loading,
    CentralMessage
  },
})
export default class ClientHistory extends Vue {
  get changeRecords() {
    return this.client?.changeHistory.slice().reverse() || [];
  }
  get client() {
    return this.$store.direct.getters.getClient(this.$route.params);
  }
}
</script>
