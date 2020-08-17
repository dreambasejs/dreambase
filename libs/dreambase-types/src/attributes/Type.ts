import { DeclarationToType } from "../schema/declaration/DeclarationToType.js";
import { parseType } from "../schema/parseType.js";
import { parseTypeMode } from "../schema/parseTypeMode.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";

export function Type<TTypeDeclaration>(
  type: TTypeDeclaration
): DeclarationToType<TTypeDeclaration> {
  const parsedType = parseType(type);
  return parseTypeMode.active
    ? ({ [DBTypeSymbol]: parsedType } as any) // We lie intentionally!
    : parsedType.default;
}
