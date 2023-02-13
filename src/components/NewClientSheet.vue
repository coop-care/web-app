<template>
  <editing-sheet
    ref="editingSheet"
    :title="$t('newClient')"
    is-data-available
    :is-initially-visible="false"
  >
    <new-client-view
      @save="addClient"
    />
  </editing-sheet>
</template>

<style lang="sass">
</style>

<script lang="ts">
import { Component, Vue, Ref } from "vue-property-decorator";
import EditingSheet from "../components/EditingSheet.vue";
import NewClientView from "../components/NewClient.vue";
import { Client, Contact } from "../models";

@Component({
  components: {
    EditingSheet,
    NewClientView
  }
})
export default class NewClientSheet extends Vue {
  @Ref() readonly editingSheet!: EditingSheet;

  addClient(contact: Contact) {
    const client = new Client();
    client.contact = contact;
    this.$store.direct.dispatch
      .addClient(client)
      .then((client) => {
        void this.$router.push({
          name: "client",
          params: { clientId: client._id?.toString() || "" },
        });
        this.editingSheet.confirm();
      })
      .catch(console.error);
  }

  created() {
    this.$root.$on("new-client", () => this.editingSheet.visible = true);
  }

  beforeDestroy() {
    this.$root.$off("new-client")
  }
}
</script>
