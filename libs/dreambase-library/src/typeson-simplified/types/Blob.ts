import { b64decode, b64encode } from "../../common/base64.js";
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
      data: b64encode(
        blob instanceof FakeBlob
          ? blob.buf
          : string2ArrayBuffer(readBlobSync(blob))
      ),
    }),
    revive: ({ mimeType, data }) => {
      const ab = b64decode(data);
      return typeof Blob !== undefined
        ? new Blob([ab])
        : new FakeBlob(ab, mimeType);
    },
  },
};
