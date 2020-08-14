import { QueryBuilder } from "./QueryBuilder.js";
import { CallableClass, include, inject, IsLazy, Flavors } from "incarnation";
import { DBStore, DBStoreQuery } from "./dbstore/DBStore.js";
import { Query } from "./Query.js";
import { Collection as CollectionImplementation } from "./internal/Collection.js";

export interface CollectionConstructor {
  new <T>(query: DBStoreQuery, Entity: new () => T, store: DBStore): Collection<
    T
  >;
  of<T>(Entity: new () => T): new () => Collection<T>;
  <T>(Entity: new () => T): Collection<T>; // Collection(Friend)
}

export interface Collection<T> extends QueryBuilder<T> {
  readonly $flavors: Flavors<this, Query<T>, this>;
  //readonly name: string; // Maybe a collection doesn't have a name? Probably all could have and default to Entity.name. But wait with this as it is not so relevant.
  Entity: new () => T;
  store: DBStore;
  toArray(): Promise<T[]>;
}

export const Collection: CollectionConstructor = CallableClass(
  CollectionImplementation,
  (EntityClass: any) => inject(CollectionImplementation.of(EntityClass))
) as CollectionConstructor;

/*
class Friend {
  name: string;
  age: number;
}

class FriendCollection extends Collection.of(Friend) {}

var f = Collection(Friend);
f.toArray().then((x) => x[0]);
var x = use(FriendCollection);
//x.toArray().then(x => x[0].

*/
