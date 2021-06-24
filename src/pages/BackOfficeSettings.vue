<template>
  <q-page
    padding
    class="limit-page-width width-sm"
  >
    <pull-to-refresh>
      <div
        v-if="backofficeOptions.length == 1"
        class="q-mt-lg"
      >
        <div>{{ $t("noExistingBackOffices") }}</div>
        <q-btn 
          v-if="isTeamAdmin"
          :label="$t('addBackoffice')"
          rounded
          no-caps
          color="primary"
          class="q-mt-md"
          @click="backofficeId = 'new'"
        />
      </div>
      <div v-else>
        <q-select
          v-model="backofficeId"
          :options="backofficeOptions"
          :label="$t('settingsForBackOffice')"
          emit-value
          map-options
          class="text-h5 q-mb-lg"
        />

        <div 
          v-if="!backoffice" 
          class="q-mt-md"
        >
          {{ $t("backofficeNotFound") }}
        </div>
        <div v-else class="q-pb-xl">
          <div v-if="isBackofficeAdmin" class="q-pl-md">
            <q-input
              v-model="backofficeName"
              :label="$t('backofficeName')"
              ref="backofficeNameInput"
              hide-bottom-space
              :error-message="backofficeNameErrorMessage"
              :error="!!backofficeNameErrorMessage"
            />
            <selectable-input
              :key="localeChangedKey"
              :value="backoffice.countryCode"
              :label="$t('country')"
              :options="countryOptions"
              clearable
              @input="saveBackoffice({countryCode: $event})"
            />
          </div>
          <back-office-settings
            v-if="isBackofficeAdmin"
            :backoffice="backoffice"
          />
          <div v-if="isBackofficeAdmin" class="q-mt-xl">
            <q-btn
              :label="$t('deleteBackoffice')"
              outline
              rounded
              no-caps
              color="negative"
              @click="deleteBackoffice"
            />
          </div>
       </div>
      </div>
    </pull-to-refresh>
  </q-page>
</template>

<style lang="sass">

</style>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { QInput } from "quasar";
import PullToRefresh from "src/components/PullToRefresh.vue";
import SelectableInput from "src/components/SelectableInput.vue";
import BackOfficeSettings from "src/components/BackOfficeSettings/index.vue";
import { BackOffice, Client } from "src/models";
import { debounce, incrementalName } from "src/helper/utils";
import TeamMixin from "src/mixins/TeamMixin";

@Component({
  components: {
    PullToRefresh,
    SelectableInput,
    BackOfficeSettings,
  }
})
export default class BackOfficeSettingsPage extends TeamMixin {
  @Ref() readonly backofficeNameInput!: QInput;

  localeChangedKey = Math.random();
  saveBackofficeDelayed = debounce(this.saveBackoffice, 1000);
  backofficeNameErrorMessage = "";

  get backofficeId() {
    return this.$route.params.backofficeId 
      || this.$store.direct.getters.currentTeam?.backoffice 
      || this.$store.direct.state.backoffices[0]?.id;
  }
  set backofficeId(value: string) {
    if (value == "new") {
      const userId = this.$store.direct.state.currentUser?.userId;

      if (userId && (this.isTeamAdmin || this.isBackofficeAdmin)) {
        const name = incrementalName(
          this.$t("newBackOffice").toString(),
          this.$store.direct.state.backoffices.map(item => item.name)
        );
        const backoffice = new BackOffice(name, userId);
        void this.$store.direct.dispatch.addBackoffice(backoffice)
          .then(backoffice => this.showBackoffice(backoffice.id));
      }
    } else {
      this.showBackoffice(value);
    }
  }
  get backoffice() {
    return this.$store.direct.state.backoffices.find(item => item.id == this.backofficeId);
  }
  get backofficeOptions() {
    const options = this.$store.direct.state.backoffices.map(item => ({
      label: item.name,
      value: item.id
    })).sort(Client.sortByLabel);

    if (this.isTeamAdmin || this.isBackofficeAdmin) {
      options.push({
        label: this.$t("addBackoffice") as string,
        value: "new"
      });
    }
    
    return options;
  }
  get backofficeName() {
    return this.backoffice?.name || "";
  }
  set backofficeName(value: string) {
    const name = value.trim();
    const errorMessage = this.nameRules
      .map(rule => rule(name))
      .find(value => value !== true)?.toString() || "";
    this.backofficeNameErrorMessage = errorMessage;

    if (!errorMessage) {
      this.updateBackoffice({name});
      void this.saveBackofficeDelayed({});
    }
  }
  get nameRules() {
    return [
      (value: string) => !!value || this.$t("requiredValue").toString(),
      (value: string) => !this.$store.direct.state.backoffices.find(item => 
          item.name == value && item.id != this.backoffice?.id
        ) || this.$t("nameMustBeUnique").toString()
    ];
  }
  get countryOptions() {
    return Object.entries(this.$t("countries") as Record<string, any>)
      .map(([value, label]) => ({label, value}));
  }
  get isBackofficeAdmin() {
    const userId = this.$store.direct.state.currentUser?.userId;
    const admins = this.backoffice?.admins || [];
    return !!userId && admins.includes(userId);
  }

  isValidName(value: string, updateOrSave: (_: Partial<BackOffice>) => void) {
    const name = value.trim();

    if (!this.nameRules.some(rule => rule(name) !== true)) {
      updateOrSave({name})
    }
  }
  showBackoffice(backofficeId: string) {
    void this.$router.replace({
      name: "backOfficeSettings", 
      params: { backofficeId }
    });
  }
  updateBackoffice(changes: Partial<BackOffice>) {
    void this.$store.direct.commit.updateObject({
      target: this.backoffice,
      changes
    });
  }
  saveBackoffice(changes: Partial<BackOffice>) {
    return this.$store.direct.dispatch.saveBackoffice({
      target: this.backoffice,
      changes
    });
  }
  deleteBackoffice() {
    const backoffice = this.backoffice;

    if (backoffice && this.isBackofficeAdmin) {
        this.$q.dialog({
          title: this.$t("confirmDeletionTitle") as string,
          message: this.$t("confirmBackOfficeDeletionMessage", {name: backoffice.name}) as string,
          persistent: true,
          ok: {
            label: this.$t("delete"),
            rounded: true,
            flat: true,
            noCaps: true,
            color: "negative"
          },
          cancel: {
            rounded: true,
            flat: true,
            noCaps: true
          }
        }).onOk(() =>
          void this.$store.direct.dispatch.deleteBackoffice(backoffice)
        );
    }
  }
}
</script>
