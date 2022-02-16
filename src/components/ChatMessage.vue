<template>
  <q-chat-message
    :text="[message.text]"
    :stamp="timeFormatter.format(message.created)"
    :sent="message.user == $store.direct.getters.userId"
    :bg-color="message.user == $store.direct.getters.userId ? 'primary-chat' : undefined"
    size="8"
    text-sanitize
    stamp-sanitize
    label-sanitize
    name-sanitize
  >
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
import { Vue, Component, Prop } from "vue-property-decorator";
import Signature from "components/Signature.vue";

export type ChatMessage = {
  text: string;
  created: Date;
  user: string;
}

@Component({
  components: {
    Signature
  }
})
export default class ChatMessageView extends Vue {
  @Prop({type: Object, required: true}) readonly message!: ChatMessage;
  @Prop(String) readonly label?: string;
  shiftNoteDraft = "";

  get timeFormatter() {
    return new Intl.DateTimeFormat(this.$root.$i18n.locale, {
      hour: "numeric",
      minute: "numeric",
    });
  }
}
</script>