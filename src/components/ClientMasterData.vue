<template>
    <split-view
      v-if="client"
      class="min-height"
      ref="splitView"
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
          <q-item 
            clickable
            @click="showRoute('clientHealthInformation')"
            v-ripple
            :active="$route.name == 'clientHealthInformation' || (!isCollapsed && isDefaultRoute)"
            class="q-pl-lg q-pr-sm active-background"
          >
            <q-item-section>
              <q-item-label>{{ $t("healthInformation") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="fas fa-angle-right"
              />
            </q-item-section>
          </q-item>
          <q-item 
            clickable
            @click="showRoute('clientContactData')"
            v-ripple
            :active="$route.name == 'clientContactData'"
            class="q-pl-lg q-pr-sm active-background"
          >
            <q-item-section>
              <q-item-label>{{ $t("contactDetails") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="fas fa-angle-right"
              />
            </q-item-section>
          </q-item>
          <q-item
            clickable
            @click="showRoute('clientAgreements')"
            v-ripple
            :active="$route.name == 'clientAgreements'"
            class="q-pl-lg q-pr-sm active-background"
          >
            <q-item-section>
              <q-item-label>{{ $t("agreements") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="fas fa-angle-right"
              />
            </q-item-section>
          </q-item>
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
          <q-item
            clickable
            v-for="contact in client.informalContacts"
            :key="contact.id"
            v-ripple
            :active="$route.name == 'clientInformalContact' && $route.params.informalContactId == contact.id"
            active-class="text-primary"
            class="q-pl-lg q-pr-sm active-background"
            @click="showInformalContact(contact.id)"
          >
            <q-item-section>
              <q-item-label :class="!contact.name ? 'text-italic' : ''">
                {{ contact.name || $t("withoutNames") }}
              </q-item-label>
              <q-item-label caption>
                {{ description(contact) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="fas fa-angle-right"
              />
            </q-item-section>
          </q-item>
          <q-item 
            v-if="false"
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
                @click.stop="addInformalContact"
                :title="$t('addContact')"
                class="shadow-1"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </template>

      <template v-slot:after>
        <client-health-information v-if ="isDefaultRoute"/>
        <router-view v-else />
      </template>
    </split-view>
</template>

<style lang="sass">
.q-item
  .fa-angle-right
    color: #bbbbbb
  &.active-background.q-item--active .fa-angle-right
    color: var(--q-color-primary)
</style>

<script lang="ts">
import { Component, Ref, Mixins } from "vue-property-decorator";
import { Contact, Intervention } from "../models";
import RecordMixin from "../mixins/RecordMixin";
import ClientActionMixin from "../mixins/ClientActionMixin";
import ActionMenu from "../components/ActionMenu.vue";
import ClientHealthInformation from "../components/ClientHealthInformation.vue";
import SplitView from "../components/SplitView.vue";

@Component({
  components: {
    ActionMenu,
    ClientHealthInformation,
    SplitView
  }
})
export default class ClientMasterData extends Mixins(RecordMixin, ClientActionMixin) {
  isCollapsed = false;
  @Ref() readonly splitView!: SplitView;

  get arrangedInterventions() {
    const interventionsByContact: Record<string, Intervention[]> = {};
    this.client?.informalContacts.forEach(contact => interventionsByContact[contact.id] = []);
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
  get isDefaultRoute() {
    return this.$route.name == "clientMasterData";
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

  showRoute(name: string, params: Record<string, string> = {}, query: Record<string, string> = {}) {
    this.splitView.showAfter();
    this.pushRoute(name, params, query);
  }
  showInformalContact(contactId: string, editMode = false) {
    const query =  editMode ? {edit: "1"} : undefined;
    this.showRoute("clientInformalContact", {informalContactId: contactId}, query);
  }
  showFormalContact(contactId: string) {
    this.$route.params.formalContactId = contactId;
    this.showRoute("clientFormalContact");
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
