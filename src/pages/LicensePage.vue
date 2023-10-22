<template>
  <q-page
    padding
    class="limit-page-width width-xs"
  >
    <div class="q-mt-md q-mb-lg text-h4 text-weight-medium">{{ $t("license") }}</div>
    <div v-if="license == 'AGPL'">
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

<script setup lang="ts">
import { ref, inject, onUnmounted, computed } from "vue";
import { EventBus } from "quasar";
import { locale } from "src/boot/i18n";

const bus = inject<EventBus>("bus");

const licenseSummary = ref("");
const licenseText = ref("");

const license = computed(() => !process.env.USE_FALLBACK_LICENSE ? "AGPL" : "");

async function loadMarkdown() {
  // @ts-ignore
  licenseText.value = (await import("../../LICENSE.md")).default;

  const localeMap: Record<string, string> = {
    "de-DE": "de",
    "en-US": "en"
  };
  const languageCode = localeMap[locale.value] || "en";
  licenseSummary.value = (await import(`../markdown/${languageCode}/agpl-summary.md`)).default;
}

loadMarkdown();
bus?.on("did-change-locale", loadMarkdown);

onUnmounted(() => bus?.off("did-change-locale", loadMarkdown));

</script>
