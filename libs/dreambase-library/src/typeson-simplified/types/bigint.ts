import { b64ToBigInt, bigint2B64 } from "../../common/bigint-conversion.js";
import { TypeDefSet } from "../TypeDefSet.js";

export const MAXUINT64 =
  typeof BigInt !== "undefined"
    ? BigInt("18446744073709551615")
    : 0xffff_ffff_ffff;

const bigIntDef: TypeDefSet = {
  bigint: {
    replace: (realVal: bigint) => {
      if (realVal <= MAXUINT64) {
        // Negative and realtively small numbers - represent as normal numbers
        return { $t: "bigint", v: "" + realVal };
      } else {
        // Very large positive numbers - compress to base64
        const b64 = bigint2B64(realVal);
        return {
          $t: "bigint",
          b64,
        };
      }
    },
    revive: (
      obj:
        | { $t: "bigint"; v: string }
        | { $t: "bigint"; neg?: boolean; b64: string }
    ) => ("v" in obj ? BigInt(obj.v) : b64ToBigInt(obj.b64)),
  },
};

export default bigIntDef;
