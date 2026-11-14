/* ==========================================================================
   Tutor Digitale · liberatoria, attestato finale, preventivi e ricevute
   Tutto è impaginato sul dispositivo: PDF e stampa identici online e offline.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;

  /* --------------------------------------------------------------- hub */
  TD.rotta("/documenti", function (app, p, q) {
    const docs = TD.db.documenti.slice().reverse();
    const att = TD.db.attestati.slice().reverse();
    app.innerHTML = TD.intest("Documenti", "Liberatoria, attestati, preventivi e ricevute: si compilano qui, si firmano sullo schermo e si scaricano in PDF o si stampano.") +
      '<div class="wrap">' +
        '<div class="tiles">' +
          '<a class="tile" href="#/clienti"><span class="tile-ico">' + I("doc") + "</span><strong>Liberatoria di un cliente</strong><small>Dalla scheda cliente › Liberatoria</small></a>" +
          '<a class="tile" href="#/liberatoria/vuota"><span class="tile-ico">' + I("print") + "</span><strong>Modulo vuoto da stampare</strong><small>Per farlo compilare a penna</small></a>" +
          '<a class="tile" href="#/clienti"><span class="tile-ico">' + I("award") + "</span><strong>Attestato finale</strong><small>Dalla scheda cliente › Attestato</small></a>" +
          '<a class="tile" href="#/preventivo"><span class="tile-ico">' + I("euro") + "</span><strong>Preventivo o ricevuta</strong><small>Dal listino, numerati per anno</small></a>" +
          '<a class="tile" href="#/presenze"><span class="tile-ico">' + I("calendar") + "</span><strong>Registro presenze</strong><small>Foglio mensile per enti e associazioni</small></a>" +
          '<a class="tile" href="#/statistiche"><span class="tile-ico">' + I("layers") + "</span><strong>Statistiche del lavoro</strong><small>Ore, incassi, argomenti, progressi</small></a>" +
        "</div>" +
        '<section class="card"><h2>Verifica un attestato</h2><form id="ver" class="search"><input name="codice" placeholder="Codice (TD-2026-0001-7) o link del QR" value="' + E(q.codice || "") + '" aria-label="Codice o link dell\'attestato"><button class="btn">' + I("check") + 'Verifica</button></form><p id="verEsito"></p>' +
          '<p class="muted text-small">Chiunque può verificare un attestato inquadrandone il QR: si apre la <a href="verifica/" target="_blank" rel="noopener">pagina di verifica</a>, che controlla la tua firma digitale.</p>' +
          (att.some(function (a) { return a.pubblico; }) ? '<div class="actions"><button class="btn btn-sm" type="button" id="regPub">' + I("download") + "Registro pubblico (solo con consenso)</button></div>" : "") + "</section>" +
        '<div class="grid-2">' +
          '<section class="card"><h2>Registro degli attestati</h2>' + (att.length ? '<table class="table"><thead><tr><th>Codice</th><th>Intestatario</th><th>Data</th></tr></thead><tbody>' + att.map(function (a) { return "<tr><td><strong>" + E(a.codice) + "</strong></td><td>" + E(a.intestatario) + "</td><td>" + E(TD.dataIt(a.data)) + "</td></tr>"; }).join("") + "</tbody></table>" : '<p class="muted">Nessun attestato rilasciato.</p>') + "</section>" +
          '<section class="card"><h2>Preventivi e ricevute</h2>' + (docs.length ? '<ul class="list">' + docs.map(function (d) { const c = TD.cliente(d.cliente); return '<li><a href="#/preventivo?doc=' + d.id + '"><span><strong>' + E(d.tipo === "ricevuta" ? "Ricevuta" : d.tipo === "fattura" ? "Fattura" : "Preventivo") + " " + E(d.numero) + "</strong> · " + E(TD.dataIt(d.data)) + " · " + E(c ? TD.nomeCliente(c) : d.intestatario || "") + " · " + TD.euro(d.totale) + "</span>" + I("arrow") + "</a></li>"; }).join("") + "</ul>" : '<p class="muted">Nessun documento.</p>') + "</section>" +
        "</div></div>";
    document.getElementById("ver").onsubmit = function (e) {
      e.preventDefault();
      const grezzo = this.codice.value.trim();
      if (/a=[A-Za-z0-9_-]+\./.test(grezzo)) {
        TD.scambio.verificaAttestato(grezzo).then(function (v) {
          document.getElementById("verEsito").innerHTML = v.stato === "valida" ? '<span class="pill ok">' + I("check") + "Firma valida: " + E(v.dati.n) + ", " + E(v.dati.c) + (v.dati.l ? ", livello " + E(v.dati.l) : "") + ", rilasciato il " + E(TD.dataIt(v.dati.data)) + " · impronta " + E(v.impronta) + "</span>"
            : '<span class="pill ko">' + I("x") + (v.stato === "alterata" ? "Firma non valida: i dati dell'attestato sono stati modificati." : "Link non leggibile.") + "</span>";
        });
        return;
      }
      const cod = grezzo.toUpperCase();
      const a = TD.db.attestati.find(function (x) { return x.codice === cod; });
      const ok = TD.codiceValido(cod);
      document.getElementById("verEsito").innerHTML = a ? '<span class="pill ok">' + I("check") + "Attestato valido: " + E(a.intestatario) + ", rilasciato il " + E(TD.dataIt(a.data)) + " (" + E(a.livello) + ")</span>"
        : ok ? '<span class="pill warn">' + I("info") + "Codice formalmente corretto ma non presente in questo archivio.</span>" : '<span class="pill ko">' + I("x") + "Codice non valido.</span>";
    };
    const rp = document.getElementById("regPub");
    if (rp) rp.onclick = function () {
      const reg = TD.db.attestati.filter(function (a) { return a.pubblico; }).map(function (a) { return { codice: a.codice, intestatario: a.intestatario, data: a.data, livello: a.livello }; });
      TD.scarica(new Blob([JSON.stringify({ tutor: TD.db.profilo.nome, aggiornato: TD.oggi(), attestati: reg }, null, 1)], { type: "application/json" }), "registro.json");
      TD.toast(reg.length + " attestati con consenso: il file va in verifica/registro.json del sito.");
    };
  });

  /* codice attestato con cifra di controllo */
  function controllo(base) { let s = 0; for (let i = 0; i < base.length; i++) s += base.charCodeAt(i) * (i + 1); return String(s % 10); }
  TD.codiceValido = function (cod) { const m = /^(TD-\d{4}-\d{4})-(\d)$/.exec(cod || ""); return !!m && controllo(m[1]) === m[2]; };
  function nuovoCodice() {
    const anno = TD.oggi().slice(0, 4);
    const n = TD.db.attestati.filter(function (a) { return a.codice.indexOf("TD-" + anno) === 0; })
      .reduce(function (m, a) { return Math.max(m, parseInt(a.codice.slice(8, 12), 10) || 0); }, 0) + 1;
    const base = "TD-" + anno + "-" + String(n).padStart(4, "0");
    return base + "-" + controllo(base);
  }

  function sostituisci(t, c) {
    const pr = TD.db.profilo;
    const contatti = [pr.indirizzo && pr.citta ? pr.indirizzo + ", " + pr.citta : pr.citta, pr.email, pr.telefono].filter(Boolean).join(" · ");
    return t.replace("{docente}", (pr.nome || "il docente") + (pr.qualifica ? ", " + pr.qualifica : ""))
      .replace("{contattiDocente}", contatti ? " — " + contatti : "")
      .replace("{forma}", c ? (c.forma === "gruppo" ? "di gruppo" : "individuale") : "individuale / di gruppo")
      .replace("{luogo}", c ? [c.luogo, c.indirizzo, c.citta].filter(Boolean).join(", ") : "______________________________");
  }

  /* --------------------------------------------------------------- LIBERATORIA */
  TD.rotta("/liberatoria/:id", function (app, p) {
    const vuota = p.id === "vuota";
    const c = vuota ? null : TD.cliente(p.id);
    if (!vuota && !c) { TD.vai("#/clienti"); return; }
    const L = TD.LIBERATORIA;
    const lib = (c && c.liberatoria) || { consensi: {}, luogo: (TD.db.profilo.citta || ""), data: TD.oggi() };
    lib.consensi = lib.consensi || {};
    const minore = c && (c.tutore || lib.tutoreNome);

    app.innerHTML = TD.intest(vuota ? "Liberatoria · modulo vuoto" : "Liberatoria · " + E(TD.nomeCliente(c)), vuota ? "Stampalo e fallo compilare a penna: stessi testi della versione da firmare sullo schermo." : "Leggi insieme al cliente, spunta i consensi, fai firmare con il dito o con il mouse. Funziona anche senza Internet.") +
      '<div class="wrap">' +
        '<div class="toolbar">' +
          (vuota ? "" : '<button class="btn btn-primary" id="salva">' + I("check") + "Salva firmata</button>") +
          '<button class="btn" id="pdf">' + I("download") + "PDF</button>" +
          '<button class="btn" id="stampa">' + I("print") + "Stampa</button>" +
          (c && c.tipo === "ente" ? '<button class="btn" id="foglioFirme">' + I("users") + "Foglio firme partecipanti</button>" : "") +
          (vuota ? "" : '<a class="btn btn-ghost" href="#/cliente/' + c.id + '">' + I("back") + "Scheda cliente</a>") +
        "</div>" +
        '<article class="card legal">' +
          "<h2>" + E(L.titolo) + "</h2>" +
          (c ? '<dl class="dl compact">' + [["Cliente", TD.nomeCliente(c)], ["Referente", c.referente], ["Nato/a il", TD.dataIt(c.nascita)], ["Codice fiscale", c.cf || c.piva], ["Indirizzo", [c.indirizzo, c.citta].filter(Boolean).join(", ")], ["Telefono", c.telefono], ["Email", c.email]].filter(function (x) { return x[1]; }).map(function (x) { return "<dt>" + E(x[0]) + "</dt><dd>" + E(x[1]) + "</dd>"; }).join("") + "</dl>" : "") +
          L.sezioni.map(function (s) { return "<h3>" + E(s.t) + "</h3>" + s.p.map(function (x) { return "<p>" + E(sostituisci(x, c)) + "</p>"; }).join(""); }).join("") +
          '<fieldset class="consents"><legend>Consensi</legend>' + L.consensi.map(function (k) {
            return '<label class="check"><input type="checkbox" name="cons_' + k.id + '"' + (lib.consensi[k.id] ? " checked" : "") + (vuota ? " disabled" : "") + "> " + E(k.testo) + (k.obbl ? ' <em class="req">obbligatorio</em>' : "") + "</label>";
          }).join("") + "</fieldset>" +
          (vuota ? "" :
          '<div class="grid-3"><label class="field"><span>Luogo</span><input id="libLuogo" value="' + E(lib.luogo || "") + '"></label><label class="field"><span>Data</span><input id="libData" type="date" value="' + E(lib.data || TD.oggi()) + '"></label>' +
            '<label class="field"><span>Genitore / tutore (se serve)</span><input id="libTutore" value="' + E(lib.tutoreNome || (c && c.tutore) || "") + '"></label></div>' +
          '<div class="sign-grid">' +
            firmaBox("fCliente", c.tipo === "ente" ? "Firma del referente" : "Firma del cliente") +
            '<div id="boxTutore"' + (minore ? "" : " hidden") + ">" + firmaBox("fTutore", "Firma del genitore / tutore") + "</div>" +
            firmaBox("fDocente", "Firma del docente") +
          "</div>") +
          '<p class="muted text-small">' + E(L.avvertenza) + "</p>" +
        "</article>" +
        '<section class="block"><h2>Anteprima di stampa</h2><div class="doc-preview" id="prev"></div></section>' +
      "</div>";

    const pads = {};
    if (!vuota) {
      pads.cliente = TD.padFirma(document.getElementById("fCliente"), lib.firmaCliente);
      pads.tutore = TD.padFirma(document.getElementById("fTutore"), lib.firmaTutore);
      pads.docente = TD.padFirma(document.getElementById("fDocente"), lib.firmaDocente || TD.db.profilo.firma);
      app.querySelectorAll("[data-pulisci]").forEach(function (b) { b.onclick = function () { pads[b.dataset.pulisci].pulisci(); }; });
      document.getElementById("libTutore").oninput = function () { document.getElementById("boxTutore").hidden = !this.value.trim(); };
    }
    function leggi() {
      const o = { consensi: {} };
      TD.LIBERATORIA.consensi.forEach(function (k) { o.consensi[k.id] = !!(app.querySelector('[name="cons_' + k.id + '"]') || {}).checked; });
      if (!vuota) {
        o.luogo = document.getElementById("libLuogo").value.trim();
        o.data = document.getElementById("libData").value;
        o.tutoreNome = document.getElementById("libTutore").value.trim();
        o.firmaCliente = pads.cliente.dati(); o.firmaTutore = o.tutoreNome ? pads.tutore.dati() : ""; o.firmaDocente = pads.docente.dati();
      }
      return o;
    }
    function costruisci() {
      const o = leggi();
      return Promise.all([TD.immagine(o.firmaCliente), TD.immagine(o.firmaTutore), TD.immagine(o.firmaDocente)]).then(function (im) {
        return pdfLiberatoria(c, o, im);
      });
    }
    function aggiornaAnteprima() { costruisci().then(function (pg) { TD.anteprima(document.getElementById("prev"), pg); }); }
    aggiornaAnteprima();
    app.querySelectorAll('[name^="cons_"]').forEach(function (x) { x.addEventListener("change", aggiornaAnteprima); });
    const nomeF = "liberatoria-" + (c ? TD.nomeFile(TD.nomeCliente(c)) : "modulo-vuoto") + ".pdf";
    document.getElementById("pdf").onclick = function () { costruisci().then(function (pg) { TD.scaricaPdf(pg, nomeF, { titolo: TD.LIBERATORIA.titolo }); }); };
    document.getElementById("stampa").onclick = function () { costruisci().then(TD.stampa); };
    const ff = document.getElementById("foglioFirme");
    if (ff) ff.onclick = function () { TD.scaricaPdf(foglioFirme(c), "firme-partecipanti-" + TD.nomeFile(TD.nomeCliente(c)) + ".pdf", { titolo: "Foglio firme" }); };
    const sv = document.getElementById("salva");
    if (sv) sv.onclick = function () {
      const o = leggi();
      if (!o.consensi.obbligatorio) { TD.toast("Serve il consenso obbligatorio per iniziare le lezioni."); return; }
      if (!o.firmaCliente) { TD.toast("Manca la firma del cliente."); return; }
      o.firmata = true;
      c.liberatoria = o;
      if (!o.consensi.accessibilita && c.accessibilita) TD.toast("Attenzione: senza consenso, cancella le note di accessibilità dalla scheda.");
      TD.salva(); aggiornaAnteprima(); TD.toast("Liberatoria salvata con le firme.");
    };
  });

  function firmaBox(id, label) {
    const k = id === "fCliente" ? "cliente" : id === "fTutore" ? "tutore" : "docente";
    return '<div class="sign"><span>' + E(label) + '</span><canvas id="' + id + '" class="sign-pad" aria-label="' + E(label) + ': disegna con il dito o con il mouse"></canvas><button type="button" class="btn btn-sm btn-ghost" data-pulisci="' + k + '">' + I("x") + "Cancella firma</button></div>";
  }

  function pdfLiberatoria(c, o, im) {
    const L = TD.LIBERATORIA;
    const d = new TD.Documento({ titolo: L.titolo, piede: "Tutor Digitale · " + L.titolo });
    d.intestazione(TD.db.profilo, "Iscrizione, privacy e liberatoria");
    d.h1(L.titolo);
    d.campi(c ? [
      [c.tipo === "ente" ? "Ente o gruppo" : "Nome e cognome", TD.nomeCliente(c)], [c.tipo === "ente" ? "Referente" : "Data di nascita", c.tipo === "ente" ? c.referente : TD.dataIt(c.nascita)],
      ["Codice fiscale / P. IVA", c.cf || c.piva], ["Telefono", c.telefono],
      ["Indirizzo", [c.indirizzo, c.citta].filter(Boolean).join(", ")], ["Email", c.email]
    ] : [["Nome e cognome / Ente", ""], ["Data di nascita / Referente", ""], ["Codice fiscale / P. IVA", ""], ["Telefono", ""], ["Indirizzo", ""], ["Email", ""]]);
    L.sezioni.forEach(function (s) {
      d.h2(s.t);
      s.p.forEach(function (x) { d.p(sostituisci(x, c), { size: 26 }); });
      if (s.t.indexOf("4.") === 0) L.consensi.forEach(function (k) { d.casella(k.testo, !!(o.consensi && o.consensi[k.id])); });
    });
    d.y += 10;
    d.campi([["Luogo", o.luogo || ""], ["Data", o.data ? TD.dataIt(o.data) : ""]]);
    const firme = [{ etichetta: c && c.tipo === "ente" ? "Firma del referente" : "Firma del cliente", immagine: im[0], nome: c ? (c.tipo === "ente" ? c.referente : TD.nomeCliente(c)) : "" }];
    if (!c || o.tutoreNome) firme.push({ etichetta: "Genitore / tutore", immagine: im[1], nome: o.tutoreNome || "" });
    firme.push({ etichetta: "Firma del docente", immagine: im[2], nome: TD.db.profilo.nome });
    d.firme(firme);
    d.piccolo(L.avvertenza, { prima: 10 });
    return d.chiudi();
  }

  function foglioFirme(c) {
    const d = new TD.Documento({ titolo: "Foglio firme · " + TD.nomeCliente(c), piede: "Tutor Digitale · foglio firme partecipanti" });
    d.intestazione(TD.db.profilo, "Foglio firme dei partecipanti");
    d.h1("Foglio firme dei partecipanti");
    d.p("Ente o gruppo: " + TD.nomeCliente(c) + (c.referente ? " · referente " + c.referente : ""), { size: 28 });
    d.piccolo("Firmando, ogni partecipante dichiara di aver letto l'informativa e la liberatoria consegnate al referente. Nella colonna «Foto» scrivere SÌ o NO per il consenso a immagini senza volto riconoscibile.", { dopo: 16 });
    const righe = (c.partecipanti || []).map(function (x, i) { return [String(i + 1), x.nome, "", "", ""]; });
    while (righe.length < 12) righe.push([String(righe.length + 1), "", "", "", ""]);
    d.tabella(["N.", "Nome e cognome", "Telefono o email", "Foto", "Firma"], righe.map(function (r) { return r.map(function (x) { return x || " \n "; }); }), [0.06, 0.3, 0.26, 0.1, 0.28]);
    return d.chiudi();
  }

  /* --------------------------------------------------------------- ATTESTATO */
  function competenzeDi(c) {
    const fatte = (c.completate || []).map(TD.lezione).filter(Boolean);
    const perArea = {};
    fatte.forEach(function (l) {
      const area = l.digcomp[0];
      perArea[area] = perArea[area] || [];
      l.obiettivi.forEach(function (o) { if (perArea[area].indexOf(o) < 0) perArea[area].push(o); });
    });
    return perArea;
  }

  TD.rotta("/attestato/:id", function (app, p) {
    const c = TD.cliente(p.id);
    if (!c) { TD.vai("#/clienti"); return; }
    const fatte = (c.completate || []).map(TD.lezione).filter(Boolean);
    const percorsi = [];
    fatte.forEach(function (l) { if (percorsi.indexOf(l.dev) < 0) percorsi.push(l.dev); });
    const livMax = fatte.reduce(function (m, l) { return Math.max(m, l.liv); }, 0);
    const svolte = (c.registro || []).filter(function (r) { return r.stato !== "pianificata"; }).map(function (r) { return r.data; }).sort();
    const perArea = competenzeDi(c);
    const testoComp = Object.keys(perArea).sort().map(function (a) { return perArea[a].slice(0, 4).join("\n"); }).join("\n");
    const media = TD.mediaQuiz(c);

    app.innerHTML = TD.intest("Attestato finale · " + E(TD.nomeCliente(c)), "Controlla i dati, scegli l'intestatario e scarica il PDF da consegnare o stampare. Ogni attestato ha un codice verificabile.") +
      '<div class="wrap"><div class="grid-2 att-grid">' +
        '<form class="card form" id="fa">' +
          (c.tipo === "ente" ? '<label class="field"><span>Intestatario</span><select name="intestatario">' + (c.partecipanti || []).map(function (x) { return "<option>" + E(x.nome) + "</option>"; }).join("") + "<option>" + E(TD.nomeCliente(c)) + "</option></select></label>"
            : '<label class="field"><span>Intestatario</span><input name="intestatario" value="' + E(TD.nomeCliente(c)) + '"></label>') +
          '<label class="field"><span>Titolo del percorso</span><input name="titolo" value="Percorso di competenze digitali"></label>' +
          '<div class="grid-2"><label class="field"><span>Livello raggiunto</span><select name="livello">' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '"' + (l.id === livMax ? " selected" : "") + ">" + E(l.nome) + "</option>"; }).join("") + "</select></label>" +
            '<label class="field"><span>Ore di formazione</span><input name="ore" type="number" step="0.5" value="' + (Math.round(TD.oreCliente(c) * 2) / 2) + '"></label></div>' +
          '<fieldset class="field"><legend>Percorsi svolti</legend><div class="checkrow">' + TD.PERCORSI.map(function (x) { return '<label class="check"><input type="checkbox" name="percorsi" data-multi="1" value="' + x.id + '"' + (percorsi.indexOf(x.id) >= 0 ? " checked" : "") + "> " + E(x.nome) + "</label>"; }).join("") + "</div></fieldset>" +
          '<div class="grid-2"><label class="field"><span>Dal</span><input name="dal" type="date" value="' + E(svolte[0] || TD.oggi()) + '"></label><label class="field"><span>Al</span><input name="al" type="date" value="' + E(svolte[svolte.length - 1] || TD.oggi()) + '"></label></div>' +
          '<label class="field"><span>Competenze acquisite (una per riga, massimo 12)</span><textarea name="competenze" rows="8">' + E(testoComp) + "</textarea></label>" +
          '<div class="grid-2"><label class="field"><span>Esito delle verifiche</span><input name="esito" value="' + (media == null ? "" : "Media dei quiz: " + media + "%") + '"></label>' +
            '<label class="field"><span>Luogo e data di rilascio</span><input name="luogo" value="' + E((TD.db.profilo.citta || "") + ", " + TD.dataLunga(TD.oggi())) + '"></label></div>' +
          '<p class="muted text-small">' + I("lock") + ' Al rilascio l\'attestato riceve un <strong>QR di verifica</strong> firmato con la tua chiave: chi lo inquadra vede codice, intestatario e data, senza archivi online.</p>' +
          '<label class="check"><input type="checkbox" name="pubblico"> L\'intestatario acconsente a comparire nel registro pubblico degli attestati (facoltativo)</label>' +
          '<div class="actions"><button class="btn btn-primary" type="submit">' + I("award") + "Rilascia e scarica PDF</button><button class=\"btn\" type=\"button\" id=\"prova\">" + I("screen") + "Aggiorna anteprima</button><button class=\"btn\" type=\"button\" id=\"stampaA\">" + I("print") + "Stampa</button></div>" +
          (TD.db.profilo.firma ? "" : '<p class="muted text-small">' + I("info") + ' Aggiungi la tua firma in <a href="#/impostazioni">Impostazioni</a>: comparirà su tutti gli attestati.</p>') +
        "</form>" +
        '<div><div class="doc-preview land" id="prevA"></div><p class="muted text-small">L\'attestato è un documento privato di frequenza e verifica delle competenze, con riferimento al quadro europeo DigComp 2.2: non è un titolo di studio né una certificazione con valore legale.</p></div>' +
      "</div></div>";

    const f = document.getElementById("fa");
    let codice = null, urlVerifica = "";
    function dati() {
      const o = TD.form(f);
      o.verifica = urlVerifica;
      o.competenze = (o.competenze || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 12);
      o.codice = codice || "TD-" + TD.oggi().slice(0, 4) + "-0000-0";
      return o;
    }
    function disegna() { return TD.immagine(TD.db.profilo.firma).then(function (firma) { return [attestatoCanvas(dati(), firma)]; }); }
    function anteprima() { disegna().then(function (pg) { TD.anteprima(document.getElementById("prevA"), pg); }); }
    anteprima();
    document.getElementById("prova").onclick = anteprima;
    document.getElementById("stampaA").onclick = function () { disegna().then(TD.stampa); };
    f.onsubmit = function (e) {
      e.preventDefault();
      const o = dati();
      if (!o.intestatario) { TD.toast("Manca l'intestatario."); return; }
      codice = nuovoCodice(); o.codice = codice;
      const rec = { codice: codice, cliente: c.id, intestatario: o.intestatario, data: TD.oggi(), livello: TD.livello(Number(o.livello)).nome, ore: o.ore, percorsi: o.percorsi, tutor: TD.db.profilo.nome, pubblico: !!o.pubblico };
      TD.db.attestati.push(rec);
      TD.salva();
      TD.chiaviTutor().then(function (ch) { return ch ? TD.scambio.firmaAttestato(rec, ch) : ""; })
        .catch(function () { return ""; })
        .then(function (url) { rec.verifica = url; urlVerifica = url; TD.salva(); return disegna(); })
        .then(function (pg) {
        TD.anteprima(document.getElementById("prevA"), pg);
        TD.scaricaPdf(pg, "attestato-" + TD.nomeFile(o.intestatario) + "-" + codice + ".pdf", { titolo: "Attestato " + o.intestatario });
        TD.toast("Attestato " + codice + " rilasciato e registrato" + (urlVerifica ? ", con QR di verifica." : "."));
        codice = null; urlVerifica = "";
      });
    };
  });

  function attestatoCanvas(o, firma) {
    const W = 2339, H = 1654;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const x = cv.getContext("2d");
    const liv = TD.livello(Number(o.livello));
    const S = TD.FONT.serif, N = TD.FONT.sans;
    // carta
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#fffdf7"); g.addColorStop(1, "#f6f1e4");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // filigrana: quattro gradini
    x.globalAlpha = 0.06;
    [0, 1, 2, 3].forEach(function (i) { x.fillStyle = TD.LIVELLI[i].colore; roundRect(x, 1500 + i * 170, 1150 - i * 140, 150, 380 + i * 140, 26); x.fill(); });
    x.globalAlpha = 1;
    // cornice
    x.strokeStyle = "#1d3557"; x.lineWidth = 10; x.strokeRect(60, 60, W - 120, H - 120);
    x.strokeStyle = "#b8923a"; x.lineWidth = 3; x.strokeRect(90, 90, W - 180, H - 180);
    // banda livelli
    TD.LIVELLI.forEach(function (l, i) { x.fillStyle = l.colore; x.fillRect(90 + i * (W - 180) / 4, 90, (W - 180) / 4, 22); });
    // QR di verifica in alto a destra (in anteprima un riquadro segnaposto)
    const lq = 320, xq = W - 120 - lq, yq = 135;
    if (o.verifica && TD.qr) {
      try {
        const moduli = TD.qr.codifica(o.verifica, "M").dimensione + 8, lato = Math.floor(lq / moduli) * moduli, sp = (lq - lato) / 2;
        x.drawImage(TD.qr.canvas(o.verifica, lato, { livello: "M" }), xq + sp, yq + sp, lato, lato);
      } catch (e) {}
    } else {
      x.strokeStyle = "#cbd5e1"; x.lineWidth = 3; x.setLineDash([12, 10]); x.strokeRect(xq + 20, yq + 20, lq - 40, lq - 40); x.setLineDash([]);
      x.font = "400 24px " + TD.FONT.sans; x.fillStyle = "#94a3b8"; x.textAlign = "center"; x.fillText("QR di verifica", xq + lq / 2, yq + lq / 2 + 8); x.textAlign = "left";
    }
    x.font = "600 22px " + TD.FONT.sans; x.fillStyle = "#1d3557"; x.textAlign = "center"; x.fillText("INQUADRA PER VERIFICARE", xq + lq / 2, yq + lq + 34); x.textAlign = "left";
    // logo e intestazione
    if (TD.logoImg && TD.logoImg.complete) { try { x.drawImage(TD.logoImg, W / 2 - 75, 160, 150, 150); } catch (e) {} }
    x.textAlign = "center"; x.fillStyle = "#1d3557";
    x.font = "600 34px " + N; x.fillText(TD.marchio && TD.marchio() && TD.marchio().nome ? (TD.marchio().nome.toUpperCase() + " · CON TUTOR DIGITALE") : "TUTOR DIGITALE · LEZIONI DI TECNOLOGIA SU MISURA", W / 2, 360);
    x.font = "700 120px " + S; x.fillText("Attestato", W / 2, 500);
    x.font = "italic 400 44px " + S; x.fillStyle = "#4b5563"; x.fillText("di frequenza e competenze digitali", W / 2, 565);
    x.font = "400 38px " + N; x.fillStyle = "#374151"; x.fillText("si attesta che", W / 2, 650);
    x.font = "700 92px " + S; x.fillStyle = "#0f1f36"; x.fillText(fit(x, o.intestatario || "", 1700, 92, S), W / 2, 760);
    x.strokeStyle = "#b8923a"; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 520, 790); x.lineTo(W / 2 + 520, 790); x.stroke();
    const perc = (o.percorsi || []).map(function (id) { return TD.percorso(id).nome; }).join(", ") || "competenze digitali";
    const frase = "ha frequentato il «" + (o.titolo || "Percorso di competenze digitali") + "» (" + perc + ") per " + String(o.ore || 0).replace(".", ",") + (Number(o.ore) === 1 ? " ora" : " ore") + ", dal " + TD.dataIt(o.dal) + " al " + TD.dataIt(o.al) + ", raggiungendo il livello";
    x.font = "400 38px " + N; x.fillStyle = "#374151";
    wrap(x, frase, W / 2, 860, 1800, 54);
    // nastro livello
    x.fillStyle = liv.colore; roundRect(x, W / 2 - 260, 950, 520, 92, 46); x.fill();
    x.fillStyle = "#ffffff"; x.font = "700 52px " + N; x.fillText(liv.nome.toUpperCase(), W / 2, 1013);
    // competenze in due colonne
    x.textAlign = "left";
    const comp = o.competenze || [];
    x.font = "700 30px " + N; x.fillStyle = "#1d3557"; x.fillText("COMPETENZE ACQUISITE", 220, 1110);
    x.font = "400 30px " + N; x.fillStyle = "#1f2937";
    const met = Math.ceil(comp.length / 2);
    comp.forEach(function (t, i) {
      const col = i < met ? 0 : 1, riga = i < met ? i : i - met;
      const xx = 220 + col * 960, yy = 1160 + riga * 44;
      x.fillStyle = liv.colore; x.beginPath(); x.arc(xx + 8, yy - 10, 7, 0, 7); x.fill();
      x.fillStyle = "#1f2937"; x.fillText(fit(x, t, 900, 30, N), xx + 28, yy);
    });
    // piede: esito, luogo, firma, codice
    const yb = 1440;
    x.font = "400 28px " + N; x.fillStyle = "#374151";
    if (o.esito) x.fillText(o.esito, 220, yb - 40);
    x.fillText(o.luogo || "", 220, yb + 10);
    x.font = "600 26px " + N; x.fillStyle = "#1d3557"; x.fillText("Codice attestato: " + o.codice, 220, yb + 60);
    x.font = "400 22px " + N; x.fillStyle = "#6b7280";
    x.fillText((o.verifica ? "Verificabile con il QR in alto a destra. " : "Verificabile presso il docente. ") + "Rif. quadro europeo DigComp 2.2. Non è un titolo di studio.", 220, yb + 98);
    x.textAlign = "center";
    if (firma) { const h = 120, w = Math.min(460, firma.width * h / firma.height); x.drawImage(firma, W - 520 - w / 2, yb - 120, w, h); }
    x.strokeStyle = "#374151"; x.lineWidth = 2; x.beginPath(); x.moveTo(W - 760, yb + 14); x.lineTo(W - 280, yb + 14); x.stroke();
    x.font = "600 30px " + N; x.fillStyle = "#111827"; x.fillText(TD.db.profilo.nome || "Il docente", W - 520, yb + 56);
    x.font = "400 24px " + N; x.fillStyle = "#4b5563"; x.fillText(TD.db.profilo.qualifica || "", W - 520, yb + 90);
    x.textAlign = "left";
    return cv;
  }
  function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function fit(x, t, max, size, fam) { let s = String(t); x.font = (x.font.match(/^(italic )?\d+ /) || ["400 "])[0] + size + "px " + fam; while (s.length > 3 && x.measureText(s).width > max) s = s.slice(0, -2); return s === t ? s : s + "…"; }
  function wrap(x, t, cx, y, max, lh) {
    const parole = t.split(" "); let r = "";
    parole.forEach(function (p) { const pr = r ? r + " " + p : p; if (x.measureText(pr).width > max && r) { x.fillText(r, cx, y); y += lh; r = p; } else r = pr; });
    x.fillText(r, cx, y);
  }

  /* --------------------------------------------------------------- PREVENTIVI E RICEVUTE */
  TD.rotta("/preventivo", function (app, p, q) {
    const esistente = q.doc ? TD.db.documenti.find(function (d) { return d.id === q.doc; }) : null;
    const pr = TD.db.profilo;
    const d = esistente || { id: TD.uid("d"), tipo: "preventivo", cliente: q.cliente || "", data: TD.oggi(), righe: [{ voce: TD.db.listino[0] ? TD.db.listino[0].voce : "", qta: 1, prezzo: TD.db.listino[0] ? TD.db.listino[0].prezzo : 0 }], note: "", ritenuta: false, numero: "" };
    const piva = pr.regime === "piva";
    app.innerHTML = TD.intest(esistente ? (d.tipo === "ricevuta" ? "Ricevuta " : "Preventivo ") + E(d.numero) : "Preventivo o ricevuta", "Le voci arrivano dal listino (modificabile in Impostazioni). Numerazione automatica per anno.") +
      '<div class="wrap"><div class="grid-2"><form class="card form" id="fp">' +
        '<div class="grid-2"><label class="field"><span>Documento</span><select name="tipo"><option value="preventivo"' + (d.tipo !== "ricevuta" ? " selected" : "") + ">Preventivo</option><option value=\"ricevuta\"" + (d.tipo === "ricevuta" ? " selected" : "") + ">" + (piva ? "Riepilogo / pro-forma" : "Ricevuta prestazione occasionale") + "</option>" + (piva ? '<option value="fattura"' + (d.tipo === "fattura" ? " selected" : "") + ">Fattura elettronica (XML FatturaPA)</option>" : "") + "</select></label>" +
          '<label class="field"><span>Data</span><input name="data" type="date" value="' + E(d.data) + '"></label></div>' +
        '<label class="field"><span>Cliente</span><select name="cliente">' + TD.opzioniClienti(d.cliente) + "</select></label>" +
        '<div id="righe"></div><div class="actions"><select id="daListino" aria-label="Aggiungi voce dal listino"><option value="">+ voce dal listino…</option>' + TD.db.listino.map(function (l, i) { return '<option value="' + i + '">' + E(l.voce) + " · " + TD.euro(l.prezzo) + "</option>"; }).join("") + '</select><button type="button" class="btn btn-sm" id="rigaLibera">' + I("plus") + "Riga libera</button></div>" +
        (piva ? '<label class="check"><input type="checkbox" name="bolloCliente"' + (d.bolloCliente ? " checked" : "") + "> Fattura senza IVA oltre 77,47 €: addebita al cliente i 2 € del bollo virtuale</label>" : '<label class="check"><input type="checkbox" name="ritenuta"' + (d.ritenuta ? " checked" : "") + "> Applica ritenuta d'acconto 20% (se il cliente è un'azienda o un ente sostituto d'imposta)</label>") +
        '<label class="field"><span>Note (validità, modalità di pagamento…)</span><textarea name="note" rows="3">' + E(d.note || (pr.pagamenti ? "Pagamento: " + pr.pagamenti : "")) + "</textarea></label>" +
        '<div id="totali" class="totals"></div>' +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + I("download") + "Salva e scarica PDF</button><button type=\"button\" class=\"btn\" id=\"stampaP\">" + I("print") + "Stampa</button>" + (esistente ? '<button type="button" class="btn btn-danger" id="delP">' + I("trash") + "Elimina</button>" : "") + "</div>" +
        '<p class="muted text-small">' + I("info") + " " + (piva ? "Con «Fattura elettronica» il programma crea il file XML FatturaPA da caricare nel portale Fatture e Corrispettivi dell'Agenzia delle Entrate o da dare al commercialista, più il PDF di cortesia per il cliente. Il programma non trasmette nulla allo SDI: controlla sempre con il commercialista." : "Ricevuta per lavoro autonomo occasionale, fuori campo IVA (art. 5 DPR 633/72). Sopra 77,47 € va applicata la marca da bollo da 2 €. Verifica sempre con il tuo commercialista.") + "</p>" +
      '</form><div><div class="doc-preview" id="prevP"></div></div></div></div>';

    const f = document.getElementById("fp"), box = document.getElementById("righe");
    function disegnaRighe() {
      box.innerHTML = '<div class="rows-head"><span>Voce</span><span>Q.tà</span><span>Prezzo €</span><span></span></div>' + d.righe.map(function (r, i) {
        return '<div class="row-line"><input data-r="' + i + '" data-k="voce" value="' + E(r.voce) + '" aria-label="Voce"><input data-r="' + i + '" data-k="qta" type="number" step="0.5" value="' + E(r.qta) + '" aria-label="Quantità"><input data-r="' + i + '" data-k="prezzo" type="number" step="0.01" value="' + E(r.prezzo) + '" aria-label="Prezzo"><button type="button" class="icon-btn" data-del="' + i + '" aria-label="Togli riga">' + I("x") + "</button></div>";
      }).join("");
      box.querySelectorAll("input").forEach(function (inp) { inp.oninput = function () { const r = d.righe[+inp.dataset.r]; r[inp.dataset.k] = inp.dataset.k === "voce" ? inp.value : Number(inp.value) || 0; totali(); }; });
      box.querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { d.righe.splice(+b.dataset.del, 1); disegnaRighe(); totali(); }; });
    }
    function calcola() {
      const o = TD.form(f);
      let imponibile = d.righe.reduce(function (s, r) { return s + (Number(r.qta) || 0) * (Number(r.prezzo) || 0); }, 0);
      if (piva && o.tipo === "fattura") { const fc = TD.fattura.calcola(d.righe, pr, { bolloAlCliente: !!o.bolloCliente }); return { o: o, imponibile: fc.totale, iva: fc.imposta, ritenuta: 0, bollo: fc.bollo, netto: fc.totale, fc: fc }; }
      const rit = !piva && o.ritenuta ? Math.round(imponibile * 20) / 100 : 0;
      const bollo = !piva && o.tipo === "ricevuta" && imponibile > 77.47;
      return { o: o, imponibile: imponibile, ritenuta: rit, bollo: bollo, netto: imponibile - rit };
    }
    function totali() {
      const t = calcola();
      document.getElementById("totali").innerHTML = "<div><span>Totale" + (t.iva ? " (IVA 22% inclusa: " + TD.euro(t.iva) + ")" : "") + "</span><strong>" + TD.euro(t.imponibile) + "</strong></div>" + (t.fc && t.fc.bollo ? '<div class="muted"><span>Bollo virtuale da 2 € indicato nel file XML</span><span>' + (t.o.bolloCliente ? "addebitato" : "a tuo carico") + "</span></div>" : "") +
        (t.ritenuta ? "<div><span>Ritenuta d'acconto 20%</span><strong>− " + TD.euro(t.ritenuta) + "</strong></div><div><span>Netto da pagare</span><strong>" + TD.euro(t.netto) + "</strong></div>" : "") +
        (t.bollo && !t.fc ? '<div class="muted"><span>Marca da bollo da 2 € sull\'originale</span><span>obbligatoria</span></div>' : "");
      clearTimeout(totali._t); totali._t = setTimeout(function () { pagine().then(function (pg) { TD.anteprima(document.getElementById("prevP"), pg.slice(0, 1)); }); }, 300);
    }
    function pagine() {
      const t = calcola(), o = t.o, c = TD.cliente(o.cliente);
      const num = d.numero || prossimoNumero(o.tipo, o.data);
      if (o.tipo === "fattura") return pagineFattura(t, c, num);
      const doc = new TD.Documento({ titolo: (o.tipo === "ricevuta" ? "Ricevuta" : "Preventivo") + " " + num, piede: "Tutor Digitale · " + (pr.nome || "") });
      doc.intestazione(pr, o.tipo === "ricevuta" ? (piva ? "Riepilogo / pro-forma" : "Ricevuta") : "Preventivo");
      doc.h1((o.tipo === "ricevuta" ? (piva ? "Riepilogo n. " : "Ricevuta n. ") : "Preventivo n. ") + num);
      doc.campi([["Data", TD.dataIt(o.data)], ["Cliente", c ? TD.nomeCliente(c) : ""], ["Indirizzo", c ? [c.indirizzo, c.citta].filter(Boolean).join(", ") : ""], ["Codice fiscale / P. IVA", c ? (c.cf || c.piva || "") : ""]]);
      if (o.tipo === "ricevuta" && !piva) doc.p("Il/la sottoscritto/a " + (pr.nome || "") + (pr.cf ? ", C.F. " + pr.cf : "") + (pr.indirizzo ? ", residente in " + pr.indirizzo + " " + (pr.citta || "") : "") + ", dichiara di ricevere la somma indicata quale compenso per prestazione di lavoro autonomo occasionale (art. 2222 c.c.) di formazione sulle competenze digitali.", { size: 26 });
      doc.tabella(["Voce", "Q.tà", "Prezzo", "Importo"], d.righe.map(function (r) { return [r.voce, String(r.qta).replace(".", ","), TD.euro(r.prezzo), TD.euro((Number(r.qta) || 0) * (Number(r.prezzo) || 0))]; }), [0.52, 0.1, 0.18, 0.2], { destra: [1, 2, 3] });
      doc.p("Totale: " + TD.euro(t.imponibile), { size: 34, peso: 700 });
      if (t.ritenuta) { doc.p("Ritenuta d'acconto 20%: − " + TD.euro(t.ritenuta)); doc.p("Netto a pagare: " + TD.euro(t.netto), { peso: 700 }); }
      if (o.tipo === "ricevuta" && !piva) doc.piccolo("Operazione fuori campo IVA ai sensi dell'art. 5 DPR 633/1972." + (t.bollo ? " Imposta di bollo da € 2,00 assolta sull'originale." : ""));
      if (piva) doc.piccolo("Documento di riepilogo senza valore fiscale: la fattura elettronica viene emessa tramite il Sistema di Interscambio.");
      if (o.tipo === "preventivo") doc.piccolo("Preventivo valido 30 giorni. Le lezioni si svolgono nei giorni e orari concordati; la disdetta è gradita con almeno 24 ore di anticipo.");
      if (o.note) { doc.h2("Note"); doc.p(o.note, { size: 26 }); }
      return TD.immagine(pr.firma).then(function (im) { doc.firme([{ etichetta: "Firma", immagine: im, nome: pr.nome }]); return doc.chiudi(); });
    }
    function pagineFattura(t, c, num) {
      const fc = t.fc;
      const doc = new TD.Documento({ titolo: "Fattura " + num, piede: "Copia di cortesia · l'originale è il file XML trasmesso tramite il Sistema di Interscambio" });
      doc.intestazione(pr, "Fattura");
      doc.h1("Fattura n. " + num);
      doc.campi([["Data", TD.dataIt(t.o.data)], ["Cliente", c ? TD.nomeCliente(c) : ""], ["Indirizzo", c ? [c.indirizzo, c.cap, c.citta, c.provincia].filter(Boolean).join(" ") : ""], ["C.F. / P. IVA", c ? (c.cf || c.piva || "") : ""], ["Cedente", (pr.nome || "") + " · P. IVA " + (pr.piva || "")], ["Codice fiscale", pr.cf || ""]]);
      doc.tabella(["Descrizione", "Q.tà", "Prezzo", "Importo"], fc.linee.map(function (l) { return [l.descr, String(l.qta).replace(".", ","), TD.euro(l.prezzo), TD.euro(l.totale)]; }), [0.52, 0.1, 0.18, 0.2], { destra: [1, 2, 3] });
      doc.p("Imponibile: " + TD.euro(fc.imponibile) + (fc.imposta ? " · IVA 22%: " + TD.euro(fc.imposta) : ""), { size: 28 });
      doc.p("Totale documento: " + TD.euro(fc.totale), { size: 34, peso: 700 });
      if (fc.senzaIva) doc.piccolo((pr.regimeFiscale === "RF02" ? "Operazione senza IVA ai sensi dell'art. 27, commi 1 e 2, D.L. 98/2011 (regime dei minimi)." : "Operazione in franchigia da IVA ai sensi dell'art. 1, commi 54-89, L. 190/2014 (regime forfettario). Compenso non soggetto a ritenuta d'acconto.") + (fc.bollo ? " Imposta di bollo da 2,00 € assolta in modo virtuale." : ""));
      if (pr.iban) doc.piccolo("Pagamento con bonifico: IBAN " + pr.iban + ".");
      if (t.o.note) { doc.h2("Note"); doc.p(t.o.note, { size: 26 }); }
      return Promise.resolve(doc.chiudi());
    }
    function prossimoNumero(tipo, data) {
      const anno = (data || TD.oggi()).slice(0, 4);
      const n = TD.db.documenti.filter(function (x) { return x.tipo === tipo && (x.numero || "").slice(-4) === anno; })
        .reduce(function (m, x) { return Math.max(m, parseInt(x.numero, 10) || 0); }, 0) + 1;
      return n + "/" + anno;
    }
    document.getElementById("daListino").onchange = function () {
      const l = TD.db.listino[this.value]; if (!l) return;
      d.righe.push({ voce: l.voce, qta: 1, prezzo: l.prezzo }); this.value = ""; disegnaRighe(); totali();
    };
    document.getElementById("rigaLibera").onclick = function () { d.righe.push({ voce: "", qta: 1, prezzo: 0 }); disegnaRighe(); totali(); };
    f.addEventListener("change", totali);
    f.onsubmit = function (e) {
      e.preventDefault();
      const t = calcola();
      if (!d.righe.length) { TD.toast("Aggiungi almeno una voce."); return; }
      if (!d.numero || d.tipo !== t.o.tipo) d.numero = prossimoNumero(t.o.tipo, t.o.data);
      if (t.o.tipo === "fattura") {
        let f;
        try { f = TD.fattura.xml(pr, TD.cliente(t.o.cliente), { numero: d.numero, data: t.o.data, bolloAlCliente: !!t.o.bolloCliente, causale: t.o.note ? t.o.note.slice(0, 200) : "" }, d.righe); }
        catch (err) { TD.toast(err.message); if (!esistente) d.numero = ""; return; }
        TD.scarica(new Blob([f.xml], { type: "application/xml" }), f.nomeFile);
        d.xml = f.nomeFile;
      }
      Object.assign(d, { tipo: t.o.tipo, data: t.o.data, cliente: t.o.cliente, note: t.o.note, ritenuta: !!t.o.ritenuta, bolloCliente: !!t.o.bolloCliente, totale: t.imponibile, netto: t.netto, intestatario: TD.cliente(t.o.cliente) ? TD.nomeCliente(TD.cliente(t.o.cliente)) : "" });
      if (!esistente) TD.db.documenti.push(d);
      TD.salva();
      pagine().then(function (pg) { TD.scaricaPdf(pg, d.tipo + "-" + d.numero.replace("/", "-") + (d.tipo === "fattura" ? "-cortesia" : "") + ".pdf", { titolo: d.tipo + " " + d.numero }); });
      if (d.tipo === "fattura") TD.toast("Fattura " + d.numero + ": scaricati il file XML (per lo SDI) e il PDF di cortesia.");
      if (!esistente) history.replaceState(null, "", "#/preventivo?doc=" + d.id);
    };
    document.getElementById("stampaP").onclick = function () { pagine().then(TD.stampa); };
    const del = document.getElementById("delP");
    if (del) del.onclick = function () { if (!TD.conferma("Eliminare il documento " + d.numero + "? La numerazione non viene riassegnata.")) return; TD.db.documenti = TD.db.documenti.filter(function (x) { return x.id !== d.id; }); TD.salva(); TD.vai("#/documenti"); };
    disegnaRighe(); totali();
  });
})();
