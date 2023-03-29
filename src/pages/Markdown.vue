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

<style lang="sass">
.readable-line-length
  max-width: 800px
  margin: 0 auto
</style>

<script lang="ts">
import { Vue, Component, Watch } from "vue-facing-decorator";

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

@Component
export default class MarkdownPage extends Vue {
  markdown = "";

  @Watch("$route")
  onRouteChanged() {
      this.loadMarkdown();
  }

  loadMarkdown() {
    this.markdown = "";
    const path = this.$route.path;
    const locale = this.$i18n.locale;
    const page = (pages as Record<string, Record<string, () => Promise<any>>>)[
      path
    ];

    if (page) {
      const module = page[locale];

      if (module) {
        module()
          .then((component) => {
            this.markdown = component.default.replace(/^---[\s\S]*?---/m, "");
          })
          .catch((error) => console.error(error));
      }
    }
  }

  created() {
    this.loadMarkdown();
    this.$bus.on("did-change-locale", this.loadMarkdown);
  }

  unmounted() {
    this.$bus.off("did-change-locale");
  }
}
</script>
