import { EncryptedDatabase } from "./EncryptedDatabase";

declare global {
    interface CordovaPlugins {
        SecureKeyStore: SecureKeyStore;
    }
}

interface SecureKeyStore {
    get: (service: string, key: string) => Promise<string | undefined>;
    set: (service: string, key: string, password: string) => Promise<void>;
    remove: (service: string, key: string) => Promise<boolean>;
}

export type VaultSecretParameters = {
    salt: string;
    nonce: Uint8Array;
    message: Uint8Array;
};

export type VaultSecretResult = {
    salt?: Uint8Array;
    nonce?: Uint8Array;
    message?: Uint8Array;
} | undefined;


export default class Vault {
    private static service = (process.env.APP_ID || "de.coopcare.any");
    private static vaultName = "vault";

    private static get electron() {
        return window.electronAPI?.vault;
    }

    private static get cordova(): SecureKeyStore | undefined {
        return window.cordova?.plugins?.SecureKeyStore;
    }

    private static get external(): SecureKeyStore | undefined {
        return this.electron || this.cordova;
    }

    static get type() {
        if (this.electron) {
            return "electron";
        } else if (this.cordova) {
            return "cordova";
        } else {
            return "indexeddb";
        }
    }

    private static uint8ArrayToString(array: Uint8Array) {
        return btoa(String.fromCharCode(...array));
    }

    private static stringToUint8Array(text: string) {
        return Uint8Array.from(Array.from(atob(text)).map(char => char.charCodeAt(0)))
    }

    private static parse(value: string | undefined | null) {
        if (value) {
            const [salt, nonce, message] = value.split("$").map(this.stringToUint8Array);
            return { salt, nonce, message } as VaultSecretResult;
        } else {
            return undefined;
        }
    }

    private static stringify(value: VaultSecretParameters) {
        return [
            value.salt,
            this.uint8ArrayToString(value.nonce),
            this.uint8ArrayToString(value.message)
        ].join("$");
    }

    private static async vaultExists() {
        return await EncryptedDatabase.exists(this.vaultName);
    }

    private static async run<T>(operation: (vault: EncryptedDatabase) => Promise<T>) {
        const key = Uint8Array.from([148,79,197,209,236,60,142,201,25,178,51,207,240,203,133,84,26,50,16,89,81,2,4,185,183,250,194,1,166,234,125,8]);
        const vault = new EncryptedDatabase(this.vaultName, key);

        const result = await operation(vault);
        vault.close();

        return result;
    }

    static async get(key: string) {
        await this.migrateExternalToVaultIfNeeded(key);
        
        return await this.vaultGet(key);
    }

    static async set(key: string, value: VaultSecretParameters) {
        await this.vaultSet(key, value);
    }

    static async delete(key: string) {
        await this.vaultDelete(key);
    }

    private static async vaultGet(key: string) {
        if (await this.vaultExists()) {
            return await this.run(async vault => {
                return this.parse((await vault.local.get(key))?.value as string | undefined);
            });
        }
    }

    private static async vaultSet(key: string, value: VaultSecretParameters) {
        await this.run(async vault => {
            await vault.local.put({
                id: key,
                value: this.stringify(value)
            }, key);
        });
    }

    private static async vaultDelete(key: string) {
        if (await this.vaultExists()) {
            await this.run(async vault => {
                await vault.local.delete(key);
            })
        }
    }

    private static async migrateExternalToVaultIfNeeded(key: string) {
        if (this.external && !(await this.vaultExists())) {
            const value = this.parse(
                await this.external.get(this.service, key)
                    .catch(error => {
                        if (error.message.startsWith("Error invoking remote method 'get-password'")) {
                            throw new Error("AbortedByUser");
                        } else {
                            console.error(error);
                            throw new Error("GenericError");
                        }
                    })
                )

            if (!!value && !!value.message && !!value.salt && !!value.nonce) {
                await this.vaultSet(key, {
                    salt: this.uint8ArrayToString(value.salt),
                    nonce: value.nonce,
                    message: value.message,
                });
                await this.external.remove(this.service, key)
                    .catch(error => {
                        console.error(error);
                        throw new Error("GenericError");
                    });
            } else {
                throw new Error("VaultMigrationError");
            }
        }
    }
};
