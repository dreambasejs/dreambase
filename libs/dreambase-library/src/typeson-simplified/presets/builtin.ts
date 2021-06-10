import { TypeDefSet } from "../TypeDefSet.js";
import numberDef from "../types/number.js";
import bigintDef from "../types/bigint.js";
import DateDef from "../types/Date.js";
import SetDef from "../types/Set.js";
import MapDef from "../types/Map.js";
import TypedArraysDefs from "../types/TypedArray.js";
import ArrayBufferDef from "../types/ArrayBuffer.js";
import BlobDef from "../types/Blob.js";

const builtin: TypeDefSet = {
  ...numberDef,
  ...bigintDef,
  ...DateDef,
  ...SetDef,
  ...MapDef,
  ...TypedArraysDefs,
  ...ArrayBufferDef,
  ...BlobDef, // Should be moved to another preset for DOM types (or universal? since it supports node as well with FakeBlob)
};

export default builtin;
