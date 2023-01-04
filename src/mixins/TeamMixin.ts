
import { Vue, Component } from "vue-property-decorator";

@Component
export default class TeamMixin extends Vue {
  get currentUser() {
    return this.$store.direct.state.currentUser;
  }
  get team() {
    return this.$store.direct.getters.currentTeam;
  }
  get isAdmin() {
    const userId = this.currentUser?.userId;
    const admins = this.team?.admins || [];
    return !!userId && admins.includes(userId);
  }
  get isTeamAdmin() {
    return this.isAdmin;
  }
}
