const CACHE = "python-academy-shell-v18";
const APP = [
  "./manifest.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/js/skulpt.min.js",
  "./assets/js/skulpt-stdlib.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Always Network-First for HTML and navigations so code updates take effect immediately
  const isHtml = req.mode === "navigate" ||
                 req.destination === "document" ||
                 url.pathname.endsWith("/") ||
                 url.pathname.endsWith(".html") ||
                 (req.headers.get("accept") && req.headers.get("accept").includes("text/html"));

  if (isHtml) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html") || caches.match("./")))
    );
    return;
  }

  // Cache-first for static assets (Skulpt JS, icons, manifest)
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => cached || new Response("Offline", { status: 503 }))
    )
  );
});
