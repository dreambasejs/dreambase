import { b64decode, b64encode } from "../../common/base64.js";

export default {
  ArrayBuffer: {
    replace: (ab: ArrayBuffer) => ({
      $t: "ArrayBuffer",
      b64: b64encode(ab),
    }),
    revive: ({ base64 }) => b64decode(base64).buffer,
  },
};
