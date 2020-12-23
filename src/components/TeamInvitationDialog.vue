<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">{{ $t("addTeamMember") }}</div>
      </q-card-section>

      <q-card-section>
        <div class="text-body2">{{ $t("inviteTeamMemberMessage") }}</div>
      </q-card-section>

      <q-card-section>
        <q-input 
          v-model="email"
          type="email"
          :label="$t('email')"
          autofocus
          clearable
          ref="emailInput"
          :hint="usernameForEmail"
          @keydown.up.down.enter.prevent="menu.navigateMenu"
          @keydown="menu.show()"
          @clear="email = ''"
        >
          <filterable-menu
            v-model="email"
            ref="menu"
            :items="users"
            @input="emailInput.focus()"
          />
        </q-input>
      </q-card-section>

      <q-card-actions class="justify-end">
        <q-btn
          :label="$t('cancel')"
          color="primary"
          no-caps
          flat
          rounded
          @click="hide"
        />
        <q-btn
          :label="$t('ok')"
          color="primary"
          no-caps
          flat
          rounded
          @click="hide(); $emit('ok', email);"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Vue, Component, Ref } from "vue-property-decorator";
import { QDialog, QInput } from "quasar";
import FilterableMenu from "../components/FilterableMenu.vue";

@Component({
  components: {
    FilterableMenu
  },
})
export default class TeamInvitationDialog extends Vue {
  @Ref() readonly dialog!: QDialog;
  @Ref() readonly emailInput!: QInput;
  @Ref() readonly menu!: FilterableMenu;
  email = ""

  get users() {
    const existingTeamMembers = this.team?.allMembers || [];
    return this.teamMembers
      .flatMap(member => 
        member.email && !existingTeamMembers.includes(member.userId) ? 
        [{
          value: member.email,
          displayValue: member.username
        }] : []
      );
  }
  get usernameForEmail() {
    if (this.email) {
      return this.teamMembers.find(member => member.email == this.email)?.username || "";
    } else {
      return "";
    }
  }
  get teamMembers() {
    return Object.values(this.$store.direct.state.teamMembers);
  }
  get team() {
    return this.$store.direct.state.teams.find(team => team._id?.equals(this.teamId));
  }
  get teamId() {
    return this.currentUser?.activeTeam || "";
  }
  get currentUser() {
    return this.$store.direct.state.currentUser;
  }

  show () {
    this.dialog.show();
  }
  hide () {
    this.dialog.hide();
  }
}
</script>
