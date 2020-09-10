import { b64decode, b64encode } from "../../common/base64.js";

export default {
  ArrayBuffer: {
    replace: (ab: ArrayBuffer) => ({
      $t: "ArrayBuffer",
      b64: b64encode(ab),
    }),
    revive: ({ b64 }) => {
      const ba = b64decode(b64);
      return ba.buffer.byteLength === ba.byteLength
        ? ba.buffer
        : ba.buffer.slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
    },
  },
};
