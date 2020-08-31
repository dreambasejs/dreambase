import { DBIndexStructure } from "./DBIndexStructure.js";
import { Collection } from "../Collection.js";
import { TypeOptions } from "../attributes/options/TypeOptions.js";

export interface DBTypeStructure<T> {
  type: string;
  ctor: Function;
  declInstance?: object;
  default: T;
  properties?: { [propName in keyof T]: DBTypeStructure<T[propName]> };
  item?: DBTypeStructure<
    T extends Array<infer I> ? I : T extends Collection<infer I> ? I : never
  >;
  indexes?: DBIndexStructure[]; // Represents indexes on this type. Not on sub props! Not for entities!
  primaryKey?: DBTypeStructure<any>; // Only set on entities
  indexedProps?: DBTypeStructure<any>[]; // Only set on entities
  nullable?: boolean;
  typeSpecificOptions?: Omit<TypeOptions<T>, keyof TypeOptions<any>>;
  keyPath?: string; // Maybe not needed runtime, but good for debugging but also mapping to SQL schemas
  parent?: DBTypeStructure<any> | null;
  parentArray?: DBTypeStructure<any[]> | null;
  cmp?: (a: T, b: T) => number; // Always there after finalizeType
  convertTo?: (x: any) => T;
  readProp?: (obj: object) => T; // Shortcut to getByKeyPath(obj, keyPath). Can be more efficient also.
  writeProp?: (obj: object, value: T) => void;
}
