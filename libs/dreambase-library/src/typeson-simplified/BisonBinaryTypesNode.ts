import { TypeDefSet } from "./TypeDefSet.js";

export class FakeBlob {
  constructor(public buf: Buffer, public mimeType?: string) {}
}

export const BisonBinaryTypesNode: TypeDefSet = {
  BisonArrayBuffer: {
    test: (buf: Buffer | ArrayBuffer, toStringTag) =>
      buf instanceof Buffer || toStringTag === "ArrayBuffer",
    replace: (buf: Buffer | ArrayBuffer, altChannel: Buffer[]) => {
      const i = altChannel.length;
      altChannel.push("buffer" in buf ? buf : Buffer.from(buf));
      return {
        $t: "BisonArrayBuffer",
        i,
      };
    },
    revive: ({ i }, altChannel) => altChannel[i] as Buffer,
  },
  BisonBlob: {
    test: (blob: FakeBlob) => blob instanceof FakeBlob,
    replace: (blob: FakeBlob, altChannel: Buffer[]) => {
      const i = altChannel.length;
      altChannel.push(blob.buf);
      return {
        $t: "BisonBlob",
        mimeType: blob.mimeType,
        i,
      };
    },
    revive: ({ i, mimeType }, altChannel: Buffer[]) =>
      new FakeBlob(altChannel[i], mimeType),
  },
};
