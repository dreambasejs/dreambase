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
import { Query } from "./Query.js";

export class _Collection<T> extends QueryBuilder<any> {
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
  static of<T>(Entity: new () => T): new () => Collection<T> {
    return class extends _Collection<any> {
      constructor() {
        const binder = inject(DBStoreBinder);
        super({}, Entity, binder.getStore(Entity));
      }
    };
  }
}

export type Collection<T> = _Collection<T>;
export const Collection = invokableClass(
  _Collection,
  <TEntity>(EntityClass: new () => TEntity) =>
    inject(Collection.of(EntityClass)) as Collection<TEntity>
);
