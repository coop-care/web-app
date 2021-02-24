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
      {{ $t("healthInformation") }}
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
      <multiple-selectable-input
        :value="healthInfo.diagnoses"
        @input="updateAndSave(healthInfo, {diagnoses: $event})"
        :options="[]"
        :label="$t('diagnosesTitle')"
        hide-dropdown-icon
      />
      <selectable-input
        :value="healthInfo.diabetes"
        :label="$t('diabetes')"
        :options="[]"
        hide-dropdown-icon
        @input="updateAndSave(healthInfo, {diabetes: $event})"
      />
      <selectable-input
        :value="healthInfo.anticoagulant"
        :label="$t('anticoagulantTitle')"
        :options="[]"
        hide-dropdown-icon
        @input="updateAndSave(healthInfo, {anticoagulant: $event})"
      />
      <selectable-input
        :value="healthInfo.pain"
        :label="$t('painTitle')"
        :options="[]"
        hide-dropdown-icon
        @input="updateAndSave(healthInfo, {pain: $event})"
      />
      <multiple-selectable-input
        :value="healthInfo.allergies"
        @input="updateAndSave(healthInfo, {allergies: $event})"
        :options="[]"
        :label="$t('allergiesTitle')"
        hide-dropdown-icon
      />
      <multiple-selectable-input
        :value="healthInfo.assistiveTechnology"
        @input="updateAndSave(healthInfo, {assistiveTechnology: $event})"
        :options="assistiveTechnologyItems"
        :label="$t('assistiveTechnologiesTitle')"
        hide-dropdown-icon
        class="mb-row-dense"
      />
      <q-input
        :value="healthInfo.likes"
        @input="update(healthInfo, {likes: $event})"
        @change="saveClient"
        :label="$t('likesTaste')"
        autogrow
      />
      <q-input
        :value="healthInfo.dislikes"
        @input="update(healthInfo, {dislikes: $event})"
        @change="saveClient"
        :label="$t('dislikesDistaste')"
        autogrow
      />
      <q-input
        :value="healthInfo.biography"
        @input="update(healthInfo, {biography: $event})"
        @change="saveClient"
        :label="$t('biographyTitle')"
        autogrow
      />
      <div class="q-mt-md">
        <q-checkbox
          :value="healthInfo.existingAdvanceHealthcareDirective"
          @input="updateAndSave(healthInfo, {existingAdvanceHealthcareDirective: $event})"
          :label="$t('existingAdvanceHealthcareDirective') + '?'"
        />
      </div>
      <div>
        <q-checkbox
          :value="healthInfo.existingHealthcareProxy"
          @input="updateAndSave(healthInfo, {existingHealthcareProxy: $event})"
          :label="$t('existingHealthcareProxy') + '?'"
        />
      </div>
      <q-input
        :value="healthInfo.notes"
        @input="update(healthInfo, {notes: $event})"
        @change="saveClient"
        :label="$t('additionalNotes')"
        autogrow
        class="q-mb-lg"
      />
    </div>
  </div>
</template>

<style lang="sass">
.button-placeholder
  width: 30px
</style>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { Client, ClientHealthInformation } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import EditToggleButton from "../components/EditToggleButton.vue";
import NoDataItem from "../components/NoDataItem.vue";
import LabeledItem, { LabeledItemType } from "../components/LabeledItem.vue";
import SelectableInput from "../components/SelectableInput.vue";
import MultipleSelectableInput from "../components/MultipleSelectableInput.vue";

@Component({
  components: {
    EditToggleButton,
    NoDataItem,
    LabeledItem,
    SelectableInput,
    MultipleSelectableInput
  }
})
export default class ClientHealthInformationView extends RecordMixin {
  isEditing = false;
  compactLayout = false;
  foo=[]

  get items() {
    const result: LabeledItemType[] = [];

    if (this.healthInfo.diagnoses.length) {
      result.push({
        label: this.$t("diagnosesTitle") as string,
        value: this.healthInfo.diagnoses.join(", ")
      });
    }
    if (this.healthInfo.diabetes) {
      result.push({
        label: this.$t("diabetes") as string,
        value: this.healthInfo.diabetes
      });
    }
    if (this.healthInfo.anticoagulant) {
      result.push({
        label: this.$t("anticoagulantTitle") as string,
        value: this.healthInfo.anticoagulant
      });
    }
    if (this.healthInfo.pain) {
      result.push({
        label: this.$t("painTitle") as string,
        value: this.healthInfo.pain
      });
    }
    if (this.healthInfo.allergies.length) {
      result.push({
        label: this.$t("allergiesTitle") as string,
        value: this.healthInfo.allergies.join(", ")
      });
    }
    if (this.healthInfo.assistiveTechnology.length) {
      result.push({
        label: this.$t("assistiveTechnologiesTitle") as string,
        value: this.healthInfo.assistiveTechnology
          .map(value => this.localizeLabel(value)).join(", ")
      });
    }
    if (this.healthInfo.likes) {
      result.push({
        label: this.$t("likesTaste") as string,
        value: this.healthInfo.likes
      });
    }
    if (this.healthInfo.dislikes) {
      result.push({
        label: this.$t("dislikesDistaste") as string,
        value: this.healthInfo.dislikes
      });
    }
    if (this.healthInfo.biography) {
      result.push({
        label: this.$t("biographyTitle") as string,
        value: this.healthInfo.biography
      });
    }
    if (this.healthInfo.existingAdvanceHealthcareDirective != null) {
      result.push({
        label: this.$t("existingAdvanceHealthcareDirective") as string,
        value: this.booleanAsText(this.healthInfo.existingAdvanceHealthcareDirective)
      });
    }
    if (this.healthInfo.existingHealthcareProxy != null) {
      result.push({
        label: this.$t("existingHealthcareProxy") as string,
        value: this.booleanAsText(this.healthInfo.existingHealthcareProxy)
      });
    }
    if (this.healthInfo.notes) {
      result.push({
        label: this.$t("additionalNotes") as string,
        value: this.healthInfo.notes
      });
    }
    
    return result;
  }
  get assistiveTechnologyItems() {
    return ClientHealthInformation.asstiveTechnologyTypes
      .map(this.makeOption)
      .sort(Client.sortByLabel) || [];
  }
  get healthInfo() {
    return (this.client || new Client()).healthInformation;
  }

  private onResize() {
    const width = (this.$el as HTMLElement).offsetWidth;
    this.compactLayout = width <= 400;
  }

  localizeLabel(label: string) {
    return ClientHealthInformation.predefinedTypes.includes(label) ? 
      this.$t(label) as string : 
      label;
  }
  booleanAsText(value: boolean) {
    return (value ? this.$t("yes") : this.$t("no")) as string
  }
  makeOption(label: string) {
    return {
      label: this.localizeLabel(label),
      value: label
    }
  }
}
</script>
