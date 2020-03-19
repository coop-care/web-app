<template>
  <span>
    <span
      v-for="(fragment, index) in text.replace(/(\*+)([^*]+)(\*+)/g, '|$1$2$3|').split('|')"
      v-bind:key="index"
      :class="classes(fragment)"
    >{{ fragment.replace(/\*/g, "") }}</span>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  props: {
    text: String
  }
})
export default class SimplifiedMarkdown extends Vue {
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
