
import { Team, User } from "src/models";
import { defineComponent } from "vue";

export interface TeamMixinInterface {
  currentUser?: User;
  team?: Team;
  isAdmin: boolean;
  isTeamAdmin: boolean;
};

export default defineComponent({
  computed: {
    currentUser() {
      return this.$store.direct.state.currentUser;
    },
    team() {
      return this.$store.direct.getters.currentTeam;
    },
    isAdmin() {
      const userId = this.currentUser?.userId;
      const admins = this.team?.admins || [];
      return !!userId && admins.includes(userId);
    },
    isTeamAdmin() {
      return this.isAdmin;
    },
  }
});
