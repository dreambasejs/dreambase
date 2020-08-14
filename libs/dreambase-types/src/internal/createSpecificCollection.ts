import { inject, Class } from "incarnation";
import { DBStoreBinder } from "../dbstore/DBStoreBinder.js";

export function createSpecificCollection<T>(
  Entity: new () => T,
  CollectionFlavor: Class
): any {
  return class SpecificCollection extends CollectionFlavor {
    constructor() {
      const binder = inject(DBStoreBinder);
      super({}, Entity, binder.getStore(Entity));
    }
  };
}
