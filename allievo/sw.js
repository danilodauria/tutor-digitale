/* ==========================================================================
   Tutor Digitale · Allievo · service worker (cache propria, scope allievo/)
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi ../LICENSE)
   ========================================================================== */

const VERSION = "tda-v1.11.1";

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "../assets/css/styles.css?v=1.11.1",
  "../assets/img/icon-allievo.svg",
  "../assets/img/icon-allievo-192.png",
  "../assets/img/icon-allievo-512.png",
  "../assets/img/icon-512.png",
  "../assets/js/data-lezioni.js?v=1.11.1",
  "../assets/js/data-quiz.js?v=1.11.1",
  "../assets/js/data-documenti.js?v=1.11.1",
  "../assets/js/data-segni.js?v=1.11.1",
  "../assets/js/core.js?v=1.11.1",
  "../assets/js/pdf.js?v=1.11.1",
  "../assets/js/scambio.js?v=1.11.1",
  "../assets/js/qr.js?v=1.11.1",
  "../assets/js/relay.js?v=1.11.1",
  "../assets/js/guide.js?v=1.11.1",
  "../assets/js/aula.js?v=1.11.1",
  "../assets/js/segni.js?v=1.11.1",
  "../assets/js/accessibilita.js?v=1.11.1",
  "../assets/js/casella.js?v=1.11.1",
  "../assets/js/assistente.js?v=1.11.1",
  "../assets/js/marchio.js?v=1.11.1",
  "../assets/js/app-allievo.js?v=1.11.1",
  "../assets/js/views-lezioni.js?v=1.11.1",
  "../assets/js/views-quiz.js?v=1.11.1",
  "../assets/js/views-palestra.js?v=1.11.1",
  "../assets/js/remoto.js?v=1.11.1",
  "../assets/js/init.js?v=1.11.1"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x.startsWith("tda-v") && x !== VERSION).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((hit) => {
    const rete = fetch(req).then((res) => { if (res && res.ok) { const c = res.clone(); caches.open(VERSION).then((x) => x.put(req, c)); } return res; }).catch(() => hit || caches.match("index.html"));
    return hit || rete;
  }));
});

/* promemoria delle scadenze ad app chiusa (dove il browser concede Periodic Background Sync) */
self.addEventListener("periodicsync", (e) => {
  if (e.tag !== "scadenze") return;
  e.waitUntil((async () => {
    const c = await caches.open("tda-promemoria");
    const r = await c.match("scadenze.json"); if (!r) return;
    const d = await r.json(); if (!d.attivi) return;
    const oggi = new Date(); oggi.setMinutes(oggi.getMinutes() - oggi.getTimezoneOffset());
    const o = oggi.toISOString().slice(0, 10);
    const ultimo = await c.match("ultimo-avviso"); if (ultimo && (await ultimo.text()) === o) return;
    const giorno = 86400000, t0 = new Date(o + "T12:00:00");
    const vicine = (d.voci || []).filter((v) => (new Date(v.data + "T12:00:00") - t0) / giorno <= 1);
    if (!vicine.length) return;
    await c.put("ultimo-avviso", new Response(o));
    await self.registration.showNotification("Tutor Digitale · promemoria", {
      body: vicine.length === 1 ? vicine[0].testo : vicine.length + " compiti in scadenza: apri l'app per vederli",
      icon: "../assets/img/icon-allievo-192.png", tag: "scadenze", data: { url: "./#/compiti" }
    });
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
    for (const w of lista) if (w.url.startsWith(self.registration.scope)) { w.navigate(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
