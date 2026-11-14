/* ==========================================================================
   Tutor Digitale · casella condivisa cifrata (miglioria 14)
   Una casella per ogni cliente dove tutor e allievo si lasciano note,
   credenziali con scadenza e piccoli file, senza passare dall'email.
   Il contenuto è cifrato AES-256 con una chiave che conoscono solo i due
   dispositivi (arriva all'allievo con il kit). Una copia cifrata resta sul
   canale pubblico, così l'altro la riceve anche se apre la casella più tardi;
   le voci scadute si cancellano da sole su entrambi i lati.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const MAX_FILE = 150 * 1024, MAX_TOTALE = 220 * 1024;
  const DURATE = [[3600e3, "1 ora"], [86400e3, "1 giorno"], [7 * 86400e3, "7 giorni"], [30 * 86400e3, "30 giorni"], [0, "Non scade"]];

  /* ------------------------------------------------------------ dati (puri) */
  TD.casellaUnisci = function (mie, altre, ora) {
    ora = ora || Date.now();
    const m = {};
    (mie || []).concat(altre || []).forEach(function (v) {
      if (!v || !v.id) return;
      const p = m[v.id];
      if (!p || (v.t || 0) > (p.t || 0) || (v.eliminata && !p.eliminata)) m[v.id] = v;
    });
    return Object.keys(m).map(function (k) { return m[k]; })
      .map(function (v) { return v.scade && v.scade < ora && !v.eliminata ? { id: v.id, eliminata: true, t: ora } : v; })
      .filter(function (v) { return !v.eliminata || ora - v.t < 45 * 86400e3; })
      .sort(function (a, b) { return (b.creato || 0) - (a.creato || 0); });
  };
  TD.casellaPeso = function (voci) { return JSON.stringify(voci).length; };

  /* dove sta la casella: tutor = nel cliente, allievo = nel suo archivio */
  function sede(id) {
    if (TD.MODO === "allievo") { const d = TD.db; return d.casella ? { conf: d.casella, voci: function (v) { if (v) d.casellaVoci = v; return d.casellaVoci || []; }, io: (d.allievo && d.allievo.nome) || "Allievo", altro: (d.tutor && d.tutor.nome) || "Tutor" } : null; }
    const c = TD.cliente(id); if (!c) return null;
    if (!c.casella) { c.casella = { stanza: TD.relay.nuovaStanza(), chiave: TD.relay.nuovaChiave() }; TD.salva(); }
    return { conf: c.casella, voci: function (v) { if (v) c.casellaVoci = v; return c.casellaVoci || []; }, io: TD.db.profilo.nome || "Tutor", altro: TD.nomeCliente(c), cliente: c };
  }
  TD.casellaPer = function (c) { if (!c.casella) { c.casella = { stanza: TD.relay.nuovaStanza(), chiave: TD.relay.nuovaChiave() }; } return c.casella; };

  const C = { canale: null, chiave: "", stato: "fermo" };
  async function collega(s) {
    if (C.canale && C.chiave === s.conf.chiave) return;
    if (C.canale) C.canale.chiudi();
    C.canale = null; C.chiave = s.conf.chiave; C.stato = "collegamento"; ridisegna();
    try {
      C.canale = await TD.relay.collega({ stanza: s.conf.stanza + "-casella", chiave: s.conf.chiave, suMessaggio: function (m) {
        if (m.t !== "casella") return;
        const prima = JSON.stringify(s.voci());
        s.voci(TD.casellaUnisci(s.voci(), m.voci)); TD.salva();
        if (JSON.stringify(s.voci()) !== prima) { ridisegna(); if (m.nuova) TD.toast("Nuovo nella casella da " + (m.da || "l'altro")); }
      }, suStato: function (st) { if (st === "chiuso") { C.canale = null; C.stato = "fermo"; ridisegna(); } } });
      C.stato = "attivo"; ridisegna();
      pubblica(s, false);
    } catch (e) { C.stato = "fermo"; C.errore = e.message; ridisegna(); }
  }
  function pubblica(s, nuova) {
    s.voci(TD.casellaUnisci(s.voci(), [])); TD.salva();
    if (C.canale) C.canale.invia({ t: "casella", voci: s.voci(), da: s.io, nuova: !!nuova }, { trattieni: true });
  }

  let appEl = null, idCorrente = "";
  function ridisegna() { if (appEl && appEl.isConnected && location.hash.indexOf("#/casella") === 0) disegna(); }
  function quando(t) { return new Date(t).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  function resto(t) { const ms = t - Date.now(); if (ms <= 0) return "scaduta"; const h = Math.round(ms / 3600e3); return h < 1 ? "meno di un'ora" : h === 1 ? "1 ora" : h < 48 ? h + " ore" : Math.round(h / 24) + " giorni"; }

  function disegna() {
    const s = sede(idCorrente);
    if (!s) { appEl.innerHTML = '<div class="wrap"><div class="card"><h1>Casella</h1><p>' + (TD.MODO === "allievo" ? "La casella si attiva con il kit del tutor." : "Cliente non trovato.") + "</p></div></div>"; return; }
    const voci = TD.casellaUnisci(s.voci(), []).filter(function (v) { return !v.eliminata; });
    appEl.innerHTML = TD.intest("Casella condivisa" + (TD.MODO === "allievo" ? "" : " · " + E(s.altro)), "Note, password con scadenza e piccoli file tra " + E(s.io) + " e " + E(s.altro) + ". Tutto cifrato: solo voi due potete leggerlo.",
        '<p>' + (C.stato === "attivo" ? '<span class="pill ok">' + I("lock") + "Collegata e cifrata</span>" : C.stato === "collegamento" ? '<span class="pill">Collegamento…</span>' : '<span class="pill warn">Non collegata: serve Internet' + (C.errore ? " (" + E(C.errore) + ")" : "") + "</span>") + "</p>") +
      '<div class="wrap"><div class="grid-2">' +
      '<form class="card form" id="caForm"><h2>' + I("plus") + 'Lascia qualcosa</h2>' +
        '<div class="seg">' + [["nota", "Nota"], ["password", "Password o codice"], ["file", "File"]].map(function (t, i) { return '<label><input type="radio" name="tipo" value="' + t[0] + '"' + (i === 0 ? " checked" : "") + "><span>" + t[1] + "</span></label>"; }).join("") + "</div>" +
        '<label class="field"><span>Titolo</span><input name="titolo" required maxlength="80" placeholder="Es. Password del Wi-Fi di casa"></label>' +
        '<label class="field" data-per="nota password"><span>Testo</span><textarea name="testo" rows="3" maxlength="4000"></textarea></label>' +
        '<label class="field" data-per="file" hidden><span>File (fino a 150 kB: foto ridotte, PDF piccoli)</span><input type="file" name="file"></label>' +
        '<label class="field"><span>Si cancella dopo</span><select name="durata">' + DURATE.map(function (d, i) { return '<option value="' + d[0] + '"' + (i === 1 ? " selected" : "") + ">" + d[1] + "</option>"; }).join("") + "</select></label>" +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + I("upload") + "Metti nella casella</button></div>" +
        '<p class="muted text-small">Consiglio: per le password scegli «1 ora» o «1 giorno». Chi le riceve le copia nel posto giusto e poi la casella le cancella da sola.</p></form>' +
      '<section class="card"><h2>' + I("layers") + "Nella casella (" + voci.length + ")</h2>" +
        (voci.length ? '<ul class="casella">' + voci.map(function (v) {
          return '<li class="casella-voce"><div><strong>' + I(v.tipo === "password" ? "lock" : v.tipo === "file" ? "doc" : "pen") + " " + E(v.titolo) + "</strong><small>da " + E(v.da) + " · " + E(quando(v.creato)) + (v.scade ? " · si cancella tra " + resto(v.scade) : "") + "</small>" +
            (v.tipo === "password" ? '<p><code class="segreto" data-seg="' + v.id + '">••••••••</code></p>' : v.tipo === "file" ? '<p class="text-small">' + E(v.file.nome) + " · " + Math.round(v.file.dati.length * 0.75 / 1024) + " kB</p>" : '<p class="read">' + E(v.testo) + "</p>") +
            '</div><div class="actions">' + (v.tipo === "password" ? '<button class="btn btn-sm" data-mostra="' + v.id + '">' + I("eye") + 'Mostra</button><button class="btn btn-sm" data-copia="' + v.id + '">' + I("copy") + "Copia</button>" : "") +
            (v.tipo === "file" ? '<a class="btn btn-sm" href="' + E(v.file.dati) + '" download="' + E(v.file.nome) + '">' + I("download") + "Salva</a>" : "") +
            '<button class="btn btn-sm btn-ghost" data-via="' + v.id + '" aria-label="Cancella «' + E(v.titolo) + '»">' + I("trash") + "</button></div></li>";
        }).join("") + "</ul>" : '<p class="muted">La casella è vuota.</p>') +
        '<p class="muted text-small">Peso attuale: ' + Math.round(TD.casellaPeso(s.voci()) / 1024) + " kB su " + Math.round(MAX_TOTALE / 1024) + " kB.</p></section></div>" +
      '<p class="muted text-small">Come funziona: la casella passa da un canale pubblico gratuito (MQTT) che conserva soltanto l\'ultima versione cifrata con AES-256: chi lo gestisce non può leggerla. È un servizio senza garanzie: per documenti importanti usa anche la copia di sicurezza. Le voci scadute vengono cancellate su entrambi i dispositivi alla prima apertura.</p></div>';
    const f = document.getElementById("caForm");
    const tipo = function () { return (f.querySelector('input[name="tipo"]:checked') || {}).value; };
    f.querySelectorAll('input[name="tipo"]').forEach(function (r) { r.onchange = function () { f.querySelectorAll("[data-per]").forEach(function (x) { x.hidden = x.dataset.per.split(" ").indexOf(tipo()) < 0; }); f.durata.value = tipo() === "password" ? "3600000" : "86400000"; }; });
    f.onsubmit = function (e) {
      e.preventDefault();
      const t = tipo(), dur = Number(f.durata.value) || 0;
      const v = { id: TD.uid("v"), tipo: t, titolo: f.titolo.value.trim(), da: s.io, creato: Date.now(), t: Date.now(), scade: dur ? Date.now() + dur : 0 };
      const metti = function () {
        const nuove = TD.casellaUnisci(s.voci(), [v]);
        if (TD.casellaPeso(nuove) > MAX_TOTALE) { TD.toast("La casella è piena: cancella qualche voce o usa l'assistenza a distanza per i file grandi."); return; }
        s.voci(nuove); TD.salva(); pubblica(s, true); TD.toast("Messo nella casella."); disegna();
      };
      if (t === "file") {
        const file = f.file.files[0]; if (!file) { TD.toast("Scegli il file."); return; }
        if (file.size > MAX_FILE) { TD.toast("File troppo grande (massimo 150 kB). Per i file grandi usa l'assistenza a distanza."); return; }
        const r = new FileReader(); r.onload = function () { v.file = { nome: file.name, tipo: file.type, dati: r.result }; metti(); }; r.readAsDataURL(file);
      } else { v.testo = f.testo.value; if (!v.testo.trim()) { TD.toast("Scrivi il testo."); return; } metti(); }
    };
    function voce(id) { return s.voci().find(function (x) { return x.id === id; }); }
    appEl.querySelectorAll("[data-mostra]").forEach(function (b) { b.onclick = function () { const el = appEl.querySelector('[data-seg="' + b.dataset.mostra + '"]'); const v = voce(b.dataset.mostra); if (el && v) el.textContent = el.textContent.indexOf("•") === 0 ? v.testo : "••••••••"; }; });
    appEl.querySelectorAll("[data-copia]").forEach(function (b) { b.onclick = function () { const v = voce(b.dataset.copia); if (v) TD.scambio.copia(v.testo).then(function (ok) { TD.toast(ok ? "Copiato." : "Copia non riuscita."); }); }; });
    appEl.querySelectorAll("[data-via]").forEach(function (b) { b.onclick = function () { if (!TD.conferma("Cancellare questa voce dalla casella? Sparisce anche dall'altro dispositivo.")) return; s.voci(TD.casellaUnisci(s.voci(), [{ id: b.dataset.via, eliminata: true, t: Date.now() }])); TD.salva(); pubblica(s, false); disegna(); }; });
  }

  TD.rotta("/casella", function (app) { appEl = app; idCorrente = ""; const s = sede(""); disegna(); if (s) collega(s); });
  TD.rotta("/casella/:id", function (app, p) { appEl = app; idCorrente = p.id; const s = sede(p.id); disegna(); if (s) collega(s); });
})();
