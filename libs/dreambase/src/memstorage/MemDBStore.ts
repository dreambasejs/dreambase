import {
  CollectionSchema,
  DBStore,
  DBStoreMutation,
  parseType,
} from "dreambase-types";
import { DBTypeContainer } from "dreambase-types/dist/schema/DBTypeContainer";
import { DBTypeStructure } from "dreambase-types/dist/schema/DBTypeStructure";
import { getBinarySearch } from "../algorithms/binarySearch";

export class MemDBStore extends DBStore {
  schema: CollectionSchema;
  rows: object[];
  binSearch: ReturnType<typeof getBinarySearch>;
  cmp: (a: any, b: any) => number;
  primKey: DBTypeStructure<any>;

  constructor(collectionSchema: CollectionSchema) {
    super();
    this.schema = collectionSchema;
    this.applyMutation = this.applyMutation.bind(this);
    this.primKey = collectionSchema.type.primaryKey!;
    this.binSearch = getBinarySearch(this.primKey.cmp!, this.primKey.readProp!);
    this.cmp = collectionSchema.type.cmp!;
  }

  applyMutation(m: DBStoreMutation): PromiseSettledResult<any> {
    const { cmp, rows, primKey, binSearch } = this;
    switch (m.type) {
      case "insert": {
        const key = primKey.readProp!(m.value);
        const [found, pos] = binSearch(rows, key);
        if (found)
          return { status: "rejected", reason: new Error(`Duplicate key`) };
        rows.splice(pos, 0, m.value);
        return { status: "fulfilled", value: key };
      }
      case "update": {
        const [found, pos] = binSearch(rows, m.key);
        if (found) {
          Object.assign(rows[pos], m.updates); // TODO: Have an updateSpec instead!
        }
        return { status: "fulfilled", value: null };
      }
      case "delete": {
        const [found, pos] = binSearch(rows, m.key);
        if (found) rows.splice(pos, 1);
        return { status: "fulfilled", value: null };
      }
    }
  }

  async count(query): Promise<number> {
    return this.rows.length;
  }

  async mutate(muts: DBStoreMutation[]): Promise<PromiseSettledResult<any>[]> {
    return muts.map(this.applyMutation);
  }

  async select(query): Promise<any[]> {
    throw "";
  }
}
