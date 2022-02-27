<template>
  <split-view
    v-if="client"
    class="min-height client-master-data-split-view"
    ref="splitView"
    :scrollOffsetTop="-60"
    @did-show-before="didShowBefore"
    @update:is-collapsed="isCollapsed = $event"
  >
    <template v-slot:before>
      <q-list 
        class="text-size-adjust-md q-mb-xl"
      >
        <q-item class="q-px-sm q-pb-none text-subtitle1 text-weight-bold">
          <q-item-section>
            <q-item-label class="ellipsis">{{ client.contact.name }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <action-menu
              :items="clientActions(client)"
            />
          </q-item-section>
        </q-item>
        <navigation-items
          :items="navigationItems"
          type="splitview"
        />

        <q-item class="q-mt-sm q-px-sm q-pb-none text-subtitle1 text-weight-bold">
          <q-item-section>
            <q-item-label class="ellipsis">{{ $t("informalContacts") }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="!isDisabled"
              icon="add"
              round
              outline
              size="10.5px"
              color="primary"
              @click.stop="addInformalContact"
              :title="$t('addContact')"
              class="shadow-1"
            />
          </q-item-section>
        </q-item>
        <navigation-items
          :items="informalContactItems"
          type="splitview"
        />

        <q-item 
          class="q-mt-sm q-px-sm q-pb-none text-subtitle1 text-weight-bold"
        >
          <q-item-section>
            <q-item-label class="ellipsis">{{ $t("formalContacts") }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="!isDisabled"
              icon="add"
              round
              outline
              size="10.5px"
              color="primary"
              @click.stop="addFormalContact"
              :title="$t('addContact')"
              class="shadow-1"
            />
          </q-item-section>
        </q-item>
        <navigation-items
          :items="formalContactItems"
          type="splitview"
        />
      </q-list>
    </template>

    <template v-slot:after>
      <client-health-information v-if ="isDefaultRoute"/>
      <router-view v-else />
    </template>
  </split-view>
</template>

<style lang="sass">
.client-master-data-split-view
  @media print
    .q-splitter__separator
      display: none
    .q-splitter__before
      width: 0 !important
</style>

<script lang="ts">
import { Component, Ref, Mixins } from "vue-property-decorator";
import { ObjectID } from "bson";
import { Contact, Intervention } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import ClientActionMixin from "../mixins/ClientActionMixin";
import ActionMenu from "../components/ActionMenu.vue";
import ClientHealthInformation from "../components/ClientHealthInformation.vue";
import SplitView from "../components/SplitView.vue";
import NavigationItems from "../components/NavigationItems.vue";
import { countryCodes as billingCountries } from "src/components/ClientBillingSettings/index.vue";

@Component({
  components: {
    ActionMenu,
    ClientHealthInformation,
    SplitView,
    NavigationItems,
  }
})
export default class ClientMasterData extends Mixins(RecordMixin, ClientActionMixin) {
  isCollapsed = false;
  @Ref() readonly splitView!: SplitView;

  get navigationItems() {
    return [{
      label: this.$t("healthInformation").toString(),
      action: () => this.showRoute("clientHealthInformation"),
      active: this.$route.name == "clientHealthInformation" || (!this.isCollapsed && this.isDefaultRoute),
    }, {
      label: this.$t("billingData").toString(),
      action: () => this.showRoute("clientBillingInformation"),
      route: "clientBillingInformation",
      visible: billingCountries.includes(this.$store.direct.getters.countryCode),
    }, {
      label: this.$t("contactDetails").toString(),
      action: () => this.showRoute("clientContactData"),
      route: "clientContactData",
    }, {
      label: this.$t("agreements").toString(),
      action: () => this.showRoute("clientAgreements"),
      route: "clientAgreements",
    }]
  }
  get informalContactItems() {
    return this.client?.informalContacts.map(contact => ({
      label: contact.name || this.$t("withoutNames"),
      caption: this.describeInformalContact(contact),
      labelClass: !contact.name ? "text-italic" : "",
      action: () => this.showInformalContact(contact.id),
      active: this.$route.name == "clientInformalContact" && contact.id.equals(this.$route.params.informalContactId)
    }))
  }
  get formalContactItems() {
    return this.client?.formalContacts.map(contact => ({
      label: contact.name || this.$t("withoutNames"),
      caption: this.describeFormalContact(contact),
      labelClass: !contact.name ? "text-italic" : "",
      action: () => this.showFormalContact(contact.id),
      active: this.$route.name == "clientFormalContact" && contact.id.equals(this.$route.params.formalContactId)
    }))
  }
  get isDefaultRoute() {
    return this.$route.name == "clientMasterData";
  }
  get arrangedInterventions() {
    const interventionsByContact: Record<string, Intervention[]> = {};
    this.client?.informalContacts.forEach(contact => interventionsByContact[contact.id.toHexString()] = []);
    this.client?.forAllReminders(reminder => {
      if (reminder instanceof Intervention && 
          reminder.arrangedIntervention && 
          reminder.hasCompletedOccurences &&
          !reminder.arrangedIntervention.isFinished) {
        interventionsByContact[reminder.arrangedIntervention?.assignee?.toHexString() || ""]
          ?.push(reminder.arrangedIntervention);
      }
    });
    return interventionsByContact;
  }

  describeInformalContact(contact: Contact) {
    const relationship = this.localizeRelationship(contact.relationship);
    const interventions = this.arrangedInterventions[contact.id.toHexString()]
      ?.map(intervention => intervention.details).join(", ");
    return [relationship, interventions].filter(Boolean).join(" • ")
  }
  describeFormalContact(contact: Contact) {
    const profession = this.localizeProfession(contact.profession);
    const interventions = this.arrangedInterventions[contact.id.toHexString()]
      ?.map(intervention => intervention.details).join(", ");
    return [profession, interventions].filter(Boolean).join(" • ")
  }
  localizeRelationship(relationship: string) {
    return this.localizeKey(relationship, Contact.relationshipTypes);
  }
  localizeProfession(profession: string) {
    return this.localizeKey(profession, Contact.professionTypes);
  }
  localizeKey(keyOrText: string, keys: string[]) {
    return keys.includes(keyOrText) ? this.$t(keyOrText) as string : keyOrText;
  }

  showRoute(name: string, params: Record<string, string> = {}, query: Record<string, string> = {}) {
    this.splitView.showAfter();
    this.pushRoute(name, params, query);
  }
  showInformalContact(contactId: ObjectID, editMode = false) {
    const query =  editMode ? {edit: "1"} : undefined;
    this.showRoute("clientInformalContact", {informalContactId: contactId.toHexString()}, query);
  }
  showFormalContact(contactId: ObjectID, editMode = false) {
    const query =  editMode ? {edit: "1"} : undefined;
    this.showRoute("clientFormalContact", {formalContactId: contactId.toHexString()}, query);
  }
  addInformalContact() {
    if (this.client) {
      const newContact = new Contact();
      this.$store.direct.commit.updateClientObject({
        target: this.client,
        changes: {
          informalContacts: this.client.informalContacts.concat([newContact])
        }
      });
      void this.saveClient();
      this.showInformalContact(newContact.id, true);
    }
  }
  addFormalContact() {
    const formalContactIds = this.client?.formalContacts
      .map(contact => contact.id.toHexString()) || [];
    const knownContacts = this.$store.direct.getters.formalContacts
      .filter(contact => !formalContactIds.includes(contact.id.toHexString()));

    if (knownContacts.length > 0) {
      this.showRoute("clientFormalContact", {formalContactId: "new"});
    } else if (this.client) {
      const newContact = new Contact();
      this.$store.direct.commit.updateClientObject({
        target: this.client,
        changes: {
          formalContacts: this.client.formalContacts.concat([newContact])
        }
      });
      void this.saveClient();
      this.showFormalContact(newContact.id, true);
    }
  }
  didShowBefore() {
    if (!this.isDefaultRoute) {
      void this.$router.push({
        name: "clientMasterData", 
        params: this.$route.params
      });
    }
  }

  created() {
    if (this.team) {
      this.updateClientsInAdditionalTeams();
    }
  }
  mounted() {
    if (!this.isDefaultRoute) {
      this.splitView.showAfter(false);
    }
  }
}
</script>
