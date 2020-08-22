import { DBTypeContainer } from "../schema/DBTypeContainer.js";
import { NativeTypeConstructor } from "../native/NativeTypeConstructor.js";
import { DeclarationToType } from "../schema/declaration/DeclarationToType.js";
import { DBIndexStructure } from "../schema/DBIndexStructure.js";
import { parseType } from "../schema/parseType.js";
import { parseTypeMode } from "../schema/parseTypeMode.js";
import { PrimaryKeyType } from "../symbols/PrimaryKeyType.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";
import { PrimaryKeyOptions } from "./options/PrimaryKeyOptions.js";
import { TypeOptions } from "./options/TypeOptions.js";
import { parseIndexOptions } from "./helpers/parseIndexOptions.js";

export type IsPrimaryKey<T> = { constructor: { [PrimaryKeyType]?: T } };

export type PrimaryKeyOf<TEntity> = {
  [P in keyof TEntity]: TEntity[P] extends {
    constructor: { [PrimaryKeyType]?: infer PrimaryKeyType };
  }
    ? PrimaryKeyType
    : never;
}[keyof TEntity];

export function PrimaryKey<TTypeDeclaration extends NativeTypeConstructor>(
  type: TTypeDeclaration,
  options?: PrimaryKeyOptions<DeclarationToType<TTypeDeclaration>> &
    TypeOptions<DeclarationToType<TTypeDeclaration>>
): DeclarationToType<TTypeDeclaration> &
  IsPrimaryKey<DeclarationToType<TTypeDeclaration>> {
  const parsedType = parseType(type);
  if (!parseTypeMode.on) return parsedType.default;

  const [primaryIndex, ...forbidden] = parseIndexOptions({ unique: true }, []);

  if (forbidden.length > 0) {
    throw new TypeError(
      `Multiple combinations of compound keys cannot be declared directly on PrimaryKey(). Instead, use both PrimaryKey() and Indexed() on the same field if you need to add additional indexes on the primary key base field: Indexed(PrimaryKey(...), {compoundWith: [...arrays of field getters]})`
    );
  }

  Object.assign(primaryIndex, <DBIndexStructure>{
    isPrimaryKey: true,
    ...options,
  });

  const indexes = [primaryIndex, ...(parsedType.indexes || [])];

  return (<DBTypeContainer<any>>{
    [DBTypeSymbol]: {
      ...parsedType,
      indexes,
    },
  }) as any; // We lie intentionally!
}
