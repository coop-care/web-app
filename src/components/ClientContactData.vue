<template>
  <contact-view 
    v-if="contact"
    :contact="contact"
    no-degree
    no-relationship
    no-organization
    no-delete
  />
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import ContactView from "../components/ContactView.vue";

@Component({
  components: {
    ContactView
  }
})
export default class ClientContactDataView extends RecordMixin {
  get contact() {
    return this.client?.contact;
  }
}
</script>
