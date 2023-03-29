<template>
  <editing-sheet
    ref="editingSheet"
    :title="$t('userSettings')"
    is-data-available
    :is-initially-visible="false"
    persistent
  >
    <user-settings-view show-only-essentials />
    <div class="q-mt-lg row justify-center">
      <q-btn
        color="primary"
        rounded
        unelevated
        no-caps
        :outline="!canClose"
        :disabled="!canClose"
        :label="$t('apply')"
        class="done-button"
        @click="editingSheet.visible = false"
      />
    </div>
  </editing-sheet>
</template>

<script lang="ts">
import { Component, Vue, Ref, Watch } from "vue-facing-decorator";
import EditingSheet from "../components/EditingSheet.vue";
import UserSettingsView from "../components/UserSettingsView.vue";

@Component({
  components: {
    EditingSheet,
    UserSettingsView
  }
})
export default class UserSettingsSheet extends Vue {
  @Ref() readonly editingSheet!: EditingSheet;

  @Watch("showYourself")
  showYourselfChanged(value: boolean) {
    if (value) {
      this.editingSheet.visible = true;
    }
  }

  get canClose() {
    return (this.$store.state.currentUser?.signature.trim().length ?? 0) > 1
  }
  get showYourself() {
    return this.$ccApi.isLoggedIn && this.$store.state.currentUser?.signature == "" && !this.$route.meta.noAuth;
  }

  mounted() {
    this.showYourselfChanged(this.showYourself);
  }
}
</script>
