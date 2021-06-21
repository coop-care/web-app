<template>
  <q-page
    padding
    class="limit-page-width width-sm"
  >
    <pull-to-refresh @refresh="updateClientsInAdditionalTeams">
      <div
        v-if="teamOptions.length == 1"
        class="q-mt-lg"
      >
        <div>{{ $t("noExistingTeams") }}</div>
        <q-btn 
          :label="$t('addTeam')"
          rounded
          no-caps
          color="primary"
          class="q-mt-md"
          @click="teamId = 'new'"
        />
      </div>
      <div v-else>
        <q-select
          v-model="teamId"
          :options="teamOptions"
          emit-value
          map-options
          class="text-h5"
        >
          <template v-slot:before>
            <span class="text-black">{{ $t("team") }}: </span>
          </template>
        </q-select>

        <div 
          v-if="!team" 
          class="q-mt-md"
        >
          {{ $t("teamNotFound") }}
        </div>
        <div v-else>

          <q-expansion-item
            v-if="isAdmin"
            v-model="expandedSettings"
            :label="$t('settingsTitle')"
            header-class="section-heading q-mt-md q-mb-sm q-px-none dense-avatar"
            switch-toggle-side
            :default-opened="false"
          >
            <div>
              <q-input
                :value="teamName"
                :label="$t('teamName')"
                ref="teamNameInput"
                @change="teamName = $event.target.value"
                style="max-width: 500px"
              />
              <div class="row items-center q-gutter-y-sm">
                <q-select
                  :value="team.backoffice"
                  @input="saveTeam({backoffice: $event || ''})"
                  :options="backofficeOptions"
                  :label="$t('backoffice')"
                  emit-value
                  map-options
                  dense-options
                  clearable
                  class="col"
                  style="max-width: 500px; min-width: 240px"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-italic text-grey">
                        {{ $t("noExistingBackOffices") }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-btn
                  :label="$t('goToBackofficeSettings')"
                  icon-right="fas fa-caret-right"
                  flat
                  rounded
                  no-caps
                  size="13px"
                  color="primary"
                  @click="$router.push({name: 'backOfficeSettings'})"
                />
              </div>
              <q-btn
                :label="$t('deleteTeam')"
                outline
                rounded
                no-caps
                color="negative"
                class="q-mt-xl"
                @click="deleteTeam"
              />
            </div>
          </q-expansion-item>

          <q-expansion-item
            v-model="expandedMembers"
            :label="$t('membersTitle') + ' (' + allMembers.length + ')'"
            header-class="section-heading q-mt-md q-mb-sm q-px-none dense-avatar"
            switch-toggle-side
          >
            <q-list style="max-width: 500px">
              <q-item v-for="member in allMembers" :key="member.userId" class="q-pl-none">
                <q-item-section side>
                  <signature :user="member"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label :class="isCurrentUser(member) ? 'text-weight-medium' : ''">
                    {{ member.username || $t('unknownMember') }} {{ isCurrentUserText(member) }}
                  </q-item-label>
                  <q-item-label
                    v-if="hasAdminRole(member)"
                    caption
                  >
                    <text-with-tooltip 
                      :text="$t('hasTeamAdminRole')"
                      :tooltip="$t('teamRolesDescription')"
                    />
                  </q-item-label>
                </q-item-section>
                <q-item-section 
                  v-if="isAdmin || isCurrentUser(member)"
                  side
                >
                  <action-menu :items="userActionItems(member)">
                    <template v-slot:admin-toggle>
                      <div>
                        <q-item>
                          <q-item-section>
                            <q-item-label>
                              <text-with-tooltip 
                                :text="hasAdminRole(member) ? $t('hasAdminRole') : $t('hasNoAdminRole')"
                                :tooltip="$t('teamRolesDescription')"
                                width="320px"
                              />
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-toggle 
                              :value="hasAdminRole(member)" 
                              @input="toggleAdminRole(member)"
                              :disable="!isAdmin"
                            />
                          </q-item-section>
                        </q-item>
                      </div>
                    </template>
                  </action-menu>
                </q-item-section>
              </q-item>
              <q-item v-for="invitation in invitations" :key="invitation.invitee" class="q-pl-none">
                <q-item-section side>
                  <signature/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-grey-7 text-italic">
                    {{ invitation.invitee }}
                  </q-item-label>
                  <q-item-label caption>
                    <span v-if="!invitation.assignAdminRole">{{ $t("invitedPersonCaption") }}</span>
                    <text-with-tooltip 
                      v-else
                      :text="$t('invitedPersonCaption') + '; ' + $t('hasTeamAdminRole')"
                      :tooltip="$t('teamRolesDescription')"
                    />
                  </q-item-label>
                </q-item-section>
                <q-item-section 
                  v-if="isAdmin"
                  side
                >
                  <action-menu :items="invitationActionItems(invitation)">
                    <template v-slot:admin-toggle>
                      <div>
                        <q-item>
                          <q-item-section>
                            <q-item-label>
                              <text-with-tooltip 
                                :text="invitation.assignAdminRole ? $t('willBecomeAdminRole') : $t('hasNoAdminRole')"
                                :tooltip="$t('teamRolesDescription')"
                                width="320px"
                              />
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-toggle 
                              :value="invitation.assignAdminRole" 
                              @input="toggleInvitationAdminRole(invitation)"
                              :disable="!isAdmin"
                            />
                          </q-item-section>
                        </q-item>
                      </div>
                    </template>
                  </action-menu>
                </q-item-section>
              </q-item>
              <q-btn
                v-if="isAdmin && !isDemo"
                :label="$t('addTeamMember')"
                icon="add"
                outline
                rounded
                no-caps
                color="primary"
                class="q-mt-md"
                @click="inviteTeamMember"
              />
            </q-list>
          </q-expansion-item>
          
          <q-expansion-item
            v-model="expandedClients"
            :label="$tc('client', 2) + ' (' + clients.length + ')'"
            header-class="section-heading q-mt-md q-mb-sm q-px-none dense-avatar"
            switch-toggle-side
          >
            <q-list style="max-width: 500px">
              <q-item 
                v-for="(client, index) in clients"
                :key="'client' + index"
                :class="'q-pl-none ' + (!!client.leftAt ? 'text-grey-7 text-italic' : '')"
              >
                <q-item-section>
                  <q-item-label>
                    {{ client.contact.name }}
                  </q-item-label>
                  <q-item-label 
                    v-if="captionForClient(client)"
                    caption
                  >
                    <span>{{ captionForClient(client) }}</span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <action-menu :items="clientActionItems(client)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

        </div>
      </div>
    </pull-to-refresh>
  </q-page>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { QInput } from "quasar";
import VueI18n from "vue-i18n";
import { TeamMember, Team, TeamInvitation, Client } from "../models";
import ClientActionMixin from "../mixins/ClientActionMixin";
import Signature from "../components/Signature.vue";
import ActionMenu from "../components/ActionMenu.vue";
import TextWithTooltip from "../components/TextWithTooltip.vue";
import PullToRefresh from "../components/PullToRefresh.vue";
import TeamInvitationDialog from "../components/TeamInvitationDialog.vue";

@Component({
  components: {
    Signature,
    ActionMenu,
    TextWithTooltip,
    PullToRefresh,
  },
})
export default class TeamSettingsPage extends ClientActionMixin {
  @Ref() readonly teamNameInput!: QInput;

  expandedSettings = true;
  expandedMembers = true;
  expandedClients = true;
  localeChangedKey = Math.random();

  get teamId() {
    return this.currentUser?.activeTeam || "";
  }
  set teamId(value) {
    if (value == "new") {
      if (this.currentUser) {
        const names = ["Tokyo", "Delhi", "Shanghai", "São Paulo", "Mexico City", "Cairo", 
          "Mumbai", "Beijing", "Dhaka", "Osaka", "New York City", "Karachi", "Buenos Aires"];
        const name = "\"" + names[Math.floor(Math.random() * names.length)] + "\”";
        const team = new Team(name, this.currentUser.userId);
        void this.$store.direct.dispatch.addTeam(team);
        this.expandedSettings = true;
        this.expandedMembers = true;
        this.expandedClients = true;
        setTimeout(() => this.teamNameInput.focus(), 100);
      }
    } else {
      void this.$store.direct.dispatch.changeTeam(value)
        .then(() => this.updateClientsInAdditionalTeams());
    }
  }
  get teamName() {
    return this.team?.name || "";
  }
  set teamName(value) {
    if (value) {
      void this.saveTeam({name: value});
    }
  }

  get teamOptions() {
    return this.$store.direct.state.teams.map(team => {
      return {
        label: team.name,
        value: team.id
      }
    }).concat({
      label: this.$t("addTeam") as string,
      value: "new"
    })
  }
  get allMembers() {
    return this.team?.allMembers
      .map(id => this.$store.direct.state.teamMembers[id] || {})
      .sort(TeamMember.sortByName) || [];
  }
  get clients() {
    return this.$store.direct.state.clients
      .slice()
      .sort(Client.sortByActiveAndLastName) || [];
  }
  get invitations() {
    return this.team?.invites.filter(invitation => !invitation.acceptedAt) || [];
  }
  get isDemo() {
    return process.env.BACKEND == "demo";
  }
  get infoDialog() {
    return {
      persistent: true,
      ok: {
        rounded: true
      }
    }
  }
  get backofficeOptions() {
    return this.$store.direct.state.backoffices.map(item => {
      return {
        label: item.name,
        value: item.id
      }
    });
  }

  isCurrentUser(member: TeamMember) {
    return this.currentUser?.equals(member) || false;
  }
  isCurrentUserText(member: TeamMember) {
    if (this.isCurrentUser(member)) {
      return this.$t("isCurrentUser") as string;
    } else {
      return "";
    }
  }
  hasAdminRole(member: TeamMember) {
    return this.team?.admins.includes(member.userId) || false
  }
  isSingleAdmin(member: TeamMember) {
    return this.hasAdminRole(member) &&  this.team && 
        this.team.admins.filter(id => id != member.userId).length == 0
  }
  userActionItems(member: TeamMember) {
    return [
      {
        customType: "admin-toggle",
        condition: this.isAdmin && ((this.team?.members.length || 0) + (this.team?.admins.length || 0) > 1)
      },
      {
        name: this.isCurrentUser(member) ? this.$t("leaveTeam") : this.$t("removeFromTeam"),
        icon: "fas fa-user-minus",
        isDestructive: true,
        action: this.removeFromTeam(member),
        condition: (this.team?.members.length || 0) + (this.team?.admins.length || 0) > 1
      },
    ];
  }
  invitationActionItems(invitation: TeamInvitation) {
    return [
      {
        customType: "admin-toggle",
        condition: this.isAdmin
      },
      {
        name: this.$t("resendInvitation"),
        icon: "fas fa-paper-plane",
        action: () => this.sendInvitation(invitation),
        condition: this.isAdmin
      },
      {
        name: this.$t("withdrawInvitation"),
        icon: "fas fa-user-minus",
        isDestructive: true,
        action: this.removeInvitation(invitation.invitee),
        condition: this.isAdmin
      },
    ];
  }
  clientActionItems(client: Client) {
    return this.clientActions(client);
  }
  captionForClient(client: Client) {
    const fragments: VueI18n.TranslateResult[] = [];

    if (!!client.leftAt) {
      fragments.push(this.$t("isArchived"));
    }
    if (this.isClientInAdditionalTeam(client)) {
      fragments.push(this.$t("isSharedWithAdditionalTeams"));
    }

    return fragments.join(", ")
  }
  removeFromTeam(member: TeamMember) {
    return () => {
      if (!this.team) {
        return;
      }

      if (this.isSingleAdmin(member)) {
          return this.presentSingleAdminError();
      }

      void this.saveTeam({
        admins: this.team.admins.filter(id => id != member.userId),
        members: this.team.members.filter(id => id != member.userId),
        alumni: this.team.alumni.concat([member.makeAlumnus()])
      });
    };
  }
  toggleAdminRole(member: TeamMember) {
    if (!this.team) {
      return;
    }

    if (this.isSingleAdmin(member)) {
        return this.presentSingleAdminError();
    }

    if (this.hasAdminRole(member)) {
      void this.saveTeam({
        admins: this.team.admins.filter(id => id != member.userId),
        members: this.team.members.concat([member.userId])
      });
    } else {
      void this.saveTeam({
        admins: this.team.admins.concat([member.userId]),
        members: this.team.members.filter(id => id != member.userId)
      });
    }
  }
  presentSingleAdminError() {
    this.$q.dialog({
      title: this.$t("oneAdminRequiredErrorTitle") as string,
      message: this.$t("oneAdminRequiredErrorMessage") as string,
      ...this.infoDialog
    });
  }
  inviteTeamMember() {
    this.$q.dialog({
      component: TeamInvitationDialog,
      parent: this
    }).onOk((email: string) => {
      const currentUserId = this.currentUser?.userId;
      const invitee = email.toLowerCase();
      const inviteeAsMember = this.team?.allMembers
        .map(userId => this.$store.direct.state.teamMembers[userId])
        .find(member => member?.email?.toLowerCase() == invitee);

      if (!!inviteeAsMember) {
        this.presentInvitationError(
          undefined,
          this.$t("teamMemberAlreadyExistsErrorMessage", { name: inviteeAsMember.username })
        );
      } else if (currentUserId && invitee) {
        const invitation = new TeamInvitation(invitee, currentUserId, this.$root.$i18n.locale);
        this.sendInvitation(invitation);
      } else {
        this.presentInvitationError();
      }
    });
  }
  sendInvitation(invitation: TeamInvitation) {
    if (this.team) {
      this.$store.direct.dispatch
        .inviteTeamMember({
          team: this.team, 
          invitation: invitation, 
          name: this.currentUser?.username || this.$t("someone", invitation.locale) as string
        })
        .catch(this.presentInvitationError)
    } else {
      this.presentInvitationError();
    }
  }
  presentInvitationError(error?: any, message = this.$t("teamMemberInvitationFailed")) {
    this.$q.dialog({
      title: this.$t("genericErrorTitle") as string,
      message: message as string,
      ...this.infoDialog
    });
  }
  toggleInvitationAdminRole(invitation: TeamInvitation) {
    if (this.team) {
      this.$store.direct.commit.updateObject({
        target: invitation, 
        changes: {
          assignAdminRole: !invitation.assignAdminRole
        }
      });
      void this.saveTeam({});
    }
  }
  removeInvitation(invitee: string) {
    return () => {
      if (this.team) {
        void this.saveTeam({
          invites: this.team.invites.filter(invitation => invitation.invitee != invitee)
        });
      }
    }
  }
  deleteTeam() {
    const team = this.team;
    if (team) {
      const state = this.$store.direct.state;
      const clientIds = state.isLoadingClientList ? 
        team.clients : 
        state.clients.map(client => client._id?.toHexString() || "");
      const clientIdsNotShared = clientIds.filter(id => !this.clientsInAdditionalTeams.includes(id))

      if (clientIdsNotShared.length) {
        this.$q.dialog({
          title: this.$t("teamHasClientsErrorTitle") as string,
          message: this.$t("teamHasClientsMessage") as string,
          ...this.infoDialog
        });
      } else {
        this.$q.dialog({
          title: this.$t("confirmDeletionTitle") as string,
          message: this.$t("confirmTeamDeletionMessage", {name: team.name}) as string,
          persistent: true,
          ok: {
            label: this.$t("delete"),
            rounded: true,
            flat: true,
            noCaps: true,
            color: "negative"
          },
          cancel: {
            rounded: true,
            flat: true,
            noCaps: true
          }
        }).onOk(() =>
          void this.$store.direct.dispatch.deleteTeam(team)
        );
      }
    }
  }

  created() {
    this.$root.$on("did-change-locale", () => this.localeChangedKey = Math.random());
  }
  mounted() {
    if (this.team) {
      this.updateClientsInAdditionalTeams();
    }
  }
  beforeDestroy() {
    this.$root.$off("did-change-locale");
  }
}
</script>
