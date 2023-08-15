import Dexie, { Table } from "dexie";
import { applyEncryptionMiddleware, cryptoOptions } from "dexie-encrypted";
import { Guideline } from "src/models/guideline";

export class TaxonomyDatabase extends Dexie {
  guidelines: Table<Guideline>;

  /**
   * Creates an encrypted database for taxonomy-related data
   */
  constructor() {
    super("taxonomy");

    const keyAsString = process.env.TAXONOMY_DB_KEY;
    const symmetricKey = keyAsString?.length == 32
      ? new TextEncoder().encode(keyAsString)
      : new Uint8Array(32);
    applyEncryptionMiddleware(this, symmetricKey, {
      guidelines: cryptoOptions.NON_INDEXED_FIELDS,
    } as any, async () => Promise.resolve());

    this.version(1).stores({
      guidelines: "[id+locale], id, locale",
    });

    this.guidelines = this.table("guidelines");
  }

  close() {
    super.close();

    // insert a void password so the database cannot be opened again without reentering the password
    applyEncryptionMiddleware(this, new Uint8Array(32), {
      encryptedData: cryptoOptions.NON_INDEXED_FIELDS,
    } as any, async () => Promise.resolve());
  }

}