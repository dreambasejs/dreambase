import { Class } from "incarnation";
import { DBTypeStructure } from "./DBTypeStructure.js";
import { finalizeType, parseType } from "./parseType.js";

export function readSchema<T>(Class: Class<T>): DBTypeStructure<T> {
  const type = parseType(Class);
  finalizeType(type);
  return type;
}
