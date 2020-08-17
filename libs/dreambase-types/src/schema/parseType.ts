import { DBTypeDeclaration } from "./declaration/DBTypeDeclaration.js";
import { DBTypeStructure } from "./DBTypeStructure.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";
import { parseNativeTypeName } from "../native/parseNativeTypeName.js";
import { parseTypeMode } from "./parseTypeMode.js";

export function parseType(type: any): DBTypeStructure<any> {
  if (type && DBTypeSymbol in type) {
    // type is already in a structured format
    // Either fixed by inner indexed(), primaryKey() or type() attribute,
    // or is a dbtypes compatible type that has the typeName prop.
    return type[DBTypeSymbol];
  }
  const directTypeString = parseNativeTypeName(type);
  if (directTypeString) {
    return {
      type: directTypeString.typeName,
      ctor: type as Function,
      default: directTypeString.default,
    };
  }
  if (parseTypeMode.active) {
    throw new Error("Invalid type was given: " + type);
  }
  return { type: "resolved", properties: {},  ctor: type?.prototype?.constructor, default: type as any};
}
