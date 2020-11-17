<template>
  <span>
    <span 
      v-for="(line, lineIndex) in text.split('\n')"
      v-bind:key="lineIndex"
    >
      <br v-if="lineIndex > 0">
      <span
        v-for="(fragment, index) in line.replace(/(\*+)([^*]+)(\*+)/g, '|$1$2$3|').split('|')"
        v-bind:key="lineIndex + '.' + index"
        :class="classes(fragment)"
      >
        {{ fragment.replace(/\*/g, "") }}
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class SimplifiedMarkdown extends Vue {
  @Prop({ type: String, default: ""}) readonly text!: string;

  classes(text: string) {
    let classes = "";
    if (text.startsWith("**")) {
      classes += "text-bold ";
    }
    if (text.startsWith("***") || /^\*[^*]/.test(text)) {
      classes += "text-italic ";
    }
    return classes;
  }
}
</script>
