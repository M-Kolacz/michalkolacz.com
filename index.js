import "dotenv/config";
import sourceMapSupport from "source-map-support";

import * as fs from "node:fs";

sourceMapSupport.install({
  retrieveSourceMap: (source) => {
    // get source file without the `file://` prefix or `?t=...` suffix
    const match = source.match(/^file:\/\/(.*)\?t=[.\d]+$/);
    if (match) {
      return {
        url: source,
        map: fs.readFileSync(match[1] + ".map", "utf8"),
      };
    }
    return null;
  },
});

if (process.env.NODE_ENV === "production") {
  await import("./server-build/index.js");
} else {
  await import("./server/index.ts");
}
