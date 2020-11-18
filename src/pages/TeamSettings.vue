<template>
  <q-page
    padding
    class="limit-page-width width-sm"
  >
    <pull-to-refresh>
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

        <div v-if="!team">
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
            <q-input
              :value="teamName"
              :label="$t('teamName')"
              @change="teamName = $event.target.value"
            />
            <q-btn
              :label="$t('deleteTeam')"
              outline
              rounded
              no-caps
              color="negative"
              class="q-mt-md"
              @click="deleteTeam"
            />
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
                  {{ member.username }} {{ isCurrentUserText(member) }}
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
            <q-btn
              v-if="isAdmin"
              :label="$t('addTeamMember')"
              icon="add"
              outline
              rounded
              no-caps
              color="primary"
              class="q-mt-md"
            />
          </q-list>
          </q-expansion-item>

        </div>
      </div>
    </pull-to-refresh>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { TeamMember, Team } from "../models";
import Signature from "../components/Signature.vue";
import ActionMenu from "../components/ActionMenu.vue";
import TextWithTooltip from "../components/TextWithTooltip.vue";
import PullToRefresh from "components/PullToRefresh.vue";

@Component({
  components: {
    Signature,
    ActionMenu,
    TextWithTooltip,
    PullToRefresh
  },
})
export default class TeamSettingsPage extends Vue {
  expandedSettings = false;
  expandedMembers = true;

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
      }
    } else {
      void this.$store.direct.dispatch.saveCurrentUser(user => {
        user.activeTeam = value;
      }).then(() => this.$store.direct.dispatch.fetchEssentialDataFromDB({ locale: this.$root.$i18n.locale }));
    }
  }
  get teamName() {
    return this.team?.name || "";
  }
  set teamName(value) {
    this.saveTeam({name: value});
  }

  get teamOptions() {
    return this.$store.direct.state.teams.map(team => {
      return {
        label: team.name,
        value: team._id?.toHexString()
      }
    }).concat({
      label: this.$t("addTeam") as string,
      value: "new"
    })
  }
  get currentUser() {
    return this.$store.direct.state.currentUser;
  }
  get team() {
    return this.$store.direct.state.teams.find(team => team._id?.equals(this.teamId));
  }
  get allMembers() {
    return this.team?.allMembers
      .map(id => this.$store.direct.state.teamMembers[id])
      .filter(member => !!member)
      .sort((a, b) => a.username.localeCompare(b.username)) || [];
  }
  get isAdmin() {
    return !!this.currentUser && !!this.team && 
      this.team.admins.includes(this.currentUser?.userId)
  }

  isCurrentUser(member: TeamMember) {
    return this.currentUser?.equals(member) || false
  }
  isCurrentUserText(member: TeamMember) {
    if (this.isCurrentUser(member)) {
      return this.$t("isCurrentUser") as string
    } else {
      return ""
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
  removeFromTeam(member: TeamMember) {
    return () => {
      if (!this.team) {
        return;
      }

      if (this.isSingleAdmin(member)) {
          return this.presentSingleAdminError();
      }

      this.saveTeam({
        admins: this.team.admins.filter(id => id != member.userId),
        members: this.team.members.filter(id => id != member.userId)
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
      this.saveTeam({
        admins: this.team.admins.filter(id => id != member.userId),
        members: this.team.members.concat([member.userId])
      });
    } else {
      this.saveTeam({
        admins: this.team.admins.concat([member.userId]),
        members: this.team.members.filter(id => id != member.userId)
      });
    }
  }
  presentSingleAdminError() {
    this.$q.dialog({
      title: this.$t("oneAdminRequiredErrorTitle") as string,
      message: this.$t("oneAdminRequiredErrorMessage") as string,
      persistent: true
    });
  }
  deleteTeam() {
    if (this.team) {
      // todo: more checks
      void this.$store.direct.dispatch.deleteTeam(this.team);
    }
  }
  saveTeam(changes: Partial<Team>) {
    if (this.team) {
      void this.$store.direct.dispatch.saveTeam({target: this.team, changes: changes});
    }
  }
}
</script>
