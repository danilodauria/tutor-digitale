/* ==========================================================================
   Tutor Digitale · ricerca rapida
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

/* Indice locale di funzioni, percorsi, lezioni e clienti: la ricerca non
   manda nulla in rete e funziona anche offline. Ogni voce mostra il percorso
   nel programma e la rotta da aprire. */

(function () {
  "use strict";

  const TD = window.TD = window.TD || {};

  let btn, modal, box, input, esiti, aiuto, chiudiBtn, ultimoFocus = null;
  let voci = [], mostrati = [], attivo = -1;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  }

  function percorsoMenu(a) {
    return a.closest(".nav-more-menu") ? "Menu › Altro" : "Menu";
  }

  /* parole che la gente usa davvero, anche se non sono nel nome del menu */
  const PAROLE = {
    "#/percorsi": "lezioni programma argomenti",
    "#/quiz": "domande test verifica punteggio",
    "#/esercizi": "palestra esercizi",
    "#/clienti": "persone schede contatti",
    "#/documenti": "liberatoria attestato preventivo fattura ricevuta",
    "#/agenda": "appuntamenti calendario orari lezioni",
    "#/percorsi-misura": "percorso personalizzato su misura",
    "#/aula": "gruppo classe tv schermo",
    "#/quiz-telefono": "telefono qr individuale gruppo",
    "#/segni": "lis lingua dei segni voce accessibilità",
    "#/guide": "guide tutorial schermate",
    "#/editor": "creare modificare lezione",
    "#/cruscotto": "oggi lavoro priorità",
    "#/statistiche": "incassi ore report",
    "#/assistente": "aiuto voce domande",
    "#/sync": "sincronizzare dispositivi",
    "#/licenza-formatori": "kit tutor licenza",
    "#/presenze": "registro firme mensile",
    "#/allievi": "scambio compiti allievi",
    "#/remoto": "assistenza remota schermo",
    "#/palestra": "esercizi interattivi",
    "#/strumenti": "timer cronometro strumenti",
    "#/strumenti/test": "test ingresso valutazione",
    "#/impostazioni": "backup esporta importa tema caratteri",
    "#/installa": "installare app",
    "#/licenze": "licenza copyright"
  };

  /* tutte le cose che si possono raggiungere: prima il menu, poi le pagine
     utili che non stanno nel menu, quindi percorsi, lezioni e clienti */
  function indice() {
    const out = [];
    document.querySelectorAll("#mainNav a").forEach(function (a) {
      const nome = (a.textContent || "").trim();
      const via = a.getAttribute("href") || "";
      if (!nome || !via) return;
      out.push({ nome: nome, via: via, percorso: percorsoMenu(a), gruppo: "Funzioni", kw: [a.dataset.alias || "", PAROLE[via] || ""].filter(Boolean).join(" ") });
    });
    [
      ["Pagina iniziale", "#/", "Home", "home inizio casa"],
      ["Nuovo cliente", "#/nuovo-cliente", "Clienti › Nuovo cliente", "aggiungi crea scheda persona"],
      ["Preventivo", "#/preventivo", "Documenti › Preventivo", "prezzo offerta costo"],
      ["Liberatoria", "#/documenti", "Documenti", "firma privacy consenso"],
      ["Attestato", "#/documenti", "Documenti", "certificato diploma"],
      ["Backup dei dati", "#/impostazioni", "Menu › Altro › Impostazioni", "esporta importa salva ripristina"]
    ].forEach(function (e) {
      out.push({ nome: e[0], via: e[1], percorso: e[2], gruppo: "Funzioni", kw: e[3] });
    });
    (TD.PERCORSI || []).forEach(function (p) {
      out.push({ nome: p.nome, via: "#/percorso/" + p.id, percorso: "Lezioni › Percorsi", gruppo: "Lezioni", kw: "percorso " + (p.descr || "") });
    });
    (TD.LEZIONI || []).forEach(function (l) {
      const p = TD.percorso ? TD.percorso(l.dev) : { nome: l.dev };
      const liv = TD.livello ? TD.livello(l.liv) : { nome: "" };
      out.push({
        nome: l.titolo,
        via: "#/lezione/" + l.id,
        percorso: "Lezioni › " + p.nome,
        gruppo: "Lezioni",
        kw: ["lezione", p.nome, liv.nome, (l.obiettivi || []).join(" "), l.personale ? "tua" : ""].join(" ")
      });
    });
    (TD.db && TD.db.clienti ? TD.db.clienti : []).forEach(function (c) {
      const nome = TD.nomeCliente ? TD.nomeCliente(c) : ((c.nome || "") + " " + (c.cognome || "")).trim();
      out.push({
        nome: nome || "Cliente",
        via: "#/cliente/" + c.id,
        percorso: "Clienti",
        gruppo: "Clienti",
        kw: [c.telefono, c.email, c.citta, c.luogo, c.note].filter(Boolean).join(" ")
      });
    });
    return out;
  }

  /* tutte le parole della ricerca devono comparire; vince chi ha il nome
     che comincia con quello che si è scritto */
  function filtra(voci, q) {
    const t = norm(q).split(" ").filter(Boolean);
    if (!t.length) return voci;
    const frase = t.join(" ");
    const out = [];
    voci.forEach(function (v) {
      const nome = norm(v.nome);
      const hay = norm([v.nome, v.kw, v.percorso, v.via].join(" "));
      if (!t.every(function (x) { return hay.indexOf(x) >= 0; })) return;
      let score = 0;
      if (nome === frase) score += 120;
      else if (nome.indexOf(frase) === 0) score += 90;
      else if (nome.indexOf(frase) >= 0) score += 60;
      t.forEach(function (x) {
        if (nome.indexOf(x) === 0) score += 25;
        else if (nome.indexOf(x) >= 0) score += 15;
      });
      if (norm(v.kw).indexOf(frase) >= 0) score += 12;
      if (norm(v.percorso).indexOf(frase) >= 0) score += 5;
      score -= Math.min(nome.length, 80) / 100;
      out.push({ v: v, s: score });
    });
    return out.sort(function (a, b) { return b.s - a.s || String(a.v.nome).localeCompare(String(b.v.nome)); }).map(function (x) { return x.v; });
  }

  function disegna() {
    if (!input || !esiti) return;
    const q = input.value.trim();
    const nL = voci.filter(function (v) { return v.gruppo === "Lezioni"; }).length;
    const nC = voci.filter(function (v) { return v.gruppo === "Clienti"; }).length;
    let list, nota;
    if (!q) {
      list = voci.filter(function (v) { return v.gruppo === "Funzioni"; });
      nota = "Scrivi per cercare anche tra " + nL + " lezioni e " + nC + (nC === 1 ? " cliente" : " clienti") + ".";
    } else {
      list = filtra(voci, q);
      nota = list.length ? list.length + (list.length === 1 ? " risultato" : " risultati") : "";
    }
    if (list.length > 40) { list = list.slice(0, 40); nota = "Primi 40 risultati: affina la ricerca."; }
    const gruppi = ["Funzioni", "Lezioni", "Clienti"];
    const ordinati = [];
    gruppi.forEach(function (g) {
      list.filter(function (v) { return v.gruppo === g; }).forEach(function (v) { ordinati.push(v); });
    });
    mostrati = ordinati;
    attivo = mostrati.length ? 0 : -1;
    let html = "";
    if (!mostrati.length) {
      html = '<p class="cerca-vuoto">Nessun risultato per «' + esc(q) + '». Prova con una parola più semplice.</p>';
    } else {
      let i = 0;
      gruppi.forEach(function (g) {
        const gruppo = mostrati.filter(function (v) { return v.gruppo === g; });
        if (!gruppo.length) return;
        html += '<p class="cerca-gruppo">' + g + " · " + gruppo.length + "</p>";
        gruppo.forEach(function (v) {
          html += '<button type="button" role="option" class="cerca-voce" id="cercaVoce' + i + '" data-i="' + i + '" aria-selected="' + (i === 0 ? "true" : "false") + '">' +
            '<span class="cerca-nome">' + esc(v.nome) + "</span>" +
            '<span class="cerca-percorso">' + esc(v.percorso) + "</span>" +
            '<span class="cerca-via">' + esc(v.via) + "</span>" +
            "</button>";
          i++;
        });
      });
    }
    esiti.innerHTML = html;
    aiuto.textContent = nota;
    input.setAttribute("aria-activedescendant", mostrati.length ? "cercaVoce0" : "");
  }

  function evidenzia(i, scorri) {
    const vociEl = esiti.querySelectorAll(".cerca-voce");
    if (!vociEl.length || i < 0) return;
    attivo = (i + vociEl.length) % vociEl.length;
    vociEl.forEach(function (el, n) { el.setAttribute("aria-selected", n === attivo ? "true" : "false"); });
    const el = vociEl[attivo];
    input.setAttribute("aria-activedescendant", el.id);
    if (scorri) { try { el.scrollIntoView({ block: "nearest" }); } catch (e) {} }
  }

  function apriVoce(v) {
    if (!v) return;
    chiudi();
    if (/^https?:/i.test(v.via) || /^assets\//.test(v.via)) window.open(v.via, "_blank", "noopener");
    else if (TD.vai) TD.vai(v.via);
    else location.hash = v.via;
  }

  function apri() {
    if (!modal) return;
    ultimoFocus = document.activeElement;
    voci = indice();
    input.value = "";
    modal.hidden = false;
    document.body.classList.add("cerca-aperta");
    const nav = document.getElementById("mainNav");
    const menuBtn = document.getElementById("menuBtn");
    const more = document.getElementById("navMore");
    if (nav) nav.classList.remove("open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    if (more) more.open = false;
    disegna();
    input.focus();
  }

  function chiudi() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("cerca-aperta");
    if (ultimoFocus && ultimoFocus.focus && document.contains(ultimoFocus)) ultimoFocus.focus();
  }

  function avvia() {
    btn = document.getElementById("cercaBtn");
    modal = document.getElementById("cercaModal");
    if (!modal) return;
    box = modal.querySelector(".cerca-box");
    input = document.getElementById("cercaInput");
    esiti = document.getElementById("cercaEsiti");
    aiuto = document.getElementById("cercaAiuto");
    chiudiBtn = document.getElementById("cercaChiudi");
    const tasto = modal.querySelector(".cerca-tasto");
    if (tasto && /Mac|iPhone|iPad|iPod/.test(navigator.platform || "")) tasto.textContent = "⌘ K";
    if (btn) btn.addEventListener("click", apri);
    /* la voce testuale nel menu a cassetto: chi non riconosce la lente trova «Cerca» */
    const navBtn = document.getElementById("cercaNav");
    if (navBtn) navBtn.addEventListener("click", apri);
    if (chiudiBtn) chiudiBtn.addEventListener("click", chiudi);
    modal.addEventListener("click", function (e) { if (e.target === modal) chiudi(); });
    esiti.addEventListener("click", function (e) {
      const b = e.target.closest(".cerca-voce");
      if (b) apriVoce(mostrati[Number(b.dataset.i)]);
    });
    input.addEventListener("input", disegna);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (mostrati.length) evidenzia(attivo + 1, true); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (mostrati.length) evidenzia(attivo - 1, true); }
      else if (e.key === "Home") { e.preventDefault(); if (mostrati.length) evidenzia(0, true); }
      else if (e.key === "End") { e.preventDefault(); if (mostrati.length) evidenzia(mostrati.length - 1, true); }
      else if (e.key === "Enter") { e.preventDefault(); if (mostrati.length) apriVoce(mostrati[attivo < 0 ? 0 : attivo]); }
      else if (e.key === "Escape") { e.preventDefault(); chiudi(); }
    });
    if (box) box.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      const f = [input, chiudiBtn].filter(Boolean);
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    });
    window.addEventListener("hashchange", chiudi);
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === "k") {
        e.preventDefault();
        if (modal.hidden) apri();
        else { input.focus(); input.select(); }
      } else if (e.key === "Escape" && !modal.hidden) {
        chiudi();
      }
    });
  }

  TD.cerca = { apri: apri, chiudi: chiudi, indice: indice, filtra: filtra };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia);
  else avvia();
})();
