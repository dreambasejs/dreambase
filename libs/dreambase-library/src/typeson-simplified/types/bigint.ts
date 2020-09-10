import { b64ToBigInt, bigint2B64 } from "../../common/bigint-conversion.js";

export default {
  bigint: {
    replace: (realVal: bigint) => {
      const negative = realVal < 0;
      const b64 = bigint2B64(negative ? -realVal : realVal);
      return negative
        ? {
            $t: "bigint",
            neg: true,
            b64,
          }
        : {
            $t: "bigint",
            b64,
          };
    },
    revive: ({ n, b64 }: { $t: "bigint"; n?: boolean; b64: string }) =>
      n ? -b64ToBigInt(b64) : b64ToBigInt(b64),
  },
};
