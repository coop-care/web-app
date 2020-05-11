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

const TextWithHighlightsProps = Vue.extend({
  props: {
    text: String,
    regex: RegExp,
    classesForMatches: String
  }
});

@Component
export default class TextWithHighlights extends TextWithHighlightsProps {
  get separatedText() {
    return this.text
      .replace(this.regex, (text: string) => "|" + text + "|")
      .split("|");
  }
}
</script>