import { DBTypeStructure } from "../schema/DBTypeStructure.js";

/**
 * This function works for many native types including:
 *  number
 *  string
 *  boolean
 *  Date
 *  Uint8Array
 *  Int8Array
 *  ...other typed arrays
 *
 * The result could be surprising if a and b are of different types.
 * In that case this function is not compatible with neither
 * Postgres JSONB or IDB if comparing different types.
 * However, IDB, Postgres and MongoDB all use different orderings of types anyway.
 *
 */
export const sameTypeNativeCmp = (a: any, b: any) =>
  a < b ? -1 : a > b ? 1 : 0;

export const getArrayCmp = (itemCmp: (a: any, b: any) => number) => (
  a: any[],
  b: any[]
) => {
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; ++i) {
    const diff = itemCmp(a[i], b[i]);
    if (diff) return diff;
  }
  return sameTypeNativeCmp(a.length, b.length);
};

export const getObjectCmp = (type: DBTypeStructure<any>) => {
  const propNames = Object.keys(type.properties!);
  const cmps = Object.values(type.properties!).map(({ cmp }) => cmp!);
  return (a: any, b: any) => {
    for (let i = 0, l = propNames.length; i < l; ++i) {
      const diff = cmps[i](a[propNames[i]], b[propNames[i]]);
      if (diff) return diff;
    }
    return 0;
  };
};

export const getEntityCmp = ({
  cmp,
  primaryKey: { readProp },
}: Required<DBTypeStructure<any>>) => (a: any, b: any) => {
  return cmp(readProp!(a), readProp!(b));
};
