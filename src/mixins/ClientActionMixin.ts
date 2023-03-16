
import { defineComponent } from "vue";
import { date, DialogChainObject } from "quasar";
import { Client, Team } from "../models";
import SelectDialog from "src/components/SelectDialog.vue";
import TeamMixin, { TeamMixinInterface } from "./TeamMixin";

export type ClientAction = {
    name: string;
    icon: string;
    isDestructive?: boolean;
    action: () => void;
    condition: boolean;
};

export interface ClientActionMixinInterface extends TeamMixinInterface {
  clientsInAdditionalTeams: string[];
  isClientInAdditionalTeam(client: Client): boolean;
  clientActions(client: Client): ClientAction[];
  moveClientToTeam(client: Client): () => void;
  addClientToTeam(client: Client): () => void;
  removeClientFromTeam(client: Client): () => void;
  archiveClient(client: Client): () => void;
  unarchiveClient(client: Client): () => void;
  deleteClient(client: Client): () => void;
  makeSelectDialog(clientId: string, message: string, okButtonLabel: string): DialogChainObject;
  confirmIfClientIsInAdditionalTeam(client: Client, confirmedAction: () => void): void;
  updateClientsInAdditionalTeams(): void;
  saveTeam(changes?: Partial<Team>, team?: Team): Promise<void>;
};

const { addToDate } = date;

