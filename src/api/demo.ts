import CoopCareApiInterface from "./coopCareApiInterface";
import { Client, User, Team } from "../models";
import { ObjectID } from "bson";
import sampleData from "../data/sample1.json";

export default class DemoApi implements CoopCareApiInterface {
    user = (() => {
        const user = new User(this.userId, this.userEmail);
        user._id = new ObjectID();
        user.firstName = "Demo";
        user.lastName = "Tester";
        user.signature = "DT";
        user.activeTeam = ""
        return user;
    })();
    clients = (Client.fromObject(sampleData) as Client[]).map(client => {
        client._id = new ObjectID();
        return client;
    });
    teams = (() => {
        const team = new Team("Team CoopCare", this.userId);
        team._id = new ObjectID();
        this.user.activeTeam = team._id.toHexString();
        team.clients = this.clients.map(client => client._id?.toHexString() || "");
        return [team];
    })();

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
        client._id = new ObjectID();
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
        return Promise.resolve(this.clients.filter(client => clientIds.includes(client._id?.toHexString() || "")));
    }
    saveClient(client: Client) {
        return Promise.resolve(client);
    }

    getMyTeams() {
        return Promise.resolve(this.teams.slice());
    }
    createTeam(team: Team) {
        team._id = new ObjectID();
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
