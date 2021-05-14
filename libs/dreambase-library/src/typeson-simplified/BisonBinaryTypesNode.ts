import { FakeBlob } from "./FakeBlob.js";
import { TypeDefSet } from "./TypeDefSet.js";

export const BisonBinaryTypesNode: TypeDefSet = {
  BisonArrayBuffer: {
    test: (buf: Buffer | ArrayBuffer, toStringTag) =>
      buf instanceof Buffer || toStringTag === "ArrayBuffer",
    replace: (buf: Buffer | ArrayBuffer, altChannel: ArrayBuffer[]) => {
      const i = altChannel.length;
      altChannel.push(
        "buffer" in buf ? buf.buffer.slice(buf.byteOffset, buf.byteLength) : buf
      );
      return {
        $t: "BisonArrayBuffer",
        i,
      };
    },
    revive: ({ i }, altChannel: ArrayBuffer[]) => altChannel[i],
  },
  BisonBlob: {
    test: (blob: FakeBlob) => blob instanceof FakeBlob,
    replace: (blob: FakeBlob, altChannel: ArrayBuffer[]) => {
      const i = altChannel.length;
      altChannel.push(blob.buf);
      return {
        $t: "BisonBlob",
        mimeType: blob.mimeType,
        i,
      };
    },
    revive: ({ i, mimeType }, altChannel: ArrayBuffer[]) =>
      new FakeBlob(altChannel[i], mimeType),
  },
};
