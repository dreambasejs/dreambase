import { TypesonSimplified } from "../src/typeson-simplified/TypesonSimplified.js";
import builtIn from "../src/typeson-simplified/presets/builtin.js";
import undef from "../src/typeson-simplified/types/undefined.js";

const TSON = TypesonSimplified(builtIn, undef);
describe("test-undef", () => {
  it("should stringify undefined", () => {
    expect(TSON.stringify({ foo: null, bar: undefined })).toBe(
      JSON.stringify({ foo: null, bar: { $t: "undefined" } })
    );
  });
  it("should revive undefined", () => {
    const revived = TSON.parse(TSON.stringify({ foo: null, bar: undefined }));
    expect(Object.keys(revived)).toStrictEqual(["foo", "bar"]);
    expect(Object.values(revived)).toStrictEqual([null, undefined]);
  });
  it("should not leak undefined properties to children", () => {
    const ORIG = {
      foo: null,
      undef1: undefined,
      $undef1: undefined,
      bar: {
        baz: "x",
        undef: undefined,
        $undef: undefined,
        $$undef: undefined,
        $Gunnar: "2",
        $t: undefined,
      },
      undef2: undefined,
      $undef2: undefined,
      $t: undefined,
    };
    const stringified = TSON.stringify(ORIG);
    const revived = TSON.parse(stringified);
    expect(revived).toStrictEqual(ORIG);
  });
});

describe("revive-sync-request", () => {
  it("should revive sync request", () => {
    const REQUEST = {
      schema: {
        $jobs2: {
          markedForSync: undefined,
          initiallySynced: true,
          generateGlobalId: undefined,
        },
        $jobs: {
          markedForSync: undefined,
          initiallySynced: true,
          generateGlobalId: undefined,
        },
      },
    };
    const stringified = TSON.stringify(REQUEST);
    const revived = TSON.parse(stringified);
    expect(revived).toStrictEqual(REQUEST);
  });
});
