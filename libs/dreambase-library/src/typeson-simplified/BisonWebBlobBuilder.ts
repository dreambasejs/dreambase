/* Untested */

import { Bison } from "./Bison.js";

export function BisonWebBlobBuilder(bison: ReturnType<typeof Bison>) {
  const result: BlobPart[] = [];

  function addBlob(type: number, blob: Blob) {
    const hdrBuf = new ArrayBuffer(5);
    const dw = new DataView(hdrBuf);
    dw.setUint8(0, type);
    dw.setUint32(1, length);
    result.push(hdrBuf);
    result.push(blob);
  }

  return {
    addHeader(header: any) {
      const jsonBlob = new Blob([JSON.stringify(header)]);
      addBlob(1, jsonBlob);
    },
    addData(value: any) {
      const dataBlob = bison.toBinary(value);
      addBlob(2, dataBlob);
    },
    getResult() {
      return new Blob(result);
    },
  };
}
