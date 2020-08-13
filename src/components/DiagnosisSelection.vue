<template>
  <div>
    <searchable-option-list
      color="primary"
      :options="diagnosisCodes"
      optionListClass="column-2-sm q-my-xs"
      :searchInputLabel="$t('findDiagnosis')"
      :value="value"
      @input="$emit('input', $event)"
    />
    <div class="text-caption text-center q-px-lg q-py-md text-grey-6">
      <simplified-markdown :text="$t('omahaSystemBookCopyrightNotice')" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { sortByTitle } from "../helper/terminology";
import SearchableOptionList from "../components/SearchableOptionList.vue";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

const ProblemsByDiagnosisProps = Vue.extend({
  props: {
    value: String,
  },
});

@Component({
  components: {
    SearchableOptionList,
    SimplifiedMarkdown,
  },
})
export default class ProblemsByDiagnosis extends ProblemsByDiagnosisProps {
  get problemCodesByDiagnosis() {
    return (this.$t("problemCodesByDiagnosis") as unknown) as {
      [id: string]: string[];
    };
  }
  get diagnosisCodes() {
    return [{ code: "", title: this.$t("none") as string }].concat(
      Object.keys(this.problemCodesByDiagnosis)
        .map((code) => {
          return {
            code: code,
            title: this.$t("diagnosisNames." + code) as string,
          };
        })
        .sort(sortByTitle)
    );
  }
}
</script>
