import { DBIndexStructure } from "./DBIndexStructure.js";
import { Collection } from "../Collection.js";

export interface DBTypeStructure<T> {
  type: string;
  ctor: Function;
  default: T;
  properties?: { [propName in keyof T]: DBTypeStructure<T[propName]> };
  item?: DBTypeStructure<
    T extends Array<infer I> ? I : T extends Collection<infer I> ? I : never
  >;
  index?: DBIndexStructure;
  nullable?: boolean;
  keyPath?: string; // Maybe not needed runtime, but good for debugging but also mapping to SQL schemas
  readProp?: (obj: object) => T; // Shortcut to getByKeyPath(obj, keyPath). Can be more efficient also.
  writeProp?: (obj: object, value: T) => void;
}
