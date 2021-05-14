import { TypeDefSet } from "./TypeDefSet.js";

export const BisonBinaryTypes: TypeDefSet = {
  Blob: {
    test: (blob: Blob, toStringTag) => toStringTag === "Blob",
    replace: (blob: Blob, altChannel: (Blob | ArrayBuffer)[]) => {
      const i = altChannel.length;
      altChannel.push(blob);
      return {
        $t: "Blob",
        mimeType: blob.type,
        i,
      };
    },
    revive: ({ i, mimeType }, altChannel: ArrayBuffer[]) =>
      new Blob([altChannel[i]], { type: mimeType }),
  },
};
