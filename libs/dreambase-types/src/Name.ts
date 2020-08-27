import { TypeOptions } from "./attributes/options/TypeOptions.js";
import { DBTypeStructure } from "./schema/DBTypeStructure.js";
import { DeclarationToType } from "./schema/declaration/DeclarationToType.js";
import { parseType } from "./schema/parseType.js";
import { parseTypeMode } from "./schema/parseTypeMode.js";
import { DBTypeSymbol } from "./symbols/DBTypeSymbol.js";

export function Name(str?: string) {
  return String(str);
}

Name[DBTypeSymbol] = {
  type: "Name",
  ctor: Name,
  default: "",
  // TODO: Define how it is comparing against other Names and other strings. What about locale?
};
