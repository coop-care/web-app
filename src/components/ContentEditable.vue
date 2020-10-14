<template>
  <div
    class="cursor-pointer"
    contenteditable
    @paste.prevent="onPaste"
    @keydown.enter="blur"
    @keydown.tab="blur"
    @blur="change"
  ></div>
</template>

<style lang="sass">
[contenteditable="true"]
  &:active, &:focus
    border: none
    outline: none
    border-bottom: 1px solid #000
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class ContentEditable extends Vue {
  onPaste(evt: ClipboardEvent) {
    if (!evt.clipboardData) {
      return;
    }

    const text = evt.clipboardData
      .getData("text/plain")
      .replace(/[\n\r\t]/g, " ");
    window.document.execCommand("insertText", false, text);
  }

  blur(evt: Event) {
    if (evt.target) {
      (evt.target as HTMLElement).blur();
    }
    const sel = window.getSelection();

    if (sel) {
      sel.removeAllRanges();
    }
  }

  change(evt: Event) {
    const target = evt.target as HTMLElement;
    if (!target) {
      return;
    }

    const text = target.innerText.trim();
    target.innerText = text;
    this.$emit("change", { value: text });
  }
}
</script>
