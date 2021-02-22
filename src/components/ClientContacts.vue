<template>
  <div>
    <split-view
      class="min-height"
      ref="splitView"
      @did-show-before="didShowBefore"
    >
      <template v-slot:before>
        <q-list 
          class="text-size-adjust-md q-mb-xl"
        >
          <no-data-item
            v-if="!contacts.length"
            :text-label="$t('noContacts')"
            :button-label="$t('addContact')"
            :hide-button="isDisabled"
            class="q-pa-md column"
            @click="addContact"
          />
          <q-item
            clickable
            v-for="contact in contacts"
            :key="contact.id"
            v-ripple
            :active="selectedContact == contact"
            active-class="text-primary"
            @click="selectContact(contact)"
          >
            <q-item-section>
              <q-item-label :class="!contact.name ? 'text-italic' : ''">
                {{ contact.name || $t("withoutNames") }}
              </q-item-label>
              <q-item-label caption>
                {{ description(contact) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </template>

      <template v-slot:after>
        <contact-view 
          v-if="selectedContact"
          :contact="selectedContact" 
          ref="contactView"
          @delete="deleteContact"
        />
        <contact-intervention-list
          v-if="selectedContact"
          :contact="selectedContact"
        />
      </template>
    </split-view>

    <q-page-sticky
      v-if="!isDisabled && isFABVisible"
      position="bottom-left"
      :offset="$q.screen.lt.sm ? [16, 10] : [56, 10]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        :title="$t('addContact')"
        @click="addContact"
      />
    </q-page-sticky>
  </div>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { Contact, Intervention, Task } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import SplitView from "../components/SplitView.vue";
import NoDataItem from "../components/NoDataItem.vue";
import ContactView from "../components/ContactView.vue";
import ContactInterventionList from "../components/ContactInterventionList.vue";

@Component({
  components: {
    SplitView,
    ContactView,
    ContactInterventionList,
    NoDataItem
  }
})
export default class ClientContactsView extends RecordMixin {
  @Ref() readonly splitView!: SplitView;
  @Ref() readonly contactView!: ContactView;

  isMounted = false;

  get contacts() {
    return this.client?.informalContacts || [];
  }
  get selectedContact() {
    const contactId = this.$route.params.contactId;
    if (contactId) {
      return this.contacts.find(contact => contact.id == contactId);
    } else {
      return undefined;
    }
  }
  get arrangedInterventions() {
    const interventionsByContact: Record<string, Intervention[]> = {};
    this.contacts.forEach(contact => interventionsByContact[contact.id] = []);
    this.client?.forAllReminders(reminder => {
      if (reminder instanceof Intervention && 
          reminder.arrangedIntervention && 
          reminder.hasCompletedOccurences &&
          !reminder.arrangedIntervention.isFinished) {
        interventionsByContact[reminder.arrangedIntervention?.assignee || ""]
          ?.push(reminder.arrangedIntervention);
      }
    });
    return interventionsByContact;
  }
  get isFABVisible() {
    return this.isMounted && (!this.splitView.isCollapsed || this.splitView.isBeforeVisible);
  }

  description(contact: Contact) {
    const relationship = this.localizeRelationship(contact.relationship);
    const interventions = this.arrangedInterventions[contact.id]
      ?.map(intervention => intervention.details).join(", ");
    return [relationship, interventions].filter(Boolean).join(" • ")
  }
  localizeRelationship(relationship: string) {
    return Contact.relationshipTypes.includes(relationship) ?
      this.$t(relationship) as string : 
      relationship;
  }
  selectContact(contact?: Contact, editMode = false) {
    const previousContactId = this.$route.params.contactId;

    if (contact) {
      this.splitView.showAfter();
      this.$route.params.contactId = contact.id;
    } else {
      this.splitView.showBefore();
      delete this.$route.params.contactId;
    }

    if (contact?.id == previousContactId) {
      return;
    }

    void this.$router.push({
      name: this.$route.name || undefined, 
      params: this.$route.params
    }).then(() => {
      if (contact && this.contactView) {
        this.contactView.isEditing = editMode;
      }
    });
  }
  didShowBefore() {
    if (this.$route.params.contactId) {
      delete this.$route.params.contactId;
      void this.$router.push({
        name: this.$route.name || undefined, 
        params: this.$route.params
      });
    }
  }
  addContact() {
    if (this.client) {
      const newContact = new Contact();
      this.$store.direct.commit.updateClientObject({
        target: this.client,
        changes: {
          informalContacts: this.contacts.concat([newContact])
        }
      });
      this.save();
      this.selectContact(newContact, true);
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
      this.save();
      this.selectContact();
    }
  }
  save() {
    void this.$store.direct.dispatch.saveClient({
      client: this.client
    });
  }

  mounted() {
    if (this.selectedContact) {
      this.splitView.showAfter();
    }

    this.isMounted = true;
  }
}
</script>
