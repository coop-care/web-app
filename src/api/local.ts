import CoopCareApiInterface from "./coopCareApiInterface";
import { Client, User, Team, BackOffice, IdentifiableObject, TeamMember } from "../models";
import argon2 from "argon2-browser";
import nacl from "tweetnacl";
import Dexie from "dexie";
import { EncryptedDatabase, SyncedData } from "src/database/EncryptedDatabase";
import Vault from "src/database/Vault";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { ObjectId } from "bson";
import { didExpire } from "src/helper/expiration";

const classRegistry: Record<string, ClassConstructor<unknown>> = {
    "_User": User,
    "_Client": Client,
    "_Team": Team,
    "_BackOffice": BackOffice,
}
const classRegistryEntries = Object.entries(classRegistry);

const typeToConstructor = <T>(type: string) => {
    const constructor = classRegistry[type] as ClassConstructor<T> | undefined;

    if (!constructor) {
        console.error(`Type "${type}" not found in class registry`);
    }

    return constructor;
}

const constructorToType = <T>(constructor: ClassConstructor<T>) => {
    const type = classRegistryEntries.find(([, classname]) => classname == constructor)?.[0];

    if (!type) {
        console.error(`Constructor "${constructor.name}" not found in class registry`);
    }

    return type;
};

export default class LocalDatabaseApi implements CoopCareApiInterface {
    private dbPrefix = "account.";
    private db?: EncryptedDatabase;
    private currentUserId?: string;

    // === public auth methods not conforming to CoopCareApiInterface ===
    
    get username() {
        return this.db?.name.substring(this.dbPrefix.length);
    }

    async allAccounts() {
        return (await Dexie.getDatabaseNames())
            .filter(name => name.startsWith(this.dbPrefix))
            .map(name => name.substring(this.dbPrefix.length))
    }

    async caseSensitiveUsername(username: string) {
        return (await Dexie.getDatabaseNames())
            .find(name => name.toLowerCase() == (this.dbPrefix + username).toLowerCase())
            ?.substring(this.dbPrefix.length)
    }

    isValidUserName(username: string) {
        // username needs to match POSIX fully portable filesnames, as it is used as database filename.
        // More characters than this minimum could be allowed in the future, but that would require tests on every operating system.
        return /^[A-Za-z0-9._-]{2,}$/.test(username);
    }

    async exists(username: string) {
        return (await this.caseSensitiveUsername(username)) != undefined;
    }

    // === private auth methods ===

    private async hashPassword(password: string, salt?: string | Uint8Array) {
        // Algorithm parameters are oriented at the second recommended option with less memory
        // (source: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-argon2-13#section-4)
        // with adjustment for even less memory because this is a mobile app.
        return await argon2.hash({
            pass: password,
            salt: salt || self.crypto.getRandomValues(new Uint8Array(16)), // 128-bit salt
            time: 3, // 3 iterations
            parallelism: 4, // 4 lanes
            mem: 4096, // 4 MiB, attention: value differs from the recommended 64 MiB (65536) to speed things up, as 64 MiB takes more than 5 seconds on a cheap tablet
            hashLen: 32, // 256-bit tag size
            type: argon2.ArgonType.Argon2id
        });
    }

    private async encryptLocalKey(username: string, password: string, key: Uint8Array) {
        const hashResult = await this.hashPassword(password);
        const salt = hashResult.encoded.split("$")[4];
        const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
        const message = nacl.secretbox(key, nonce, hashResult.hash);

        await Vault.set(username.toLowerCase(), { salt, nonce, message });
    }

    private async decryptLocalKey(username: string, password: string) {
        const secret = await Vault.get(username.toLowerCase());

        if (!secret || !secret.salt || !secret.nonce || !secret.message) {
            throw new Error("EncryptionCorrupted")
        }

        const hashResult = await this.hashPassword(password, secret.salt);
        const key = nacl.secretbox.open(secret.message, secret.nonce, hashResult.hash);

        if (key === null) {
            throw new Error("WrongPassword");
        }

        return key;
    }

    private async updateUserOnFirstLogin(user: User, locale?: string) {
        if (!user.signature) {
            if (!user.firstName && !user.lastName) {
                const nameComponents = (this.username ?? "").replace(/([^\-])([A-Z])/g, "$1 $2").trim().split(/[ ._]/).filter(Boolean)
                user.firstName = nameComponents.shift() ?? "";
                user.lastName = nameComponents.join(" ");
            }

            user.signature = !!user.firstName && !!user.lastName
                ? (user.firstName.substring(0, 1) + user.lastName.substring(0, 1)).toUpperCase()
                : this.username?.substring(0, 2) ?? "";

            await this.updateDocument(user);
        }

        if (!user.locale && !!locale) {
            user.locale = locale;
            await this.updateDocument(user);
        }

    }

