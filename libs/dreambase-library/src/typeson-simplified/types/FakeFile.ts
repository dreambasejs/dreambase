import { b64decode, b64encode } from "../../common/base64.js";
import { FakeBlob } from "../FakeBlob.js";
import { FakeFile } from "../FakeFile.js";

export default {
  File: {
    test: (file: FakeFile) => file instanceof FakeFile,
    replace: (file: FakeFile) => ({
      $t: "File",
      v: b64encode(file.blob.buf),
      type: file.blob.type,
      name: file.name,
      lastModified: file.lastModified.toISOString(),
    }),
    revive: ({ type, v, name, lastModified }) => {
      const ab = b64decode(v);
      const blob = new FakeBlob(ab.buffer, type);
      return new FakeFile(blob, name, new Date(lastModified));
    },
  },
};
