import { TypeDef } from "./TypeDef.js";
import { TypeDefSet } from "./TypeDefSet.js";

const { toString: toStr } = {};
function getToStringTag(val: any) {
  return toStr.call(val).slice(8, -1);
}

function escapeDollarProps(value: any) {
  const keys = Object.keys(value);
  let dollarKeys: string[] | null = null;
  for (let i = 0, l = keys.length; i < l; ++i)
    if (keys[i][0] === "$")
      dollarKeys = (dollarKeys || ([] as string[])).concat(keys[i]);
  if (!dollarKeys) return value;
  const clone = { ...value };
  for (const k of dollarKeys) {
    delete clone[k];
    clone["$" + k] = value[k];
  }
  return clone;
}

const ObjectDef = {
  replace: escapeDollarProps,
};

export function TypesonSimplified(...typeDefsInputs: TypeDefSet[]) {
  const typeDefs = typeDefsInputs.reduce(
    (p, c) => ({ ...p, ...c }),
    typeDefsInputs.reduce((p, c) => ({ ...c, ...p }), {})
  );
  const protoMap = new WeakMap<object, TypeDef | null>();
  return {
    stringify(value: any, alternateChannel?: any, space?: number): string {
      const nonStringifyables = [];
      const json = JSON.stringify(
        value,
        function (key: string) {
          const realVal = this[key];
          const typeDef = getTypeDef(realVal);
          return typeDef ? typeDef.replace(realVal, alternateChannel) : realVal;
        },
        space
      );
      return json;
    },

    parse(tson: string, alternateChannel?: any) {
      let parent = null;
      let unescapeParentKeys: string[] = [];

      return JSON.parse(tson, function (key, value) {
        //
        // Parent Part
        //
        const type = value?.$t;
        if (type) {
          const typeDef = typeDefs[type];
          value = typeDef ? typeDef.revive(value, alternateChannel) : value;
        }
        if (value === parent) {
          // Do what the kid told us to
          if (unescapeParentKeys.length > 0) {
            // Unescape dollar props
            value = { ...value };
            for (const k of unescapeParentKeys) {
              value[k.substr(1)] = value[k];
              delete value[k];
            }
          }
          unescapeParentKeys = [];
          return value;
        }

        //
        // Child part
        //
        if (key[0] === "$" && key !== "$t") {
          parent = this;
          unescapeParentKeys.push(key);
        }

        return value;
      });
    },
  };

  function getTypeDef(realVal: any) {
    switch (typeof realVal) {
      case "string":
      case "boolean":
      case "undefined":
        return null;
      case "number":
        return isNaN(realVal) || realVal === Infinity || realVal === -Infinity
          ? typeDefs.SpecialNumber
          : null;
      case "bigint":
        return typeDefs.bigint;
      case "object":
      case "function": {
        // "object", "function", null
        if (realVal === null) return null;
        const proto = Object.getPrototypeOf(realVal);
        if (!proto) return ObjectDef;
        let typeDef = protoMap.get(proto);
        if (typeDef !== undefined) return typeDef; // Null counts to! So the caching of Array.prototype also counts.
        const toStringTag = getToStringTag(realVal);
        const entry = Object.entries(typeDefs).find(([typeName, typeDef]) =>
          typeDef?.test
            ? typeDef.test(realVal, toStringTag)
            : typeName === toStringTag
        );
        typeDef = entry?.[1];
        if (!typeDef) {
          typeDef = Array.isArray(realVal)
            ? null
            : typeof realVal === "function"
            ? typeDefs.function || null
            : ((ObjectDef as unknown) as TypeDef);
        }
        protoMap.set(proto, typeDef);
        return typeDef;
      }
      case "symbol":
        return typeDefs.symbol;
    }
  }
}
