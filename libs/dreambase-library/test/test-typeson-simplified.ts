import { TypesonSimplified } from "../src/typeson-simplified/TypesonSimplified.js";
import builtIn from "../src/typeson-simplified/presets/builtin.js";

describe("test-stringify-plain", () => {
  const TSON = TypesonSimplified(builtIn);
  it("should stringify plain objects", () => {
    const plainObject = { foo: "bar" };
    const tson = TSON.stringify(plainObject);
    expect(tson).toBe(JSON.stringify(plainObject));
    expect(TSON.parse(tson)).toStrictEqual(plainObject);
  });
  it("should stringify plain arrays", () => {
    const plainArray = [{ foo: "bar" }, 5, "dfd"];
    const tson = TSON.stringify(plainArray);
    expect(tson).toBe(JSON.stringify(plainArray));
    expect(TSON.parse(tson)).toStrictEqual(plainArray);
  });
  it("should stringify plain number", () => {
    expect(TSON.stringify(88)).toBe(JSON.stringify(88));
    expect(TSON.parse("88")).toBe(88);
  });
  it("should stringify plain boolean", () => {
    expect(TSON.stringify(false)).toBe(JSON.stringify(false));
    expect(TSON.stringify(true)).toBe(JSON.stringify(true));
    expect(TSON.parse("false")).toStrictEqual(false);
    expect(TSON.parse("true")).toStrictEqual(true);
  });
  it("should stringify null", () => {
    expect(TSON.stringify({ foo: null })).toBe(JSON.stringify({ foo: null }));
    expect(TSON.stringify(null)).toBe("null");
  });
  it("should not stringify undefined", () => {
    expect(TSON.stringify({ foo: null, bar: undefined })).toBe(
      JSON.stringify({ foo: null, bar: undefined })
    );
  });
  it("should escape props with leading $", () => {
    // Escaping of props named "$t":
    const input = { $t: "fakeType" };
    const tson = TSON.stringify(input);
    expect(tson).toBe(JSON.stringify({ $$t: "fakeType" }));
    expect(TSON.parse(tson)).toStrictEqual(input);

    // Escaping of props named "$hello":
    const tson2 = TSON.stringify({ $hello: "world" });
    expect(tson2).toBe(JSON.stringify({ $$hello: "world" }));
    expect(TSON.parse(tson2)).toStrictEqual({ $hello: "world" });

    // Escaping of props named "$":
    const tson3 = TSON.stringify({ $: 3 });
    expect(tson3).toBe(JSON.stringify({ $$: 3 }));
    expect(TSON.parse(tson3)).toStrictEqual({ $: 3 });
  });
});

describe("test-stringify-specials", () => {
  const TSON = TypesonSimplified(builtIn);
  it("should stringify NaN", () => {
    const tson = TSON.stringify(NaN);
    expect(tson).toBe(JSON.stringify({ $t: "SpecialNumber", v: "NaN" }));
    expect(TSON.parse(tson)).toBeNaN();
  });
  it("should stringify Infinity", () => {
    const tson = TSON.stringify(Infinity);
    expect(tson).toBe(JSON.stringify({ $t: "SpecialNumber", v: "Infinity" }));
    expect(TSON.parse(tson)).toBe(Infinity);
  });
  it("should stringify NegativeInfinity", () => {
    const tson = TSON.stringify(-Infinity);
    expect(tson).toBe(JSON.stringify({ $t: "SpecialNumber", v: "-Infinity" }));
    expect(TSON.parse(tson)).toBe(-Infinity);
  });
  it("should stringify bigints", () => {
    const golem96 =
      (BigInt(0xabcd_1234) << BigInt(64)) |
      (BigInt(0x0000_9876) << BigInt(32)) |
      BigInt(0x8888_7776);
    const input = [BigInt(0), BigInt(1), BigInt(-1), BigInt(16), golem96];
    const tson = TSON.stringify(input);
    const back: typeof input = TSON.parse(tson);
    expect(back[0]).toBe(BigInt(0));
    expect(back[1]).toBe(BigInt(1));
    expect(back[2]).toBe(BigInt(-1));
    expect(back[3]).toBe(BigInt(16));
    expect(back[4]).toBe(golem96);
    expect(tson).toBe(
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
          b64: "q80SNAAAmHaIiHd2",
        },
      ])
    );
  });
});

describe("test-stringify-complex", () => {
  const TSON = TypesonSimplified(builtIn);
  it("should stringify Date objects", () => {
    const date = new Date(0);
    const invalidDate = new Date(NaN);
    const plainObject = { foo: date, bar: invalidDate };
    const tson = TSON.stringify(plainObject);
    expect(tson).toBe(
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
    expect(TSON.parse(tson).foo).toStrictEqual(plainObject.foo);
    expect(TSON.parse(tson).bar.getTime()).toBeNaN();
  });

  it("should stringify Map", () => {
    const m = new Map<string, { foo: Array<number> }>();
    m.set("foo", { foo: [1, 2, 3, Infinity] });
    const tson = TSON.stringify(m);
    expect(tson).toBe(
      JSON.stringify({
        $t: "Map",
        v: [
          ["foo", { foo: [1, 2, 3, { $t: "SpecialNumber", v: "Infinity" }] }],
        ],
      })
    );
    expect(TSON.parse(tson)).toStrictEqual(m);
  });

  it("should stringify Float64Array", () => {
    const fa = new Float64Array([19.6]);
    expect(new Float64Array([19.6])).toStrictEqual(fa);
    const tson = TSON.stringify(fa);
    expect(tson).toBe(
      JSON.stringify({
        $t: "Float64Array",
        b: {
          $t: "ArrayBuffer",
          b64: "mpmZmZmZM0A=",
        },
      })
    );
    expect(TSON.parse(tson)).toStrictEqual(fa);
  });
});

describe("test-alternate-channel", () => {
  const TSON = TypesonSimplified({
    ArrayBuffer2: {
      test: (val, toStringTag) => toStringTag === "ArrayBuffer",
      replace: (val: ArrayBuffer, altChannel: ArrayBuffer[]) => {
        const pos = altChannel.length;
        altChannel.push(val);
        return { $t: "ArrayBuffer2", i: pos };
      },
      revive: ({ i }, altChannel: ArrayBuffer[]) => {
        return altChannel[i];
      },
    },
    ...builtIn,
  });

  it("should stringify Float64Array using alternate channel", () => {
    const fa = new Float64Array([19.6]);
    const arrayBuffers = [];
    const tson = TSON.stringify(fa, arrayBuffers);
    expect(arrayBuffers.length).toBe(1);
    expect(arrayBuffers[0]).toStrictEqual(new Float64Array([19.6]).buffer);
    expect(tson).toBe(
      JSON.stringify({
        $t: "Float64Array",
        b: {
          $t: "ArrayBuffer2",
          i: 0,
        },
      })
    );
    expect(TSON.parse(tson, arrayBuffers)).toStrictEqual(
      new Float64Array([19.6])
    );
  });
});
