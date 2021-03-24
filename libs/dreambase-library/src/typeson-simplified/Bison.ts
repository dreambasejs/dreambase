import { BisonBinaryTypes } from "./BisonBinaryTypes.js";
import builtin from "./presets/builtin.js";
import { TypeDefSet } from "./TypeDefSet.js";
import { TypesonSimplified } from "./TypesonSimplified.js";

export function Bison(...typeDefsInputs: TypeDefSet[]) {
  const tson = TypesonSimplified(builtin, BisonBinaryTypes, ...typeDefsInputs);
  return {
    toBinary(value: any): Blob {
      const [blob, json] = this.stringify(value);
      const lenBuf = new ArrayBuffer(4);
      new DataView(lenBuf).setUint32(0, (blob as Blob).size);
      return new Blob([lenBuf, blob, json]);
    },
    stringify(value: any): [Blob, string] {
      const binaries: (ArrayBuffer | Blob)[] = [];
      const json = tson.stringify(value, binaries);
      const blob = new Blob(
        binaries.map<BlobPart>((b) => {
          const lenBuf = new ArrayBuffer(4);
          new DataView(lenBuf).setUint32(
            0,
            "byteLength" in b ? b.byteLength : b.size
          );
          return new Blob([lenBuf, b]);
        })
      );
      return [blob, json];
    },
    async parse<T = any>(json: string, binData: Blob): Promise<T> {
      let pos = 0;
      const arrayBuffers: ArrayBuffer[] = [];
      const buf = await readBlobBinary(binData);
      const view = new DataView(buf);
      while (pos < buf.byteLength) {
        const len = view.getUint32(pos);
        pos += 4;
        const ab = buf.slice(pos, pos + len);
        pos += len;
        arrayBuffers.push(ab);
      }
      return tson.parse(json, arrayBuffers);
    },

    async fromBinary<T = any>(blob: Blob): Promise<T> {
      const len = new DataView(
        await readBlobBinary(blob.slice(0, 4))
      ).getUint32(0);
      const binData = blob.slice(4, len + 4);
      const json = await readBlob(blob.slice(len + 4));
      return await this.parse(json, binData);
    },
  };
}

export function readBlob(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = (ev) => reject(new Error("file read aborted"));
    reader.onerror = (ev) => reject((ev.target as any).error);
    reader.onload = (ev) => resolve((ev.target as any).result);
    reader.readAsText(blob);
  });
}

export function readBlobBinary(blob: Blob): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = (ev) => reject(new Error("file read aborted"));
    reader.onerror = (ev) => reject((ev.target as any).error);
    reader.onload = (ev) => resolve((ev.target as any).result);
    reader.readAsArrayBuffer(blob);
  });
}
