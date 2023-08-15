
import { EncryptedDatabase } from "./EncryptedDatabase"

type Keys = "lastUpdated"
    | "lastLoginUsername";

async function accessDatabase<T>(operation: (database: EncryptedDatabase) => Promise<T>) {
    const key = Uint8Array.from([115,37,188,154,57,188,39,208,42,37,87,179,25,19,209,232,226,75,179,229,43,34,251,94,120,66,53,247,222,213,111,38]);
    const db = new EncryptedDatabase("AppSettings", key);

    const result = await operation(db);
    db.close();

    return result;
}

export async function get<T>(key: Keys) {
    return accessDatabase(async db => 
        (await db.local.get(key))?.value as T
    );
}

export async function set<T>(key: Keys, value: T) {
    await accessDatabase(async db => 
        await db.local.put({
            id: key,
            value
        }, key)
    );
}

export async function remove(key: Keys) {
    await accessDatabase(async db => 
        await db.local.delete(key)
    );
}
