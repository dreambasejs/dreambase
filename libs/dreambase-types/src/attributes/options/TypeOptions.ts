export type TypeOptions<T> = {
  default?: T;
  nullable?: boolean;
} & TypeSpecificOptions<T>;

export type TypeSpecificOptions<T> = T extends string
  ? {
      min?: number;
      max?: number;
      //regexp?: RegExp;
    }
  : {}; // We could extend this list for number, Array, ArrayBuffer, TypedArray, Date, etc
