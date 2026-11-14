/* ==========================================================================
   Tutor Digitale · nucleo: archivio locale, navigazione, utilità
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

window.TD = window.TD || {};

(function () {
  "use strict";

  TD.VERSIONE = "1.3.0";
  TD.MODO = TD.MODO || "tutor";
  const KEY = TD.MODO === "allievo" ? "tutor-digitale-allievo:v1:db" : "tutor-digitale:v1:db";
  TD.CHIAVE = KEY;

  /* ------------------------------------------------------------ archivio */
  function vuoto() {
    return {
      profilo: { nome: "Danilo D'Auria", qualifica: "Tutor e consulente digitale", email: "", telefono: "", indirizzo: "", citta: "", piva: "", cf: "", sito: "https://danilodauria.github.io/", firma: "" },
      clienti: [],
      listino: JSON.parse(JSON.stringify(TD.LISTINO_BASE || [])),
      documenti: [],
      attestati: [],
      memo: {},
      allievo: null, tutor: null, segreto: "", consegne: [], allenamenti: [], ripassate: [],
      impostazioni: { tema: "", caratteri: "normale", correzione: "subito" },
      creato: new Date().toISOString()
    };
  }
  function carica() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return vuoto();
      const d = JSON.parse(raw);
      const base = vuoto();
      Object.keys(base).forEach(function (k) { if (d[k] == null) d[k] = base[k]; });
      Object.keys(base.profilo).forEach(function (k) { if (d.profilo[k] == null) d.profilo[k] = base.profilo[k]; });
      return d;
    } catch (e) { return vuoto(); }
  }
  TD.db = carica();
  TD.salva = function () {
    try { localStorage.setItem(KEY, JSON.stringify(TD.db)); return true; }
    catch (e) { TD.toast("Spazio del browser pieno: esporta un backup e libera spazio."); return false; }
  };
  TD.azzera = function () { TD.db = vuoto(); TD.salva(); };
  TD.importa = function (obj) {
    if (!obj || !Array.isArray(obj.clienti)) throw new Error("File non valido");
    const base = vuoto();
    Object.keys(base).forEach(function (k) { if (obj[k] == null) obj[k] = base[k]; });
    TD.db = obj; TD.salva();
  };

  /* ------------------------------------------------------------ utilità */
  TD.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  TD.uid = function (pref) {
    return (pref || "") + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };
  TD.oggi = function () {
    const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  TD.dataIt = function (iso) {
    if (!iso) return "";
    const p = String(iso).slice(0, 10).split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  };
  TD.dataLunga = function (iso) {
    try { return new Date(iso + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return TD.dataIt(iso); }
  };
  TD.euro = function (n) {
    return (Number(n) || 0).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
  };
  TD.rnd = function (n) {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n;
    }
    return Math.floor(Math.random() * n);
  };
  TD.mescola = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = TD.rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  TD.nomeCliente = function (c) {
    if (!c) return "";
    return c.tipo === "ente" ? (c.ragione || "Ente senza nome") : ((c.nome || "") + " " + (c.cognome || "")).trim() || "Cliente senza nome";
  };
  TD.cliente = function (id) { return TD.db.clienti.find(function (c) { return c.id === id; }); };
  TD.livello = function (n) { return TD.LIVELLI[n] || TD.LIVELLI[0]; };
  TD.percorso = function (id) { return TD.PERCORSI.find(function (p) { return p.id === id; }) || { id: id, nome: id }; };
  TD.scarica = function (blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  };
  TD.nomeFile = function (s) {
    return String(s || "documento").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  };

  /* ------------------------------------------------------------ icone */
  const IC = {
    home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    tablet: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    tv: '<rect x="2.5" y="5" width="19" height="12.5" rx="2"/><path d="M8 21h8M8.5 2.5 12 5l3.5-2.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M8 7h8M8 11h6"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    award: '<circle cx="12" cy="8.5" r="6"/><path d="m8.5 13.5-1.5 8 5-3 5 3-1.5-8"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    speaker: '<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12"/>',
    play: '<path d="m7 4 13 8-13 8Z"/>',
    pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
    screen: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    euro: '<path d="M18 6.5A7 7 0 1 0 18 17.5M4 10h10M4 14h10"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2Z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    mouse: '<rect x="6" y="2.5" width="12" height="19" rx="6"/><path d="M12 6v4"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/>',
    map: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 20h.01"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>'
  };
  TD.icona = function (n, cls) {
    return '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (IC[n] || IC.info) + "</svg>";
  };
  TD.iconaPercorso = function (id) { return TD.icona(TD.percorso(id).icona || "info"); };

  /* ------------------------------------------------------------ messaggi */
  TD.toast = function (msg) {
    let box = document.getElementById("toast");
    if (!box) { box = document.createElement("div"); box.id = "toast"; box.className = "toast"; box.setAttribute("role", "status"); document.body.appendChild(box); }
    box.textContent = msg; box.classList.add("on");
    clearTimeout(box._t); box._t = setTimeout(function () { box.classList.remove("on"); }, 3200);
  };
  TD.conferma = function (msg) { return window.confirm(msg); };

  /* finestra per chiedere una password (con conferma quando si cifra) */
  TD.chiediPassword = function (titolo, testo, conConferma) {
    return new Promise(function (risolvi) {
      const box = document.createElement("div");
      box.className = "modal";
      box.innerHTML = '<form class="modal-box form" role="dialog" aria-modal="true"><h2>' + TD.esc(titolo) + "</h2><p>" + testo + "</p>" +
        '<label class="field"><span>Password</span><input type="password" name="p1" autocomplete="new-password" minlength="8" required></label>' +
        (conConferma ? '<label class="field"><span>Ripeti la password</span><input type="password" name="p2" autocomplete="new-password" required></label>' : "") +
        '<label class="check"><input type="checkbox" name="vedi"> Mostra la password</label><p class="muted text-small" data-err></p>' +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + TD.icona("lock") + 'Conferma</button><button class="btn btn-ghost" type="button" data-annulla>Annulla</button></div></form>';
      document.body.appendChild(box);
      const f = box.querySelector("form");
      f.p1.focus();
      f.vedi.onchange = function () { f.querySelectorAll('input[type="password"],input[data-pw]').forEach(function (i) { i.setAttribute("data-pw", "1"); i.type = f.vedi.checked ? "text" : "password"; }); };
      function chiudi(v) { box.remove(); risolvi(v); }
      box.querySelector("[data-annulla]").onclick = function () { chiudi(null); };
      box.addEventListener("click", function (e) { if (e.target === box) chiudi(null); });
      f.onsubmit = function (e) {
        e.preventDefault();
        const err = f.querySelector("[data-err]");
        if (f.p1.value.length < 8) { err.textContent = "Almeno 8 caratteri: meglio una frase di 3 o 4 parole."; return; }
        if (conConferma && f.p1.value !== f.p2.value) { err.textContent = "Le due password non coincidono."; return; }
        chiudi(f.p1.value);
      };
    });
  };

  /* chiavi di firma del tutor (ECDSA): create alla prima occorrenza, restano nel backup */
  TD.chiaviTutor = async function () {
    if (TD.MODO === "allievo" || !TD.scambio || !TD.scambio.sicuro) return null;
    const pr = TD.db.profilo;
    if (!pr.chiavi || !pr.chiavi.privata) { pr.chiavi = await TD.scambio.nuoveChiavi(); TD.salva(); }
    return pr.chiavi;
  };

  /* ------------------------------------------------------------ voce */
  TD.leggi = function (testo) {
    if (!("speechSynthesis" in window)) { TD.toast("Questo dispositivo non ha la lettura ad alta voce."); return; }
    speechSynthesis.cancel();
    const voci = speechSynthesis.getVoices().filter(function (v) { return /^it/i.test(v.lang); });
    const migliore = voci.find(function (v) { return /natural|neural|premium|enhanced/i.test(v.name); }) || voci[0];
    String(testo).split(/(?<=[.!?:])\s+/).forEach(function (frase) {
      if (!frase.trim()) return;
      const u = new SpeechSynthesisUtterance(frase);
      u.lang = "it-IT"; u.rate = 0.95; if (migliore) u.voice = migliore;
      speechSynthesis.speak(u);
    });
  };
  TD.zitto = function () { if ("speechSynthesis" in window) speechSynthesis.cancel(); };

  /* ------------------------------------------------------------ spia online */
  TD.aggiornaSpia = function () {
    const on = navigator.onLine;
    document.documentElement.classList.toggle("is-online", on);
    document.documentElement.classList.toggle("is-offline", !on);
    document.querySelectorAll("[data-spia]").forEach(function (el) {
      el.classList.toggle("on", on);
      const t = el.querySelector(".spia-testo");
      if (t) t.textContent = on ? "Online" : "Offline";
      el.title = on ? "Connesso a Internet. Tutti i contenuti sono comunque già sul dispositivo." : "Senza Internet: tutto funziona allo stesso modo.";
    });
  };
  window.addEventListener("online", TD.aggiornaSpia);
  window.addEventListener("offline", TD.aggiornaSpia);

  /* ------------------------------------------------------------ navigazione */
  const rotte = [];
  TD.rotta = function (pattern, fn) {
    const chiavi = [];
    const re = new RegExp("^" + pattern.replace(/:([a-z]+)/gi, function (_, k) { chiavi.push(k); return "([^/]+)"; }) + "$");
    rotte.push({ re: re, chiavi: chiavi, fn: fn, pattern: pattern });
  };
  TD.vai = function (h) { if (location.hash === h) TD.render(); else location.hash = h; };
  TD.render = function () {
    TD.zitto();
    document.querySelectorAll(".modal").forEach(function (m) { m.remove(); });
    const percorso = (location.hash || "#/").slice(1) || "/";
    const [path, qs] = percorso.split("?");
    const query = {};
    if (qs) qs.split("&").forEach(function (kv) { const p = kv.split("="); query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); });
    const app = document.getElementById("app");
    for (const r of rotte) {
      const m = path.match(r.re);
      if (m) {
        const par = {};
        r.chiavi.forEach(function (k, i) { par[k] = decodeURIComponent(m[i + 1]); });
        if (app._cleanup) { try { app._cleanup(); } catch (e) {} app._cleanup = null; }
        app.innerHTML = "";
        try { r.fn(app, par, query); }
        catch (e) { console.error(e); app.innerHTML = '<div class="wrap"><div class="card"><h1>Qualcosa non va</h1><p>' + TD.esc(e.message) + '</p><a class="btn" href="#/">Torna alla home</a></div></div>'; }
        document.querySelectorAll("[data-nav]").forEach(function (a) {
          const seg = path.split("/")[1] || "";
          a.classList.toggle("active", !!seg && (a.getAttribute("data-nav") === seg || (a.dataset.alias || "").split(" ").indexOf(seg) >= 0));
        });
        TD.aggiornaSpia();
        window.scrollTo(0, 0);
        const h = app.querySelector("h1");
        const marchio = TD.MODO === "allievo" ? "Tutor Digitale · Allievo" : "Tutor Digitale";
        if (h) document.title = (h.textContent === "Tutor Digitale" || h.textContent.indexOf("Ciao") === 0 ? "" : h.textContent + " · ") + marchio;
        return;
      }
    }
    location.hash = "#/";
  };

  /* ------------------------------------------------------------ piccoli componenti */
  TD.intest = function (titolo, sotto, extra) {
    return '<header class="page-head"><div class="wrap"><h1>' + titolo + "</h1>" + (sotto ? '<p class="lead">' + sotto + "</p>" : "") + (extra || "") + "</div></header>";
  };
  TD.badgeLiv = function (n) {
    const l = TD.livello(n);
    return '<span class="badge liv-' + l.id + '">' + TD.esc(l.breve) + "</span>";
  };
  TD.barra = function (val, max, colore) {
    const p = max ? Math.round(100 * val / max) : 0;
    return '<div class="bar" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + p + "%" + (colore ? ";background:" + colore : "") + '"></span></div>';
  };
  TD.opzioniClienti = function (sel) {
    return '<option value="">— nessun cliente —</option>' + TD.db.clienti.slice().sort(function (a, b) { return TD.nomeCliente(a).localeCompare(TD.nomeCliente(b)); })
      .map(function (c) { return '<option value="' + c.id + '"' + (c.id === sel ? " selected" : "") + ">" + TD.esc(TD.nomeCliente(c)) + "</option>"; }).join("");
  };
  TD.form = function (root) {
    const o = {};
    root.querySelectorAll("[name]").forEach(function (el) {
      if (el.type === "checkbox") {
        if (el.dataset.multi) { o[el.name] = o[el.name] || []; if (el.checked) o[el.name].push(el.value); }
        else o[el.name] = el.checked;
      } else if (el.type === "radio") { if (el.checked) o[el.name] = el.value; }
      else o[el.name] = el.value.trim();
    });
    return o;
  };
})();
