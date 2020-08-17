import { DBTypeContainer } from "../schema/DBTypeContainer.js";
import { NativeTypeConstructor } from "../native/NativeTypeConstructor.js";
import { DeclarationToType } from "../schema/declaration/DeclarationToType.js";
import { DBIndexStructure } from "../schema/DBIndexStructure.js";
import { parseType } from "../schema/parseType.js";
import { DBTypeStructure } from "../schema/DBTypeStructure.js";
import { parseTypeMode } from "../schema/parseTypeMode.js";
import { IsPrimaryKey } from "../symbols/IsPrimaryKey.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";

export function PrimaryKey<
  TTypeDeclaration extends NativeTypeConstructor | [NativeTypeConstructor]
>(
  type: TTypeDeclaration
): DeclarationToType<TTypeDeclaration> & { [IsPrimaryKey]?: true } {
  const parsedType = parseType(type);
  return parseTypeMode.active
    ? ({
        [DBTypeSymbol]: {
          ...parsedType,
          index: {
            isPrimaryKey: true,
            unique: true,
          },
        },
      } as any)
    : parsedType.default;
}
