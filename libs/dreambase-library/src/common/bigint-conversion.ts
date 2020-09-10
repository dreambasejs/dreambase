import { TypedArray } from "../typings/TypedArray.js";
import { b64decode, b64encode } from "./base64.js";

const HEX_PARSER_REGEXP = /[\da-f]{2}/gi;

export function buf2bigint(buf: TypedArray | ArrayBuffer): bigint {
  let bits = BigInt(8);
  if (ArrayBuffer.isView(buf)) bits = BigInt(buf.BYTES_PER_ELEMENT * 8);
  else buf = new Uint8Array(buf);

  let ret = BigInt(0);
  let iter = buf[Symbol.iterator]();
  let ir: IteratorResult<number>;
  while (true) {
    ir = iter.next();
    if (ir.done) break;
    const bi = BigInt(ir.value);
    ret = (ret << bits) | bi;
  }
  return ret;
}

export function bigint2Buf(bi: bigint): Uint8Array {
  if (bi < 0) throw new TypeError("Cannot convert negative bigint to a buffer");
  const hex = bi.toString(16);
  return Uint8Array.from(
    (
      (hex.length % 2 ? "0" + hex : hex).match(HEX_PARSER_REGEXP) || []
    ).map((h) => parseInt(h, 16))
  );
}

export function bigint2B64(bi: bigint): string {
  return b64encode(bigint2Buf(bi));
}

export function b64ToBigInt(base64: string): bigint {
  return buf2bigint(b64decode(base64));
}
