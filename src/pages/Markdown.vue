<template>
  <q-page
    padding
    class="limit-page-width"
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
import Vue from "vue";
import Component from "vue-class-component";

const pages = {
  "/legal-notice": {
    // @ts-ignore
    "de-de": () => import("../markdown/de/impressum.md"),
    // @ts-ignore
    "en-us": () => import("../markdown/en/legal-notice.md"),
  },
  "/privacy-policy": {
    // @ts-ignore
    "de-de": () => import("../markdown/de/datenschutz.md"),
    // @ts-ignore
    "en-us": () => import("../markdown/en/privacy-policy.md"),
  },
};

@Component({
  watch: {
    $route(this: MarkdownPage) {
      this.loadMarkdown();
    },
  },
})
export default class MarkdownPage extends Vue {
  markdown = "";

  loadMarkdown() {
    this.markdown = "";
    const path = this.$route.path;
    const locale = this.$root.$i18n.locale;
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
    this.$root.$on("didChangeLocale", this.loadMarkdown);
  }

  beforeDestroy() {
    this.$root.$off("didChangeLocale");
  }
}
</script>
