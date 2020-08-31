import { Expression } from "../expression/Expression.js";

export type DBStoreInsertMutation = {
  type: "insert";
  value: any;
};

export type DBStoreUpdateMutation = {
  type: "update";
  key: any;
  updates: object;
};

export type DBStoreDeleteMutation = {
  type: "delete";
  key: any;
};

export type DBStoreMutation =
  | DBStoreInsertMutation
  | DBStoreUpdateMutation
  | DBStoreDeleteMutation;
