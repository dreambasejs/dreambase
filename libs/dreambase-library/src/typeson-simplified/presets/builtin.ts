import bigintDef from "../types/bigint.js";
import SpecialNumberDef from "../types/SpecialNumber.js";
import DateDef from "../types/Date.js";
import SetDef from "../types/Set.js";
import MapDef from "../types/Map.js";
import TypedArraysDefs from "../types/TypedArray";
import ArrayBufferDef from "../types/ArrayBuffer";

export default {
  ...bigintDef,
  ...SpecialNumberDef,
  ...DateDef,
  ...SetDef,
  ...MapDef,
  ...TypedArraysDefs,
  ...ArrayBufferDef,
};
