import { _global } from "../../common/_global.js";

import ArrayBufferSpec from "./ArrayBuffer.js";

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
      replace: (a: ArrayBufferView) => ({
        $t: typeName,
        b64: ArrayBufferSpec.ArrayBuffer.replace(
          a.byteOffset === 0 && a.byteLength === a.buffer.byteLength
            ? a.buffer
            : a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength)
        ).b64,
      }),
      revive: ({ b64 }) => {
        const TypedArray = _global[typeName];
        return (
          TypedArray &&
          new TypedArray(ArrayBufferSpec.ArrayBuffer.revive({ b64 }))
        );
      },
    },
  }),
  {}
);
