import { _global } from "../../common/_global.js";
import { TypeDef } from "../TypeDef.js";

export default [
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "DataView",
  "BigInt64Array",
  "BigUint64Array",
].reduce(
  (specs, typeName) => ({
    ...specs,
    [typeName]: {
      // Replace passes the the typed array into $t, buffer so that
      // the ArrayBuffer typedef takes care of further handling of the buffer:
      // {$t:"Uint8Array",buffer:{$t:"ArrayBuffer",idx:0}}
      // CHANGED ABOVE! Now shortcutting that for more sparse format of the typed arrays
      // to contain the b64 property directly.
      replace: (
        a: ArrayBufferView,
        _: any,
        typeDefs: { ArrayBuffer: TypeDef<ArrayBuffer, { v: string }> }
      ) => {
        const result = {
          $t: typeName,
          v: typeDefs.ArrayBuffer.replace(
            a.byteOffset === 0 && a.byteLength === a.buffer.byteLength
              ? a.buffer
              : a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength),
            _,
            typeDefs
          ).v,
        };
        return result;
      },
      revive: (
        { v },
        _: any,
        typeDefs: { ArrayBuffer: TypeDef<ArrayBuffer, { v: string }> }
      ) => {
        const TypedArray = _global[typeName];
        return (
          TypedArray &&
          new TypedArray(typeDefs.ArrayBuffer.revive({ v }, _, typeDefs))
        );
      },
    },
  }),
  {}
);
