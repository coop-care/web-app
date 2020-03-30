<template>
  <span v-if="!regex">{{ text }}</span>
  <span v-else>
    <span
      v-for="(part, index) in separatedText"
      v-bind:key="index"
      :class="regex.test(part) ? classesForMatches : ''"
    >{{ part }}</span>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  props: {
    text: String,
    regex: RegExp,
    classesForMatches: String
  }
})
export default class TextWithHighlights extends Vue {
  get separatedText() {
    return this.$props.text
      .replace(this.$props.regex, (text: string) => "|" + text + "|")
      .split("|");
  }
}
</script>