import { DBStore, DBStoreQuery } from "./DBStore.js";

export class DBStoreBinder {
  /** Bind a certain entity class to a DBStore implementation.
   *
   */
  getStore(EntityClass: new () => any): DBStore {
    throw new Error(`Could not bind ${EntityClass.name} to a DBStore`);
  }
}
