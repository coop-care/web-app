<template>
  <div>
    <div class="row q-col-gutter-md q-mb-md">
      <q-input
        v-model="contact.firstName"
        :label="$t('firstName')"
        class="col-sm col-12"
        autofocus
      />
      <q-input
        v-model="contact.lastName"
        :label="$t('lastName')"
        class="col-sm col-12"
        @keyup.enter="$emit('save', contact)"
      />
    </div>
    <div class="q-mt-lg row justify-center">
      <q-btn
        @click="$emit('save', contact)"
        color="primary"
        rounded
        unelevated
        no-caps
        :disable="contact.name.trim().length === 0"
        :label="$t('add')"
        class="done-button"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import { Contact } from "../models";

@Component({
  emits: ["save"]
})
export default class NewClientView extends Vue {
  contact = new Contact();
}
</script>
