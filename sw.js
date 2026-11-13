/* ==========================================================================
   Tutor Digitale · service worker: tutto in cache, identico online e offline
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

const VERSION = "td-v1.0.0";

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/styles.css",
  "assets/img/icon.svg",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/img/apple-touch-icon.png",
  "assets/js/data-lezioni.js",
  "assets/js/data-quiz.js",
  "assets/js/data-documenti.js",
  "assets/js/core.js",
  "assets/js/pdf.js",
  "assets/js/views-lezioni.js",
  "assets/js/views-quiz.js",
  "assets/js/views-palestra.js",
  "assets/js/views-clienti.js",
  "assets/js/views-documenti.js",
  "assets/js/views-altro.js",
  "assets/js/init.js",
  "LICENSE",
  "LICENSE-CONTENT.md",
  "MARCHIO.md"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("td-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* prima la cache (così online e offline sono identici), poi la rete per aggiornare */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const rete = fetch(req).then((res) => {
        if (res && res.ok) { const copia = res.clone(); caches.open(VERSION).then((c) => c.put(req, copia)); }
        return res;
      }).catch(() => hit || caches.match("index.html"));
      return hit || rete;
    })
  );
});
