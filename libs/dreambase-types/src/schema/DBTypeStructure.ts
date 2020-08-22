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
  indexes?: DBIndexStructure[];
  nullable?: boolean;
  typeSpecificOptions?: Omit<TypeOptions<T>, keyof TypeOptions<any>>;
  keyPath?: string; // Maybe not needed runtime, but good for debugging but also mapping to SQL schemas
  parent?: DBTypeStructure<any> | null;
  readProp?: (obj: object) => T; // Shortcut to getByKeyPath(obj, keyPath). Can be more efficient also.
  writeProp?: (obj: object, value: T) => void;
}
