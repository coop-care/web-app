<template>
  <div>
    <transition
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeOutUp"
    >
      <q-banner
        v-if="isOffline"
        dense
        class="bg-negative text-white text-center q-py-xs"
        style="height: 32px"
      >
        <div class="text-caption text-weight-medium ellipsis">
          {{ $t("offlineBanner") }}
        </div>
      </q-banner>
    </transition>

    <transition
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeOutUp"
    >
      <q-banner
        v-if="banner && showBanner"
        dense
        class="bg-positive text-white default-banner"
      >
        <div class="text-body2 text-center text-weight-medium text-shadow">
          {{ banner.message }}
        </div>
        <template v-slot:action>
            <q-btn
              v-for="(action, index) in banner.actions"
              :key="'action' + index"
              flat
              dense
              no-caps
              rounded
              :label="action.label"
              class="q-px-sm text-weight-bold text-shadow"
              @click="action.action"
            />
        </template>
      </q-banner>
    </transition>
  </div>
</template>

<style lang="sass">
.text-shadow
  text-shadow: #0a0 0px 0px 15px
.default-banner
  display: block
  .q-banner__content, .q-banner__actions
    max-width: 1000px
    margin: 0 auto

</style>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { Team, TeamInvitation, TeamMember } from "../models";

@Component
export default class BannerView extends Vue {
  isOffline = !window.navigator.onLine;
  showBanner = true;

  @Watch("banner")
  onBannerChanged(newValue: any, oldValue: any) {
    if (!!newValue && !!oldValue && JSON.stringify(newValue) != JSON.stringify(oldValue)) {
      this.showBanner = false;
      setTimeout(() => this.showBanner = true, 300);
    }
  }

  get banner() {
    if (this.receivedInvitation) {
      const { team, invitation } = this.receivedInvitation;
      const username = this.$store.direct.state.teamMembers[invitation.invitedBy]?.username;

      return {
        message: this.$t("userReceivedTeamInvitation", {
          teamName: team.name,
          invitedBy: username || this.$t("someone")
        }),
        actions: [{
          label: this.$t("acceptInvitation"),
          action: () => this.acceptInvitation(team, invitation)
        },
        {
          label: this.$t("rejectInvitation"),
          action: () => this.deleteInvitation(team, invitation)
        }]
      }

    } else if (this.acceptedInvitation) {
      const { team, invitation } = this.acceptedInvitation;
      const username = Object.values(this.$store.direct.state.teamMembers)
        .find(member => 
          member.email?.toLowerCase() == invitation.invitee
        )?.username;

      return {
        message: this.$t("userAcceptedTeamInvitation", {
          teamName: team.name,
          invitee: username || this.$t("someone")
        }),
        actions: [{
          label: this.$t("ok"),
          action: () => this.deleteInvitation(team, invitation)
        }]
      }

    } else {
      return undefined;
    }
  }
  get receivedInvitation() {
    const state = this.$store.direct.state;
    const email = state.currentUser?.email?.toLowerCase();

    if (email) {
      return this.findTeamWithMatchingInvitation(state.teams, invitation => 
        !invitation.acceptedAt && invitation.invitee == email
      );
    } else {
      return undefined;
    }
  }
  get acceptedInvitation() {
    const state = this.$store.direct.state;
    const userId = state.currentUser?.userId;

    if (userId) {
      return this.findTeamWithMatchingInvitation(state.teams, invitation => 
        !!invitation.acceptedAt && invitation.invitedBy == userId
      );
    } else {
      return undefined;
    }
  }

  updateOfflineStatus() {
    this.isOffline = !window.navigator.onLine;
  }
  findTeamWithMatchingInvitation(teams: Team[], predicate: (invitation: TeamInvitation) => boolean) {
    let result: {team: Team, invitation: TeamInvitation} | undefined;

    teams.find(team => {
      const invitation = team.invites.find(predicate);

      if (invitation) {
        result = {
          team: team,
          invitation: invitation
        }
      }

      return !!invitation;
    });

    return result;
  }
  acceptInvitation(team: Team, invitation: TeamInvitation) {
    const currentUser = this.$store.direct.state.currentUser;
    let changes: Partial<Team>

    if (!currentUser || currentUser.email?.toLowerCase() != invitation.invitee) {
      return;
    }

    const newUserId = currentUser.userId;
    const userExists = (member: TeamMember) => member.userId == newUserId;
    const userNotExists = (member: TeamMember) => member.userId != newUserId;

    if (invitation.assignAdminRole) {
      changes = { admins: team.admins.concat([currentUser.userId]) }
    } else {
      changes = { members: team.members.concat([currentUser.userId]) }
    }

    if (team.alumni.find(userExists)) {
      changes.alumni = team.alumni.filter(userNotExists);
    }
    
    // trigger update on invites
    changes.invites = team.invites.slice();
    this.$store.direct.commit.acceptTeamInvitation(invitation);
    void this.$store.direct.dispatch.saveTeam({
      target: team,
      changes: changes
    }).then(() => 
      this.$store.direct.dispatch.fetchEssentialDataFromDB({locale: this.$root.$i18n.locale})
    );
  }
  deleteInvitation(team: Team, invitation: TeamInvitation) {
    void this.$store.direct.dispatch.saveTeam({
      target: team,
      changes: {
        invites: team.invites.filter(item => item != invitation)
      }
    });
  }

  mounted() {
    window.addEventListener("online", this.updateOfflineStatus);
    window.addEventListener("offline", this.updateOfflineStatus);
  }
}
</script>
