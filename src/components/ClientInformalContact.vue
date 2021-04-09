<template>
  <div v-if="contact">
    <contact-view 
      :contact="contact" 
      no-birthday
      no-profession
      no-organization
      @save="saveClient"
      @delete="deleteContact"
    />
    <contact-intervention-list
      :contact="contact" 
      class="q-mb-lg"
    />
  </div>
  
  <div
    v-else
    :class="['q-pt-xs q-pb-md text-center text-body1 text-grey-7 text-italic', $q.screen.gt.xs ? 'q-px-md' : 'q-px-xs']"
  >
    {{ $t("contactNotFound") }}
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
      return this.client?.informalContacts.find(contact => contact.id.equals(contactId));
    } else {
      return undefined;
    }
  }

  deleteContact(contactId: string) {
    const client = this.client;

    if (client) {
      client.forAllReminders((reminder, problem) => {
        if (reminder instanceof Intervention && 
            (reminder.receiver?.equals(contactId)) && 
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
          informalContacts: client.informalContacts.filter(contact => !contact.id.equals(contactId))
        }
      });
      void this.saveClient();
      setTimeout(() => window.scrollTo({top: 0, behavior: "smooth"}))
    }
  }
}
</script>
