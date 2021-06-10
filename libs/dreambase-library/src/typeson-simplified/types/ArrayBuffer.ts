import { b64LexDecode, b64LexEncode } from "../../common/b64lex.js";

export default {
  ArrayBuffer: {
    replace: (ab: ArrayBuffer) => ({
      $t: "ArrayBuffer",
      v: b64LexEncode(ab),
    }),
    revive: ({ v }) => {
      const ba = b64LexDecode(v);
      return ba.buffer.byteLength === ba.byteLength
        ? ba.buffer
        : ba.buffer.slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
    },
  },
};
