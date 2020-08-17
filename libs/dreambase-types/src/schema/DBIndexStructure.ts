import { DBTypeStructure } from "./DBTypeStructure.js";

export interface DBIndexStructure {
  unique?: boolean;
  compositeProps?: DBTypeStructure<any>[];
  isPrimaryKey?: boolean;
  generated?: boolean;
}
