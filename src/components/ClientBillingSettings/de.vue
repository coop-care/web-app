<template>
  <div
    :class="[$q.screen.gt.xs ? 'q-px-md' : 'q-px-xs']"
  >
    <q-resize-observer @resize="onResize" />
    <div class="row justify-end">
      <edit-toggle-button
        v-if="!isDisabled"
        v-model="isEditing"
        :class="[$q.screen.gt.xs ? '' : 'q-mr-sm']"
      />
    </div>
    <div class="q-mb-md q-px-lg text-h5 text-center break-word">
      {{ $t("billingData") }}
    </div>

    <div v-if="!isEditing || isDisabled">
      <q-list class="text-size-adjust-md q-mb-md">
        <no-data-item
          v-if="!items.length"
          button-classes="text-weight-regular"
          :hide-button="isDisabled"
          class="justify-center"
          @click="isEditing = true"
        />
        <labeled-item
          v-for="(item, index) in items"
          :key="'item' + index"
          :item="item"
          :compactLayout="compactLayout"
          class="text-primary"
        />
      </q-list>
    </div>
    <div v-else>
      <div class="q-mb-xl">
        <selectable-input
          :label="$t('de.krankenkasse') + ', ' + $tc('numberOfDigits', 9)"
          :value="clientCustomValue('de.krankenkasse')"
          @input="saveClientCustomField('de.krankenkasse', $event, false)"
          :options="healthInsuranceOptions"
          :options-dense="false"
          clearable
          :hint="healthInsuranceDescription"
        />
        <q-input
          :label="$t('de.versichertennummer')"
          :value="clientCustomValue('de.versichertennummer')"
          @input="saveClientCustomField('de.versichertennummer', $event, false)"
        />
        <q-btn-dropdown
          :label="$t('de.addKostentraeger')"
          outline
          rounded
          no-caps
          auto-close
          color="primary"
          class="q-mt-md q-mb-xs"
        >
          <q-list>
            <q-item
              v-for="(label, index) in invisibleKostentraeger"
              :key="index"
              clickable
              @click="addedKostentraeger.push(label)"
            >
              <q-item-section>
                <q-item-label>{{ $t(label) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <selectable-input
          v-if="!invisibleKostentraeger.includes('de.pflegekasse')"
          :label="$t('de.pflegekasse') + ', ' + $tc('numberOfDigits', 9)"
          :value="clientCustomValue('de.pflegekasse')"
          @input="saveClientCustomField('de.pflegekasse', $event, false)"
          :options="careInsuranceOptions"
          :options-dense="false"
          clearable
          :hint="careInsuranceDescription"
        />
        <q-input
          v-if="!invisibleKostentraeger.includes('de.privateVersicherungTarif')"
          :label="$t('de.privateVersicherungTarif')"
          :value="clientCustomValue('de.privateVersicherungTarif')"
          @input="saveClientCustomField('de.privateVersicherungTarif', $event, false)"
        />
        <q-input
          v-if="!invisibleKostentraeger.includes('de.beihilfe')"
          :label="$t('de.beihilfe')"
          :value="clientCustomValue('de.beihilfe')"
          @input="saveClientCustomField('de.beihilfe', $event, false)"
          inputmode="numeric"
        >
          <template v-slot:append>
            <div class="q-mt-sm">%</div>
          </template>
        </q-input>
        <q-input
          v-if="!invisibleKostentraeger.includes('de.sozialamt')"
          :label="$t('de.sozialamt')"
          :value="clientCustomValue('de.sozialamt')"
          @input="saveClientCustomField('de.sozialamt', $event, false)"
        />
        <q-input
          v-if="!invisibleKostentraeger.includes('de.andereKostentraeger')"
          :label="$t('de.andereKostentraeger')"
          :value="clientCustomValue('de.andereKostentraeger')"
          @input="saveClientCustomField('de.andereKostentraeger', $event, false)"
        />
      </div>

      <div class="q-mb-xl">
        <div
          v-for="(item, index) in pflegegradItems"
          :key="index"
          class="row items-center q-gutter-x-md"
        >
          <selectable-input
            :label="$t('de.pflegegrad')"
            :value="item.value"
            @input="savePflegegrad(item, {value: $event})"
            :options="pflegegradOptions"
            no-new-value
            clearable
            class="col"
            style="min-width: 120px"
          />
          <date-time-input
            :label="$t('sinceDateLabel', {dateFormat: $t('dateFormatPlaceholder')})"
            :value="item.since != undefined ? new Date(item.since) : item.since"
            @input="savePflegegrad(item, {since: $event != undefined ? $event.getTime() : $event}, false)"
            :format="$t('dateFormat')"
            clearable
            class="col"
            style="min-width: 120px"
          />
          <q-btn
            icon="fas fa-minus-circle"
            flat
            round
            color="primary"
            :title="$t('de.deletePflegegrad')"
            @click="deletePflegegrad(index)"
          />
        </div>
        <q-btn
          :label="$t('de.addPflegegrad')"
          flat
          rounded
          no-caps
          color="primary"
          class="q-mt-sm"
          @click="addPflegegrad"
        />
      </div>

      <div class="q-mb-xl">
        <q-input
          :label="$t('de.entlastungsleistungBudget')"
          :value="clientCustomValue('de.entlastungsleistungBudget')"
          @input="saveClientCustomField('de.entlastungsleistungBudget', $event, false)"
          :hint="$t('de.entlastungsleistungHint')"
          inputmode="numeric"
          type="number"
        >
          <template v-slot:append>
            <div class="q-mt-sm">€</div>
          </template>
        </q-input>
        <q-toggle
          :label="$t('de.entlastungsleistungAufteilung')"
          :value="clientCustomValue('de.entlastungsleistungAufteilung') || false"
          @input="saveClientCustomField('de.entlastungsleistungAufteilung', $event)"
          class="q-mt-md"
        />
        <div v-if="clientCustomValue('de.entlastungsleistungAufteilung')">
          <q-input
            :label="$t('de.entlastungsleistungLeistungserbringer')"
            :value="clientCustomValue('de.entlastungsleistungLeistungserbringer')"
            @input="saveClientCustomField('de.entlastungsleistungLeistungserbringer', $event, false)"
            autogrow
            :autofocus="!clientCustomValue('de.entlastungsleistungLeistungserbringer')"
          />
          <q-input
            :label="$t('de.entlastungsleistungAvailableBudget')"
            :value="clientCustomValue('de.entlastungsleistungAvailableBudget')"
            @input="saveClientCustomField('de.entlastungsleistungAvailableBudget', $event, false)"
            inputmode="numeric"
            type="number"
          >
            <template v-slot:append>
              <div class="q-mt-sm">€</div>
            </template>
          </q-input>
        </div>
      </div>

      <div class="q-mb-xl column">
        <q-toggle
          :label="$t('de.medikamenteOrganisieren')"
          :value="clientCustomValue('de.medikamenteOrganisieren') || false"
          @input="saveClientCustomField('de.medikamenteOrganisieren', $event)"
        />
        <q-toggle
          :label="$t('de.gebuehrenbefreit')"
          :value="clientCustomValue('de.gebuehrenbefreit') || false"
          @input="saveClientCustomField('de.gebuehrenbefreit', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import RecordMixin from "src/mixins/RecordMixin";
import EditToggleButton from "src/components/EditToggleButton.vue";
import NoDataItem from "src/components/NoDataItem.vue";
import LabeledItem from "src/components/LabeledItem.vue";
import SelectableInput from "src/components/SelectableInput.vue";
import DateTimeInput from "src/components/DateTimeInput.vue";
import { LabeledItemType } from "src/components/LabeledItem.vue";
import { 
  healthInsuranceOptions, 
  careInsuranceOptions, 
  mapToOptionsWithoutValue
} from "src/helper/billing/de";
import { PflegegradSchluessel, pflegegradSchluessel } from "paid-care";

type Pflegegrad = {
  value?: PflegegradSchluessel,
  since?: number
}

@Component({
  components: {
    EditToggleButton,
    NoDataItem,
    LabeledItem,
    SelectableInput,
    DateTimeInput,
  },
})
export default class ClientBillingSettings extends RecordMixin {
  isEditing = false;
  compactLayout = false;
  addedKostentraeger: string[] = [];

  @Watch("isEditing")
  onIsEditingChanged() {
    this.addedKostentraeger = [];
  }

  get items() {
    return [
      "de.krankenkasse",
      "de.versichertennummer",
      "de.pflegekasse",
      "de.privateVersicherungTarif",
      "de.beihilfe",
      "de.sozialamt",
      "de.andereKostentraeger",
      "de.pflegegrad",
      "de.entlastungsleistungBudget",
      "de.entlastungsleistungAufteilung",
      "de.entlastungsleistungLeistungserbringer",
      "de.medikamenteOrganisieren",
      "de.gebuehrenbefreit",
    ].flatMap(label => {
      let value = this.clientCustomValue(label);

      if (label == "de.pflegegrad") {
        return (value as Pflegegrad[] || []).slice()
          .sort((a, b) => (a.since || Number.NEGATIVE_INFINITY) - (b.since || Number.NEGATIVE_INFINITY))
          .flatMap(item => item.value
            ? [{
              label: this.$t("de.pflegegradSeitDatum", {
                date: item.since != undefined ? this.$d(item.since, "DateShort") : this.$t("unknown")
              }),
              value: item.value
            }]
            : []
          ).map((item, index, list) => index + 1 == list.length
            ? {
              ...item,
              value: item.value + " " + this.$t("currentValue")
            } : item
          )
      } else if (label == "de.krankenkasse") {
        value = this.healthInsurance?.label || value;
      } else if (label == "de.pflegekasse") {
        value = this.careInsurance?.label || value;
      } else if (label == "de.beihilfe" && value) {
        value = value + " %";
      } else if (["de.entlastungsleistungBudget", "de.entlastungsleistungAvailableBudget"].includes(label) && value) {
        value = value + " €";
      } else if (typeof value == "boolean") {
        value = value ? this.$t("yes") : this.$t("no");
      }

      if (value != undefined && value != "") {
        return [{
          label: this.$t(label),
          value
        }]
      } else {
        return [];
      }
    }) as LabeledItemType[];
  }
  get allKostentreagerLabels() {
    return [
      "de.pflegekasse",
      "de.privateVersicherungTarif",
      "de.beihilfe",
      "de.sozialamt",
      "de.andereKostentraeger",
    ]
  }
  get invisibleKostentraeger() {
    return this.allKostentreagerLabels
      .filter(label => !this.clientCustomValue(label) && !this.addedKostentraeger.includes(label));
  }
  get healthInsurance() {
    const value = this.clientCustomValue("de.krankenkasse");
    return this.healthInsuranceOptions.find(item => item.value == value);
  }
  get healthInsuranceDescription() {
    return this.healthInsurance?.description;
  }
  get healthInsuranceOptions() {
    return healthInsuranceOptions();
  }
  get careInsurance() {
    const value = this.clientCustomValue("de.pflegekasse");
    return this.careInsuranceOptions.find(item => item.value == value);
  }
  get careInsuranceDescription() {
    return this.careInsurance?.description;
  }
  get careInsuranceOptions() {
    return careInsuranceOptions();
  }
  get revealButtonClasses() {
    return "q-mt-xs q-py-sm q-px-md can-hover radius-xl overflow-hidden inline-block";
  }
  get pflegegradItems(): Pflegegrad[] {
    const value = this.clientCustomValue("de.pflegegrad") as Pflegegrad[] || [];
    
    return value.length > 0
      ? value
      : [{}];
  }
  get pflegegradOptions() {
    return mapToOptionsWithoutValue(pflegegradSchluessel);
  }

  addPflegegrad() {
    this.saveClientCustomField(
      "de.pflegegrad", 
      this.pflegegradItems.concat({})
    );
  }
  deletePflegegrad(itemIndex: number) {
    this.saveClientCustomField(
      "de.pflegegrad", 
      this.pflegegradItems.filter((_, index) => index != itemIndex)
    );
  }
  savePflegegrad(target: Pflegegrad, changes: Partial<Pflegegrad>, immediately = true) {
    this.$store.direct.commit.updateObject({ target, changes });
    this.saveClientCustomField("de.pflegegrad", this.pflegegradItems, immediately);
  }

  private onResize() {
    const width = (this.$el as HTMLElement).offsetWidth;
    this.compactLayout = width <= 400;
  }
}
</script>
