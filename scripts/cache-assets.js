import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const dist = "dist";
const workerSource = await readFile(
  new URL("./service-worker.js", import.meta.url),
  "utf8",
);
const entries = await readdir(dist, { recursive: true, withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name !== "sw.js")
  .map((entry) =>
    relative(dist, join(entry.parentPath, entry.name)).replaceAll("\\", "/"),
  )
  .sort();

// Include paths, contents and worker logic in the revision used for this offline shell.
const hash = createHash("sha256").update(workerSource);
for (const file of files) {
  hash.update(JSON.stringify(file)).update(await readFile(join(dist, file)));
}
const manifest = {
  revision: hash.digest("hex").slice(0, 12),
  paths: files.map((path) => "/" + path),
};
await writeFile(
  join(dist, "sw.js"),
  "self.precache = " + JSON.stringify(manifest) + ";\n" + workerSource,
);
