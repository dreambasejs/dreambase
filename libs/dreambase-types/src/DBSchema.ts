import { Collection } from "./Collection";

export interface DBSchema {
  collections: CollectionSchema[];
}

export interface CollectionSchema {
  name: string;
  fields: any; // TODO: FIXTHIS!
  CollectionClass: new () => Collection<any>;
  EntityClass: new () => any;
}