    private assertLoggedIn() {
        if (!this.isLoggedIn) {
            this.logout();
            throw new Error("NotLoggedIn");
        }
    }

    private assertCanWriteData() {
        if (didExpire()) {
            throw new Error("AppIsReadOnly");
        }
    }

    // === private methods for CRUD access and conversion of generic documents in database ===

    private async getDocumentById<T extends IdentifiableObject>(id: string): Promise<T | undefined> {
        this.assertLoggedIn();
        const item = await this.db?.synced.get(id);
        return this.toDocument<T>(item);
    }

    private async getDocumentsById<T extends IdentifiableObject>(idList: string[]): Promise<T[]> {
        this.assertLoggedIn();
        const items = await this.db?.synced.bulkGet(idList);
        return this.toDocumentList<T>(items);
    }

    private async getDocumentsByType<T extends IdentifiableObject>(constructor: ClassConstructor<T>): Promise<T[]> {
        this.assertLoggedIn();
        const type = constructorToType(constructor);

        if (!type) {
            return [];
        }

        const items = await this.db?.synced.where("type").equals(type).toArray();
        return this.toDocumentList(items, constructor);
    }

    private async createDocument<T extends IdentifiableObject>(doc: T): Promise<T> {
        this.assertLoggedIn();
        this.assertCanWriteData();

        if (doc._id == undefined) {
            doc._id = new ObjectId();
        }

        await this.db?.synced.add(this.fromDocument(doc));
        return doc;
    }

    private async updateDocument<T extends IdentifiableObject>(doc: T): Promise<T> {
        this.assertLoggedIn();
        this.assertCanWriteData();

        if (doc._id == undefined) {
            throw new Error("MissingObjectId")
        }

        await this.db?.synced.put(this.fromDocument(doc));
        return doc;
    }

    private async deleteDocument<T extends IdentifiableObject>(doc: T) {
        this.assertLoggedIn();

        if (doc._id == undefined) {
            throw new Error("MissingObjectId")
        }

        await this.db?.synced.delete(doc.id);
    }

    private fromDocument<T extends IdentifiableObject>(doc: T) {
        const id = doc.id;
        const value = JSON.stringify(doc.toJSON());
        const type = constructorToType(doc.constructor as ClassConstructor<T>);

        return {id, type, value} as SyncedData<string>
    }

    private toDocument<T extends IdentifiableObject>(item?: SyncedData<string>, constructor?: ClassConstructor<T>) {
        if (!item) {
            return;
        }

        const classname = constructor ?? typeToConstructor<T>(item.type ?? "");

        if (!classname) {
            return undefined;
        }

        const document = JSON.parse(item.value);

        return plainToInstance(classname, document);
    }

    private toDocumentList<T extends IdentifiableObject>(items: (SyncedData<string> | undefined)[] = [], constructor?: ClassConstructor<T>) {
        return items
            .map(item => this.toDocument<T>(item, constructor))
            .filter(Boolean) as T[];
    }

    // === public methods for CRUD access to values in database "local" ===

    async getLocalValue<T>(key: string) {
        this.assertLoggedIn();

        return (await this.db?.local.get(key))?.value as T | undefined
    }

    async setLocalValue<T>(key: string, value: T) {
        this.assertLoggedIn();

        await this.db?.local.put({id: key, value})
    }

    async deleteLocalValue(key: string) {
        this.assertLoggedIn();

        await this.db?.local.delete(key);
    }

    // === auth methods ===

    get isLoggedIn() {
        return this.db?.isOpen() == true;
    }

    get userId() {
        return this.currentUserId;
    }

    get userEmail() {
        return undefined;
    }

    async login(username: string, password: string, locale?: string) {
        if (!username) {
            throw new Error("UsernameMissing");
        }
        if (!password) {
            throw new Error("PasswordMissing");
        }

        const caseSensitiveUsername = await this.caseSensitiveUsername(username);
        const name = this.dbPrefix + caseSensitiveUsername;

        if (!caseSensitiveUsername || !await Dexie.exists(name)) {
            throw new Error("UsernameDoesNotExist")
        }

        const key = await this.decryptLocalKey(username, password);
        const db = new EncryptedDatabase(name, key);
        await db.open();
        this.db = db;

        await db.local.get("verification").catch(async () => {
            await this.logout();
            throw new Error("EncryptionCorrupted")
        });
        await persistIfNeeded();
        
        const user = await this.getUser().catch(async () => {
            await this.logout();
            throw new Error("UserDoesNotExist");
        });

        if (!user) {
            await this.logout();
            throw new Error("UserDoesNotExist");
        }

        this.currentUserId = user.id;
        this.updateUserOnFirstLogin(user, locale)
    }

