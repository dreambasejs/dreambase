import { DeclarationToType } from "../schema/declaration/DeclarationToType.js";
import { parseType } from "../schema/parseType.js";
import { parseTypeMode } from "../schema/parseTypeMode.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";
import { TypeOptions } from "./options/TypeOptions.js";

export function Type<TTypeDeclaration>(
  type: TTypeDeclaration,
  options?: TypeOptions<DeclarationToType<TTypeDeclaration>>
): DeclarationToType<TTypeDeclaration> {
  const parsedType = parseType(type, options);
  return parseTypeMode.on
    ? ({ [DBTypeSymbol]: parsedType } as any) // We lie intentionally!
    : parsedType.default;
}
