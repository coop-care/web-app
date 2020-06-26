<template>
  <div>
    <div class="row q-col-gutter-md q-mb-md">
      <q-input
        v-model="masterData.firstName"
        :label="$t('firstName')"
        class="col-sm col-12"
        autofocus
      />
      <q-input
        v-model="masterData.lastName"
        :label="$t('lastName')"
        class="col-sm col-12"
        @keyup.enter="$emit('save', masterData)"
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
      :disable="masterData.name.trim().length === 0"
      color="primary"
      rounded
      @click="$emit('save', masterData)"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { MasterData } from "../models/masterData";

@Component
export default class App extends Vue {
  masterData = new MasterData();
}
</script>
