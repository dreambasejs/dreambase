export interface TypeDef<T = unknown, TReplaced = unknown> {
  test?: (val: T, toStringTag: string) => boolean | "cache";
  replace: (
    val: T,
    altChannel: any
  ) => TReplaced | (TReplaced & { $t: string });
  revive: (val: TReplaced, altChannel: any) => T;
}
