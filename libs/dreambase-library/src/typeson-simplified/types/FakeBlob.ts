import { b64decode, b64encode } from "../../common/base64.js";
import { FakeBlob } from "../FakeBlob.js";

export default {
  Blob: {
    test: (blob: FakeBlob) => blob instanceof FakeBlob,
    replace: (blob: FakeBlob) => ({
      $t: "Blob",
      v: b64encode(blob.buf),
      type: blob.type,
    }),
    revive: ({ type, v }) => {
      const ab = b64decode(v);
      return new FakeBlob(ab.buffer, type);
    },
  },
};
