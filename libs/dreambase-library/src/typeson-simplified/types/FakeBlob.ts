import { FakeBlob } from "../FakeBlob.js";

export default {
  FakeBlob: {
    test: (blob: FakeBlob) => blob instanceof FakeBlob,
    replace: (blob: FakeBlob) => ({
      $t: "FakeBlob",
      mimeType: blob.mimeType,
      buf: blob.buf,
    }),
    revive: ({ mimeType, buf }) => new FakeBlob(buf, mimeType),
  },
};
