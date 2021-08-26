
import { Vue, Component } from "vue-property-decorator";
import { debounce } from "src/helper/utils";
import { BackOffice } from "src/models";

@Component
export default class BackofficeMixin extends Vue {
  saveBackofficeDelayed = debounce(this.saveBackoffice, 1000);

  get backofficeId() {
    return this.$route.params.backofficeId
      || this.$store.direct.getters.currentTeam?.backoffice
      || this.$store.direct.state.backoffices[0]?.id;
  }
  get backoffice() {
    return this.$store.direct.state.backoffices.find(item => item.id == this.backofficeId);
  }
  get isBackofficeAdmin() {
    const userId = this.$store.direct.state.currentUser?.userId;
    const admins = this.backoffice?.admins || [];
    return !!userId && admins.includes(userId);
  }
  get backofficeCountryComponent() {
    return this.backoffice?.countryCode.toLowerCase() || "default";
  }

  matchingCountryCode(countryCodes: string[], countryCode = this.backofficeCountryComponent) {
    return countryCodes.includes(countryCode)
      ? countryCode
      : "";
  }
  updateBackoffice(changes: Partial<BackOffice>) {
    void this.$store.direct.commit.updateObject({
      target: this.backoffice,
      changes
    });
  }
  saveBackoffice(changes: Partial<BackOffice>) {
    return this.$store.direct.dispatch.saveBackoffice({
      target: this.backoffice,
      changes
    });
  }
}
