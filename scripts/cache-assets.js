import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const names = (
  await readdir("dist", { recursive: true, withFileTypes: true })
).filter((e) => e.isFile() && e.name !== "sw.js");
const { relative, join } = await import("node:path");
const files = names
  .map((e) =>
    relative("dist", join(e.parentPath, e.name)).replaceAll("\\", "/"),
  )
  .sort();
const hash = createHash("sha256");
for (const name of files) hash.update(await readFile(join("dist", name)));
const version = "krishichakra-" + hash.digest("hex").slice(0, 12);
const worker = `const cacheName = ${JSON.stringify(version)}
const shell = ${JSON.stringify(files.map((n) => "/" + n))}
self.addEventListener('install', event => event.waitUntil(caches.open(cacheName).then(c => c.addAll(shell)).then(() => self.skipWaiting())))
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('krishichakra-') && k !== cacheName).map(k => caches.delete(k)))).then(() => self.clients.claim())))
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  const path = event.request.mode === 'navigate' ? '/index.html' : url.pathname
  if (shell.includes(path)) event.respondWith(caches.open(cacheName).then(async c => (await c.match(path)) || fetch(event.request)))
})`;
await writeFile("dist/sw.js", worker);
