<template>
  <q-item class="auto-height items-center q-py-none">
    <div class="text-italic text-grey-7">{{ textLabel || $t("noData") }}</div>
    <q-btn
      v-if="!hideButton"
      :label="buttonLabel || $t('add')"
      flat
      rounded
      no-caps
      dense
      color="primary"
      :class="['q-px-sm q-mx-xs', buttonClasses]"
      @click="$emit('click')"
    />
  </q-item>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";

@Component({
  emits: ["click"]
})
export default class NoDataItem extends Vue {
  @Prop({ type: String, default: ""}) readonly textLabel!: string;
  @Prop({ type: String, default: ""}) readonly buttonLabel!: string;
  @Prop({ type: String, default: ""}) readonly buttonClasses!: string;
  @Prop({ type: Boolean }) readonly hideButton!: boolean;
}
</script>