import { Client } from "../models/client";

export default interface CoopCareApiInterface {
    readonly isLoggedIn: boolean;
    readonly user?: object;
    readonly userId: string;
    readonly username: string;
    login(username: string, password: string): Promise<void>;
    logout(): Promise<void>;
    registerUser(username: string, password: string): Promise<void>;
    confirmUser(token: string, tokenId: string): Promise<void>;

    getAllClients(): Promise<Client[]>;
    createClient(client: Client): Promise<Client>;
    saveClient(client: Client): Promise<Client>;
    deleteClient(client: Client): Promise<void>;
    deleteAllClients(client: Client): Promise<void>;
}
