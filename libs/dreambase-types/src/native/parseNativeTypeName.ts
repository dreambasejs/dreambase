const map = new Map<any, { typeName: string; default: any }>([
  [String, { typeName: "string", default: "" }],
  [Number, { typeName: "number", default: 0 }],
  [Boolean, { typeName: "boolean", default: false }],
  [Date, { typeName: "Date", default: new Date(0) }],
  [ArrayBuffer, { typeName: "ArrayBuffer", default: new ArrayBuffer(0) }],
  [Uint8Array, { typeName: "Uint8Array", default: new Uint8Array(0) }]
]);
export function parseNativeTypeName(
  type: any
): { typeName: string; default: any } | undefined {
  return map.get(type);
}
