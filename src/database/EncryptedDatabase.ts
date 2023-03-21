import Dexie, { DBCorePutRequest, Table } from "dexie";
import { applyEncryptionMiddleware, cryptoOptions } from "dexie-encrypted";

export type SyncedData<T> = {
  id: string;
  type?: string;
  value: T;
}

export type LocalData<T> = {
  id: string;
  type?: string;
  value: T;
}

export type Subscriber = (
  event: "add" | "put" | "delete",
  key: string,
  item?: SyncedData<any>,
) => void;


function applyObserverMiddleware(db: EncryptedDatabase) {
  db.use({
    stack: "dbcore", // The only stack supported so far.
    name: "Observer", // Optional name of your middleware
    create(downlevelDatabase) {
      // Return your own implementation of DBCore:
      return {
        // Copy default implementation.
        ...downlevelDatabase,
        // Override table method
        table(tableName) {
          // Call default table method
          const downlevelTable = downlevelDatabase.table(tableName);
          // Derive your own table from it:
          return {
            // Copy default table implementation:
            ...downlevelTable,
            // Override the mutate method:
            mutate: req => {
              // Copy the request object
              const myRequest = { ...req };
              // Do things before mutate, then
              // call downlevel mutate:
              return downlevelTable.mutate(myRequest).then(res => {
                // Do things after mutate

                // notify observers after successful changes to the table named "synced" occured
                // learned a lot about observers from Dexie.js/src/hooks/hooks-middleware.ts
                if (tableName == "synced" && req.type != "deleteRange") {
                  const request = req as DBCorePutRequest;
                  const keys = req.keys || request.values?.map(value => (value as SyncedData<any>)?.id);

                  keys.forEach((key, index) => {
                    const primaryKey = res.results ? res.results[index] : key;

                    if (primaryKey != undefined) {
                      db.subscribers.forEach(subscriber => {
                        try {
                          subscriber(req.type, primaryKey, request.values?.[index]);
                        } catch (error) {
                          console.error("Error in subscriber:", error);
                        }
                      });
                    }
                  });
                }

                const myResponse = { ...res };
                // Then return your response:
                return myResponse;
              });
            }
          }
        }
      };
    }
  });
};


export class EncryptedDatabase extends Dexie {
  local: Table<LocalData<any>>;
  synced: Table<SyncedData<any>>;
  subscribers: Subscriber[] = [];

  static async exists(name: string) {
    return (await Dexie.getDatabaseNames()).includes(name);
  }

  /**
   * Creates an encrypted database
   * @param name a string that is safe as file name for all kinds of file systems
   * @param symmetricKey a securely random Uint8Array of length 32
   */
  constructor(name: string, symmetricKey: Uint8Array) {
    super(name);

    applyEncryptionMiddleware(this, symmetricKey, {
      local: cryptoOptions.NON_INDEXED_FIELDS,
      synced: cryptoOptions.NON_INDEXED_FIELDS,
    } as any, async () => {
      // "onKeyChange" event: attempted to decrypt the database with a diffferent key than the key that was used last. 
      // Indicates either a key change or decryption using a wrong key or decryption with the correct key after a failed attempt with a wrong key.
      console.error("onKeyChange");
      return Promise.resolve();
    });
    
    applyObserverMiddleware(this);

    this.version(1).stores({
      local: "id,type",
      synced: "id,type",
    });

    this.local = this.table("local");
    this.synced = this.table("synced");
  }

  close() {
    super.close();

    this.subscribers = [];

    // insert a void password so the database cannot be opened again without reentering the password
    applyEncryptionMiddleware(this, new Uint8Array(32), {
      encryptedData: cryptoOptions.NON_INDEXED_FIELDS,
    } as any, async () => Promise.resolve());
  }

  subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber: Subscriber) {
    this.subscribers = this.subscribers.filter(item => item != subscriber);
  }

}