<template>
  <div>
    <div v-if="isSingleEditor" class="q-mb-sm">
      <q-btn-toggle
        v-model="categoryCode"
        spread
        no-caps
        unelevated
        rounded
        stack
        toggle-color="intervention"
        text-color="intervention"
        class="intervention-category q-my-sm border-intervention"
        :options="categoryOptions"
      />
      <div class="q-mx-md">
        <div
          v-if="$q.screen.lt.sm"
          class="text-center text-intervention text-subtitle2 text-weight-bold"
        >
          {{ $t("terminology.categoryByCode[" + categoryCode + "].title") }}
        </div>
        <div v-if="categoryCode" class="text-caption">
          {{
            $t("terminology.categoryByCode[" + categoryCode + "].description")
          }}
        </div>
      </div>
    </div>

    <div v-if="!isSingleEditor && $q.screen.lt.sm" class="text-right">
      <q-btn
        icon="far fa-clone"
        flat
        round
        dense
        color="intervention"
        :title="$t('duplicate')"
        @click.stop="$emit('duplicate')"
      />
      <q-btn
        icon="far fa-trash-alt"
        flat
        round
        dense
        color="intervention"
        :title="$t('delete')"
        class="q-ml-xs"
        @click.stop="$emit('delete')"
      />
    </div>

    <div class="q-mb-sm">
      <intervention-target-select
        v-model="targetCode"
        :options="targets"
        color="intervention"
      >
        <template v-slot:after v-if="!isSingleEditor && $q.screen.gt.xs">
          <q-btn
            icon="far fa-clone"
            flat
            round
            dense
            color="intervention"
            :title="$t('duplicate')"
            @click.stop="$emit('duplicate')"
          />
          <q-btn
            icon="far fa-trash-alt"
            flat
            round
            dense
            color="intervention"
            :title="$t('delete')"
            class="q-ml-xs"
            @click.stop="$emit('delete')"
          />
        </template>
      </intervention-target-select>
    </div>

    <q-input
      v-if="targetCode"
      v-model="details"
      :label="$t('describeClientSpecificIntervention')"
      autogrow
      color="intervention"
      debounce="50"
      class="q-mb-sm"
      clearable
      ref="detailsInput"
      @keydown.up.down.enter.prevent="$refs.detailsMenu.navigateMenu"
    >
      <filterable-menu
        v-model="details"
        ref="detailsMenu"
        :items="suggestedDetails"
        @input="$refs.detailsInput.focus()"
      />
    </q-input>

    <div v-if="targetCode">
      <reminder-editor v-model="recurrenceRules" color="intervention" />
    </div>
  </div>
</template>

<style lang="sass">
.q-btn-toggle.intervention-category .q-btn__content
    .q-icon
      font-size: 24px
    div
      margin-top: 2px
      font-size: 12px
      line-height: .9rem
</style>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {
  TerminologyWithMaps,
  UsersGuide,
  sortByTitle
} from "../helper/terminology";
import { ProblemRecord } from "../models/problemRecord";
import { Intervention } from "../models/intervention";
import InterventionTargetSelect from "../components/InterventionTargetSelect.vue";
import ReminderEditor from "../components/ReminderEditor.vue";
import FilterableMenu from "../components/FilterableMenu.vue";

const InterventionEditorProps = Vue.extend({
  props: {
    value: Intervention,
    problemRecord: ProblemRecord,
    isSingleEditor: Boolean
  }
});

@Component({
  components: {
    InterventionTargetSelect,
    ReminderEditor,
    FilterableMenu
  }
})
export default class InterventionEditor extends InterventionEditorProps {
  get categoryCode() {
    return this.value.categoryCode;
  }
  set categoryCode(value) {
    this.updateIntervention({ categoryCode: value });
  }
  get targetCode() {
    return this.value.targetCode;
  }
  set targetCode(value) {
    this.updateIntervention({ targetCode: value });
  }
  get details() {
    return this.value.details;
  }
  set details(value) {
    this.updateIntervention({ details: value || "" });
  }
  get recurrenceRules() {
    return this.value.recurrenceRules;
  }
  set recurrenceRules(value) {
    this.updateIntervention({ recurrenceRules: value });
  }
  get targets() {
    const suggestions = this.usersGuideForProblem?.interventionSuggestions;

    if (suggestions && this.categoryCode) {
      const targetByCode = this.terminology.targetByCode;
      const suggestedTargetCodes = Object.keys(
        suggestions[this.categoryCode] || {}
      );
      const suggestedTargets: Record<string, any>[] = suggestedTargetCodes
        .map(code => targetByCode[code])
        .sort(sortByTitle)
        .concat(this.terminology.targetByCode["63"]);
      const notSuggestedTargets: Record<string, any>[] = Object.values(
        targetByCode
      )
        .filter(
          target =>
            !suggestedTargetCodes.includes(target.code) && target.code != "63"
        )
        .sort(sortByTitle);
      const suggestedTitle =
        this.$t("frequentInterventionTargetsForProblem", {
          problem: this.$t(this.record.problem.title)
        }) + ":";
      const notSuggestedTitle = this.$t("otherInterventionTargets") + ":";

      return [{ title: suggestedTitle, isHeader: true } as Record<string, any>]
        .concat(suggestedTargets)
        .concat({ title: notSuggestedTitle, isHeader: true })
        .concat(notSuggestedTargets);
    } else {
      let targets = this.terminology.interventionScheme.targets.slice();
      const other = targets.pop();
      targets = targets.sort(sortByTitle);

      if (other) {
        targets.push(other);
      }
      return targets;
    }
  }
  get suggestedDetails() {
    if (this.categoryCode && this.targetCode && this.usersGuideForProblem) {
      const intervention = this.usersGuideForProblem.interventionSuggestions;
      const category = intervention[this.categoryCode] || {};
      const details = category[this.targetCode] || [];

      return details;
    } else {
      return [];
    }
  }
  get usersGuideForProblem() {
    return ((this.$t("usersGuide") as unknown) as UsersGuide)[
      this.record?.problem.code || ""
    ];
  }
  get categoryOptions() {
    return this.terminology.interventionScheme.categories.map(item => {
      return {
        label: this.$q.screen.gt.xs ? item.title : "",
        value: item.code,
        icon: item.icon
      };
    });
  }
  get terminology() {
    return (this.$t("terminology") as unknown) as TerminologyWithMaps;
  }
  get record() {
    return (
      this.problemRecord ||
      this.$store.direct.getters.getProblemRecordById(this.$route.params)
    );
  }

  updateIntervention(changes: Partial<Intervention>) {
    this.$store.direct.commit.updateReminder({
      target: this.value,
      changes: changes
    });
    this.$emit("input", this.value);
  }
}
</script>
