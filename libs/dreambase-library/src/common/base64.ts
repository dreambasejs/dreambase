export const b64decode: (b64: string) => Uint8Array =
  typeof Buffer !== "undefined"
    ? (base64) => Buffer.from(base64, "base64")
    : (base64) => {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
      };

export const b64encode: (b: Uint8Array | Buffer | ArrayBuffer) => string =
  typeof Buffer !== "undefined"
    ? (b) => {
        if (ArrayBuffer.isView(b)) {
          return Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString(
            "base64"
          );
        } else {
          return Buffer.from(b).toString("base64");
        }
      }
    : (b) => {
        return btoa(
          String.fromCharCode.apply(
            null,
            ArrayBuffer.isView(b) ? b : new Uint8Array(b)
          )
        );
      };
