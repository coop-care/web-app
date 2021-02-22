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
    <q-btn
      :label="$t('cancel')"
      @click="$emit('cancel')"
      flat
      color="primary"
      rounded
      class="on-left shadow-1"
    />
    <q-btn
      :label="$t('save')"
      :disable="contact.name.trim().length === 0"
      color="primary"
      rounded
      @click="$emit('save', contact)"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Contact } from "../models";

@Component
export default class App extends Vue {
  contact = new Contact();
}
</script>
