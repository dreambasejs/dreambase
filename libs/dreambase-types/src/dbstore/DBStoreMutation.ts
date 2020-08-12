import { Expression } from "../expression/Expression";

export type DBStoreInsertMutation = {
  type: "insert";
  value: any;
};

export type DBStoreUpdateMutation = {
  type: "update";
  updates: object;
};

export type DBStoreDeleteMutation = {
  type: "delete";
  expr: Expression;
};

export type DBStoreMutation =
  | DBStoreInsertMutation
  | DBStoreUpdateMutation
  | DBStoreDeleteMutation;
