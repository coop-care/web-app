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

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  components: {}
})
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
    let sel = window.getSelection();

    if (sel) {
      sel.removeAllRanges();
    }
  }

  change(evt: Event) {
    let target = evt.target as HTMLElement;
    if (!target) {
      return;
    }

    let text = target.innerText.trim();
    target.innerText = text;
    this.$emit("change", { value: text });
  }
}
</script>