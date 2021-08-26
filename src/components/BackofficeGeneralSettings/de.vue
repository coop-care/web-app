<template>
  <div>
    <div class="q-my-xl">
      <div class="text-h6 q-mt-lg">{{ $t("billing") }}</div>
      <selectable-input
        :label="$t('de.rechnungsart')"
        :options="rechnungsartOptions"
        no-new-value
        clearable
        :value="customValue('de.rechnungsart')"
        @input="saveCustomField('de.rechnungsart', $event)"
      />
      <q-input
        :label="$t('de.leistungserbringerIK')"
        :value="customValue('de.leistungserbringerIK')"
        @input="saveCustomField('de.leistungserbringerIK', $event, false)"
        inputmode="numeric"
        mask="#########"
        hide-bottom-space
        :rules="[value => !value || /^\d{9}$/.test(value) || $t('de.institutionskennzeichenWarning')]"
      />
      <selectable-input
        :label="$t('de.leistungserbringerRegion')"
        :options="regionOptions"
        no-new-value
        clearable
        :value="customValue('de.leistungserbringerRegion')"
        @input="saveCustomField('de.leistungserbringerRegion', $event)"
      />
      <div class="row items-center q-gutter-x-md">
        <selectable-input
          :label="$t('de.abrechnungscodeSgbXI')"
          :options="abrechnungscodeOptions"
          no-new-value
          clearable
          :value="customValue('de.abrechnungscodeSgbXI')"
          @input="saveCustomField('de.abrechnungscodeSgbXI', $event)"
          class="col"
          style="min-width: 280px"
        />
        <selectable-input
          :label="$t('de.tarifbereichSgbXI')"
          :options="tarifbereichOptions"
          no-new-value
          clearable
          :value="customValue('de.tarifbereichSgbXI')"
          @input="saveCustomField('de.tarifbereichSgbXI', $event)"
          class="col"
          style="min-width: 280px"
        />
      </div>
      <div class="row items-center q-gutter-x-md">
        <selectable-input
          :label="$t('de.abrechnungscodeSgbV')"
          :options="abrechnungscodeOptions"
          no-new-value
          clearable
          :value="customValue('de.abrechnungscodeSgbV')"
          @input="saveCustomField('de.abrechnungscodeSgbV', $event)"
          class="col"
          style="min-width: 280px"
        />
        <selectable-input
          :label="$t('de.tarifbereichSgbV')"
          :options="tarifbereichOptions"
          no-new-value
          clearable
          :value="customValue('de.tarifbereichSgbV')"
          @input="saveCustomField('de.tarifbereichSgbV', $event)"
          class="col"
          style="min-width: 280px"
        />
      </div>
      <div class="row items-center q-gutter-x-md">
        <q-select
          :value="customValue('de.umsatzsteuerbefreit') || ''"
          @input="saveCustomField('de.umsatzsteuerbefreit', $event)"
          :options="umsatzsteuerBefreiungOptions"
          emit-value
          map-options
          class="col"
          style="min-width: 280px"
        />
        <q-input
          v-if="!customValue('de.umsatzsteuerbefreit')"
          :label="$t('de.umsatzsteuerOrdnungsnummer')"
          :value="customValue('de.umsatzsteuerOrdnungsnummer')"
          @input="saveCustomField('de.umsatzsteuerOrdnungsnummer', $event, false)"
          class="col"
          style="min-width: 280px"
        />
      </div>
      <q-input
        :label="$t('invoiceNumberPrefix')"
        :value="customValue('de.invoiceNumberPrefix')"
        @input="saveCustomField('de.invoiceNumberPrefix', $event, false)"
        maxlength="8"
      />
      <div
        v-for="(contact, index) in getContacts('de.ansprechpartner')"
        :key="index"
        class="row items-center q-gutter-sm"
      >
        <q-input
          :label="$t('contactPersonName')"
          :value="contact.name"
          @input="updateContact(contact, {name: $event})"
          class="col"
        />
        <q-input
          :label="$t('phone')"
          :value="contact.phone"
          @input="updateContact(contact, {phone: $event})"
          inputmode="phone"
          class="col"
        />
        <q-btn
          icon="fas fa-user-minus"
          flat
          round
          color="primary"
          :title="$t('deleteContactPerson')"
          @click="deleteContact('de.ansprechpartner', index)"
          class="q-mt-lg"
        />
      </div>
      <q-btn
        :label="$t('addContactPerson')"
        icon="fas fa-user-plus"
        flat
        rounded
        no-caps
        color="primary"
        class="q-mt-md"
        @click="addContact('de.ansprechpartner')"
      />
    </div>
    
    <div v-if="['2', '3'].includes(customValue('de.rechnungsart'))">
      <div class="text-h6 q-mt-lg">{{ $t("de.abrechnungsstelle") }}</div>
      <q-input
        :label="$t('de.abrechnungsstelleIK')"
        :value="customValue('de.abrechnungsstelleIK')"
        @input="saveCustomField('de.abrechnungsstelleIK', $event, false)"
        inputmode="numeric"
        mask="#########"
        hide-bottom-space
        :rules="[value => !value || /^\d{9}$/.test(value) || $t('de.institutionskennzeichenWarning')]"
      />
      <q-input
        :label="$t('de.abrechnungsstelleName')"
        :value="customValue('de.abrechnungsstelleName')"
        @input="saveCustomField('de.abrechnungsstelleName', $event, false)"
      />
      <div
        v-for="(contact, index) in getContacts('de.abrechnungsstelleAnsprechpartner')"
        :key="index"
        class="row items-center q-gutter-sm"
      >
        <q-input
          :label="$t('contactPersonName')"
          :value="contact.name"
          @input="updateContact(contact, {name: $event})"
          class="col"
        />
        <q-input
          :label="$t('phone')"
          :value="contact.phone"
          @input="updateContact(contact, {phone: $event})"
          inputmode="phone"
          class="col"
        />
        <q-btn
          icon="fas fa-user-minus"
          flat
          round
          color="primary"
          :title="$t('deleteContactPerson')"
          @click="deleteContact('de.abrechnungsstelleAnsprechpartner', index)"
          class="q-mt-lg"
        />
      </div>
      <q-btn
        :label="$t('addContactPerson')"
        icon="fas fa-user-plus"
        flat
        rounded
        no-caps
        color="primary"
        class="q-mt-md"
        @click="addContact('de.abrechnungsstelleAnsprechpartner')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import SelectableInput from "src/components/SelectableInput.vue";
