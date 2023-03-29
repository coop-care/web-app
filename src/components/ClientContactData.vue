<template>
  <contact-view 
    v-if="contact"
    :contact="contact"
    no-relationship
    no-organization
    no-delete
    class="q-mb-lg"
    @save="saveClient"
  />
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import RecordMixin, { RecordMixinInterface } from "../mixins/RecordMixin";
import ContactView from "../components/ContactView.vue";

interface ClientContactDataView extends RecordMixinInterface {};

@Component({
  components: {
    ContactView
  },
  mixins: [RecordMixin]
})
class ClientContactDataView extends Vue {
  get contact() {
    return this.client?.contact;
  }
}

export default ClientContactDataView;
</script>