    async logout() {
        this.db?.close();
        this.db = undefined;
        this.currentUserId = undefined;
    }

    async registerUser(username: string, password: string) {
        if (!username) {
            throw new Error("UsernameMissing")
        }

        if (!password) {
            throw new Error("PasswordMissing")
        }

        if (!this.isValidUserName(username)) {
            throw new Error("UsernameInvalid")
        }

        if (await this.exists(username)) {
            throw new Error("UsernameExists")
        }

        this.assertCanWriteData();

        const key = nacl.randomBytes(32);
        await this.encryptLocalKey(username, password, key);

        await persistIfNeeded();

        const name = this.dbPrefix + username;
        const db = new EncryptedDatabase(name, key);

        const id = new ObjectId();
        const user = new User(id.toHexString())
        user._id = id;

        await db.open();
        await db.synced.add(this.fromDocument(user));
        await db.local.bulkAdd([{
            id: "verification",
            value: true
        },{
            id: "userId",
            value: user.id
        }]);
        db.close();
    }

    async changePassword(oldPassword: string, newPassword: string) {
        if (!oldPassword || !newPassword) {
            throw new Error("PasswordMissing")
        }

        if (!this.username || !await Dexie.exists(this.dbPrefix + this.username)) {
            throw new Error("UsernameDoesNotExist")
        }

        // ensure that user is really logged in by decrypting a value from the database
        await this.db?.local.get("verification").catch(async () => {
            await this.logout();
            throw new Error("WrongPassword");
        });

        const key = await this.decryptLocalKey(this.username, oldPassword);
        await this.encryptLocalKey(this.username, newPassword, key);
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

    // === user methods ===

    async getUser() {
        const value = await this.getLocalValue<string>("userId");

        if (!value) {
            return;
        }

        return this.getDocumentById<User>(value);
    }

    createUser(user: User) {
        return this.createDocument(user);
    }

    saveUser(user: User) {
        return this.updateDocument(user);
    }

    async deleteUser(username: string) {
        if (!username) {
            throw new Error("UsernameMissing")
        }

        const name = this.dbPrefix + await this.caseSensitiveUsername(username);

        if (!await Dexie.exists(name)) {
            throw new Error("UsernameDoesNotExist")
        }

        if (username == this.username) {
            await this.logout();
        }

        await Dexie.delete(name);
        await Vault.delete(username.toLowerCase());
    }
    
    async getTeamMembers() {
        const user = await this.getUser();
        return [user].filter(Boolean) as TeamMember[];
    }

    // === client methods ===

    createClient(client: Client) {
        return this.createDocument(client);
    }

    deleteClient(client: Client) {
        return this.deleteDocument(client);
    }

    async deleteAllClients() {
        const clients = await this.getDocumentsByType(Client);
        await Promise.all(clients.map(this.deleteClient));
        return Promise.resolve();
    }

    getClients(clientIds: string[]) {
        return this.getDocumentsById<Client>(clientIds);
    }

    saveClient(client: Client) {
        return this.updateDocument(client);
    }

    async getClientsInAdditionalTeams(clientIds: string[], teamIds: string[]) {
        return Promise.resolve(
            (await this.getDocumentsByType(Team))
                .flatMap(team => teamIds.indexOf(team._id?.toString() || "") < 0 ? team.clients : [])
                .filter(clientId => clientIds.indexOf(clientId) >= 0)
        );
    }

    // === team methods ===

    getMyTeams() {
        return this.getDocumentsByType(Team);
    }

    createTeam(team: Team) {
        return this.createDocument(team);
    }

    saveTeam(team: Team) {
        return this.updateDocument(team);
    }

    deleteTeam(team: Team) {
        return this.deleteDocument(team);
    }

    // === backoffice methods ===

    getMyBackoffices() {
        return this.getDocumentsByType(BackOffice);
    }

    createBackoffice(backoffice: BackOffice) {
        return this.createDocument(backoffice);
    }

    saveBackoffice(backoffice: BackOffice) {
        return this.updateDocument(backoffice);
    }

    deleteBackoffice(backoffice: BackOffice) {
        return this.deleteDocument(backoffice);
    }

}


export async function persistIfNeeded() {
    // see https://dexie.org/docs/StorageManager
    // also https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Browser_storage_limits_and_eviction_criteria
    // similar https://web.dev/persistent-storage/
    // Best Practices for Using IndexedDB: https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices
    if (!(await navigator.storage?.persisted?.())) {
        return await navigator.storage?.persist?.() || false;
    } else {
        return true;
    }
}
