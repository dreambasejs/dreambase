import { Collection } from "./Collection.js";
import { IsLazy, refDeterministic, inject } from "incarnation";
import { DBStoreBinder } from "../dbstore/DBStoreBinder.js";

export class Query extends Collection {
  get $flavors() {
    return {
      orig: this,
      suspense: this,
      promise: Collection(this.Entity),
    };
  }
  [IsLazy] = true; // Not needed because we get it from superclass. But TS' JS-compiler complains! https://github.com/microsoft/TypeScript/issues/37832

  @refDeterministic
  static of(Entity) {
    return class extends Query {
      constructor() {
        const binder = inject(DBStoreBinder);
        super({}, Entity, binder.getStore(Entity).$flavors.suspense);
      }
    };
  }
}
