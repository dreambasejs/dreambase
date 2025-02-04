import { b64decode, b64encode } from "../../common/base64.js";
import { readBlobSync } from "../readBlobSync.js";
import { string2ArrayBuffer } from "../string2ArrayBuffer.js";

export default {
  File: {
    test: (file: File, toStringTag: string) => toStringTag === "File",
    replace: (file: File) => ({
      $t: "File",
      v: b64encode(string2ArrayBuffer(readBlobSync(file))),
      type: file.type,
      name: file.name,
      lastModified: new Date(file.lastModified).toISOString(),
    }),
    revive: ({ type, v, name, lastModified }) => {
      const ab = b64decode(v);
      return new File([ab], name, {
        type,
        lastModified: new Date(lastModified).getTime(),
      });
    },
  },
};
