<template>
  <span v-if="!regex">{{ text }}</span>
  <span v-else>
    <span
      v-for="(part, index) in separatedText"
      :key="index"
      :class="classesForPart(part)"
    >{{ part }}</span>
  </span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";

@Component
export default class TextWithHighlights extends Vue {
  @Prop({ type: String, default: ""}) readonly text!: string;
  @Prop({ type: RegExp }) readonly regex: RegExp | undefined;
  @Prop({ type: String, default: ""}) readonly classesForMatches!: string;

  get separatedText() {
    if (this.regex) {
      return this.text
        .replace(this.regex, (text: string) => "|" + text + "|")
        .split("|");
    } else {
      return []
    }
  }
  classesForPart(part: string) {
    if (this.regex && new RegExp(this.regex).test(part)) {
      return this.classesForMatches
    } else {
      return ""
    }
  }
}
</script>