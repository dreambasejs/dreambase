import { TypesonSimplified } from "../src/typeson-simplified/TypesonSimplified.js";
import builtIn from "../src/typeson-simplified/presets/builtin.js";
import undef from "../src/typeson-simplified/types/undefined.js";

describe("test-undef", () => {
  const TSON = TypesonSimplified(builtIn, undef);
  it("should stringify undefined", () => {
    expect(TSON.stringify({ foo: null, bar: undefined })).toBe(
      JSON.stringify({ foo: null, bar: { $t: "undefined" } })
    );
  });
});
