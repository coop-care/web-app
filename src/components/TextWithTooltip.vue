<template>
  <div :class="tooltip ? 'cursor-help' : ''">
    {{ text }}
    <q-icon
      v-if="tooltip"
      name="fas fa-info-circle"
      size=".85rem"
      :class="[!iconClass.includes('q-ml-') ? 'q-ml-xs' : '', iconClass]"
      style="vertical-align: baseline"
    />
    <q-tooltip
      :offset="$q.platform.is.mobile ? [0,10] : [0,4]"
      v-if="tooltip"
      :max-width="maxWidth"
      :anchor="($q.platform.is.mobile ? 'top' : 'bottom') + ' middle'"
      :self="($q.platform.is.mobile ? 'bottom' : 'top') + ' middle'"
      class="text-center"
      style="font-size: 0.8rem"
    >
      <simplified-markdown :text="tooltip" />
    </q-tooltip>
    <q-resize-observer @resize="parentWidth = $event.width + 'px'" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";
import SimplifiedMarkdown from "./SimplifiedMarkdown.vue";

@Component({
  components: {
    SimplifiedMarkdown
  }
})
export default class TextWithTooltip extends Vue {
  @Prop({ type: String, default: ""}) readonly text!: string;
  @Prop({ type: String, default: ""}) readonly tooltip!: string;
  @Prop({ type: String, default: ""}) readonly width!: string;
  @Prop({ type: String, default: ""}) readonly iconClass!: string;

  parentWidth = "100%";

  get maxWidth() {
    return this.width || this.parentWidth;
  }
}
</script>