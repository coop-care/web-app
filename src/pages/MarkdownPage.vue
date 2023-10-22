<template>
  <q-page
    class="limit-page-width page-padding"
  >
    <q-markdown
      :src="markdown"
      class="readable-line-length"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, inject, onUnmounted } from "vue";
import { EventBus } from "quasar";
import { locale } from "src/boot/i18n";
import { useRoute } from "vue-router";

const pages = {
  "/legal-notice": {
    // @ts-ignore
    "de-DE": () => import("../markdown/de/impressum.md"),
    // @ts-ignore
    "en-US": () => import("../markdown/en/legal-notice.md"),
  },
  "/privacy-policy": {
    // @ts-ignore
    "de-DE": () => import("../markdown/de/datenschutz.md"),
    // @ts-ignore
    "en-US": () => import("../markdown/en/privacy-policy.md"),
  },
};

const route = useRoute();
const bus = inject<EventBus>("bus");

const markdown = ref("");

function loadMarkdown() {
  markdown.value = "";
  const path = route.path;
  const page = (pages as Record<string, Record<string, () => Promise<any>>>)[
    path
  ];

  if (page) {
    const module = page[locale.value];

    if (module) {
      module()
        .then((component) => {
          markdown.value = component.default.replace(/^---[\s\S]*?---/m, "");
        })
        .catch((error) => console.error(error));
    }
  }
}

watch(
  () => route,
  () => loadMarkdown(),
  {deep: true}
)

loadMarkdown();
bus?.on("did-change-locale", loadMarkdown);

onUnmounted(() => bus?.off("did-change-locale", loadMarkdown));

</script>
