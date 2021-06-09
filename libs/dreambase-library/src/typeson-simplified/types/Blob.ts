import { FakeBlob } from "../FakeBlob.js";
import { readBlobSync } from "../readBlobSync.js";
import { string2ArrayBuffer } from "../string2arraybuffer.js";

export default {
  Blob: {
    test: (blob: FakeBlob, toStringTag: string) =>
      toStringTag === "Blob" || blob instanceof FakeBlob,
    replace: (blob: FakeBlob | Blob) => ({
      $t: "Blob",
      mimeType: blob.type,
      data: blob instanceof FakeBlob ? blob.buf : readBlobSync(blob),
    }),
    revive: ({ mimeType, data }) => {
      const ab = typeof data === "string" ? string2ArrayBuffer(data) : data;
      return typeof Blob !== undefined
        ? new Blob([ab])
        : new FakeBlob(ab, mimeType);
    },
  },
};
