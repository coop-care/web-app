<template>
  <q-expansion-item
    switch-toggle-side
    header-class="q-px-xs dense-avatar"
    expand-icon-class="text-primary q-pr-sm"
  >
    <template v-slot:header>
      <q-item-section class="items-start">
        <q-item-label class="overflow-hidden">
          <span class="text-weight-medium line-height-10">{{ item.label }}</span>
          <q-btn
            v-if="item.url"
            icon="fas fa-up-right-from-square"
            flat
            round
            color="primary"
            size="xs"
            :title="$t('externalWebsiteHint', {url: item.url })"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="q-ml-xs"
            @click.stop
          />
          <q-btn
            v-if="item.repository"
            icon="fab fa-github"
            flat
            round
            dense
            color="primary"
            size="sm"
            :title="$t('externalRepositoryHint', {url: item.repository})"
            :href="item.repository"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="q-ml-xs"
            @click.stop
          />
        </q-item-label>
        <q-item-label
          caption
          lines="1"
          class="q-mt-none"
        >
          {{ item.caption }}
          <q-btn
            v-if="item.captionEmail"
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
            :title="$t('mailtoHint', {address: item.captionEmail})"
            :href="'mailto:' + item.captionEmail"
            rel="noopener noreferrer nofollow"
            @click.stop
          />
          <q-btn
            v-if="item.captionUrl"
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
            :title="$t('externalWebsiteHint', {url: item.captionUrl})"
            :href="item.captionUrl"
            target="_blank"
            rel="noopener noreferrer nofollow"
            @click.stop
          />
        </q-item-label>
      </q-item-section>
      <q-item-section side style="max-width: 35%" class="hyphen text-right">
        <q-item-label>{{ item.license }}</q-item-label>
        <q-item-label
          v-if="item.licenseCaption"
          caption
        >{{ item.licenseCaption }}</q-item-label>
      </q-item-section>
    </template>
    <div 
      class="text-body2 q-pr-md q-pt-xs q-pb-xl" 
      style="white-space: pre-wrap; padding-left: 37px"
    >
      <ul class="no-bullet">
        <li
          v-for="(contentItem, contentIndex) in item.content"
          :key="contentIndex"
          class="q-pb-sm"
        >
          <span class="text-weight-medium">{{ contentItem.label }}:</span> {{ contentItem.value }}
        </li>
      </ul>
    </div>
  </q-expansion-item>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";

export type FormattedDependency = {
  label: string;
  caption?: string;
  url?: string;
  repository?: string;
  captionEmail?: string;
  captionUrl?: string;
  license: string;
  licenseCaption?: string;
  content: {
    label: string;
    value?: string;
  }[];
}

@Component
export default class AcknowledgementDependency extends Vue {
  @Prop({ type: Object, default: () => ({}) }) readonly item!: FormattedDependency;
}
</script>
