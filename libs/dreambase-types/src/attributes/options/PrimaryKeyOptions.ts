import { DBIndexStructure } from "../../schema/DBIndexStructure.js";
import { TypeOptions } from "./TypeOptions.js";

export type PrimaryKeyOptions<T> = {
  compoundWith?: (() => any) | (() => any)[];
} & (T extends number
  ? {
      autoIncrement?: boolean;
    }
  : {});
