import { Client, User } from "../models";

export default interface CoopCareApiInterface {
    readonly isLoggedIn: boolean;
    readonly user?: User;
    login(username: string, password: string): Promise<void>;
    logout(): Promise<void>;
    registerUser(username: string, password: string): Promise<void>;
    confirmUser(token: string, tokenId: string): Promise<void>;
    resendConfirmationEmail(email: string): Promise<void>;
    sendResetPasswordEmail(email: string): Promise<void>;
    resetPassword(token: string, tokenId: string, password: string): Promise<void>;
    saveUser(user: User): Promise<User>;

    getAllClients(): Promise<Client[]>;
    createClient(client: Client): Promise<Client>;
    saveClient(client: Client): Promise<Client>;
    deleteClient(client: Client): Promise<void>;
    deleteAllClients(): Promise<void>;
}
