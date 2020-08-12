import { DataStore, DataStoreReducerSet } from "incarnation";
import { Expression } from "../expression/Expression";
import { DBStoreMutation } from "./DBStoreMutation";

export interface DBStoreQuery {
  expr?: Expression;
  limit?: number;
  orderBy?: string[];
  fields?: string[];
}

export abstract class DBStore extends DataStore {
  abstract select(query: DBStoreQuery): Promise<any[]>;
  abstract count(query: DBStoreQuery): Promise<number>;
  abstract mutate(
    mutations: DBStoreMutation[]
  ): Promise<PromiseSettledResult<any>[]>;
}

DBStore.reducers = <DataStoreReducerSet<DBStore>>{
  select(query) {
    return {
      /*insert: (result, m) => {
        
      }*/
    };
  },
};
