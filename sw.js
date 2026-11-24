/* ==========================================================================
   Tutor Digitale · service worker: tutto in cache, identico online e offline
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

const VERSION = "td-v1.12.3";

const ASSETS = [
  "./",
  "index.html",
  "schermo/index.html",
  "manifest.webmanifest",
  "assets/css/styles.css?v=1.12.3",
  "assets/img/icon.svg",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/img/apple-touch-icon.png",
  "assets/js/data-lezioni.js?v=1.12.3",
  "assets/js/data-quiz.js?v=1.12.3",
  "assets/js/data-documenti.js?v=1.12.3",
  "assets/js/data-segni.js?v=1.12.3",
  "assets/js/core.js?v=1.12.3",
  "assets/js/pdf.js?v=1.12.3",
  "assets/js/scambio.js?v=1.12.3",
  "assets/js/qr.js?v=1.12.3",
  "assets/js/relay.js?v=1.12.3",
  "assets/js/fattura.js?v=1.12.3",
  "assets/js/guide.js?v=1.12.3",
  "assets/js/views-percorsi.js?v=1.12.3",
  "assets/js/views-editor.js?v=1.12.3",
  "assets/js/aula.js?v=1.12.3",
  "assets/js/schermo.js?v=1.12.3",
  "assets/js/segni.js?v=1.12.3",
  "assets/js/accessibilita.js?v=1.12.3",
  "assets/js/sync.js?v=1.12.3",
  "assets/js/casella.js?v=1.12.3",
  "assets/js/assistente.js?v=1.12.3",
  "assets/js/marchio.js?v=1.12.3",
  "assets/js/remoto.js?v=1.12.3",
  "assets/js/views-allievi.js?v=1.12.3",
  "assets/js/views-lezioni.js?v=1.12.3",
  "assets/js/views-quiz.js?v=1.12.3",
  "assets/js/views-palestra.js?v=1.12.3",
  "assets/js/views-clienti.js?v=1.12.3",
  "assets/js/views-documenti.js?v=1.12.3",
  "assets/js/views-altro.js?v=1.12.3",
  "assets/js/views-lavoro.js?v=1.12.3",
  "assets/js/cerca.js?v=1.12.3",
  "assets/js/init.js?v=1.12.3",
  "LICENSE",
  "LICENSE-CONTENT.md",
  "MARCHIO.md",
  "assets/pdf/vademecum-tutor-digitale.pdf"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
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
  const u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== location.origin || u.pathname.indexOf("/allievo/") >= 0) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((hit) => {
      const rete = fetch(req).then((res) => {
        if (res && res.ok) { const copia = res.clone(); caches.open(VERSION).then((c) => c.put(req, copia)); }
        return res;
      }).catch(() => hit || caches.match("index.html"));
      return hit || rete;
    })
  );
});
