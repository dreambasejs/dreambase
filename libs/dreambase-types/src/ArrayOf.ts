import { TypeOptions } from "./attributes/options/TypeOptions.js";
import { DBTypeStructure } from "./schema/DBTypeStructure.js";
import { DeclarationToType } from "./schema/declaration/DeclarationToType.js";
import { parseType } from "./schema/parseType.js";
import { parseTypeMode } from "./schema/parseTypeMode.js";
import { DBTypeSymbol } from "./symbols/DBTypeSymbol.js";

export function ArrayOf<TTypeDeclaration>(
  type: TTypeDeclaration,
  options?: TypeOptions<DeclarationToType<TTypeDeclaration>[]>
): DeclarationToType<TTypeDeclaration>[] {
  const itemType = parseType(type);
  if (!parseTypeMode.on) return (options?.default || []) as any;
  return {
    [DBTypeSymbol]: <DBTypeStructure<any[]>>{
      ctor: Array,
      default: options?.default || (options?.nullable ? null : []),
      type: "array",
      item: itemType,
    },
  } as any; // We lie intentionally!
}
