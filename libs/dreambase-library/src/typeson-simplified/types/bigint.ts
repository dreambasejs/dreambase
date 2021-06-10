import { TypeDefSet } from "../TypeDefSet.js";

const bigIntDef: TypeDefSet = {
  bigint: {
    replace: (realVal: bigint) => {
      return { $t: "bigint", v: "" + realVal };
    },
    revive: (obj: { $t: "bigint"; v: string }) => BigInt(obj.v),
  },
};

export default bigIntDef;
