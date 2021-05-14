import { BisonBinaryTypesNode } from "./BisonBinaryTypesNode.js";
import builtin from "./presets/builtin.js";
import { TypeDefSet } from "./TypeDefSet.js";
import { TypesonSimplified } from "./TypesonSimplified.js";

export function BisonForNode(...typeDefsInputs: TypeDefSet[]) {
  const tson = TypesonSimplified(
    builtin,
    BisonBinaryTypesNode,
    ...typeDefsInputs
  );
  return {
    toBinary(value: any): Buffer {
      const [binData, json] = this.stringify(value);
      const lenBuf = Buffer.alloc(4);
      lenBuf.writeUInt32BE(binData.byteLength, 0);
      return Buffer.concat([lenBuf, binData, Buffer.from(json, "utf-8")]);
    },

    stringify(value: any): [Buffer, string] {
      const binaries: ArrayBuffer[] = [];
      const json = tson.stringify(value, binaries);
      const buf = Buffer.concat(
        binaries.map((b) => {
          const lenBuf = new ArrayBuffer(4);
          new DataView(lenBuf).setUint32(0, b.byteLength);
          return Buffer.concat([new Uint8Array(lenBuf), new Uint8Array(b)]);
        })
      );
      return [buf, json];
    },

    parse<T = any>(json: string, binData: Buffer): T {
      let pos = 0;
      const buffers: ArrayBuffer[] = [];
      while (pos < binData.byteLength) {
        const len = binData.readUInt32BE(pos);
        pos += 4;
        const dataBlob = binData.slice(pos, pos + len).buffer;
        pos += len;
        buffers.push(dataBlob);
      }
      return tson.parse(json, buffers);
    },

    fromBinary<T = any>(buf: Buffer): T {
      const len = buf.readUInt32BE(0);
      const binData = buf.slice(4, len + 4);
      const json = buf.slice(len + 4).toString("utf-8");
      return this.parse(json, binData);
    },
  };
}
