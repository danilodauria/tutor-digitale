/* ==========================================================================
   Tutor Digitale · Allievo · service worker (cache propria, scope allievo/)
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi ../LICENSE)
   ========================================================================== */

const VERSION = "tda-v1.1.1";

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "../assets/css/styles.css?v=1.1.1",
  "../assets/img/icon-allievo.svg",
  "../assets/img/icon-allievo-192.png",
  "../assets/img/icon-allievo-512.png",
  "../assets/img/icon-512.png",
  "../assets/js/data-lezioni.js?v=1.1.1",
  "../assets/js/data-quiz.js?v=1.1.1",
  "../assets/js/data-documenti.js?v=1.1.1",
  "../assets/js/core.js?v=1.1.1",
  "../assets/js/pdf.js?v=1.1.1",
  "../assets/js/scambio.js?v=1.1.1",
  "../assets/js/app-allievo.js?v=1.1.1",
  "../assets/js/views-lezioni.js?v=1.1.1",
  "../assets/js/views-quiz.js?v=1.1.1",
  "../assets/js/views-palestra.js?v=1.1.1",
  "../assets/js/remoto.js?v=1.1.1",
  "../assets/js/init.js?v=1.1.1"
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
  e.respondWith(caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((hit) => {
    const rete = fetch(req).then((res) => { if (res && res.ok) { const c = res.clone(); caches.open(VERSION).then((x) => x.put(req, c)); } return res; }).catch(() => hit || caches.match("index.html"));
    return hit || rete;
  }));
});
