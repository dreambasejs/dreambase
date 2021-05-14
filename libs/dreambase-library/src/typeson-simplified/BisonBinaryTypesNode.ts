import { FakeBlob } from "./FakeBlob.js";
import { TypeDefSet } from "./TypeDefSet.js";

export const BisonBinaryTypesNode: TypeDefSet = {
  Blob: {
    test: (blob: FakeBlob) => blob instanceof FakeBlob,
    replace: (blob: FakeBlob, altChannel: ArrayBuffer[]) => {
      const i = altChannel.length;
      altChannel.push(blob.buf);
      return {
        $t: "Blob",
        mimeType: blob.mimeType,
        i,
      };
    },
    revive: ({ i, mimeType }, altChannel: ArrayBuffer[]) =>
      new FakeBlob(altChannel[i], mimeType),
  },
};
