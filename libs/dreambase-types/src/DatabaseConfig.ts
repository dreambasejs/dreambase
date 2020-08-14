import { Collection } from "./Collection";

export interface DatabaseConfig {
  collections: CollectionConfig[];
}

export interface CollectionConfig {
  name: string;
  fields: any; // TODO: FIXTHIS!
  CollectionClass: new () => Collection<any>;
  EntityClass: new () => any;
}
