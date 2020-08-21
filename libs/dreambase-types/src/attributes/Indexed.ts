import { DBTypeContainer } from "../schema/DBTypeContainer.js";
import { DeclarationToType } from "../schema/declaration/DeclarationToType.js";
import { parseType } from "../schema/parseType.js";
import { parseTypeMode } from "../schema/parseTypeMode.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";
import { parseIndexOptions } from "./helpers/parseIndexOptions.js";
import { IndexOptions } from "./options/IndexOptions.js";
import { TypeOptions } from "./options/TypeOptions.js";

export function Indexed<TTypeDeclaration>(
  type: TTypeDeclaration,
  options?: IndexOptions<DeclarationToType<TTypeDeclaration>> &
    TypeOptions<DeclarationToType<TTypeDeclaration>>
): DeclarationToType<TTypeDeclaration> {
  const parsedType = parseType(type, options);
  if (!parseTypeMode.activeType) return parsedType.default;

  const indexes = parseIndexOptions(options || {}, [
    ...(parsedType.indexes || []),
  ]);

  return (<DBTypeContainer<any>>{
    [DBTypeSymbol]: {
      ...parsedType,
      indexes,
    },
  }) as any; // We lie intentionally!
}
