<template>
  <div>
    <searchable-option-list
      color="primary"
      :options="diagnosisCodes"
      optionListClass="diagnosis-list flex q-my-xs"
      :searchInputLabel="$t('findDiagnosis')"
      :model-value="value"
      @update:model-value="$emit('update:model-value', $event)"
    />
    <div class="text-caption text-center q-px-lg q-py-md text-grey-6">
      {{ $t("omahaSystemBookCopyrightNotice") }} <q-markdown :src="$t('omahaSystemBookReference')" />
    </div>
  </div>
</template>

<style lang="sass">
.diagnosis-list
  .q-item
    width: 50%
    @media (max-width: $breakpoint-xs-max)
      width: 100%
body.desktop .diagnosis-list .q-hoverable:hover > .q-focus-helper
  background-color: var(--q-primary)
</style>

<script lang="ts">
import { Vue, Component, Model } from "vue-facing-decorator";
import { sortByTitle } from "../helper/terminology";
import SearchableOptionList from "../components/SearchableOptionList.vue";
import SimplifiedMarkdown from "../components/SimplifiedMarkdown.vue";

@Component({
  components: {
    SearchableOptionList,
    SimplifiedMarkdown,
  },
  emits: ["update:model-value"]
})
export default class ProblemsByDiagnosis extends Vue {
  @Model({ type: String, required: true }) readonly value!: string;

  get problemCodesByDiagnosis() {
    return (this.$tm("problemCodesByDiagnosis") as unknown) as {
      [id: string]: string[];
    };
  }
  get diagnosisCodes() {
    return [{ code: "", title: this.$t("noDiagnosis") as string }].concat(
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
