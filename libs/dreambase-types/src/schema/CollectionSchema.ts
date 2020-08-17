import { Collection } from "../Collection.js";
import { DBTypeStructure } from "./DBTypeStructure.js";

export interface CollectionSchema<T = any> {
  name: string;
  type: DBTypeStructure<T>;
  CollectionClass: new () => Collection<T>;
  EntityClass: new () => T;
}
