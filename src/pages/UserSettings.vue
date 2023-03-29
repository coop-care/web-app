<template>
  <q-page
    class="limit-page-width width-sm page-padding"
  >
    <pull-to-refresh>
      <user-settings-view/>
    </pull-to-refresh>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import PullToRefresh from "components/PullToRefresh.vue";
import UserSettingsView from "components/UserSettingsView.vue";

@Component({
  components: {
    PullToRefresh,
    UserSettingsView,
  }
})
export default class UserSettingsPage extends Vue {}
</script>
