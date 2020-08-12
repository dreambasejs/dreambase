import { QueryBuilder } from "./QueryBuilder.js";
import {
  invokableClass,
  include,
  inject,
  IsLazy,
  Flavors,
  refDeterministic,
} from "incarnation";
import { DBStore, DBStoreQuery } from "./dbstore/DBStore.js";
import { DBStoreBinder } from "./dbstore/DBStoreBinder.js";
import { Collection } from "./Collection.js";

export class _Query<T> extends QueryBuilder<any> {
  constructor(
    query: DBStoreQuery,
    public Entity: new () => T,
    public store: DBStore["$flavors"]["suspense"]
  ) {
    super(query);
  }

  [IsLazy] = true;
  get $flavors(): Flavors<this, this, Collection<T>> {
    return {
      orig: this,
      suspense: this,
      promise: Collection(this.Entity),
    };
  }

  toArray(): T[] {
    return this.store.select(this.query);
  }

  @refDeterministic
  static of<T>(Entity: new () => T): new () => Query<T> {
    return class extends _Query<any> {
      constructor() {
        const binder = inject(DBStoreBinder);
        super({}, Entity, binder.getStore(Entity).$flavors.suspense);
      }
    };
  }
}

export type Query<T> = _Query<T>;
export const Query = invokableClass(
  _Query,
  <TEntity>(EntityClass: new () => TEntity) =>
    inject(Query.of(EntityClass)) as Query<TEntity>
);
