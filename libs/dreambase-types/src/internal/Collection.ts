import { QueryBuilder } from "../QueryBuilder.js";
import {
  include,
  IsLazy,
  Flavors,
  refDeterministic,
  CallableClass,
} from "incarnation";
import { DBStore, DBStoreQuery } from "../dbstore/DBStore.js";
import { Query } from "../Query.js";
import {
  Collection as ICollection,
  CollectionConstructor,
} from "../Collection";
import { createSpecificCollection } from "./createSpecificCollection";

export class Collection<T> extends QueryBuilder<T> implements ICollection<T> {
  constructor(
    query: DBStoreQuery,
    public Entity: new () => T,
    public store: DBStore
  ) {
    super(query);
  }

  [IsLazy] = true;
  get $flavors(): Flavors<this, Query<T>, this> {
    return {
      orig: this,
      suspense: Query(this.Entity),
      promise: this,
    };
  }

  toArray(): Promise<T[]> {
    return this.store.select(this.query);
  }

  @refDeterministic
  static of<T>(
    Entity: new () => T
  ): CallableClass<Collection<T>, () => Collection<T>> {
    return createSpecificCollection(Entity, Collection);
  }
}
