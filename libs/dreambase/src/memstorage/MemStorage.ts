import { DBStoreBinder } from "dreambase-types";
import {
  Environment,
  Middleware,
  PROVIDER,
  refDeterministic,
} from "incarnation";
import { HasProviderFn, ProviderFn } from "incarnation/dist/Provider.js";
import { MemDBStore } from "./MemDBStore";

export class MemStorage extends Middleware<DBStoreBinder> {
  constructor() {
    super(DBStoreBinder, (Next) => {
      class MemDB extends Next {
        getStore(EntityClass: new () => any) {
          const dbSchema = super.getDatabaseConfig(EntityClass);
          const collectionSchema = dbSchema?.collections.find(
            (x) => x.EntityClass === EntityClass
          );
          return collectionSchema
            ? new MemDBStore(collectionSchema)
            : super.getStore(EntityClass);
        }
      }
      MemDB.prototype.getStore = refDeterministic(MemDB.prototype.getStore);
      return MemDB;
    });
  }
}
