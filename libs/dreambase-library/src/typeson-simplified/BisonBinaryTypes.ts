import { TypeDefSet } from "./TypeDefSet.js";

export const BisonBinaryTypes: TypeDefSet = {
  BisonArrayBuffer: {
    test: (ab: ArrayBuffer, toStringTag) => toStringTag === "ArrayBuffer",
    replace: (ab: ArrayBuffer, altChannel: (Blob | ArrayBuffer)[]) => {
      const i = altChannel.length;
      altChannel.push(ab);
      return {
        $t: "BisonArrayBuffer",
        i,
      };
    },
    revive: ({ i }, altChannel) => altChannel[i] as ArrayBuffer,
  },
  BisonBlob: {
    test: (blob: Blob, toStringTag) => toStringTag === "Blob",
    replace: (blob: Blob, altChannel: (Blob | ArrayBuffer)[]) => {
      const i = altChannel.length;
      altChannel.push(blob);
      return {
        $t: "BisonBlob",
        mimeType: blob.type,
        i,
      };
    },
    revive: ({ i, mimeType }, altChannel: ArrayBuffer[]) =>
      new Blob([altChannel[i]], { type: mimeType }),
  },
};
