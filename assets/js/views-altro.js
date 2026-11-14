/* ==========================================================================
   Tutor Digitale · strumenti, test d'ingresso, agenda, impostazioni,
   licenze, installazione, idee per il lavoro
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;

  /* --------------------------------------------------------------- timer */
  TD.timer = { inizio: 0, accumulato: 0, attivo: false, ultimaPausa: 0 };
  function trascorso() { return TD.timer.accumulato + (TD.timer.attivo ? Date.now() - TD.timer.inizio : 0); }
  function mmss(ms) { const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600); const m = Math.floor(s % 3600 / 60); return (h ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(s % 60).padStart(2, "0"); }
  function beep() {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35].forEach(function (t) { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 660; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0.2, a.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t + 0.3); o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.3); });
    } catch (e) {}
  }
  setInterval(function () {
    const pill = document.getElementById("timerPill");
    if (pill) { pill.hidden = !TD.timer.attivo; pill.querySelector("span").textContent = mmss(trascorso()); }
    const big = document.getElementById("timerBig"); if (big) big.textContent = mmss(trascorso());
    if (TD.timer.attivo) {
      const min = Math.floor(trascorso() / 60000);
      if (min > 0 && min % 45 === 0 && TD.timer.ultimaPausa !== min) { TD.timer.ultimaPausa = min; beep(); TD.toast("Sono passati " + min + " minuti: una pausa di 5 minuti aiuta a ricordare."); }
    }
  }, 1000);

  /* --------------------------------------------------------------- strumenti */
  TD.rotta("/strumenti", function (app) {
    app.innerHTML = TD.intest("Strumenti", "Quello che serve durante la lezione e prima di uscire di casa.") +
      '<div class="wrap"><div class="grid-2">' +
        '<section class="card timer-card"><h2>' + I("clock") + 'Timer della lezione</h2><p class="timer-big" id="timerBig">0:00</p>' +
          '<div class="actions"><button class="btn btn-primary" id="tStart">' + I("play") + 'Avvia</button><button class="btn" id="tPausa">' + I("pause") + 'Pausa</button><button class="btn" id="tReset">' + I("x") + 'Azzera</button><button class="btn" id="tReg">' + I("check") + "Registra per il cliente attivo</button></div>" +
          '<p class="muted text-small">Ogni 45 minuti suona un promemoria per la pausa. Il timer resta attivo anche cambiando pagina.</p></section>' +
        '<section class="card"><h2>' + I("target") + "Test d'ingresso</h2><p>Venti domande «lo so fare da solo?» per decidere da quale livello partire su ogni dispositivo.</p><div class=\"actions\"><a class=\"btn btn-primary\" href=\"#/strumenti/test\">Apri il test</a></div></section>" +
        '<section class="card"><h2>' + I("screen") + "Assistenza a distanza</h2><p>Vedi lo schermo dell'allievo, chatta e scambia file con un codice e una password di 6 cifre che si rigenera.</p><div class=\"actions\"><a class=\"btn btn-primary\" href=\"#/remoto\">Apri</a><a class=\"btn\" href=\"#/allievi\">Scambio con gli allievi</a></div></section>" +
        '<section class="card"><h2>' + I("print") + "Verifiche cartacee</h2><p>Dal Quiz crea verifiche stampabili tutte diverse, con chiave di correzione separata.</p><div class=\"actions\"><a class=\"btn\" href=\"#/quiz\">Vai al Quiz</a></div></section>" +
        '<section class="card"><h2>' + I("screen") + "Modalità lavagna</h2><p>Ogni lezione si proietta a tutto schermo, un passo alla volta, con testo grande: ideale con la Smart TV nei gruppi.</p><div class=\"actions\"><a class=\"btn\" href=\"#/percorsi\">Scegli la lezione</a></div></section>" +
        '<section class="card"><h2>' + I("layers") + 'Kit del tutor</h2><ul class="checks" id="kit">' + TD.KIT.map(function (k, i) { const on = (TD.db.impostazioni.kit || [])[i]; return '<li><label class="check"><input type="checkbox" data-kit="' + i + '"' + (on ? " checked" : "") + "> " + E(k) + "</label></li>"; }).join("") + '</ul><div class="actions"><button class="btn btn-sm" id="kitReset">Svuota le spunte</button></div></section>' +
        '<section class="card"><h2>' + I("bulb") + "Idee per il lavoro</h2><p>Dove proporre le lezioni, pacchetti, collaborazioni e un metodo di lavoro in cinque tempi.</p><div class=\"actions\"><a class=\"btn\" href=\"#/idee\">Leggi le idee</a></div></section>" +
      "</div></div>";
    document.getElementById("tStart").onclick = function () { if (!TD.timer.attivo) { TD.timer.inizio = Date.now(); TD.timer.attivo = true; } };
    document.getElementById("tPausa").onclick = function () { if (TD.timer.attivo) { TD.timer.accumulato += Date.now() - TD.timer.inizio; TD.timer.attivo = false; } };
    document.getElementById("tReset").onclick = function () { TD.timer.attivo = false; TD.timer.accumulato = 0; TD.timer.ultimaPausa = 0; };
    document.getElementById("tReg").onclick = function () {
      const c = TD.clienteAttivo(); if (!c) { TD.toast("Nessun cliente attivo: aprilo dalla scheda cliente."); return; }
      const min = Math.max(5, Math.round(trascorso() / 60000));
      c.registro = c.registro || [];
      c.registro.push({ id: TD.uid("r"), data: TD.oggi(), ora: new Date(Date.now() - trascorso()).toTimeString().slice(0, 5), durata: min, luogo: c.luogo, argomenti: [], note: "Registrata dal timer", importo: "", pagato: false, stato: "svolta", presenti: (c.partecipanti || []).map(function (x) { return x.id; }) });
      TD.salva(); TD.toast(min + " minuti registrati per " + TD.nomeCliente(c) + ".");
    };
    TD.db.impostazioni.kit = TD.db.impostazioni.kit || [];
    app.querySelectorAll("[data-kit]").forEach(function (cb) { cb.onchange = function () { TD.db.impostazioni.kit[+cb.dataset.kit] = cb.checked; TD.salva(); }; });
    document.getElementById("kitReset").onclick = function () { TD.db.impostazioni.kit = []; TD.salva(); TD.render(); };
  });

  /* --------------------------------------------------------------- test d'ingresso */
  const RISP = [["solo", "Lo faccio da solo"], ["aiuto", "Con aiuto"], ["mai", "Mai fatto"]];
  TD.rotta("/strumenti/test", function (app, p, q) {
    const c = TD.cliente(q.cliente) || TD.clienteAttivo();
    app.innerHTML = TD.intest("Test d'ingresso", "Leggete insieme ogni frase e scegliete la risposta sincera. Il livello di partenza è il primo gradino in cui serve aiuto.") +
      '<div class="wrap"><form id="ft" class="form">' +
        '<div class="card"><label class="field"><span>Cliente</span><select name="cliente">' + TD.opzioniClienti(c ? c.id : "") + "</select></label></div>" +
        TD.PERCORSI.map(function (pc) {
          return '<section class="card"><h2 class="with-ico">' + I(pc.icona) + E(pc.nome) + '</h2><label class="check"><input type="checkbox" name="salta_' + pc.id + '"> Non interessa / non possiede il dispositivo</label>' +
            TD.TEST_INGRESSO[pc.id].map(function (t, i) {
              return '<div class="test-row"><span>' + TD.badgeLiv(i) + " " + E(t) + '</span><div class="seg small">' + RISP.map(function (r) { return '<label><input type="radio" name="' + pc.id + "_" + i + '" value="' + r[0] + '"' + (r[0] === "mai" ? " checked" : "") + "><span>" + r[1] + "</span></label>"; }).join("") + "</div></div>";
            }).join("") + "</section>";
        }).join("") +
        '<div class="actions"><button class="btn btn-primary btn-lg" type="submit">' + I("check") + 'Calcola i livelli</button><button class="btn" type="button" id="pdfTest">' + I("print") + "Test su carta</button></div>" +
        '<div id="esitoTest"></div></form></div>';
    const f = document.getElementById("ft");
    f.onsubmit = function (e) {
      e.preventDefault();
      const o = TD.form(f);
      const ris = {};
      TD.PERCORSI.forEach(function (pc) {
        if (o["salta_" + pc.id]) return;
        let liv = 0;
        for (let i = 0; i < 4; i++) { if (o[pc.id + "_" + i] === "solo") liv = Math.min(3, i + 1); else break; }
        ris[pc.id] = liv;
      });
      const cl = TD.cliente(o.cliente);
      document.getElementById("esitoTest").innerHTML = '<section class="card"><h2>Da dove partire</h2><ul class="list">' + Object.keys(ris).map(function (k) { return "<li><span>" + TD.iconaPercorso(k) + E(TD.percorso(k).nome) + "</span>" + TD.badgeLiv(ris[k]) + ' <a href="#/percorso/' + k + '">Apri il percorso</a></li>'; }).join("") + "</ul>" +
        (cl ? '<button class="btn btn-primary" type="button" id="salvaTest">' + I("check") + "Salva nella scheda di " + E(TD.nomeCliente(cl)) + "</button>" : '<p class="muted">Scegli un cliente per salvare i livelli.</p>') + "</section>";
      const st = document.getElementById("salvaTest");
      if (st) st.onclick = function () {
        cl.livelli = Object.assign(cl.livelli || {}, ris);
        cl.dispositivi = Object.keys(ris);
        cl.testIngresso = { data: TD.oggi(), livelli: ris };
        TD.salva(); TD.toast("Livelli salvati."); TD.vai("#/cliente/" + cl.id);
      };
      document.getElementById("esitoTest").scrollIntoView({ behavior: "smooth" });
    };
    document.getElementById("pdfTest").onclick = function () {
      const d = new TD.Documento({ titolo: "Test d'ingresso", piede: "Tutor Digitale · test d'ingresso" });
      d.intestazione(TD.db.profilo, "Test d'ingresso");
      d.h1("Test d'ingresso");
      d.campi([["Nome", c && c.tipo !== "ente" ? TD.nomeCliente(c) : ""], ["Data", TD.dataIt(TD.oggi())]]);
      d.piccolo("Per ogni frase barra una casella: D = lo faccio da solo · A = con aiuto · M = mai fatto.", { dopo: 16 });
      TD.PERCORSI.forEach(function (pc) {
        d.h2(pc.nome);
        TD.TEST_INGRESSO[pc.id].forEach(function (t) { d.p("[ D ]  [ A ]  [ M ]     " + t, { size: 27, dopo: 8 }); });
      });
      TD.scaricaPdf(d.chiudi(), "test-ingresso.pdf", { titolo: "Test d'ingresso" });
    };
  });

  /* --------------------------------------------------------------- agenda */
  TD.rotta("/agenda", function (app) {
    const oggi = TD.oggi();
    const tutte = TD.tutteLeLezioni();
    const future = tutte.filter(function (x) { return x.r.stato === "pianificata" && x.r.data >= oggi; }).sort(function (a, b) { return (a.r.data + a.r.ora).localeCompare(b.r.data + b.r.ora); });
    const recenti = tutte.filter(function (x) { return x.r.stato !== "pianificata"; }).sort(function (a, b) { return (b.r.data + (b.r.ora || "")).localeCompare(a.r.data + (a.r.ora || "")); }).slice(0, 15);
    const scadute = tutte.filter(function (x) { return x.r.stato === "pianificata" && x.r.data < oggi; });
    const attivo = TD.clienteAttivo();
    app.innerHTML = TD.intest("Agenda", "Appuntamenti pianificati e lezioni svolte. Esporta nel calendario del telefono con un file .ics.") +
      '<div class="wrap"><div class="grid-2">' +
        '<form class="card form" id="fa"><h2>Nuovo appuntamento</h2>' +
          '<label class="field"><span>Cliente</span><select name="cliente" required>' + TD.opzioniClienti(attivo ? attivo.id : "") + "</select></label>" +
          '<div class="grid-3"><label class="field"><span>Data</span><input name="data" type="date" value="' + oggi + '"></label><label class="field"><span>Ora</span><input name="ora" type="time" value="10:00"></label><label class="field"><span>Minuti</span><input name="durata" type="number" value="60"></label></div>' +
          '<label class="field"><span>Argomento previsto</span><select name="lez"><option value="">—</option>' + TD.LEZIONI.map(function (l) { return '<option value="' + l.id + '">' + E(TD.percorso(l.dev).nome + " · " + l.titolo) + "</option>"; }).join("") + "</select></label>" +
          '<label class="field"><span>Note</span><input name="note"></label>' +
          '<div class="actions"><button class="btn btn-primary" type="submit">' + I("plus") + 'Aggiungi</button><button class="btn" type="button" id="ics">' + I("calendar") + "Esporta .ics</button></div></form>" +
        '<section class="card"><h2>In programma</h2>' + (future.length ? '<ul class="reg-list">' + future.map(riga).join("") + "</ul>" : '<p class="muted">Nessun appuntamento futuro.</p>') +
          (scadute.length ? '<h3>Da aggiornare</h3><p class="muted text-small">Appuntamenti passati ancora «pianificati»: aprili e segnali come svolti.</p><ul class="reg-list">' + scadute.map(riga).join("") + "</ul>" : "") + "</section>" +
      '</div><section class="card"><h2>Ultime lezioni svolte</h2>' + (recenti.length ? '<ul class="reg-list">' + recenti.map(riga).join("") + "</ul>" : '<p class="muted">Ancora nessuna lezione registrata.</p>') + "</section></div>";
    function riga(x) {
      return '<li class="' + (x.r.stato === "pianificata" ? "plan" : "") + '"><a href="#/cliente/' + x.c.id + "?tab=registro&r=" + x.r.id + '"><span class="when"><strong>' + E(TD.dataIt(x.r.data)) + "</strong>" + E(x.r.ora || "") + "</span><span>" + E(TD.nomeCliente(x.c)) + "<small>" + E(((x.r.argomenti || []).map(function (id) { const l = TD.lezione(id); return l ? l.titolo : ""; }).join(" · ")) || x.r.note || x.r.luogo || "") + "</small></span>" + I("arrow") + "</a></li>";
    }
    const f = document.getElementById("fa");
    f.onsubmit = function (e) {
      e.preventDefault(); const o = TD.form(f); const c = TD.cliente(o.cliente);
      if (!c) { TD.toast("Scegli il cliente."); return; }
      c.registro = c.registro || [];
      c.registro.push({ id: TD.uid("r"), data: o.data, ora: o.ora, durata: Number(o.durata) || 60, luogo: c.luogo, argomenti: o.lez ? [o.lez] : [], note: o.note, importo: "", pagato: false, stato: "pianificata", presenti: (c.partecipanti || []).map(function (x) { return x.id; }) });
      TD.salva(); TD.toast("Appuntamento aggiunto."); TD.render();
    };
    document.getElementById("ics").onclick = function () {
      function dt(d, o) { return d.replace(/-/g, "") + "T" + (o || "10:00").replace(":", "") + "00"; }
      function fine(d, o, min) { const t = new Date(d + "T" + (o || "10:00") + ":00"); t.setMinutes(t.getMinutes() + (Number(min) || 60)); const p = function (n) { return String(n).padStart(2, "0"); }; return t.getFullYear() + p(t.getMonth() + 1) + p(t.getDate()) + "T" + p(t.getHours()) + p(t.getMinutes()) + "00"; }
      function esc(s) { return String(s || "").replace(/[\\;,]/g, function (c) { return "\\" + c; }).replace(/\n/g, "\\n"); }
      const ev = future.map(function (x) {
        return ["BEGIN:VEVENT", "UID:" + x.r.id + "@tutor-digitale", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z", "DTSTART:" + dt(x.r.data, x.r.ora), "DTEND:" + fine(x.r.data, x.r.ora, x.r.durata),
          "SUMMARY:" + esc("Lezione · " + TD.nomeCliente(x.c)), "LOCATION:" + esc([x.c.indirizzo, x.c.citta].filter(Boolean).join(", ") || x.r.luogo), "DESCRIPTION:" + esc(((x.r.argomenti || []).map(function (id) { const l = TD.lezione(id); return l ? l.titolo : ""; }).join("; ")) + (x.r.note ? " — " + x.r.note : "")), "END:VEVENT"].join("\r\n");
      });
      if (!ev.length) { TD.toast("Nessun appuntamento futuro da esportare."); return; }
      const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Danilo D'Auria//Tutor Digitale//IT", "CALSCALE:GREGORIAN"].concat(ev).concat(["END:VCALENDAR"]).join("\r\n");
      TD.scarica(new Blob([ics], { type: "text/calendar" }), "agenda-tutor-digitale.ics");
    };
  });

  /* --------------------------------------------------------------- impostazioni */
  TD.rotta("/impostazioni", function (app) {
    const pr = TD.db.profilo, imp = TD.db.impostazioni;
    let usato = 0; try { usato = (localStorage.getItem("tutor-digitale:v1:db") || "").length; } catch (e) {}
    app.innerHTML = TD.intest("Impostazioni", "Il tuo profilo compare su liberatorie, attestati, preventivi e ricevute.") +
      '<div class="wrap"><div class="grid-2">' +
        '<form class="card form" id="fp"><h2>' + I("user") + "Profilo del docente</h2>" +
          [["nome", "Nome e cognome"], ["qualifica", "Qualifica"], ["email", "Email"], ["telefono", "Telefono (facoltativo)"], ["indirizzo", "Indirizzo (per le ricevute)"], ["citta", "Città"], ["cf", "Codice fiscale"], ["piva", "Partita IVA (se c'è)"], ["sito", "Sito"], ["pagamenti", "Modalità di pagamento (es. contanti, bonifico, PayPal)"]].map(function (k) {
            return '<label class="field"><span>' + E(k[1]) + '</span><input name="' + k[0] + '" value="' + E(pr[k[0]] || "") + '"></label>';
          }).join("") +
          '<label class="field"><span>Regime per i documenti</span><select name="regime"><option value="occasionale"' + (pr.regime !== "piva" ? " selected" : "") + '>Prestazione occasionale (ricevuta)</option><option value="piva"' + (pr.regime === "piva" ? " selected" : "") + ">Partita IVA (fattura elettronica fuori dal programma)</option></select></label>" +
          '<div class="sign"><span>La tua firma (usata su attestati e documenti)</span><canvas id="firmaDoc" class="sign-pad"></canvas><button type="button" class="btn btn-sm btn-ghost" id="pulFirma">' + I("x") + "Cancella firma</button></div>" +
          '<div class="actions"><button class="btn btn-primary" type="submit">' + I("check") + "Salva profilo</button></div></form>" +
        "<div>" +
          '<section class="card"><h2>' + I("eye") + 'Aspetto e lettura</h2><div class="field"><span>Tema</span>' + seg("tema", [["", "Automatico"], ["light", "Chiaro"], ["dark", "Scuro"]], imp.tema || "") + '</div><div class="field"><span>Dimensione dei caratteri</span>' + seg("caratteri", [["normale", "Normale"], ["grande", "Grande"], ["enorme", "Molto grande"]], imp.caratteri || "normale") + "</div></section>" +
          '<section class="card"><h2>' + I("euro") + 'Listino</h2><p class="muted text-small">Prezzi di partenza proposti: modificali secondo la tua zona e la tua esperienza.</p><div id="listino"></div><div class="actions"><button class="btn btn-sm" id="addL">' + I("plus") + 'Voce</button><button class="btn btn-sm btn-primary" id="salvaL">' + I("check") + 'Salva listino</button><button class="btn btn-sm btn-ghost" id="resetL">Ripristina proposta</button><button class="btn btn-sm" id="pdfL">' + I("download") + "Listino PDF</button></div></section>" +
          '<section class="card"><h2>' + I("lock") + "Copia di sicurezza</h2><p>I dati sono solo su questo dispositivo (" + Math.round(usato / 1024) + ' kB usati). Esporta una copia ogni settimana e tienila anche su una chiavetta o nel cloud.</p>' +
            '<p class="text-small">' + (TD.db.esportato ? "Ultima copia: <strong>" + E(TD.dataIt(TD.db.esportato)) + "</strong>" + (giorniDa(TD.db.esportato) > 7 ? ' <span class="pill warn">più di una settimana fa</span>' : "") : '<span class="pill warn">Nessuna copia esportata finora</span>') + "</p>" +
            '<div class="actions"><button class="btn btn-primary" id="expC">' + I("lock") + 'Backup cifrato con password</button><label class="btn">' + I("upload") + 'Importa backup<input type="file" id="imp" accept="application/json,.json,.tdcifrato" hidden></label></div>' +
            '<p class="muted text-small">Il backup cifrato (AES-256, file <code>.tdcifrato</code>) si apre solo con la tua password: puoi tenerlo su chiavetta, Google Drive o OneDrive senza rischi per la privacy dei clienti. Se perdi la password, la copia non si recupera: scrivila su carta e conservala a parte.</p>' +
            '<details class="more"><summary>Altre azioni</summary><div class="actions"><button class="btn" id="exp">' + I("download") + 'Backup non cifrato (.json)</button><button class="btn btn-danger" id="del">' + I("trash") + "Cancella tutti i dati</button></div></details></section>" +
          '<section class="card"><h2>' + I("shield") + 'Firma digitale dei kit</h2><p>Kit, correzioni e attestati escono firmati con la tua chiave personale (ECDSA P-256). L\'allievo vede «kit verificato» e il QR dell\'attestato conferma che l\'hai rilasciato tu.</p><p>Impronta della tua chiave: <code id="impronta">…</code></p><p class="muted text-small">Leggila all\'allievo la prima volta: la stessa impronta compare nel suo profilo. La chiave privata non lascia mai questo dispositivo, salvo dentro il backup (per questo conviene cifrarlo).</p><div class="actions"><button class="btn btn-sm" id="copiaChiave">' + I("copy") + 'Copia la chiave pubblica</button><button class="btn btn-sm btn-ghost" id="nuovaChiave">Crea una chiave nuova</button></div></section>' +
        "</div></div></div>";
    const pad = TD.padFirma(document.getElementById("firmaDoc"), pr.firma);
    document.getElementById("pulFirma").onclick = pad.pulisci;
    const f = document.getElementById("fp");
    f.onsubmit = function (e) { e.preventDefault(); Object.assign(pr, TD.form(f)); pr.firma = pad.dati(); TD.salva(); TD.toast("Profilo salvato."); };
    app.querySelectorAll('input[name="tema"]').forEach(function (r) { r.onchange = function () { imp.tema = r.value; TD.salva(); TD.applicaAspetto(); }; });
    app.querySelectorAll('input[name="caratteri"]').forEach(function (r) { r.onchange = function () { imp.caratteri = r.value; TD.salva(); TD.applicaAspetto(); }; });
    const lst = JSON.parse(JSON.stringify(TD.db.listino));
    function disegnaL() {
      document.getElementById("listino").innerHTML = '<div class="rows-head"><span>Voce</span><span>Unità</span><span>€</span><span></span></div>' + lst.map(function (l, i) {
        return '<div class="row-line"><input data-i="' + i + '" data-k="voce" value="' + E(l.voce) + '" aria-label="Voce"><input data-i="' + i + '" data-k="unita" value="' + E(l.unita) + '" aria-label="Unità"><input data-i="' + i + '" data-k="prezzo" type="number" step="0.01" value="' + E(l.prezzo) + '" aria-label="Prezzo"><button class="icon-btn" data-x="' + i + '" aria-label="Togli">' + I("x") + "</button></div>";
      }).join("");
      app.querySelectorAll("#listino input").forEach(function (inp) { inp.oninput = function () { lst[+inp.dataset.i][inp.dataset.k] = inp.dataset.k === "prezzo" ? Number(inp.value) || 0 : inp.value; }; });
      app.querySelectorAll("#listino [data-x]").forEach(function (b) { b.onclick = function () { lst.splice(+b.dataset.x, 1); disegnaL(); }; });
    }
    disegnaL();
    document.getElementById("addL").onclick = function () { lst.push({ id: TD.uid("l"), voce: "", prezzo: 0, unita: "lezione" }); disegnaL(); };
    document.getElementById("salvaL").onclick = function () { TD.db.listino = lst.filter(function (l) { return l.voce; }); TD.salva(); TD.toast("Listino salvato."); };
    document.getElementById("resetL").onclick = function () { if (TD.conferma("Ripristinare il listino proposto?")) { TD.db.listino = JSON.parse(JSON.stringify(TD.LISTINO_BASE)); TD.salva(); TD.render(); } };
    document.getElementById("pdfL").onclick = function () {
      const d = new TD.Documento({ titolo: "Listino", piede: "Tutor Digitale · listino " + TD.oggi().slice(0, 4) });
      d.intestazione(pr, "Listino delle lezioni");
      d.h1("Listino " + TD.oggi().slice(0, 4));
      d.p("Lezioni di computer, tablet, smartphone, Smart TV e Internet, dai primi passi a esperto. A domicilio, in ufficio, nei centri anziani, nelle biblioteche e nelle associazioni.", { size: 28 });
      d.tabella(["Servizio", "Unità", "Prezzo"], TD.db.listino.map(function (l) { return [l.voce, l.unita, l.prezzo ? TD.euro(l.prezzo) : "incluso"]; }), [0.6, 0.18, 0.22], { destra: [2] });
      d.piccolo("Primo incontro conoscitivo e test d'ingresso compresi nella prima lezione. Materiali, schede e attestato inclusi." + (pr.pagamenti ? " Pagamento: " + pr.pagamenti + "." : ""));
      TD.scaricaPdf(d.chiudi(), "listino-tutor-digitale.pdf", { titolo: "Listino" });
    };
    function marca() { const ora = new Date(); return TD.oggi() + "_" + String(ora.getHours()).padStart(2, "0") + String(ora.getMinutes()).padStart(2, "0"); }
    document.getElementById("exp").onclick = function () {
      if (!TD.conferma("Il backup non cifrato contiene in chiaro i dati dei clienti e la tua chiave di firma. Meglio il backup cifrato: continuare comunque?")) return;
      TD.db.esportato = new Date().toISOString(); TD.db.versione = TD.VERSIONE; TD.salva();
      TD.scarica(new Blob([JSON.stringify(TD.db, null, 1)], { type: "application/json" }), "tutor-digitale-backup_" + marca() + ".json");
    };
    document.getElementById("expC").onclick = async function () {
      const pw = await TD.chiediPassword("Backup cifrato", "Scegli una password di almeno 8 caratteri (meglio una frase: «lampada-fiume-ottobre»). Servirà per riaprire la copia: <strong>se la perdi, la copia non si recupera</strong>.", true);
      if (!pw) return;
      try {
        TD.db.esportato = new Date().toISOString(); TD.db.versione = TD.VERSIONE; TD.salva();
        const cif = await TD.scambio.cifraBackup(pw, TD.db);
        TD.scarica(new Blob([JSON.stringify(cif)], { type: "application/octet-stream" }), "tutor-digitale-backup_" + marca() + ".tdcifrato");
        TD.toast("Backup cifrato salvato. Tienilo anche su una chiavetta.");
        TD.render();
      } catch (e) { TD.toast(e.message); }
    };
    document.getElementById("imp").onchange = function () {
      const file = this.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = async function () {
        let obj;
        try { obj = JSON.parse(r.result); } catch (e) { TD.toast("Il file non è un backup valido di Tutor Digitale."); return; }
        if (TD.scambio.eBackupCifrato(obj)) {
          const pw = await TD.chiediPassword("Apri il backup cifrato", "Scrivi la password scelta quando hai salvato la copia del " + E(TD.dataIt(obj.creato)) + ".", false);
          if (!pw) return;
          try { obj = await TD.scambio.decifraBackup(pw, obj); } catch (e) { TD.toast(e.message); return; }
        }
        try {
          if (!TD.conferma("Sostituire i dati attuali con il backup (" + (obj.clienti || []).length + " clienti)? Conviene prima esportare quelli attuali.")) return;
          TD.importa(obj); TD.toast("Backup importato."); TD.applicaAspetto(); TD.vai("#/");
        } catch (e) { TD.toast("Il file non è un backup valido di Tutor Digitale."); }
      };
      r.readAsText(file);
    };
    TD.chiaviTutor().then(function (ch) { return ch ? TD.scambio.impronta(ch.pubblica) : ""; }).then(function (imp) {
      const el = document.getElementById("impronta"); if (el) el.textContent = imp || "non disponibile (serve https o l'app installata)";
    }).catch(function () {});
    document.getElementById("copiaChiave").onclick = function () {
      TD.chiaviTutor().then(function (ch) { if (!ch) return; TD.scambio.impronta(ch.pubblica).then(function (imp) {
        TD.scambio.copia(JSON.stringify({ nome: pr.nome, impronta: imp, chiave: ch.pubblica })).then(function (ok) { TD.toast(ok ? "Chiave pubblica copiata: puoi pubblicarla in verifica/chiavi.json." : "Copia non riuscita."); });
      }); });
    };
    document.getElementById("nuovaChiave").onclick = async function () {
      if (!TD.conferma("Creare una chiave nuova? Gli allievi riceveranno un avviso al prossimo kit e gli attestati già rilasciati resteranno verificabili solo con la vecchia chiave pubblicata.")) return;
      pr.chiaviVecchie = (pr.chiaviVecchie || []).concat(pr.chiavi ? [{ pubblica: pr.chiavi.pubblica, creata: pr.chiavi.creata }] : []);
      pr.chiavi = null; TD.salva(); await TD.chiaviTutor(); TD.render();
    };
    document.getElementById("del").onclick = function () {
      if (!TD.conferma("Cancellare TUTTI i dati (clienti, registro, documenti, attestati)? L'operazione non si annulla: esporta prima un backup.")) return;
      if (!TD.conferma("Confermi davvero la cancellazione definitiva?")) return;
      TD.azzera(); TD.applicaAspetto(); TD.aggiornaChip(); TD.vai("#/");
    };
  });
  function giorniDa(iso) { return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000); }
  function seg(nome, voci, sel) {
    return '<div class="seg">' + voci.map(function (v) { return '<label><input type="radio" name="' + nome + '" value="' + v[0] + '"' + (v[0] === sel ? " checked" : "") + "><span>" + v[1] + "</span></label>"; }).join("") + "</div>";
  }

  /* --------------------------------------------------------------- idee */
  TD.rotta("/idee", function (app) {
    const metodo = [
      ["Accogliere", "Dieci minuti per capire obiettivi, paure e dispositivi. Liberatoria e test d'ingresso alla prima lezione."],
      ["Mostrare", "Il tutor fa vedere una volta, lentamente, con la modalità lavagna o sul dispositivo del cliente."],
      ["Fare insieme", "Il cliente ripete con le sue mani: il tutor non tocca, guida a voce. Si usa l'esercizio facile."],
      ["Fare da solo", "Esercizio medio senza aiuto. Gli errori sono benvenuti: si annotano nel registro."],
      ["Fissare", "Quiz breve con risposte che cambiano, compito per casa stampato, appuntamento successivo in agenda."]
    ];
    const pacchetti = [
      ["Pacchetto «Primi passi»", "4 lezioni a domicilio per chi parte da zero, con scheda compiti stampata e attestato finale."],
      ["Sportello «SPID e servizi pubblici»", "Incontri brevi per attivare e usare SPID, CIE, app IO, Fascicolo sanitario: molto richiesto da anziani e famiglie."],
      ["Laboratorio «Truffe? No grazie»", "Un incontro di gruppo per centri anziani, parrocchie e associazioni, con la palestra «Truffa o no?» proiettata sulla TV."],
      ["Nonni e nipoti", "Videochiamate, foto e WhatsApp: incontro in due, con il nipote che diventa «assistente» del nonno."],
      ["Ufficio in ordine", "Per piccoli negozi e studi: email, cloud, backup, password e sicurezza dei dispositivi di lavoro."],
      ["Smart TV senza stress", "Una visita: collegamento, app, sottotitoli, guida stampata del telecomando lasciata in casa."],
      ["Ripasso a distanza", "Videolezione di 30 minuti tra un incontro e l'altro, con quiz e compiti assegnati dal programma."]
    ];
    const canali = [
      "Comuni e Municipi: progetti di inclusione digitale e «punti di facilitazione digitale» finanziati dal PNRR e dalle Regioni.",
      "Centri anziani, circoli e università della terza età: cicli di incontri a tema con attestato.",
      "Biblioteche: corsi per gli iscritti, in collaborazione con il servizio di prestito digitale.",
      "Patronati, CAF e parrocchie: sportello di accompagnamento ai servizi online.",
      "Negozi di elettronica e telefonia: lezione di consegna del nuovo dispositivo per i clienti meno esperti.",
      "Aziende e studi professionali: formazione breve sulla sicurezza informatica per i dipendenti.",
      "Il tuo sito danilodauria.github.io, il libro «Tecnologia Gentile» e gli Shorts su YouTube come vetrina dei corsi."
    ];
    app.innerHTML = TD.intest("Idee per il lavoro", "Dove portare le lezioni, cosa proporre e come lavorare in modo impeccabile.") +
      '<div class="wrap">' +
        '<section class="block"><h2>Il metodo in cinque tempi</h2><ol class="method">' + metodo.map(function (m, i) { return '<li><span class="method-n">' + (i + 1) + "</span><div><h3>" + E(m[0]) + "</h3><p>" + E(m[1]) + "</p></div></li>"; }).join("") + "</ol></section>" +
        '<section class="block"><h2>Dove portare le lezioni</h2><div class="places">' + TD.LUOGHI_ESEMPI.map(function (l) { return '<div class="place"><h3>' + E(l.t) + "</h3><p>" + E(l.d) + "</p></div>"; }).join("") + "</div></section>" +
        '<section class="block"><h2>Pacchetti da proporre</h2><div class="places">' + pacchetti.map(function (l) { return '<div class="place"><h3>' + E(l[0]) + "</h3><p>" + E(l[1]) + "</p></div>"; }).join("") + "</div></section>" +
        '<section class="block"><h2>Canali e collaborazioni</h2><ul class="checks">' + canali.map(function (c) { return "<li>" + E(c) + "</li>"; }).join("") + "</ul></section>" +
        '<section class="card"><h2>Lavorare in modo impeccabile</h2><ul class="checks">' +
          "<li>Liberatoria firmata prima di toccare qualsiasi dispositivo; le password le digita sempre il cliente.</li>" +
          "<li>Copia di sicurezza dei dati prima di aggiornamenti, pulizie e ripristini.</li>" +
          "<li>Registro compilato a fine lezione: argomenti, durata, compito e importo.</li>" +
          "<li>Backup cifrato del programma ogni settimana su chiavetta o cloud (Impostazioni › Backup cifrato con password).</li>" +
          "<li>Ricevuta o fattura per ogni pagamento, conservata con il numero progressivo.</li>" +
          "<li>Attestato con codice solo dopo una verifica superata (soglia consigliata 60%).</li>" +
        "</ul></section></div>";
  });

  /* --------------------------------------------------------------- installa */
  let promptInstall = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); promptInstall = e; const b = document.getElementById("btnInstalla"); if (b) b.hidden = false; });
  TD.rotta("/installa", function (app) {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    app.innerHTML = TD.intest("Installa l'app", "Tutor Digitale si installa come un programma su computer, tablet e telefono e funziona anche senza Internet.") +
      '<div class="wrap">' +
        '<div class="card"><p>' + (standalone ? '<span class="pill ok">' + I("check") + "Stai già usando l'app installata.</span>" : '<span class="pill">' + I("info") + "Stai usando la versione nel browser.</span>") + ' <span class="pill" id="swStato">Controllo dell\'uso offline…</span></p>' +
          '<div class="actions"><button class="btn btn-primary btn-lg" id="btnInstalla"' + (promptInstall ? "" : " hidden") + ">" + I("download") + "Installa ora</button></div></div>" +
        '<div class="grid-2">' +
          '<section class="card"><h2>' + I("pc") + "Windows, Linux, ChromeOS</h2><ol><li>Apri il sito con Chrome o Edge.</li><li>Nella barra dell'indirizzo premi l'icona «Installa» (un computer con la freccia).</li><li>Conferma: l'app compare nel menu Start o tra le applicazioni.</li></ol></section>" +
          '<section class="card"><h2>' + I("pc") + "Mac</h2><ol><li>Con Safari: menu File › Aggiungi al Dock.</li><li>Con Chrome: icona «Installa» nella barra dell'indirizzo.</li></ol></section>" +
          '<section class="card"><h2>' + I("phone") + "Android</h2><ol><li>Apri il sito con Chrome.</li><li>Menu ⋮ › «Installa app» o «Aggiungi a schermata Home».</li></ol></section>" +
          '<section class="card"><h2>' + I("tablet") + "iPhone e iPad</h2><ol><li>Apri il sito con Safari.</li><li>Tocca Condividi (quadrato con freccia) › «Aggiungi alla schermata Home».</li></ol></section>" +
        "</div>" +
        '<section class="card"><h2>' + I("users") + "L'app per i tuoi allievi</h2><p>I clienti installano <strong>Tutor Digitale · Allievo</strong> nello stesso modo, da <a href=\"allievo/\" target=\"_blank\" rel=\"noopener\">danilodauria.github.io/tutor-digitale/allievo/</a>. Si personalizza da sola quando aprono il link del kit che crei nella loro scheda (› App allievo).</p></section>" +
        '<section class="card"><h2>' + I("wifi") + "Online e offline</h2><p>Al primo avvio il programma salva sul dispositivo tutte le lezioni, i quiz, gli esercizi e i modelli dei documenti. Da quel momento funziona identico anche senza connessione: cambia solo la spia in alto, verde quando c'è Internet.</p><p>I dati dei clienti restano <strong>solo</strong> su questo dispositivo: per usarli su un altro, esporta il backup e importalo là.</p></section>" +
      "</div>";
    const b = document.getElementById("btnInstalla");
    b.onclick = function () { if (promptInstall) { promptInstall.prompt(); promptInstall = null; b.hidden = true; } };
    const st = document.getElementById("swStato");
    if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistration().then(function (r) {
      st.className = "pill " + (r && r.active ? "ok" : "warn");
      st.textContent = r && r.active ? "Pronto per l'uso offline" : "Uso offline in preparazione: ricarica la pagina una volta";
    }); else { st.className = "pill warn"; st.textContent = "Questo browser non supporta l'uso offline"; }
  });

  /* --------------------------------------------------------------- licenze */
  TD.rotta("/licenze", function (app) {
    app.innerHTML = TD.intest("Licenze e progetto", "Tutor Digitale · versione " + TD.VERSIONE + " · ideato, scritto e sviluppato da Danilo D'Auria.") +
      '<div class="wrap"><div class="grid-2">' +
        '<section class="card"><h2>Codice · MIT</h2><p>HTML, CSS, JavaScript, service worker e script sono distribuiti con licenza MIT: © 2026 Danilo D\'Auria. Si possono usare, copiare e modificare mantenendo l\'avviso di copyright e di licenza.</p><p><a href="LICENSE" target="_blank" rel="noopener">Testo della licenza MIT</a></p></section>' +
        '<section class="card"><h2>Contenuti · CC BY-NC-SA 4.0</h2><p>Lezioni, domande, esercizi, testi dei documenti, grafiche e logo sono distribuiti con licenza Creative Commons Attribuzione – Non commerciale – Condividi allo stesso modo 4.0: citare l\'autore, nessun uso commerciale senza permesso, stessa licenza per le opere derivate.</p><p><a href="LICENSE-CONTENT.md" target="_blank" rel="noopener">Licenza dei contenuti</a></p></section>' +
        '<section class="card"><h2>Nome e marchio</h2><p>Il nome «Tutor Digitale», il logo con i quattro gradini e il puntatore e la veste grafica identificano il servizio di Danilo D\'Auria: non sono concessi in licenza. Chi ridistribuisce una versione modificata deve usare un nome e un logo diversi.</p><p><a href="MARCHIO.md" target="_blank" rel="noopener">Regole sul nome e sul marchio</a></p></section>' +
        '<section class="card"><h2>Privacy</h2><p>Il programma non ha server, account, pubblicità o statistiche: tutti i dati dei clienti stanno nel browser di questo dispositivo. Kit, risposte e correzioni viaggiano solo per i canali scelti da te (file, email, messaggi) e sono firmati con un codice segreto per cliente. L\'assistenza a distanza collega direttamente i due dispositivi in modo cifrato; per trovarsi in rete usa i server pubblici STUN di Google e Cloudflare, che vedono solo gli indirizzi di rete, mai i contenuti. Chi lo usa per lavoro ne è titolare del trattamento e deve custodirli: il backup cifrato con password (AES-256) e il dispositivo protetto da password sono le due difese principali.</p></section>' +
        '<section class="card"><h2>Riferimenti</h2><p>Le aree di competenza seguono il quadro europeo <strong>DigComp 2.2</strong> (Commissione europea, JRC), citato come riferimento: l\'attestato non è una certificazione ufficiale DigComp.</p><p>Nomi di prodotti e servizi citati (Windows, Android, iPhone, WhatsApp, RaiPlay…) appartengono ai rispettivi proprietari e sono usati solo a scopo descrittivo.</p></section>' +
        '<section class="card"><h2>Esclusione di garanzia</h2><p>I modelli di liberatoria, ricevuta e preventivo sono una base di lavoro curata ma non sostituiscono il parere di un consulente legale, fiscale o privacy. Il programma è fornito «così com\'è».</p></section>' +
      "</div></div>";
  });
})();
