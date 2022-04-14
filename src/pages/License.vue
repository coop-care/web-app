<template>
  <q-page
    padding
    class="limit-page-width width-xs"
  >
    <div class="q-mt-md q-mb-lg text-h4 text-weight-medium">{{ $t("license") }}</div>
    <div v-if="$store.direct.getters.license == 'AGPL'">
      <q-markdown
        :src="licenseSummary"
        class="readable-line-length q-mb-xl"
      />
      <q-markdown
        :src="licenseText"
        no-breaks
        no-heading-anchor-links
        class="readable-line-length"
      />
    </div>
    <div v-else>{{ $t("appCopyrightNotice") }}</div>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class LicensePage extends Vue {
  licenseSummary = "";
  licenseText = "";

  async loadMarkdown() {
    // @ts-ignore
    this.licenseText = (await import("../../LICENSE.md")).default;

    const localeMap: Record<string, string> = {
      "de-de": "de",
      "en-us": "en"
    };
    const locale = localeMap[this.$root.$i18n.locale] || "en";
    // @ts-ignore
    this.licenseSummary = (await import(`../markdown/${locale}/agpl-summary.md`)).default;
  }

  created() {
    void this.loadMarkdown();
    this.$root.$on("did-change-locale", this.loadMarkdown);
  }

  beforeDestroy() {
    this.$root.$off("did-change-locale");
  }
}
</script>
