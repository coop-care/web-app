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
    <div class="q-mb-md q-px-xl text-h5 text-center break-word">
      {{ $t("agreements") }}
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
      <date-time-input
        :value="agreements.initialInterview"
        @input="updateAndSave(agreements, {initialInterview: $event})"
        :label="$t('initialInterviewDate')"
        :format="$t('datetimeFormat')"
      />
      <date-time-input
        :value="agreements.initialCare"
        @input="updateAndSave(agreements, {initialCare: $event})"
        :label="$t('initialCareDate')"
        :format="$t('datetimeFormat')"
      />
      <date-time-input
        :value="agreements.contractHandover"
        @input="updateAndSave(agreements, {contractHandover: $event})"
        :label="$t('contractHandoverDate')"
        :format="$t('dateFormat')"
      />
      <date-time-input
        :value="agreements.costEstimateHandover"
        @input="updateAndSave(agreements, {costEstimateHandover: $event})"
        :label="$t('costEstimateHandoverDate')"
        :format="$t('dateFormat')"
      />
      <date-time-input
        :value="agreements.documentationCreated"
        @input="updateAndSave(agreements, {documentationCreated: $event})"
        :label="$t('documentationCreatedDate')"
        :format="$t('dateFormat')"
      />
      <date-time-input
        :value="agreements.carePlanCreated"
        @input="updateAndSave(agreements, {carePlanCreated: $event})"
        :label="$t('carePlanCreatedDate')"
        :format="$t('dateFormat')"
      />
      <div class="q-mt-md">
        <q-checkbox
          :value="agreements.existingInitialPrescription"
          @input="updateAndSave(agreements, {existingInitialPrescription: $event})"
          :label="$t('existingInitialPrescription') + '?'"
        />
      </div>
      <div class="q-mb-lg">
        <q-checkbox
          :value="agreements.keyHandoverRequired"
          @input="updateAndSave(agreements, {keyHandoverRequired: $event})"
          :label="$t('keyHandoverRequired') + '?'"
        />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { DateTime } from "luxon";
import { Client } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import EditToggleButton from "../components/EditToggleButton.vue";
import NoDataItem from "../components/NoDataItem.vue";
import LabeledItem, { LabeledItemType } from "../components/LabeledItem.vue";
import DateTimeInput from "../components/DateTimeInput.vue";

@Component({
  components: {
    EditToggleButton,
    NoDataItem,
    LabeledItem,
    DateTimeInput
  }
})
export default class ClientHealthInformation extends RecordMixin {
  isEditing = false;
  compactLayout = false;

  private onResize() {
    const width = (this.$el as HTMLElement).offsetWidth;
    this.compactLayout = width <= 400;
  }

  get items() {
    const result: LabeledItemType[] = [];
    const locale = this.$root.$i18n.locale;

    if (this.client?.createdAt) {
      result.push({
        label: this.$t("clientCreatedAt") as string,
        value: this.client?.createdAt.toLocaleString(locale, DateTime.DATETIME_MED)
      });
    }
    if (this.agreements.initialInterview) {
      result.push({
        label: this.$t("initialInterviewDate") as string,
        value: this.agreements.initialInterview.toLocaleString(locale, DateTime.DATETIME_MED)
      });
    }
    if (this.agreements.initialCare) {
      result.push({
        label: this.$t("initialCareDate") as string,
        value: this.agreements.initialCare.toLocaleString(locale, DateTime.DATETIME_MED)
      });
    }
    if (this.agreements.contractHandover) {
      result.push({
        label: this.$t("contractHandoverDate") as string,
        value: this.agreements.contractHandover.toLocaleString(locale, DateTime.DATE_MED)
      });
    }
    if (this.agreements.costEstimateHandover) {
      result.push({
        label: this.$t("costEstimateHandoverDate") as string,
        value: this.agreements.costEstimateHandover.toLocaleString(locale, DateTime.DATE_MED)
      });
    }
    if (this.agreements.documentationCreated) {
      result.push({
        label: this.$t("documentationCreatedDate") as string,
        value: this.agreements.documentationCreated.toLocaleString(locale, DateTime.DATE_MED)
      });
    }
    if (this.agreements.carePlanCreated) {
      result.push({
        label: this.$t("carePlanCreatedDate") as string,
        value: this.agreements.carePlanCreated.toLocaleString(locale, DateTime.DATE_MED)
      });
    }
    if (this.agreements.existingInitialPrescription != null) {
      result.push({
        label: this.$t("existingInitialPrescription") as string,
        value: this.booleanAsText(this.agreements.existingInitialPrescription)
      });
    }
    if (this.agreements.keyHandoverRequired != null) {
      result.push({
        label: this.$t("keyHandoverRequired") as string,
        value: this.booleanAsText(this.agreements.keyHandoverRequired)
      });
    }
    if (this.client?.leftAt) {
      result.push({
        label: this.$t("clientLeftAt") as string,
        value: this.client?.leftAt.toLocaleString(locale, DateTime.DATETIME_MED)
      });
    }
    
    return result;
  }
  get agreements() {
    return (this.client || new Client()).agreements;
  }

  booleanAsText(value: boolean) {
    return (value ? this.$t("yes") : this.$t("no")) as string
  }
}
</script>
