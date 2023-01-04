<template>
  <div>
    <div class="text-h5 text-center q-mb-lg">{{ $t("generalSettings") }}</div>
    <div>
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
        :value="backofficeCountryCode"
        :label="$t('country')"
        :options="countryOptions"
        clearable
        @input="saveBackoffice({countryCode: $event})"
      />
    </div>
    <backoffice-country-specific-settings
      :backoffice="backoffice"
    />
    <div class="q-mt-xl">
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
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { QInput } from "quasar";
import BackofficeMixin from "src/mixins/BackofficeMixin";
import SelectableInput from "src/components/SelectableInput.vue";
import BackofficeCountrySpecificSettings from "src/components/BackofficeGeneralSettings/index.vue";

@Component({
  components: {
    SelectableInput,
    BackofficeCountrySpecificSettings,
  },
})
export default class BackofficeGeneralSettings extends BackofficeMixin {
  @Ref() readonly backofficeNameInput!: QInput;

  localeChangedKey = Math.random();
  backofficeNameErrorMessage = "";

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
  get backofficeCountryCode() {
    return this.backoffice?.countryCode || "";
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
