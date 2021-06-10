import { FakeBlob } from "../FakeBlob.js";
import { readBlobSync } from "../readBlobSync.js";
import {
  arrayBuffer2String,
  string2ArrayBuffer,
} from "../string2arraybuffer.js";

export default {
  Blob: {
    test: (blob: Blob | FakeBlob, toStringTag: string) =>
      toStringTag === "Blob" || blob instanceof FakeBlob,
    replace: (blob: Blob | FakeBlob) => ({
      $t: "Blob",
      v:
        blob instanceof FakeBlob
          ? arrayBuffer2String(blob.buf)
          : readBlobSync(blob),
      type: blob.type,
    }),
    revive: ({ type, v }) => {
      const ab = string2ArrayBuffer(v);
      return typeof Blob !== undefined
        ? new Blob([ab])
        : new FakeBlob(ab, type);
    },
  },
};
