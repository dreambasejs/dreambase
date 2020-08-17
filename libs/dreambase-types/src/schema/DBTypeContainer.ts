import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";
import { DBTypeStructure } from "./DBTypeStructure.js";

export type DBTypeContainer<T> = {
  [DBTypeSymbol]: DBTypeStructure<T>;
};
