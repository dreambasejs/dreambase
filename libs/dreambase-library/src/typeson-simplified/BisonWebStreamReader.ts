/* Untested */

import { Bison, readBlob, readBlobBinary } from "./Bison.js";
import { readableStreamIterator } from "./readableStreamIterator.js";

export enum BisonMessageType {
  HEADER = 1,
  DATA = 2,
}

export interface BisonMessageHeader<T> {
  type: BisonMessageType.HEADER;
  header: T;
}

export interface BisonMessageData<T> {
  type: BisonMessageType.DATA;
  data: T;
}

export type BisonMessage<TD, TH> =
  | BisonMessageHeader<TH>
  | BisonMessageData<TD>;

export async function* BisonWebStreamReader<TD, TH>(
  bison: ReturnType<typeof Bison>,
  res: Response
): AsyncIterator<BisonMessage<TD, TH>> {
  if (!res.body) throw new Error("No body in response");
  const it = readableStreamIterator(res.body);
  while (true) {
    await it.next(5);
    let x = await it.next();
    if (x.done) break;

    const header = await readBlobBinary(x.value as Blob);
    const dw = new DataView(header);
    const type = dw.getUint8(0);
    const length = dw.getUint32(1);
    await it.next(length);
    x = await it.next();
    if (x.done) break;
    if (type === 1) {
      const header = JSON.parse(await readBlob(x.value as Blob));
      yield {
        type,
        header,
      };
    } else {
      const data = await bison.fromBinary(x.value as Blob);
      yield {
        type,
        data,
      };
    }
  }
}
