<template>
  <div>
    <q-input v-model="name" :label="$t('newCustomer')" class="" />
    <q-btn
      :label="$t('save')"
      :disable="name.length === 0"
      color="primary"
      @click="$emit('save', name)"
    />
    <q-btn
      :label="$t('cancel')"
      @click="$emit('cancel')"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class App extends Vue {
  name = "";
}
</script>
