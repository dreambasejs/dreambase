import { DBTypeContainer } from "../DBTypeContainer.js";
import { DBTypeSymbol } from "../../symbols/DBTypeSymbol.js";

export type DeclarationToType<T> = T extends DBTypeContainer<any>
  ? T[typeof DBTypeSymbol]["default"]
  : T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : T extends DateConstructor
  ? Date
  : T extends ArrayBufferConstructor
  ? ArrayBuffer
  : T extends Uint8ArrayConstructor
  ? Uint8Array
  : T extends { new (...args: any[]): infer R }
  ? R
  : T extends { [prop: string]: any }
  ? { [P in keyof T]: DeclarationToType<T[P]> }
  : T;
