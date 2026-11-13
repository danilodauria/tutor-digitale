/* ==========================================================================
   Tutor Digitale · Allievo · service worker (cache propria, scope allievo/)
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi ../LICENSE)
   ========================================================================== */

const VERSION = "tda-v1.1.0";

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "../assets/css/styles.css",
  "../assets/img/icon-allievo.svg",
  "../assets/img/icon-allievo-192.png",
  "../assets/img/icon-allievo-512.png",
  "../assets/img/icon-512.png",
  "../assets/js/data-lezioni.js",
  "../assets/js/data-quiz.js",
  "../assets/js/data-documenti.js",
  "../assets/js/core.js",
  "../assets/js/pdf.js",
  "../assets/js/scambio.js",
  "../assets/js/app-allievo.js",
  "../assets/js/views-lezioni.js",
  "../assets/js/views-quiz.js",
  "../assets/js/views-palestra.js",
  "../assets/js/remoto.js",
  "../assets/js/init.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x.startsWith("tda-") && x !== VERSION).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => {
    const rete = fetch(req).then((res) => { if (res && res.ok) { const c = res.clone(); caches.open(VERSION).then((x) => x.put(req, c)); } return res; }).catch(() => hit || caches.match("index.html"));
    return hit || rete;
  }));
});
