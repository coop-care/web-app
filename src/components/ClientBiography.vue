<template>
  <div>
    <q-resize-observer @resize="onResize" />
    <div class="row justify-end">
      <edit-toggle-button
        v-if="!isDisabled"
        v-model="isEditing"
        :class="[$q.screen.gt.xs ? '' : 'q-mr-sm']"
      />
    </div>
    <div class="q-mb-md q-px-lg text-h5 text-center break-word">
      {{ $t("biographyTitle") }}
    </div>

    <div v-if="!isEditing || isDisabled">
      <q-list class="text-size-adjust-md q-mb-md">
        <no-data-item
          v-if="!items.length"
          button-classes="text-weight-regular"
          :hide-button="isDisabled"
          class="justify-center"
          @click="isEditing = true"
        />
        <labeled-item
          v-for="(item, index) in items"
          :key="'item' + index"
          :item="item"
          :compactLayout="compactLayout"
          class="text-primary"
        />
      </q-list>
    </div>
    <div v-else>
      <q-input
        :model-value="healthInfo.likes"
        @update:model-value="update(healthInfo, {likes: $event})"
        @change="saveClient"
        :label="$t('likesTaste')"
        autogrow
      />
      <q-input
        :model-value="healthInfo.dislikes"
        @update:model-value="update(healthInfo, {dislikes: $event})"
        @change="saveClient"
        :label="$t('dislikesDistaste')"
        autogrow
      />
      <q-input
        :model-value="healthInfo.biography"
        @update:model-value="update(healthInfo, {biography: $event})"
        @change="saveClient"
        :label="$t('biographyTitle')"
        autogrow
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import { Client } from "../models";
import RecordMixin, { RecordMixinInterface } from "../mixins/RecordMixin";
import EditToggleButton from "../components/EditToggleButton.vue";
import NoDataItem from "../components/NoDataItem.vue";
import LabeledItem, { LabeledItemType } from "../components/LabeledItem.vue";

interface ClientBiographyView extends RecordMixinInterface {};

@Component({
  components: {
    EditToggleButton,
    NoDataItem,
    LabeledItem
  },
  mixins: [RecordMixin]
})
class ClientBiographyView extends Vue {
  isEditing = false;
  compactLayout = false;

  get items() {
    const result: LabeledItemType[] = [];
    if (this.healthInfo.likes) {
      result.push({
        label: this.$t("likesTaste"),
        value: this.healthInfo.likes
      });
    }
    if (this.healthInfo.dislikes) {
      result.push({
        label: this.$t("dislikesDistaste"),
        value: this.healthInfo.dislikes
      });
    }
    if (this.healthInfo.biography) {
      result.push({
        label: this.$t("biographyTitle"),
        value: this.healthInfo.biography
      });
    }
    
    return result;
  }
  get healthInfo() {
    return (this.client || new Client()).healthInformation;
  }

  private onResize() {
    const width = (this.$el as HTMLElement).offsetWidth;
    this.compactLayout = width <= 400;
  }
}

export default ClientBiographyView;
</script>
