import { DBTypeContainer } from "./DBTypeContainer.js";
import { DBTypeStructure } from "./DBTypeStructure.js";

export interface DBIndexStructure {
  unique?: boolean;
  compoundGetters?: (() => DBTypeContainer<any>)[];
  compoundKeys?: DBTypeStructure<any>[]; // Exists after fully parsed.
  isPrimaryKey?: boolean;
  autoIncrement?: boolean;
}
