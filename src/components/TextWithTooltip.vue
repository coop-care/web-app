<template>
  <div class="cursor-help">
    {{ text }}
    <q-icon
      v-if="tooltip"
      name="fas fa-info-circle"
      size=".85rem"
      class="q-ml-xs"
      style="vertical-align: baseline"
    />
    <q-tooltip
      :offset="$q.platform.is.mobile ? [0,10] : [0,4]"
      v-if="tooltip"
      :max-width="maxWidth"
      :anchor="($q.platform.is.mobile ? 'top' : 'bottom') + ' middle'"
      :self="($q.platform.is.mobile ? 'bottom' : 'top') + ' middle'"
      content-class="text-center"
      content-style="font-size: 0.8rem"
    >
      <simplified-markdown :text="tooltip" />
    </q-tooltip>
    <q-resize-observer @resize="parentWidth = $event.width + 'px'" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
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

  parentWidth = "100%";

  get maxWidth() {
    return this.width || this.parentWidth;
  }
}
</script>