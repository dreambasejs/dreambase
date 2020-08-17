import { DBTypeStructure } from "../schema/DBTypeStructure.js";
import { parseTypeMode } from "../schema/parseTypeMode.js";
import { DBTypeContainer } from "../schema/DBTypeContainer.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";

export function Composite<T, TFieldGetters extends any[]>(
  indexed: T,
  ...fieldGetters: TFieldGetters
): T {
  if (!parseTypeMode.active) {
    return indexed;
  }
  const type = indexed?.[DBTypeSymbol] as DBTypeStructure<any>;
  const index = type?.index;
  if (!index)
    throw new Error(
      `First argument to Composite() must be an index or primary key`
    );
  const compositeIndex = { ...index };
  parseTypeMode.phase3.push(
    () => (compositeIndex.compositeProps = fieldGetters.map((fg) => fg()))
  );
  return (<DBTypeContainer<any>>{
    [DBTypeSymbol]: {
      ...type,
      index: {
        ...compositeIndex,
      },
    },
  }) as any; // We lie intentionally!
}
