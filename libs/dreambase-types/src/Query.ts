import { QueryBuilder } from "./QueryBuilder.js";
import {
  include,
  inject,
  IsLazy,
  Flavors,
  refDeterministic,
  CallableClass,
} from "incarnation";
import { DBStore, DBStoreQuery } from "./dbstore/DBStore.js";
import { DBStoreBinder } from "./dbstore/DBStoreBinder.js";
import { Collection } from "./Collection.js";
import { Query as QueryImplementation } from "./internal/Query.js";

export interface QueryConstructor {
  new <T>(query: DBStoreQuery, Entity: new () => T, store: DBStore): Query<T>;
  of<T>(Entity: new () => T): new () => Query<T>;
  <T>(Entity: new () => T): Query<T>; // Query(Friend)
}

export interface Query<T> extends QueryBuilder<T> {
  readonly $flavors: Flavors<this, this, Collection<T>>;
  Entity: new () => T;
  store: DBStore;
  toArray(): T[];
}

export const Query: QueryConstructor = CallableClass(
  (QueryImplementation as unknown) as QueryConstructor,
  (EntityClass: any) => inject(QueryImplementation.of(EntityClass))
) as QueryConstructor;
