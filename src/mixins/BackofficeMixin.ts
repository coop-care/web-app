
import { defineComponent } from "vue";
import { debounce } from "src/helper/utils";
import { BackOffice } from "src/models";

export interface BackofficeMixinInterface {
  backofficeId: string;
  backoffice?: BackOffice;
  isBackofficeAdmin: boolean;
  backofficeCountryComponent: string;
  matchingCountryCode(countryCodes: string[], countryCode?: string): string;
  updateBackoffice(changes: Partial<BackOffice>): void;
  saveBackoffice(changes?: Partial<BackOffice>): Promise<void | BackOffice>;
  saveBackofficeDelayed(changes?: Partial<BackOffice>): Promise<void | BackOffice>;
  saveBackofficeCustomField(label: string, value: any, immediately?: boolean): void;
  isCurrentRoute(name: string, params: Record<string, string>): boolean;
  pushRoute(name: string, params?: Record<string, string>, query?: Record<string, string>): void;
};

export default defineComponent({
  data() {
    return {
      // @ts-ignore
      saveBackofficeDelayed: debounce(this.saveBackoffice, 1000)
    }
  },

  computed: {
    backofficeId() {
      return this.$route.params.backofficeId as string
        || this.$store.direct.getters.currentTeam?.backoffice
        || this.$store.direct.state.backoffices[0]?.id;
    },
    backoffice() {
      return this.$store.direct.state.backoffices.find(item => item.id == this.backofficeId);
    },
    isBackofficeAdmin() {
      const userId = this.$store.direct.state.currentUser?.userId;
      const admins = this.backoffice?.admins || [];
      return !!userId && admins.includes(userId);
    },
    backofficeCountryComponent() {
      return this.backoffice?.countryCode.toLowerCase() || "default";
    },
  },

  methods: {
    // @ts-ignore
    matchingCountryCode(countryCodes: string[], countryCode = this.backofficeCountryComponent) {
      return countryCodes.includes(countryCode)
        ? countryCode
        : "";
    },
    updateBackoffice(changes: Partial<BackOffice>) {
      void this.$store.direct.commit.updateObject({
        target: this.backoffice,
        changes
      });
    },
    saveBackoffice(changes: Partial<BackOffice> = {}) {
      return this.$store.direct.dispatch.saveBackoffice({
        target: this.backoffice,
        changes
      });
    },
    saveBackofficeCustomField(label: string, value: any, immediately = true) {
      if (!this.backoffice) {
        return;
      }

      void this.$store.direct.commit.updateObject({
        target: this.backoffice,
        changes: {
          customFields: this.backoffice.updatedCustomField(label, value)
        }
      });
      immediately ? void this.saveBackoffice() : void this.saveBackofficeDelayed();
    },
    isCurrentRoute(name: string, params: Record<string, string>) {
      const route = this.$route;
      return (name == route.name) &&
        (Object.keys(params).filter(key => params[key] != route.params[key]).length == 0);
    },
    pushRoute(name: string, params: Record<string, string> = {}, query: Record<string, string> = {}) {
      if (!this.isCurrentRoute(name, params)) {
        void this.$router.push({
          name,
          params: {
            ...params,
            backofficeId: this.$route.params.backofficeId
          },
          query
        });
      }
    },
  }
  
});
