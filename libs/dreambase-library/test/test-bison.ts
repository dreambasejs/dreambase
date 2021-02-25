import { FakeBlob } from "../src/typeson-simplified/BisonBinaryTypesNode.js";
import { BisonForNode } from "../src/typeson-simplified/BisonForNode.js";

describe("test-bison", () => {
  it("should convert object to binary and back", () => {
    const obj = {
      foo: "Bar",
      ab: Buffer.alloc(3),
      b: new FakeBlob(Buffer.alloc(2, 65), "text/plain"),
    };
    const BSON = BisonForNode();
    const buf = BSON.toBinary(obj);
    const [b, json] = BSON.stringify(obj);
    debugger;
    const objBack = BSON.fromBinary(buf);
    expect(objBack).toStrictEqual(obj);
  });
});
