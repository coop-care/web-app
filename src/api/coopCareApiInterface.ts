import { Client, User, Team, TeamMember } from "../models";

export type CoopCareApiListener<T> = (changeType: string, data: T | undefined) => void;

export default interface CoopCareApiInterface {
    readonly isLoggedIn: boolean;
    readonly userId: string | undefined;
    readonly userEmail: string | undefined;
    authListener?: CoopCareApiListener<void>;
    userListener?: CoopCareApiListener<TeamMember>;
    teamListener?: CoopCareApiListener<Team>;
    clientListener?: CoopCareApiListener<Client>;

    login(username: string, password: string): Promise<void>;
    logout(): Promise<void>;
    registerUser(username: string, password: string): Promise<void>;
    confirmUser(token: string, tokenId: string): Promise<void>;
    resendConfirmationEmail(email: string): Promise<void>;
    sendResetPasswordEmail(email: string): Promise<void>;
    resetPassword(token: string, tokenId: string, password: string): Promise<void>;

    getUser(): Promise<User | undefined>;
    createUser(user: User): Promise<User>;
    saveUser(user: User): Promise<User>;
    deleteUser(): Promise<void>;
    getTeamMembers(): Promise<TeamMember[]>;

    getClients(clientIds: string[]): Promise<Client[]>;
    createClient(client: Client): Promise<Client>;
    saveClient(client: Client): Promise<Client>;
    deleteClient(client: Client): Promise<void>;
    deleteAllClients(): Promise<void>;

    getMyTeams(): Promise<Team[]>;
    createTeam(team: Team): Promise<Team>;
    saveTeam(team: Team): Promise<Team>;
    deleteTeam(team: Team): Promise<void>;
}