export default defineComponent({
  extends: TeamMixin,

  data() {
    return {
      clientsInAdditionalTeams: [] as string[]
    }
  },

  watch: {
    team(newValue?: Team, oldValue?: Team) {
      if (!!newValue && !oldValue) {
        this.updateClientsInAdditionalTeams();
      }
    }
  },

  methods: {
    isClientInAdditionalTeam(client: Client) {
      return this.clientsInAdditionalTeams.includes(client._id?.toHexString() || "")
    },

    clientActions(client: Client): ClientAction[] {
      const clientId = client._id?.toHexString();
      const teamWithoutClientExists = !!this.$store.direct.state.teams.find(team => !clientId || !team.clients.includes(clientId));
      const isInAdditionalTeam = this.isClientInAdditionalTeam(client);

      return [
        {
          name: this.$t("moveClientToTeam"),
          icon: "fas fa-people-carry",
          action: this.moveClientToTeam(client),
          condition: this.isAdmin && teamWithoutClientExists
        },
        {
          name: this.$t("copyClientToTeam"),
          icon: "fas fa-people-arrows",
          action: this.addClientToTeam(client),
          condition: teamWithoutClientExists
        },
        {
          name: this.$t("deleteClientFromTeam"),
          icon: "fas fa-user-slash",
          action: this.removeClientFromTeam(client),
          condition: this.isAdmin && isInAdditionalTeam
        },
        {
          name: this.$t("clientDischarge"),
          icon: "fas fa-archive",
          action: this.archiveClient(client),
          condition: !client.leftAt,
        },
        {
          name: this.$t("clientReadmission"),
          icon: "fas fa-folder-open",
          action: this.unarchiveClient(client),
          condition: !!client.leftAt,
        },
        {
          name: this.$t("deleteClient"),
          icon: "fas fa-trash",
          isDestructive: true,
          action: this.deleteClient(client),
          condition: (this.isAdmin && !isInAdditionalTeam) ||
            (Date.now() < addToDate(client.createdAt, { days: 3 }).getTime())
        },
      ];
    },

    moveClientToTeam(client: Client) {
      return () => {
        const clientId = client._id?.toHexString();

        this.makeSelectDialog(
          clientId || "",
          this.$t("moveClientToTeamMessage", { name: client.name }) as string,
          this.$t("moveClient") as string
        ).onOk((value: string) => {
          const oldTeam = this.team;
          const newTeam = this.$store.direct.state.teams.find(team => team._id?.equals(value))

          if (oldTeam && newTeam && clientId) {
            void this.saveTeam({
              clients: newTeam.clients.concat([clientId])
            }, newTeam)
              .then(() =>
                this.saveTeam({
                  clients: oldTeam.clients.filter(id => id != clientId)
                }, oldTeam)
              )
              .then(() => this.$bus.emit("did-move-client-to-team"))
          }
        });
      }
    },
    addClientToTeam(client: Client) {
      return () => {
        const clientId = client._id?.toHexString();

        this.makeSelectDialog(
          clientId || "",
          "",
          this.$t("add") as string
        ).onOk((value: string) => {
          const newTeam = this.$store.direct.state.teams.find(team => team._id?.equals(value))

          if (newTeam && clientId && !newTeam.clients.includes(clientId)) {
            void this.saveTeam({
              clients: newTeam.clients.concat([clientId])
            }, newTeam)
              .then(() => this.$bus.emit("did-add-client-to-team"))
              .then(this.updateClientsInAdditionalTeams);
          }
        });
      }
    },
    removeClientFromTeam(client: Client) {
      return () => {
        const clientId = client._id?.toHexString();

        this.$q.dialog({
          title: this.$t("confirmTitle") as string,
          message: this.$t("clientIsRemovedFromTeamMessage", { name: client.name }) as string,
          persistent: true,
          ok: {
            rounded: true,
            flat: true
          },
          cancel: {
            rounded: true,
            flat: true,
            noCaps: true
          }
        }).onOk(() => {
          if (this.team) {
            void this.saveTeam({
              clients: this.team.clients.filter(id => id != clientId)
            })
              .then(() => this.$bus.emit("did-remove-client-from-team"));
          }
        });
      }
    },
    archiveClient(client: Client) {
      return () => {
        this.confirmIfClientIsInAdditionalTeam(client, () =>
          void this.$store.direct.dispatch.updateAndSaveClient({
            target: client,
            changes: {
              leftAt: new Date()
            }
          }).then(() => this.$bus.emit("did-archive-client"))
        );
      }
    },
    unarchiveClient(client: Client) {
      return () => {
        this.confirmIfClientIsInAdditionalTeam(client, () =>
          void this.$store.direct.dispatch.updateAndSaveClient({
            target: client,
            changes: {
              leftAt: undefined
            }
          }).then(() => this.$bus.emit("did-unarchive-client"))
        );
      }
    },
    deleteClient(client: Client) {
      return () => {
        this.$q.dialog({
          title: this.$t("confirmDeletionTitle") as string,
          message: this.$t("confirmClientDeletionMessage", { name: client.name }) as string,
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
          void this.$store.direct.dispatch.deleteClient(client)
            .then(() => this.$bus.emit("did-delete-client"))
        );
      }
    },

    makeSelectDialog(clientId: string, message: string, okButtonLabel: string) {
      const teams = this.$store.direct.state.teams
        .filter(team => !team.clients.includes(clientId))
        .map(team => {
          return {
            label: team.name,
            value: team._id?.toHexString() || ""
          }
        });

      return this.$q.dialog({
        component: SelectDialog,
        componentProps: {
          title: this.$t("selectTeam") as string,
          message,
          okButtonLabel,
          selectOptions: teams
        }
      });
    },
    confirmIfClientIsInAdditionalTeam(client: Client, confirmedAction: () => void) {
      if (this.isClientInAdditionalTeam(client)) {
        this.$q.dialog({
          title: this.$t("confirmTitle") as string,
          message: this.$t("clientChangesAffectsMultipleTeamsMessage", { name: client.name }) as string,
          persistent: true,
          ok: {
            label: this.$t("yes"),
            rounded: true,
            flat: true
          },
          cancel: {
            label: this.$t("no"),
            rounded: true,
            flat: true
          }
        }).onOk(confirmedAction);
      } else {
        confirmedAction();
      }
    },

    updateClientsInAdditionalTeams() {
      void this.$store.direct.dispatch.getClientsInAdditionalTeams(this.team?.clients || [])
        .then(clientIds => this.clientsInAdditionalTeams = clientIds);
    },

    saveTeam(changes: Partial<Team> = {}, team?: Team) {
      team = team ?? this.team;

      if (team) {
        return this.$store.direct.dispatch.saveTeam({ target: team, changes: changes })
          .then(() => undefined);
      } else {
        return Promise.resolve();
      }
    }
  }

});
