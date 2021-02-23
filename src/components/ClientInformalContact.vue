<template>
  <div v-if="contact">
    <contact-view 
      :contact="contact" 
      no-degree
      no-birthday
      no-profession
      no-organization
      @delete="deleteContact"
    />
    <contact-intervention-list
      :contact="contact" 
    />
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { Task, Intervention } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import ContactView from "../components/ContactView.vue";
import ContactInterventionList from "../components/ContactInterventionList.vue";

@Component({
  components: {
    ContactView,
    ContactInterventionList
  }
})
export default class ClientInformalContactView extends RecordMixin {

  get contact() {
    const contactId = this.$route.params.informalContactId;

    if (contactId) {
      return this.client?.informalContacts.find(contact => contact.id == contactId);
    } else {
      return undefined;
    }
  }

  deleteContact(contactId: string) {
    const client = this.client;

    if (client) {
      client.forAllReminders((reminder, problem) => {
        if (reminder instanceof Intervention && 
            (reminder.receiver == contactId) && 
            !reminder.isFinished) {
          this.$store.direct.commit.endReminder({
            task: new Task(reminder, problem?.id, reminder.occurrences[0]),
            client: client
          });
        }
      });
      this.$store.direct.commit.updateClientObject({
        target: client,
        changes: {
          informalContacts: client.informalContacts.filter(contact => contact.id != contactId)
        }
      });
      void this.saveClient();
      const parentRoute = this.$route.matched[this.$route.matched.length - 2];
      void this.$router.replace({name: parentRoute.name, params: this.$route.params});
    }
  }
}
</script>