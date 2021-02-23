import CoopCareApiInterface from "./coopCareApiInterface";
import { Client, User, Team } from "../models";
import { ObjectID } from "bson";
import { importSamplesV2, sampleClientIds } from "../data/sampleImporter";

export default class DemoApi implements CoopCareApiInterface {
    private user = (() => {
        const user = new User(this.userId, this.userEmail);
        user._id = new ObjectID("6033c10377b850dbb17c7d20");
        user.firstName = "Demo";
        user.lastName = "Tester";
        user.signature = "DT";
        user.activeTeam = "6033c10377b850dbb17c7d30"
        return user;
    })();
    private clients: Client[] = [];
    private teams = (() => {
        const team = new Team("Team CoopCare", this.userId);
        team._id = new ObjectID("6033c10377b850dbb17c7d30");
        team.clients = sampleClientIds().map(id => id.toHexString());
        return [team];
    })();
    private didImportSampleClients = false;

    get isLoggedIn() {
        return true;
    }
    get userId() {
        return "demo";
    }
    get userEmail() {
        return "demo@coopcare.de";
    }
    login() {
        return Promise.resolve();
    }
    logout() {
        return Promise.reject();
    }
    registerUser() {
        return Promise.resolve();
    }
    confirmUser() {
        return Promise.resolve();
    }
    resendConfirmationEmail() {
        return Promise.resolve();
    }
    sendResetPasswordEmail() {
        return Promise.resolve();
    }
    resetPassword() {
        return Promise.resolve();
    }

    getUser() {
        return Promise.resolve(this.user);
    }
    createUser(user: User) {
        return Promise.resolve(user);
    }
    saveUser(user: User) {
        return Promise.resolve(user);
    }
    deleteUser() {
        return Promise.resolve();
    }
    getTeamMembers() {
        return Promise.resolve([this.user]);
    }

    createClient(client: Client) {
        if (client._id == undefined) {
            client._id = new ObjectID();
        }
        this.clients.push(client);
        return Promise.resolve(client);
    }
    deleteClient(client: Client) {
        this.clients = this.clients.filter(item => item._id != client._id);
        return Promise.resolve();
    }
    deleteAllClients() {
        return Promise.reject();
    }
    getClients(clientIds: string[]): Promise<Client[]> {
        if (!this.didImportSampleClients) {
            this.clients = this.clients.concat(importSamplesV2());
            this.clients.forEach((client, index) => client._id = new ObjectID(clientIds[index]))
            this.didImportSampleClients = true;
        }
        return Promise.resolve(
            this.clients.filter(client =>
                clientIds.includes(client._id?.toHexString() || ""))
        );
    }
    saveClient(client: Client) {
        return Promise.resolve(client);
    }
    getClientsInAdditionalTeams(clientIds: string[], teamIds: string[]) {
        return Promise.resolve(
            this.teams
                .flatMap(team => teamIds.indexOf(team._id?.toString() || "") < 0 ? team.clients : [])
                .filter(clientId => clientIds.indexOf(clientId) >= 0)
        );
    }

    getMyTeams() {
        return Promise.resolve(this.teams.slice());
    }
    createTeam(team: Team) {
        if (!team._id) {
            team._id = new ObjectID();
        }
        this.teams.push(team);
        return Promise.resolve(team);
    }
    saveTeam(team: Team) {
        return Promise.resolve(team);
    }
    deleteTeam(team: Team) {
        this.teams = this.teams.filter(item => !item.equals(team));
        return Promise.resolve();
    }
}
