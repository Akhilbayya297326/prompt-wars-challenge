// cache-assets.js prepends the build-specific manifest when it emits dist/sw.js.
const prefix = "krishichakra-";
const cacheName = prefix + self.precache.revision;
const shell = new Set(self.precache.paths);

async function installShell() {
  const cache = await caches.open(cacheName);
  await cache.addAll([...shell]);
  await self.skipWaiting();
}

async function activateShell() {
  const keys = await caches.keys();
  const obsolete = keys.filter(
    (key) => key.startsWith(prefix) && key !== cacheName,
  );
  await Promise.all(obsolete.map((key) => caches.delete(key)));
  await self.clients.claim();
}

async function serveAsset(path, request) {
  const cache = await caches.open(cacheName);
  return (await cache.match(path)) ?? fetch(request);
}

self.addEventListener("install", (event) => event.waitUntil(installShell()));
self.addEventListener("activate", (event) => event.waitUntil(activateShell()));
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  )
    return;
  const path = request.mode === "navigate" ? "/index.html" : url.pathname;
  if (shell.has(path)) event.respondWith(serveAsset(path, request));
});
