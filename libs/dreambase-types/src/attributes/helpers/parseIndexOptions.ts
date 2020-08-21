import { DBIndexStructure } from "../../schema/DBIndexStructure.js";
import { IndexOptions } from "../options/IndexOptions.js";

export function parseIndexOptions(
  { compoundWith, unique }: IndexOptions<any>,
  outIndexes: DBIndexStructure[]
) {
  if (!compoundWith) {
    // foo = Indexed(String);
    outIndexes.push({ unique });
  } else if (typeof compoundWith === "function") {
    // foo = Indexed(String, {compoundWith: ()=>this.bar})
    outIndexes.push({
      unique,
      compoundGetters: [compoundWith],
    });
  } else if (Array.isArray(compoundWith)) {
    const compoundGetters = (compoundWith as (() => any)[]).filter(
      (cw) => typeof cw === "function"
    );
    const innerArrays = (compoundWith as Array<
      Array<(() => any) | IndexOptions<any>>
    >).filter((cw) => Array.isArray(cw));

    if (compoundGetters.length > 0 && innerArrays.length > 0) {
      throw new TypeError(
        `Invalid value for compoundWith. Either array of functions or array of arrays.`
      );
    }
    if (compoundGetters.length > 0) {
      // foo = Indexed(String, {compoundWith: [()=>this.bar, ()=>this.baz]})
      outIndexes.push({ unique, compoundGetters });
    } else {
      // foo = Indexed(String, {compoundWith: [[()=>this.bar, {unique:true}], [()=>this.baz]]})
      for (const innerArray of innerArrays) {
        const { unique } =
          (innerArray.find((o) => o && typeof o === "object") as IndexOptions<
            any
          >) || {};
        const compoundGetters = innerArray.filter(
          (fn) => typeof fn === "function"
        ) as (() => any)[];
        outIndexes.push({ unique, compoundGetters });
      }
    }
  }
  return outIndexes;
}
