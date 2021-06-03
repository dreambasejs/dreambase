import { FakeBlob } from "../src/typeson-simplified/FakeBlob.js";
import { BisonForNode } from "../src/typeson-simplified/BisonForNode.js";

describe("test-bison", () => {
  it("should convert object to binary and back", () => {
    const blobbab = new Uint8Array(2);
    blobbab[0] = 68;
    blobbab[1] = 70;
    const obj = {
      foo: "Bar",
      ab: new ArrayBuffer(3),
      time: new Date(),
      b: new FakeBlob(
        blobbab.buffer.slice(blobbab.byteOffset, blobbab.byteLength),
        "text/plain"
      ),
    };
    const BSON = BisonForNode();
    const buf = BSON.toBinary(obj);
    const objBack = BSON.fromBinary(buf);
    const [b, json] = BSON.stringify(obj);
    expect(obj).toStrictEqual(objBack);
  });
});
