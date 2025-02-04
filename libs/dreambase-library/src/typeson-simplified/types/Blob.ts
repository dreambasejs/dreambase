import { b64decode, b64encode } from "../../common/base64.js";
import { FakeBlob } from "../FakeBlob.js";
import { readBlobSync } from "../readBlobSync.js";
import { string2ArrayBuffer } from "../string2ArrayBuffer.js";

export default {
  Blob: {
    test: (blob: Blob | FakeBlob, toStringTag: string) =>
      toStringTag === "Blob" || blob instanceof FakeBlob,
    replace: (blob: Blob | FakeBlob) => ({
      $t: "Blob",
      v:
        blob instanceof FakeBlob
          ? b64encode(blob.buf)
          : b64encode(string2ArrayBuffer(readBlobSync(blob))),
      type: blob.type,
    }),
    revive: ({ type, v }) => {
      const ab = b64decode(v);
      return typeof Blob !== undefined
        ? new Blob([ab])
        : new FakeBlob(ab.buffer, type);
    },
  },
};
