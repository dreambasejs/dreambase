import { DBTypeStructure } from "./DBTypeStructure.js";

export interface DBIndexStructure {
  unique?: boolean;
  compoundGetters?: (() => DBTypeStructure<any>)[];
  compoundKeys?: DBTypeStructure<any>[]; // Exists after fully parsed.
  isPrimaryKey?: boolean;
  autoIncrement?: boolean;
}
