import {
  arrayBuffer2String,
  string2ArrayBuffer,
} from "../string2arraybuffer.js";

export default {
  ArrayBuffer: {
    replace: (ab: ArrayBuffer) => ({
      $t: "ArrayBuffer",
      v: arrayBuffer2String(ab),
    }),
    revive: ({ v }) => {
      return string2ArrayBuffer(v);
    },
  },
};