import { BackOffice } from "src/models";
import {
  rechnungsartSchluessel,
  abrechnungscodeSchluesselSGBXI,
  tarifbereichSchluesselSGBXI,
  umsatzsteuerBefreiungSchluessel,
  careProviderLocationSchluessel,
} from "paid-care";
import { mapToOptions, mapToOptionsWithoutValue } from "src/helper/billing/de";
import { debounce } from "src/helper/utils";

type ContactPerson = {name: string, phone: string};

@Component({
  components: {
    SelectableInput,
  },
})
export default class BackOfficeSettings extends Vue {
  @Prop({type: Object, required: true}) readonly backoffice!: BackOffice;

  saveBackofficeDelayed = debounce(this.saveBackoffice, 1000);

  get rechnungsartOptions() {
    return mapToOptions(rechnungsartSchluessel);
  }
  get abrechnungscodeOptions() {
    return mapToOptions(abrechnungscodeSchluesselSGBXI);
  }
  get tarifbereichOptions() {
    return mapToOptions(tarifbereichSchluesselSGBXI)
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  get regionOptions() {
    return mapToOptionsWithoutValue(careProviderLocationSchluessel)
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  get umsatzsteuerBefreiungOptions() {
    return mapToOptions(umsatzsteuerBefreiungSchluessel)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getContacts(label: string): ContactPerson[] {
    return this.customValue(label) || [];
  }
  addContact(label: string) {
    this.saveCustomField(
      label, 
      this.getContacts(label).concat({
        name: "",
        phone: ""
      })
    );
  }
  deleteContact(label: string, contactIndex: number) {
    this.saveCustomField(
      label, 
      this.getContacts(label).filter((_, index) => index != contactIndex)
    );
  }
  updateContact(contact: ContactPerson, changes: Partial<ContactPerson>) {
    this.$store.direct.commit.updateObject({
      target: contact,
      changes
    });
    void this.saveBackofficeDelayed();
  }

  customValue(label: string) {
    return this.backoffice.customValue(label);
  }
  saveCustomField(label: string, value: any, immediately = true) {
    void this.$store.direct.commit.updateObject({
      target: this.backoffice,
      changes: {
        customFields: this.backoffice.updatedCustomField(label, value)
      }
    });
    immediately ? void this.saveBackoffice() : void this.saveBackofficeDelayed();
  }
  saveBackoffice() {
    return this.$store.direct.dispatch.saveBackoffice({
      target: this.backoffice,
      changes: {}
    });
  }
}
</script>
