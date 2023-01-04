<template>
  <q-page
    padding
    class="limit-page-width width-xs"
  >
    <div class="q-mt-md q-mb-lg text-body2">
      <div class="text-h4 text-weight-medium q-mb-lg">{{ $t("acknowledgements") }} ❤️</div>
      <div>{{ $t("acknowledgementsIntro") }}</div>
    </div>
    <div class="q-mb-lg text-body2">
      <div class="text-h5 text-weight-medium q-mb-xs">{{ $t("omahaSystem") }}</div>
      <div class="q-mb-md">{{ $t("acknowledgementsOmahaSystemIntro") }}</div>
      <div>{{ $t("acknowledgementsOmahaSystemPublicDomain") }}</div>
      <q-markdown
        class="q-mb-md" 
        :src="$t('acknowledgementsOmahaSystemReference') + ' ' + $t('omahaSystemBookReference')"
      />
      <div v-if="hasDiagnosisNames || hasUsersGuide">
        <div>{{ $t("acknowledgementsOmahaSystemCopyrights") }}</div>
        <ul class="q-my-xs">
          <li v-if="hasUsersGuide">{{ $t("acknowledgementsOmahaSystemUsersGuide") }}</li>
          <li v-if="hasDiagnosisNames">{{ $t("acknowledgementsOmahaSystemDiagnoses") }}</li>
        </ul>
        <q-markdown :src="$t('omahaSystemBookCopyrightNotice') + ' ' + $t('omahaSystemBookReference')" />
      </div>
    </div>
    <div class="text-body2">
      <div class="text-h5 text-weight-medium q-mb-sm">{{ $t("ossComponents") }}</div>
      <div class="q-mb-md">{{ $t("acknowledgementsOpenSourceIntro", {count: ossLicenses.length}) }}</div>
    </div>
    <div class="q-mb-xl">
      <q-expansion-item
        v-for="(item, index) in ossLicenses"
        :key="index"
        :label="item.name"
        :caption="typeof item.author == 'string' ? item.author : JSON.stringify(item.author)"
        group="oss-licenses"
        class="oss-component"
        header-class="q-px-xs"
        expand-icon-class="text-primary"
        ref="expansionItems"
      >
        <template v-slot:header>
          <q-item-section avatar class="q-pr-xs" style="min-width: inherit">
            <q-btn
              icon="fab fa-github"
              round
              flat
              color="primary"
              :title="$t('externalRepositoryHint', {url: item.repository})"
              :href="item.repository"
              target="_blank"
              rel="noopener noreferrer nofollow"
              type="a"
              @click.stop
            />
          </q-item-section>
          <q-item-section class="items-start">
            <q-item-label
              lines="1"
            >
              <q-btn
                v-if="item.homepage"
                :label="item.name"
                flat
                no-caps
                no-wrap
                dense
                rounded
                color="primary"
                padding="2px 8px 2px 0"
                class="line-height-10"
                :title="$t('externalWebsiteHint', {url: item.homepage})"
                :href="item.homepage"
                target="_blank"
                rel="noopener noreferrer nofollow"
                type="a"
                @click.stop
              />
              <span v-else class="text-weight-medium line-height-10">{{ item.name }}</span>
            </q-item-label>
            <q-item-label
              caption
              lines="1"
            >
              {{ item.author.name }}
              <q-btn
                v-if="item.author.email"
                :label="$t('email')"
                rounded
                flat
                no-caps
                no-wrap
                dense
                size="0.75rem"
                color="primary"
                padding="2px 6px"
                class="line-height-10"
                :title="$t('mailtoHint', {address: item.author.email})"
                :href="'mailto:' + item.author.email"
                rel="noopener noreferrer nofollow"
                type="a"
                @click.stop
              />
              <q-btn
                v-if="item.author.url"
                :label="$t('websiteShortTitle')"
                rounded
                flat
                no-caps
                no-wrap
                dense
                size="0.75rem"
                color="primary"
                padding="2px 6px"
                class="line-height-10"
                :title="$t('externalWebsiteHint', {url: item.author.url})"
                :href="item.author.url"
                target="_blank"
                rel="noopener noreferrer nofollow"
                type="a"
                @click.stop
              />
            </q-item-label>
          </q-item-section>
          <q-item-section side style="max-width: 35%">
            <q-item-label lines="1">{{ item.license }}</q-item-label>
            <q-item-label
              caption
              lines="1"
            >{{ $t("license") }}</q-item-label>
          </q-item-section>
        </template>
        <div class="text-body2 q-px-md q-pt-xs q-pb-xl" style="white-space: pre-wrap">{{ item.licenseText }}</div>
      </q-expansion-item>
    </div>
  </q-page>
</template>

<style lang="sass">
.readable-line-length
  max-width: 800px
  margin: 0 auto
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import SimplifiedMarkdown from "components/SimplifiedMarkdown.vue";

type OSSDependency = {
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  license: string;
  licenseText: string;
  name: string;
  repository?: string;
  homepage?: string;
};

@Component({
  components: {
    SimplifiedMarkdown
  }
})
export default class AcknowledgementsPage extends Vue {
  ossLicenses: OSSDependency[] = [];

  get hasDiagnosisNames() {
    return Object.keys(this.$t("diagnosisNames")).length > 0;
  }
  get hasUsersGuide() {
    const keys = Object.keys(this.$t("usersGuide"));
    return keys.length > 1 || keys[0] != "50";
  }

  async fetchLicenses() {
    this.ossLicenses = (await fetch("oss-licenses.json")
      .then(async response => {
        if (response.ok) {
            return response.text().then(text => JSON.parse(text));
        } else {
            return [];
        }
      }))
      .sort((a: OSSDependency, b: OSSDependency) => a.name.localeCompare(b.name));
  }

  mounted() {
    void this.fetchLicenses();
  }
}
</script>
