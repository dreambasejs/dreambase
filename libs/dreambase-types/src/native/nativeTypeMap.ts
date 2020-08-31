import { sameTypeNativeCmp } from "../cmp/defaultCmp.js";
import { DBTypeStructure } from "../schema/DBTypeStructure.js";

const typedArrayNames = [8, 16, 32, 64]
  .map((num) => ["Int", "Uint", "Float"].map((t) => t + num + "Array"))
  .flat()
  .concat("Uint8ClampedArray");

// Table of [Contructor, typeName, defaultValue, convertIntoType(x)]
// For example String constructor also works as a function for converting something into
// a string. So String can be put in last argument. Date needs new in order to be
// a date object. Same goes with typed arrays.
const nativeTypes: [Function, string, any, (x: any) => any][] = [
  [String, "string", "", String],
  [Number, "number", 0, Number],
  [Boolean, "boolean", false, (x) => (x === "false" ? false : Boolean(x))],
  [BigInt, "bigint", BigInt(0), BigInt],
  [Date, "Date", new Date(0), (x) => new Date(x)],
  ...typedArrayNames
    .map(
      (typeName) =>
        [globalThis[typeName], typeName] as [new (x: number) => any, string]
    )
    .filter(([Ctor]) => Ctor)
    .map(
      ([Ctor, typeName]) =>
        [Ctor, typeName, new Ctor(0), (x) => new Ctor(x)] as [
          Function,
          string,
          any,
          (x: any) => any
        ]
    ),
];

export const nativeTypeMap = new Map<any, DBTypeStructure<any>>();

for (const [ctor, type, def, convertTo] of nativeTypes) {
  nativeTypeMap.set(ctor, {
    ctor,
    type,
    default: def,
    cmp: sameTypeNativeCmp,
    convertTo,
  });
}
