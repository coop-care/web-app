<template>
  <q-chat-message
    :stamp="$d(message.created, 'TimeSimple')"
    :sent="message.user == $store.direct.getters.userId"
    :bg-color="message.user == $store.direct.getters.userId ? 'primary-chat' : undefined"
    size="8"
  >
    <div>
      <div
        v-for="(line, index) in message.text.split('\n')"
        :key="index"
      >{{ line.trim() || "&nbsp;" }}</div>
    </div>
    <template v-slot:label>
      <q-btn
        v-if="label"
        :label="label"
        flat
        rounded
        no-caps
        color="primary"
        class="text-caption"
        @click="$emit('label-click')"
      />
    </template>
    <template v-slot:avatar>
      <signature
        :userId="message.user"
        :date="message.created"
        has-tooltip
        :class="[message.user == $store.direct.getters.userId ? 'q-message-avatar--sent' : 'q-message-avatar--received']"
      />
    </template>
  </q-chat-message>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";
import Signature from "components/Signature.vue";

export type ChatMessage = {
  text: string;
  created: Date;
  user: string;
}

@Component({
  components: {
    Signature
  },
  emits: ["label-click"]
})
export default class ChatMessageView extends Vue {
  @Prop({type: Object, required: true}) readonly message!: ChatMessage;
  @Prop({ type: String }) readonly label?: string;
  shiftNoteDraft = "";
}
</script>