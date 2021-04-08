<template>
  <div 
    v-if="isNew"
    :class="['q-pb-md column', $q.screen.gt.xs ? 'q-px-md' : 'q-px-xs']"
  >
    <div class="text-h6 text-center q-mb-lg">{{ $t("newFormalContactTitle") }}</div>
    <div 
      v-if="knownContacts.length > 0"
      class="column"
    >
      <q-select 
        v-model="knownContactId"
        :options="filteredOptions"
        :label="$t('findKnownContact') + ':'"
        clearable
        map-options
        emit-value
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        color="primary"
        class="q-mb-md"
        @filter="filterOptions"
      >
        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            v-on="scope.itemEvents"
          >
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label
                caption
                lines="1"
              >{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-btn 
        :label="$t('addSelectedContact')"
        icon-right="fas fa-caret-right"
        @click="addKnownContact"
        color="primary"
        rounded
        no-caps
        :outline="!knownContact"
        :disable="!knownContact"
        class="self-center"
      />
      <div class="text-subtitle1 text-weight-bold text-center q-my-md">{{ $t("or") }}</div>
    </div>
    <q-btn 
      :label="$t('addNewContact')"
      icon-right="fas fa-caret-right"
      @click="addContact()"
      color="primary"
      rounded
      no-caps
      :outline="!!knownContact"
      class="self-center"
    />
  </div>

  <div v-else-if="contact">
    <contact-view 
      :contact="contact" 
      no-birthday
      no-relationship
      @save="saveClient"
      @delete="deleteContact"
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
import { Task, Intervention, Contact, LabeledValue } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import ContactView from "../components/ContactView.vue";
import { ObjectID } from "bson";

@Component({
  components: {
    ContactView
  }
})
export default class ClientFormalContactView extends RecordMixin {
  knownContactId = "";
  filteredOptions: LabeledValue<string>[] = [];

  get isNew() {
    return this.$route.params.formalContactId == "new";
  }
  get contact() {
    const contactId = this.$route.params.formalContactId;

    if (contactId) {
      return this.client?.formalContacts.find(contact => contact.id.equals(contactId));
    } else {
      return undefined;
    }
  }
  get referenceCount() {
    return this.contact 
      ? this.$store.direct.getters.referenceCountForFormalContact(this.contact.id)
      : 0;
  }
  get knownContacts() {
    const formalContactIds = this.client?.formalContacts
      .map(contact => contact.id.toHexString()) || [];
    return this.$store.direct.getters.formalContacts
      .filter(contact => !formalContactIds.includes(contact.id.toHexString()));
  }
  get knownContactOptions() {
    return this.knownContacts.map(contact => ({
      label: [contact.name, this.localizeProfession(contact.profession)].filter(Boolean).join(", "),
      description: contact.postalAddresses.length 
        ? (this.$t("postalAddressFormat", contact.postalAddresses[0].value) as string).replace(/(\\n)+/g, ", ")
        : "",
      value: contact.id.toHexString()
    }))
  }
  get knownContact() {
    return this.knownContacts.find(contact => contact.id.equals(this.knownContactId))
  }

  localizeProfession(profession: string) {
    return this.localizeKey(profession, Contact.professionTypes);
  }
  localizeKey(keyOrText: string, keys: string[]) {
    return keys.includes(keyOrText) ? this.$t(keyOrText) as string : keyOrText;
  }
  filterOptions(inputValue: string, doneFn: (callbackFn: () => void) => void) {
    doneFn(() => {
      if (inputValue) {
        const regExp = new RegExp(
          // comment next line to search to word beginnings:
          "(:?^|\\b)" +
          inputValue.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
          "gi"
        );
        this.filteredOptions = this.knownContactOptions
          .filter(option =>
              new RegExp(regExp).test(option.label) ||
              new RegExp(regExp).test(option.description)
          );
      } else {
        this.filteredOptions = this.knownContactOptions;
      }
    });
  }

  showContact(contactId: ObjectID, editMode = true) {
    const query =  editMode ? {edit: "1"} : undefined;
    this.pushRoute("clientFormalContact", {formalContactId: contactId.toHexString()}, query);
  }
  addKnownContact() {
    if (this.knownContact) {
      this.addContact(this.knownContact, false);
    }
  }
  addContact(newContact = new Contact(), editMode = true) {
    if (this.client) {
      this.$store.direct.commit.updateClientObject({
        target: this.client,
        changes: {
          formalContacts: this.client.formalContacts.concat([newContact])
        }
      });
      void this.saveClient();
      this.showContact(newContact.id, editMode);
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
          formalContacts: client.formalContacts.filter(contact => !contact.id.equals(contactId))
        }
      });
      void this.saveClient();
      setTimeout(() => window.scrollTo({top: 0, behavior: "smooth"}))
    }
  }
}
</script>
