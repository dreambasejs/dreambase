import bigintDef from "../types/bigint.js";
import SpecialNumberDef from "../types/SpecialNumber.js";
import DateDef from "../types/Date.js";
import SetDef from "../types/Set.js";
import MapDef from "../types/Map.js";
import TypedArraysDefs from "../types/TypedArray.js";
import ArrayBufferDef from "../types/ArrayBuffer.js";
import { TypeDefSet } from "../TypeDefSet.js";
import FakeBlob from "../types/FakeBlob.js";

const builtin: TypeDefSet = {
  ...bigintDef,
  ...SpecialNumberDef,
  ...DateDef,
  ...SetDef,
  ...MapDef,
  ...TypedArraysDefs,
  ...ArrayBufferDef,
  ...FakeBlob,
};

export default builtin;
