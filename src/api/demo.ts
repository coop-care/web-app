import CoopCareApiInterface from "./coopCareApiInterface";
import { Client, User } from "../models";
import { ObjectID } from "bson";
import sampleData from "../data/sample1.json";

export default class DemoApi implements CoopCareApiInterface {
    clients = (Client.fromObject(sampleData) as Client[]).map(client => {
        client._id = new ObjectID();
        return client;
    });

    get isLoggedIn() {
        return true;
    }
    get user() {
        const user = new User("demo");
        user.firstName = "Demo";
        user.lastName = "Tester";
        user.email = "demo@coopcare.de";
        user.signature = window.localStorage.getItem("signature") || "DT";
        return user;
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
    saveUser(user: User) {
        window.localStorage.setItem("signature", user.signature);
        return Promise.resolve(user);
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
    getAllClients(): Promise<Client[]> {
        return Promise.resolve(this.clients.slice());
    }
    saveClient(client: Client) {
        return Promise.resolve(client);
    }
}
