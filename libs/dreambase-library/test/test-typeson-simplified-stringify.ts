import { TypesonSimplified } from "../src/typeson-simplified/TypesonSimplified.js";
import builtIn from "../src/typeson-simplified/presets/builtin.js";

describe("test-stringify-plain", () => {
  const TSON = TypesonSimplified(builtIn);
  it("should stringify plain objects", () => {
    const plainObject = { foo: "bar" };
    expect(TSON.stringify(plainObject)).toBe(JSON.stringify(plainObject));
  });
  it("should stringify plain arrays", () => {
    const plainArray = [{ foo: "bar" }, 5, "dfd"];
    expect(TSON.stringify(plainArray)).toBe(JSON.stringify(plainArray));
  });
  it("should stringify plain number", () => {
    expect(TSON.stringify(88)).toBe(JSON.stringify(88));
  });
  it("should stringify plain boolean", () => {
    expect(TSON.stringify(false)).toBe(JSON.stringify(false));
    expect(TSON.stringify(true)).toBe(JSON.stringify(true));
  });
});

describe("test-stringify-specials", () => {
  const TSON = TypesonSimplified(builtIn);
  it("should stringify NaN", () => {
    expect(TSON.stringify(NaN)).toBe(
      JSON.stringify({ $t: "SpecialNumber", v: "NaN" })
    );
  });
  it("should stringify Infinity", () => {
    expect(TSON.stringify(Infinity)).toBe(
      JSON.stringify({ $t: "SpecialNumber", v: "Infinity" })
    );
  });
  it("should stringify NegativeInfinity", () => {
    expect(TSON.stringify(-Infinity)).toBe(
      JSON.stringify({ $t: "SpecialNumber", v: "-Infinity" })
    );
  });
  it("should stringify bigints", () => {
    expect(
      TSON.stringify([
        BigInt(0),
        BigInt(1),
        BigInt(-1),
        BigInt(16),
        BigInt(0x1_ffff_ffff_ffff_ffff),
      ])
    ).toBe(
      JSON.stringify([
        {
          $t: "bigint",
          b64: "AA==",
        },
        {
          $t: "bigint",
          b64: "AQ==",
        },
        {
          $t: "bigint",
          neg: true,
          b64: "AQ==",
        },
        {
          $t: "bigint",
          b64: "EA==",
        },
        {
          $t: "bigint",
          b64: "AgAAAAAAAAAA",
        },
      ])
    );
  });
});

describe("test-stringify-compplex", () => {
  const TSON = TypesonSimplified(builtIn);
  it("should stringify Date objects", () => {
    const date = new Date(0);
    const invalidDate = new Date(NaN);
    const plainObject = { foo: date, bar: invalidDate };
    expect(TSON.stringify(plainObject)).toBe(
      JSON.stringify({
        foo: {
          $t: "Date",
          v: 0,
        },
        bar: {
          $t: "Date",
          v: { $t: "SpecialNumber", v: "NaN" },
        },
      })
    );
  });
});
