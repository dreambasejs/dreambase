import { DBStore, DBStoreQuery } from "./DBStore.js";
import { DBSchema } from "../schema/DBSchema.js";

export class DBStoreBinder {
  /** Bind a certain entity class to a DBStore implementation.
   *
   */
  getStore(EntityClass: new () => any): DBStore {
    throw new Error(`Could not bind ${EntityClass.name} to a DBStore`);
  }

  getName(EntityClass: new () => any): string {
    return EntityClass.name;
  }

  getCollec;

  getDatabaseConfig(EntityClass: new () => any): DBSchema | null {
    return null;
  }
}
