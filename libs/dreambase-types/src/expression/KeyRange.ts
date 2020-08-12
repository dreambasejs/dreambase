export type KeyRange<T = any> =
  | {
      op: "=";
      value: T;
    }
  | {
      op: "range";
      lower: T;
      lowerOpen?: boolean;
      upper: T;
      upperOpen?: boolean;
    }
  | {
      op: "any";
    }
  | {
      op: "none";
    };

