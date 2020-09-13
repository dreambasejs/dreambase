import bigintDef from "../types/bigint.js";
import SpecialNumberDef from "../types/SpecialNumber.js";
import DateDef from "../types/Date.js";
import SetDef from "../types/Set.js";
import MapDef from "../types/Map.js";
import TypedArraysDefs from "../types/TypedArray.js";
import ArrayBufferDef from "../types/ArrayBuffer.js";

export default {
  ...bigintDef,
  ...SpecialNumberDef,
  ...DateDef,
  ...SetDef,
  ...MapDef,
  ...TypedArraysDefs,
  ...ArrayBufferDef,
};
