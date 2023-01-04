<template>
  <div class="client-conversation">
    <div 
      ref="scrollTarget" 
      class="overflow-auto column items-center q-pr-sm non-selectable" 
      style="height: 0"
    >
      <q-infinite-scroll
        v-if="shiftNotes.length"
        :scroll-target="scrollTarget"
        :offset="250"
        @load="load"
        reverse
        class="limit-width full-width q-pb-md"
      >
        <chat-message
          v-for="(note, index) in shiftNotes"
          :key="index"
          ref="chatMessage"
          :message="note"
          :label="dayLabel(note, index)"
          @label-click="showDay(note)"
        />
      </q-infinite-scroll>
      <div
        v-else
        class="text-body2 text-italic q-my-lg"
      >{{ $t("noShiftNotes") }}</div>
    </div>
    <div ref="footer" class="column items-center bg-white border-top-grey">
      <q-resize-observer @resize="onResize" />
      <shift-note-input
        @add="didAddShiftNote"
        class="limit-width"
      />
    </div>
  </div>
</template>

<style lang="sass">
.client-conversation .limit-width
  max-width: 600px
</style>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { date } from "quasar";
import { ShiftNote } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import ChatMessage from "components/ChatMessage.vue";
import ShiftNoteInput from "components/ShiftNoteInput.vue";

const { isSameDate } = date;
const shiftNotesBatchSize = 20;

@Component({
  components: {
    ShiftNoteInput,
    ChatMessage
  }
})
export default class ClientConversation extends RecordMixin {
  @Ref() readonly scrollTarget!: HTMLElement;
  @Ref() readonly footer!: HTMLElement;
  @Ref() readonly chatMessage!: ChatMessage[];

  numberOfLoadedShiftNotes = shiftNotesBatchSize;

  get shiftNotes() {
    return this.allShiftNotes.slice(- this.numberOfLoadedShiftNotes);
  }
  get allShiftNotes() {
    return this.client?.shiftNotes
      .slice()
      .sort(ShiftNote.sortByCreated) || [];
  }

  private onResize() {
    const boundingRect = this.$el?.getBoundingClientRect();
    const headerHeight = (boundingRect?.top || 0);
    const footerHeight = this.footer.clientHeight;
    const bottomPadding = 24;
    const contentHeight = window.innerHeight - headerHeight - footerHeight - bottomPadding;
    this.scrollTarget.style.height = contentHeight + "px";
  }

  load(page: number, done: (stop?: boolean) => void) {
    this.numberOfLoadedShiftNotes = Math.max(
      (page + 1) * shiftNotesBatchSize,
      this.numberOfLoadedShiftNotes
    );
    done(this.numberOfLoadedShiftNotes >= this.allShiftNotes.length);
  }

  scrollToShiftNoteAtIndex(index: number) {
    this.chatMessage?.[index]?.$el.scrollIntoView({behavior: "smooth"});
  }

  scrollToDateIfNeeded() {
    const timestamp = parseInt(this.$route.params.day);

    if (!isNaN(timestamp)) {
      let index = this.allShiftNotes
        .findIndex(note => isSameDate(timestamp, note.created, "day"));
      const note = this.allShiftNotes[index];

      if (index < 0) {
        return;
      }

      index += this.shiftNotes.length - this.allShiftNotes.length;
      const additionalShiftNotesToLoad = 2;

      if (index < additionalShiftNotesToLoad) {
        this.numberOfLoadedShiftNotes += additionalShiftNotesToLoad - index;
        index = this.shiftNotes.findIndex(item => item == note);
      }

      setTimeout(() => this.scrollToShiftNoteAtIndex(index), 200);
    }
  }

  dayLabel(note: ShiftNote, index: number) {
    const previousNote = this.shiftNotes[index - 1] || undefined;

    if (!previousNote || !isSameDate(note.created, previousNote.created, "day")) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (isSameDate(note.created, today, "day")) {
        return this.$t("today")
      } else if (isSameDate(note.created, yesterday, "day")) {
        return this.$t("yesterday")
      } else {
        return this.$d(note.created, "DateHuge")
      }
    } else {
      return undefined;
    }
  }

  showDay(note: ShiftNote) {
    void this.$router.push({
      name: "clientReminders",
      params: {
        day: "" + note.created.getTime()
      }
    });
  }

  didAddShiftNote() {
    setTimeout(() => {
      this.scrollToShiftNoteAtIndex(this.shiftNotes.length - 1);
    })
  }

  created() {
    window.addEventListener("resize", this.onResize);
  }

  mounted() {
    this.onResize();
    this.scrollToDateIfNeeded();
    (window as any).foo = this
  }

  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  }
}
</script>