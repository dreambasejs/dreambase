import { parse } from "path";
import { Stream, Duplex } from "stream";
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
    streamify(value: any): Stream {
      const [binData, json] = this.split(value);
      const stream = new Duplex();
      const lenBuf = new ArrayBuffer(4);
      new DataView(lenBuf).setUint32(0, binData.byteLength);
      stream.push(lenBuf);
      stream.push(binData);
      stream.push(json, "utf-8");
      return stream;
    },

    split(value: any): [Buffer, string] {
      const binaries: Buffer[] = [];
      const json = tson.stringify(value, binaries);
      const buf = Buffer.concat(
        binaries.map((b) => {
          const lenBuf = new ArrayBuffer(4);
          new DataView(lenBuf).setUint32(0, b.byteLength);
          return Buffer.concat([new Uint8Array(lenBuf), b]);
        })
      );
      return [buf, json];
    },

    async unsplit<T = any>(json: string, binData: Buffer): Promise<T> {
      let pos = 0;
      const buffers: Buffer[] = [];
      while (pos < binData.byteLength) {
        const len = binData.readUInt32BE(pos);
        pos += 4;
        const dataBlob = binData.slice(pos, pos + len);
        pos += len;
        buffers.push(dataBlob);
      }
      return tson.parse(json, buffers);
    },

    async parse<T = any>(stream: Stream): Promise<T> {
      const buf = await streamToBuffer(stream);
      const len = buf.readUInt32BE(0);
      const binData = buf.slice(4, len + 4);
      const json = buf.slice(len + 4).toString("utf-8");
      return await this.unsplit(json, binData);
    },
  };
}

function streamToBuffer(stream: Stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let buffers: Buffer[] = [];
    stream.on("error", reject);
    stream.on("data", (data) => buffers.push(data));
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });
}
