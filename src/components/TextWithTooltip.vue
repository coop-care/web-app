<template>
  <div>
    {{ text }}
    <q-icon
      v-if="tooltip"
      name="far fa-comment-alt"
      size="0.85em"
      class="q-ml-xs"
    />
    <q-tooltip
      :offset="$q.platform.is.mobile ? [0,10] : [0,4]"
      v-if="tooltip"
      :max-width="width"
      :anchor="($q.platform.is.mobile ? 'top' : 'bottom') + ' middle'"
      :self="($q.platform.is.mobile ? 'bottom' : 'top') + ' middle'"
      content-class="text-center"
      content-style="font-size: 0.9em"
    >
      <simplified-markdown :text="tooltip" />
    </q-tooltip>
    <q-resize-observer @resize="width = $event.width + 'px'" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import SimplifiedMarkdown from "./SimplifiedMarkdown.vue";

@Component({
  props: {
    text: String,
    tooltip: String
  },
  components: {
    SimplifiedMarkdown
  }
})
export default class TextWithTooltip extends Vue {
  width = "100%";
}
</script>