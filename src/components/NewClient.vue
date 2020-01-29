<template>
  <div>
    <q-input
      v-model="name"
      :label="$t('newClient')"
      class="q-mb-md"
      autofocus
      @keyup.enter="$emit('save', name)"
    />
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
      :disable="name.length === 0"
      color="primary"
      rounded
      @click="$emit('save', name)"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class App extends Vue {
  name = "";
}
</script>
