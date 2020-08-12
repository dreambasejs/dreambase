import { KeyRange } from "./KeyRange.js";

export type Expression =
  | AtomicFormula
  | OrExpression
  | AndExpression
  | NotExpression
  | CustomFormula;

export interface AtomicFormula {
  type: "atom";
  keyPath: string;
  ranges: KeyRange[]; // Precondition: ranges must be sorted!
}

export interface OrExpression {
  type: "or";
  operands: Expression[];
}

export interface AndExpression {
  type: "and";
  operands: Expression[];
}

export interface NotExpression {
  type: "not";
  operand: Expression;
}

export interface CustomFormula {
  type: "custom";
  op: string; // For example DateRange: overlaps/intersect, Geolocation near/overlap/intersect etc ,
  value: any;
}
