<template>
  <div>
    <div class="q-my-xl">
      <div class="text-h6 q-mt-lg">{{ $t("billing") }}</div>
      <selectable-input
        :label="$t('de.rechnungsart')"
        :options="rechnungsartOptions"
        no-new-value
        clearable
        :model-value="customValue('de.rechnungsart')"
        @update:model-value="saveCustomField('de.rechnungsart', $event)"
      />
      <q-input
        :label="$t('de.leistungserbringerIK')"
        :model-value="customValue('de.leistungserbringerIK')"
        @update:model-value="saveCustomField('de.leistungserbringerIK', $event, false)"
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
        :model-value="customValue('de.leistungserbringerRegion')"
        @update:model-value="saveCustomField('de.leistungserbringerRegion', $event)"
      />
      <div class="row items-center q-gutter-x-md">
        <selectable-input
          :label="$t('de.abrechnungscodeSgbXI')"
          :options="abrechnungscodeOptions"
          no-new-value
          clearable
          :model-value="customValue('de.abrechnungscodeSgbXI')"
          @update:model-value="saveCustomField('de.abrechnungscodeSgbXI', $event)"
          class="col"
          style="min-width: 280px"
        />
        <selectable-input
          :label="$t('de.tarifbereichSgbXI')"
          :options="tarifbereichOptions"
          no-new-value
          clearable
          :model-value="customValue('de.tarifbereichSgbXI')"
          @update:model-value="saveCustomField('de.tarifbereichSgbXI', $event)"
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
          :model-value="customValue('de.abrechnungscodeSgbV')"
          @update:model-value="saveCustomField('de.abrechnungscodeSgbV', $event)"
          class="col"
          style="min-width: 280px"
        />
        <selectable-input
          :label="$t('de.tarifbereichSgbV')"
          :options="tarifbereichOptions"
          no-new-value
          clearable
          :model-value="customValue('de.tarifbereichSgbV')"
          @update:model-value="saveCustomField('de.tarifbereichSgbV', $event)"
          class="col"
          style="min-width: 280px"
        />
      </div>
      <div class="row items-center q-gutter-x-md">
        <q-select
          :model-value="customValue('de.umsatzsteuerbefreit') || ''"
          @update:model-value="saveCustomField('de.umsatzsteuerbefreit', $event)"
          :options="umsatzsteuerBefreiungOptions"
          emit-value
          map-options
          class="col"
          style="min-width: 280px"
        />
        <q-input
          :label="customValue('de.umsatzsteuerbefreit') ? $t('de.steuernummer') : $t('de.ustIdentifikationsnummer')"
          :placeholder="customValue('de.umsatzsteuerbefreit') ? $t('de.steuernummerPlaceholder') : $t('de.ustIdentifikationsnummerPlaceholder')"
          :model-value="customValue('de.umsatzsteuerOrdnungsnummer')"
          @update:model-value="saveCustomField('de.umsatzsteuerOrdnungsnummer', $event, false)"
          class="col"
          style="min-width: 280px"
        />
      </div>
      <q-input
        :label="$t('invoiceNumberPrefix')"
        :model-value="customValue('de.invoiceNumberPrefix')"
        @update:model-value="saveCustomField('de.invoiceNumberPrefix', $event, false)"
        maxlength="8"
      />
      <div
        v-for="(contact, index) in getContacts('de.ansprechpartner')"
        :key="index"
        class="row items-center q-gutter-sm"
      >
        <q-input
          :label="$t('contactPersonName')"
          :model-value="contact.name"
          @update:model-value="updateContact(contact, {name: $event})"
          class="col"
        />
        <q-input
          :label="$t('phone')"
          :model-value="contact.phone"
          @update:model-value="updateContact(contact, {phone: $event})"
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
        :model-value="customValue('de.abrechnungsstelleIK')"
        @update:model-value="saveCustomField('de.abrechnungsstelleIK', $event, false)"
        inputmode="numeric"
        mask="#########"
        hide-bottom-space
        :rules="[value => !value || /^\d{9}$/.test(value) || $t('de.institutionskennzeichenWarning')]"
      />
      <q-input
        :label="$t('de.abrechnungsstelleName')"
        :model-value="customValue('de.abrechnungsstelleName')"
        @update:model-value="saveCustomField('de.abrechnungsstelleName', $event, false)"
      />
      <div
        v-for="(contact, index) in getContacts('de.abrechnungsstelleAnsprechpartner')"
        :key="index"
        class="row items-center q-gutter-sm"
      >
        <q-input
          :label="$t('contactPersonName')"
          :model-value="contact.name"
          @update:model-value="updateContact(contact, {name: $event})"
          class="col"
        />
        <q-input
          :label="$t('phone')"
          :model-value="contact.phone"
          @update:model-value="updateContact(contact, {phone: $event})"
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
import { Component, Vue } from "vue-facing-decorator";
import SelectableInput from "src/components/SelectableInput.vue";
// import {
//   rechnungsartSchluessel,
//   abrechnungscodeSchluesselSGBXI,
//   tarifbereichSchluesselSGBXI,
//   umsatzsteuerBefreiungSchluessel,
//   careProviderLocationSchluessel,
// } from "paid-care";
import { mapToOptions, mapToOptionsWithoutValue } from "src/helper/billing/de";
import BackofficeMixin, { BackofficeMixinInterface } from "src/mixins/BackofficeMixin";
const rechnungsartSchluessel =  {
    "1": "Abrechnung von Leistungserbringer und Zahlung an IK Leistungserbringer",
    "2": "Abrechnung über Abrechnungsstelle (ohne Inkassovollmacht) und Zahlung an IK Leistungserbringer",
    "3": "Abrechnung über Abrechnungsstelle (mit Inkassovollmacht) und Zahlung an IK Abrechnungsstelle",
}
const abrechnungscodeSchluesselSGBXI = {
    "35": "ambulante Pflege: frei gemeinnütziger Anbieter (Sozialstation)",
    "36": "ambulante Pflege: privat gewerblicher Anbieter",
}
const tarifbereichSchluesselSGBXI = {
    "01": "Baden-Württemberg",
    "05": "Hamburg",
}
const umsatzsteuerBefreiungSchluessel = {
    "": "keine Umsatzsteuerbefreiung",
    "01": "Umsatzsteuerbefreiung nach § 4 Nr. 16",
}
const careProviderLocationSchluessel = {
    "HH": "Hamburg",
    "BW": "Baden-Württemberg",
}

type ContactPerson = {name: string, phone: string};

interface BackOfficeSettings extends BackofficeMixinInterface {};

@Component({
  components: {
    SelectableInput,
  },
  mixins: [BackofficeMixin]
})
class BackOfficeSettings extends Vue {
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
  get saveCustomField() {
    return this.saveBackofficeCustomField;
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

  customValue<T>(label: string) {
    return this.backoffice?.customValue<T>(label);
  }
}

export default BackOfficeSettings;
</script>
