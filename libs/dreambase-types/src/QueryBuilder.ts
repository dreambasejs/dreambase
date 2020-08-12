import { DBStoreQuery } from "./dbstore/DBStore.js";

export class QueryBuilder<T> {
  constructor(public query: DBStoreQuery) {}

  limit(number: number): this {
    // @ts-ignore
    return deriveQuery(this, { limit: number });
  }
}

function deriveQuery(qb: QueryBuilder<any>, changes: Partial<DBStoreQuery>) {
  return Object.create(this, { query: { value: { ...qb.query, ...changes } } });
}
