export interface IndexOptions<T> {
  unique?: boolean;
  compoundWith?:
    | (() => any)
    | (() => any)[]
    | Array<Array<(() => any) | IndexOptions<any>>>;
}
