import { b64LexDecode, b64LexEncode } from "../../common/b64lex.js";
import { b64decode, b64encode } from "../../common/base64.js";

export default {
  ArrayBuffer: {
    replace: (ab: ArrayBuffer) => ({
      $t: "ArrayBuffer",
      b: b64LexEncode(ab),
    }),
    revive: ({ b }) => {
      const ba = b64LexDecode(b);
      return ba.buffer.byteLength === ba.byteLength
        ? ba.buffer
        : ba.buffer.slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
    },
  },
};
