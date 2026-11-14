/* ==========================================================================
   Tutor Digitale · sincronizzazione tra i tuoi dispositivi (miglioria 13)
   PC, tablet e telefono del tutor si «abbinano» una volta con un QR; poi,
   aprendo «Sincronizza» su due dispositivi insieme, si scambiano l'archivio
   cifrato end-to-end e lo uniscono: vince la modifica più recente, elemento
   per elemento. Senza Internet si usa il backup cifrato: «Unisci» invece di
   «Sostituisci». Il backup può stare anche sul «GitHub di casa».
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const URL_TUTOR = "https://danilodauria.github.io/tutor-digitale/";
  const PEZZO = 60000;
  const ST = { canale: null, stato: "fermo", log: [], ricevendo: {}, altri: {} };

  function abbinamento() { return TD.db.sync && TD.db.sync.stanza ? TD.db.sync : null; }
  function nomeDispositivo() {
    const s = TD.db.sync || {};
    if (s.nome) return s.nome;
    const ua = navigator.userAgent || "";
    return /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? "Tablet" : /Mobile|iPhone|Android/i.test(ua) ? "Telefono" : "Computer";
  }
  function registra(t) { ST.log.unshift(new Date().toTimeString().slice(0, 8) + " · " + t); ST.log = ST.log.slice(0, 12); ridisegna(); }
  /* cosa viaggia: l'archivio senza le impostazioni del singolo dispositivo */
  function istantanea() {
    const o = JSON.parse(JSON.stringify(TD.db));
    delete o.impostazioni; delete o.memo; delete o.sync;
    return o;
  }
  async function inviaArchivio() {
    const testo = await TD.scambio.comprimi(istantanea());
    const id = TD.uid("s"), n = Math.ceil(testo.length / PEZZO);
    for (let i = 0; i < n; i++) await ST.canale.invia({ t: "pezzo", id: id, i: i, n: n, d: testo.slice(i * PEZZO, (i + 1) * PEZZO), da: nomeDispositivo() });
    registra("Inviato l'archivio (" + Math.round(testo.length / 1024) + " kB)");
  }
  async function ricevi(m) {
    if (m.t === "ciao" || m.t === "ciao2") {
      ST.altri[m.da] = Date.now();
      registra("Trovato: " + m.da);
      if (m.t === "ciao") ST.canale.invia({ t: "ciao2", da: nomeDispositivo() });
      inviaArchivio().catch(function (e) { registra("Errore nell'invio: " + e.message); });
    } else if (m.t === "pezzo") {
      const r = ST.ricevendo[m.id] = ST.ricevendo[m.id] || { parti: [], n: m.n, ricevuti: 0 };
      if (r.parti[m.i] == null) { r.parti[m.i] = m.d; r.ricevuti++; }
      if (r.ricevuti === r.n) {
        delete ST.ricevendo[m.id];
        try {
          const altro = await TD.scambio.decomprimi(r.parti.join(""));
          const ris = TD.unisciDati(TD.db, altro);
          TD.timbra(TD.db, true); TD.salva(); TD.applicaPersonali && TD.applicaPersonali();
          TD.db.sync.ultimo = new Date().toISOString(); TD.salva();
          registra("Unito con " + (m.da || "l'altro dispositivo") + ": " + ris.aggiunti + " nuovi, " + ris.aggiornati + " aggiornati, " + ris.tolti + " tolti");
          ST.canale.invia({ t: "fatto", da: nomeDispositivo() });
        } catch (e) { registra("Archivio non leggibile: " + e.message); }
      }
    } else if (m.t === "fatto") registra(m.da + " ha finito di unire");
  }
  async function avvia() {
    const a = abbinamento(); if (!a) return;
    ST.stato = "collegamento"; ridisegna();
    try {
      ST.canale = await TD.relay.collega({ stanza: a.stanza, chiave: a.chiave, suMessaggio: function (m) { ricevi(m).catch(function () {}); }, suStato: function (s) { if (s === "chiuso") { ST.stato = "fermo"; ST.canale = null; ridisegna(); } } });
      ST.stato = "attivo"; registra("In ascolto: apri «Sincronizza» anche sull'altro dispositivo");
      await ST.canale.invia({ t: "ciao", da: nomeDispositivo() });
      clearInterval(ST.eco); ST.eco = setInterval(function () { if (ST.canale) ST.canale.invia({ t: "ciao", da: nomeDispositivo() }); }, 20000);
    } catch (e) { ST.stato = "fermo"; registra(e.message); }
  }
  function ferma() { clearInterval(ST.eco); if (ST.canale) ST.canale.chiudi(); ST.canale = null; ST.stato = "fermo"; ridisegna(); }

  let appEl = null;
  function ridisegna() { if (appEl && appEl.isConnected && location.hash.indexOf("#/sync") === 0) disegna(); }
  function disegna() {
    const a = abbinamento();
    const link = a ? URL_TUTOR + "#/sync?s=" + a.stanza + "&k=" + a.chiave : "";
    appEl.innerHTML = TD.intest("Sincronizza i tuoi dispositivi", "Lo stesso archivio di clienti, registro, documenti e contenuti su PC, tablet e telefono. Il collegamento è cifrato dall'inizio alla fine.") +
      '<div class="wrap"><div class="grid-2">' +
      (a ? '<section class="card"><h2>' + I("wifi") + 'Sincronizza adesso</h2><label class="field"><span>Nome di questo dispositivo</span><input id="syNome" value="' + E(nomeDispositivo()) + '"></label>' +
          '<p>' + (ST.stato === "attivo" ? '<span class="pill ok">' + I("check") + "In ascolto</span>" : ST.stato === "collegamento" ? '<span class="pill">Collegamento…</span>' : '<span class="pill">Fermo</span>') + (a.ultimo ? ' <span class="muted text-small">ultima unione: ' + E(new Date(a.ultimo).toLocaleString("it-IT")) + "</span>" : "") + "</p>" +
          '<div class="actions">' + (ST.stato === "fermo" ? '<button class="btn btn-primary btn-lg" id="syVia">' + I("play") + "Sincronizza</button>" : '<button class="btn" id="syStop">Ferma</button>') + "</div>" +
          '<p class="muted text-small">Apri questa pagina e premi «Sincronizza» su <strong>due</strong> dispositivi abbinati, tutti e due collegati a Internet: si trovano da soli, si scambiano l\'archivio e lo uniscono. Vince sempre la modifica più recente.</p>' +
          (ST.log.length ? '<ul class="sync-log">' + ST.log.map(function (x) { return "<li>" + E(x) + "</li>"; }).join("") + "</ul>" : "") + "</section>" +
        '<section class="card"><h2>' + I("plus") + 'Abbina un altro dispositivo</h2>' + TD.qr.svg(link, { etichetta: "QR per abbinare un dispositivo" }) +
          '<p>Sull\'altro dispositivo inquadra il QR con la fotocamera (o apri il link): si abbina da solo. Il link contiene la chiave segreta: non mandarlo ad altri.</p>' +
          '<div class="actions"><button class="btn btn-sm" id="syCopia">' + I("copy") + 'Copia il link</button><button class="btn btn-sm btn-ghost" id="syNuovo">Crea un nuovo abbinamento</button></div></section>'
        : '<section class="card"><h2>' + I("plus") + 'Primo abbinamento</h2><p>Crea l\'abbinamento su questo dispositivo, poi inquadra il QR con gli altri tuoi dispositivi.</p><div class="actions"><button class="btn btn-primary" id="syCrea">' + I("lock") + "Crea l'abbinamento</button></div></section>") +
      "</div>" +
      '<section class="card"><h2>' + I("download") + 'Senza Internet o tra dispositivi lontani</h2><p>Su un dispositivo: Impostazioni › <strong>Backup cifrato con password</strong>. Porta il file sull\'altro (chiavetta, cloud, «GitHub di casa») e lì scegli Impostazioni › Importa backup › <strong>Unisci</strong>: i dati si sommano invece di sostituirsi, con la stessa regola della modifica più recente.</p></section>' +
      '<p class="muted text-small">Come funziona: i due dispositivi si parlano attraverso un canale pubblico gratuito (MQTT), ma ogni messaggio è cifrato con AES-256 con la chiave dell\'abbinamento: chi gestisce il canale vede solo testo illeggibile. Le impostazioni di ogni dispositivo (tema, caratteri, accessibilità) restano separate.</p></div>';
    const $ = function (id) { return document.getElementById(id); };
    if ($("syCrea")) $("syCrea").onclick = function () { TD.db.sync = { stanza: TD.relay.nuovaStanza(), chiave: TD.relay.nuovaChiave(), nome: nomeDispositivo(), creato: TD.oggi() }; TD.salva(); disegna(); };
    if ($("syNuovo")) $("syNuovo").onclick = function () { if (TD.conferma("Creare un nuovo abbinamento? Gli altri dispositivi andranno abbinati di nuovo.")) { ferma(); TD.db.sync = { stanza: TD.relay.nuovaStanza(), chiave: TD.relay.nuovaChiave(), nome: nomeDispositivo(), creato: TD.oggi() }; TD.salva(); disegna(); } };
    if ($("syCopia")) $("syCopia").onclick = function () { TD.scambio.copia(link).then(function (ok) { TD.toast(ok ? "Link copiato." : "Copia non riuscita."); }); };
    if ($("syNome")) $("syNome").onchange = function () { TD.db.sync.nome = this.value.trim().slice(0, 30); TD.salva(); };
    if ($("syVia")) $("syVia").onclick = avvia;
    if ($("syStop")) $("syStop").onclick = ferma;
  }

  TD.rotta("/sync", function (app, p, q) {
    appEl = app;
    if (q.s && q.k) {
      const a = abbinamento();
      if (!a || a.stanza !== q.s) {
        if (!a || TD.conferma("Abbinare questo dispositivo agli altri tuoi dispositivi? Poi premi «Sincronizza» qui e sull'altro dispositivo.")) {
          TD.db.sync = { stanza: q.s, chiave: q.k, nome: nomeDispositivo(), creato: TD.oggi() }; TD.salva();
          TD.toast("Dispositivo abbinato.");
        }
      }
      history.replaceState(null, "", "#/sync");
    }
    disegna();
  });
})();
