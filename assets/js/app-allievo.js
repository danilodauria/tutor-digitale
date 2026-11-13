/* ==========================================================================
   Tutor Digitale · Allievo — l'app del cliente
   Personalizzata dal kit del tutor: nome, compiti, quiz da consegnare,
   correzioni ricevute. Lezioni, allenamento, palestra e assistenza a distanza.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const db = function () { return TD.db; };

  function consegna(id) { return (db().consegne || []).find(function (k) { return k.id === id; }); }
  function aperte() { return (db().consegne || []).filter(function (k) { return !k.inviata; }); }
  function nomeBreve() { return db().allievo ? db().allievo.nome.split(" ")[0] : ""; }
  function compitiAperti() {
    let n = 0;
    (db().consegne || []).forEach(function (k) { if (!k.inviata) k.compiti.forEach(function (c) { if (!((k.statoCompiti || {})[c.id] || {}).fatto) n++; }); });
    return n;
  }
  function quizFatto(k) { return k.quiz.length && Object.keys(k.risposte || {}).length >= k.quiz.length; }

  /* ------------------------------------------------------------ pacchetti */
  TD.apriPacchetto = async function (p) {
    const d = db();
    if (p.tipo === "kit") {
      const a = p.dati.allievo;
      if (d.allievo && d.allievo.clienteId !== a.clienteId && !TD.conferma("Questa app è di " + d.allievo.nome + ". Sostituire con il profilo di " + a.nome + "? I compiti attuali verranno tolti.")) return;
      if (d.allievo && d.allievo.clienteId !== a.clienteId) d.consegne = [];
      d.allievo = a; d.tutor = p.dati.tutor; d.segreto = p.dati.segreto;
      d.profilo = Object.assign({}, d.profilo, { nome: p.dati.tutor.nome || "", qualifica: p.dati.tutor.qualifica || "", email: p.dati.tutor.email || "", telefono: p.dati.tutor.telefono || "" });
      const k = p.dati.consegna;
      d.consegne = (d.consegne || []).filter(function (x) { return x.id !== k.id; });
      d.consegne.push(Object.assign({ risposte: {}, statoCompiti: {}, inviata: false, correzione: null, ricevuta: new Date().toISOString() }, k));
      TD.salva();
      TD.toast("Benvenuto " + a.nome.split(" ")[0] + "! " + (k.compiti.length || k.quiz.length ? "Hai nuovi compiti." : ""));
      TD.vai("#/");
      return;
    }
    if (p.tipo === "correzione") {
      const firma = await TD.scambio.verifica(p, d.segreto);
      if (firma === false) { TD.toast("La correzione non risulta firmata dal tuo tutor."); return; }
      const k = consegna(p.dati.consegnaId);
      if (!k) { TD.toast("Questa correzione riguarda compiti che non sono in questa app."); return; }
      k.correzione = p.dati; k.inviata = true; TD.salva();
      TD.toast("È arrivata la correzione!");
      TD.vai("#/correzione/" + k.id);
      return;
    }
    TD.toast("Questo pacchetto va aperto nel programma del tutor.");
  };

  async function pacchettoRisposte(k, nota, allegati) {
    const d = db();
    return TD.scambio.impacchetta("risposte", { id: d.allievo.clienteId, partecipante: d.allievo.partecipante || "" }, {
      consegnaId: k.id, nome: d.allievo.nome, risposte: k.risposte || {}, compiti: k.statoCompiti || {},
      nota: nota || "", allegati: allegati || [], ripassate: d.ripassate || [], allenamenti: (d.allenamenti || []).slice(-10), inviato: new Date().toISOString()
    }, d.segreto);
  }
  function nomeFileRisposte(k) { return "tutor-digitale-risposte_" + TD.nomeFile(db().allievo.nome) + "_" + k.data + ".json"; }

  TD.azioniRemote = function () {
    if (!db().allievo) return "";
    const k = (db().consegne || []).slice().reverse().find(function (x) { return !x.correzione; });
    return k ? ' <button class="btn btn-primary" id="rCompiti">' + I("upload") + "Invia i miei compiti</button>" : "";
  };
  TD.collegaAzioniRemote = function () {
    const b = document.getElementById("rCompiti"); if (!b) return;
    b.onclick = async function () {
      const k = (db().consegne || []).slice().reverse().find(function (x) { return !x.correzione; });
      await TD.inviaFileRemoto(TD.scambio.file(await pacchettoRisposte(k, "", []), nomeFileRisposte(k)));
      k.inviata = true; TD.salva(); TD.toast("Compiti inviati al tutor.");
    };
  };

  /* ------------------------------------------------------------ home */
  TD.rotta("/", function (app) {
    const d = db();
    if (!d.allievo) { benvenuto(app); return; }
    const t = d.tutor || {};
    const ap = aperte(), nc = compitiAperti();
    const nuoveCorr = (d.consegne || []).filter(function (k) { return k.correzione && !k.correzioneVista; });
    const devs = (d.allievo.dispositivi || []).length ? d.allievo.dispositivi : ["pc", "tablet", "smartphone", "tv", "rete"];
    app.innerHTML =
      '<section class="hero allievo-hero"><div class="wrap">' +
        '<p class="hero-kicker"><span class="spia" data-spia><i></i><span class="spia-testo">Online</span></span>' + (d.allievo.ente ? E(d.allievo.ente) : "Il tuo spazio per imparare") + "</p>" +
        "<h1>Ciao, " + E(nomeBreve()) + "!</h1>" +
        '<p class="hero-lead">' + (ap.length ? "Hai <strong>" + (nc ? nc + " compit" + (nc === 1 ? "o" : "i") : "") + (nc && ap.some(function (k) { return k.quiz.length && !quizFatto(k); }) ? " e " : "") + (ap.some(function (k) { return k.quiz.length && !quizFatto(k); }) ? "un quiz" : "") + "</strong> da fare." : "Niente compiti in sospeso: puoi ripassare le lezioni o allenarti.") + "</p>" +
        '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/compiti">' + I("pen") + "I miei compiti</a>" + (ap.length ? '<a class="btn btn-lg" href="#/invia">' + I("upload") + "Invia al tutor</a>" : "") + "</div>" +
      "</div></section>" +
      '<div class="wrap">' +
        (nuoveCorr.length ? '<a class="note-box ok-box" href="#/correzione/' + nuoveCorr[0].id + '">' + I("award") + "<div><strong>È arrivata la correzione dei compiti del " + E(TD.dataIt(nuoveCorr[0].data)) + "</strong><br>Tocca per vedere com'è andata.</div></a>" : "") +
        '<section class="tiles">' +
          tile("#/compiti", "pen", "Compiti", nc ? nc + " da fare" : "Tutto fatto") +
          tile("#/percorsi", "book", "Lezioni", "Ripassa quando vuoi") +
          tile("#/quiz", "quiz", "Allenamento", "Quiz sempre diversi") +
          tile("#/palestra", "mouse", "Palestra", "Mouse, tastiera, truffe") +
          tile("#/invia", "upload", "Invia al tutor", "Compiti e messaggi") +
          tile("#/ricevi", "download", "Ricevi dal tutor", "Nuovi compiti e correzioni") +
          tile("#/remoto", "screen", "Aiuto a distanza", "Codice e password") +
          tile("#/info", "user", "Il mio profilo", "Dati e copia di sicurezza") +
        "</section>" +
        '<section class="block"><div class="block-head"><h2>Le mie lezioni</h2></div><div class="paths">' + devs.map(function (id) {
          const p = TD.percorso(id), liv = (d.allievo.livelli || {})[id] || 0;
          return '<a class="path-card" href="#/percorso/' + id + '"><span class="path-ico">' + I(p.icona) + "</span><h3>" + E(p.nome) + "</h3><p>" + TD.badgeLiv(liv) + "</p></a>";
        }).join("") + "</div></section>" +
        '<section class="card tutor-card"><h2>' + I("user") + "Il tuo tutor</h2><p><strong>" + E(t.nome || "") + "</strong>" + (t.qualifica ? " · " + E(t.qualifica) : "") + "</p><p>" +
          (t.telefono ? '<a class="btn" href="tel:' + E(t.telefono) + '">' + I("phone") + E(t.telefono) + "</a> " : "") +
          (t.email ? '<a class="btn" href="mailto:' + E(t.email) + '">' + I("doc") + E(t.email) + "</a>" : "") + "</p></section>" +
      "</div>";
  });
  function tile(h, ic, t, d) { return '<a class="tile" href="' + h + '"><span class="tile-ico">' + I(ic) + "</span><strong>" + E(t) + "</strong><small>" + E(d) + "</small></a>"; }

  function benvenuto(app) {
    app.innerHTML = '<section class="hero"><div class="wrap"><p class="hero-kicker"><span class="spia" data-spia><i></i><span class="spia-testo">Online</span></span> Tutor Digitale · Allievo</p>' +
      "<h1>Benvenuto!</h1><p class=\"hero-lead\">Questa è l'app per chi segue le lezioni di Tutor Digitale. Per personalizzarla apri il <strong>link</strong> o il <strong>file</strong> che ti ha mandato il tuo tutor.</p></div></section>" +
      '<div class="wrap"><div class="grid-2">' + importatore("Attiva l'app") +
      '<section class="card"><h2>' + I("book") + "Intanto puoi</h2><div class=\"action-list\">" +
        '<a class="action" href="#/percorsi">' + I("book") + "<span><strong>Guardare le lezioni</strong><small>40 lezioni, dai primi passi a esperto</small></span>" + I("arrow") + "</a>" +
        '<a class="action" href="#/palestra">' + I("mouse") + "<span><strong>Allenarti in palestra</strong><small>Mouse, tastiera, truffe, password</small></span>" + I("arrow") + "</a>" +
        '<a class="action" href="#/remoto">' + I("screen") + "<span><strong>Ricevere aiuto a distanza</strong><small>Con il codice e la password del tutor</small></span>" + I("arrow") + "</a>" +
      "</div></section></div></div>";
    collegaImportatore();
  }

  function importatore(titolo) {
    return '<section class="card"><h2>' + I("download") + E(titolo) + '</h2><label class="btn btn-primary btn-lg">' + I("upload") + 'Apri il file ricevuto<input type="file" id="impFile" accept=".json,application/json" hidden></label>' +
      '<label class="field"><span>…oppure incolla il link o il codice ricevuto</span><textarea id="impTesto" rows="3" placeholder="https://… oppure TD1.…"></textarea></label><button class="btn" id="impBtn">' + I("check") + "Apri</button></section>";
  }
  function collegaImportatore() {
    const f = document.getElementById("impFile");
    if (f) f.onchange = async function () { try { await TD.apriPacchetto(await TD.scambio.leggiFile(this.files[0])); } catch (e) { TD.toast(e.message); } };
    const b = document.getElementById("impBtn");
    if (b) b.onclick = async function () { try { await TD.apriPacchetto(await TD.scambio.leggi(document.getElementById("impTesto").value)); } catch (e) { TD.toast(e.message); } };
  }

  TD.rotta("/attiva", function (app, p, q) {
    if (!q.k) { TD.vai("#/ricevi"); return; }
    app.innerHTML = '<div class="wrap loading"><p>Preparo la tua app…</p></div>';
    TD.scambio.leggi("k=" + q.k).then(TD.apriPacchetto).catch(function (e) {
      app.innerHTML = '<div class="wrap"><div class="card"><h1>Link incompleto</h1><p>' + E(e.message) + ' Probabilmente il link è stato tagliato: chiedi al tutor il <strong>file</strong> del kit.</p><a class="btn btn-primary" href="#/ricevi">Apri il file</a></div></div>';
    });
  });
  TD.rotta("/ricevi", function (app, p, q) {
    if (q.k) { app.innerHTML = '<div class="wrap loading"><p>Apro…</p></div>'; TD.scambio.leggi("k=" + q.k).then(TD.apriPacchetto).catch(function (e) { TD.toast(e.message); TD.vai("#/ricevi"); }); return; }
    app.innerHTML = TD.intest("Ricevi dal tutor", "Nuovi compiti e correzioni arrivano come file, link o codice. Aprili qui.") + '<div class="wrap">' + importatore("Apri quello che hai ricevuto") + "</div>";
    collegaImportatore();
  });

  /* ------------------------------------------------------------ compiti */
  TD.rotta("/compiti", function (app) {
    const d = db();
    const lista = (d.consegne || []).slice().reverse();
    app.innerHTML = TD.intest("I miei compiti", d.allievo ? "Spunta quello che hai fatto e, se vuoi, scrivi com'è andata. Poi «Invia al tutor»." : "Attiva l'app con il link del tutor per ricevere i compiti.") +
      '<div class="wrap">' + (lista.length ? lista.map(function (k) {
        const fatto = quizFatto(k);
        return '<section class="card consegna-card' + (k.inviata ? " inviata" : "") + '"><div class="block-head"><h2>Compiti del ' + E(TD.dataIt(k.data)) + "</h2>" +
          (k.correzione ? '<a class="pill ok" href="#/correzione/' + k.id + '">' + I("award") + "Corretti · " + (k.correzione.esito ? k.correzione.esito.perc + "%" : "visti") + "</a>" : k.inviata ? '<span class="pill">' + I("check") + "Inviati</span>" : k.scadenza ? '<span class="pill warn">entro il ' + E(TD.dataIt(k.scadenza)) + "</span>" : "") + "</div>" +
          (k.messaggio ? '<p class="q-proposta">' + I("user") + " " + E(k.messaggio) + "</p>" : "") +
          (k.compiti.length ? '<ul class="task-list">' + k.compiti.map(function (c) {
            const s = (k.statoCompiti || {})[c.id] || {};
            return '<li class="' + (s.fatto ? "done" : "") + '"><label class="check"><input type="checkbox" data-k="' + k.id + '" data-c="' + c.id + '"' + (s.fatto ? " checked" : "") + (k.inviata ? " disabled" : "") + "> <span>" + E(c.testo) + (c.lezione ? ' <a href="#/lezione/' + c.lezione + '">rivedi la lezione</a>' : "") + "</span></label>" +
              (k.inviata ? (s.nota ? "<small>" + E(s.nota) + "</small>" : "") : '<input class="nota" data-nk="' + k.id + '" data-nc="' + c.id + '" placeholder="Com\'è andata? (facoltativo)" value="' + E(s.nota || "") + '">') + "</li>";
          }).join("") + "</ul>" : "") +
          (k.quiz.length ? '<div class="actions">' + (k.inviata ? "" : '<a class="btn ' + (fatto ? "" : "btn-primary") + '" href="#/consegna/' + k.id + '">' + I("quiz") + (fatto ? "Rivedi il quiz" : "Fai il quiz (" + k.quiz.length + " domande)") + "</a>") + (fatto ? '<span class="pill ok">' + I("check") + "Quiz completato</span>" : "") + "</div>" : "") +
          (k.inviata ? "" : '<div class="actions"><a class="btn btn-primary" href="#/invia?c=' + k.id + '">' + I("upload") + "Invia al tutor</a></div>") + "</section>";
      }).join("") : '<div class="card empty"><p>Nessun compito per ora.</p><a class="btn" href="#/ricevi">Ricevi dal tutor</a></div>') + "</div>";
    app.querySelectorAll("[data-k]").forEach(function (cb) {
      cb.onchange = function () {
        const k = consegna(cb.dataset.k); k.statoCompiti = k.statoCompiti || {};
        k.statoCompiti[cb.dataset.c] = Object.assign({}, k.statoCompiti[cb.dataset.c], { fatto: cb.checked });
        TD.salva(); cb.closest("li").classList.toggle("done", cb.checked);
      };
    });
    app.querySelectorAll("[data-nk]").forEach(function (inp) {
      inp.onchange = function () { const k = consegna(inp.dataset.nk); k.statoCompiti = k.statoCompiti || {}; k.statoCompiti[inp.dataset.nc] = Object.assign({}, k.statoCompiti[inp.dataset.nc], { nota: inp.value.trim() }); TD.salva(); };
    });
  });

  /* quiz della consegna: si risponde, corregge il tutor */
  TD.rotta("/consegna/:id", function (app, p) {
    const k = consegna(p.id);
    if (!k || !k.quiz.length) { TD.vai("#/compiti"); return; }
    k.risposte = k.risposte || {};
    let i = 0;
    function mostra() {
      const q = k.quiz[i], r = k.risposte[i];
      let corpo = "";
      if (q.opzioni) {
        corpo = '<p class="q-text">' + E(q.testo).replace("___", '<span class="blank">______</span>') + "</p>" + (q.proposta ? '<p class="q-proposta">Risposta proposta: <strong>' + E(q.proposta) + '</strong></p><p class="muted">È giusta?</p>' : "") +
          '<div class="opts">' + q.opzioni.map(function (o, j) { return '<button type="button" class="opt' + (r === o ? " sel" : "") + '" data-o="' + j + '"><b>' + E(q.etichette[j]) + "</b><span>" + E(o) + "</span></button>"; }).join("") + "</div>";
      } else if (q.tipo === "seq") {
        const cur = Array.isArray(r) ? r : q.passi.slice();
        k.risposte[i] = cur;
        corpo = '<p class="q-text">Metti in ordine: <strong>' + E(q.testo) + '</strong></p><ol class="seq" id="seq">' + cur.map(function (s, j) { return "<li><span>" + E(s) + '</span><span class="seq-btns"><button type="button" data-su="' + j + '"' + (j === 0 ? " disabled" : "") + ' aria-label="Su">▲</button><button type="button" data-giu="' + j + '"' + (j === cur.length - 1 ? " disabled" : "") + ' aria-label="Giù">▼</button></span></li>'; }).join("") + "</ol>";
      } else if (q.tipo === "abbina") {
        const cur = Array.isArray(r) ? r : [];
        corpo = '<p class="q-text">' + E(q.testo) + '</p><ul class="defs">' + q.definizioni.map(function (d, j) { return "<li><b>" + E(q.etichette[j]) + "</b> " + E(d) + "</li>"; }).join("") + '</ul><div class="match">' +
          q.termini.map(function (t, j) { return '<label class="match-row"><span>' + E(t) + '</span><select data-t="' + j + '"><option value="">—</option>' + q.definizioni.map(function (d, x) { return '<option value="' + x + '"' + (cur[j] === d ? " selected" : "") + ">" + E(q.etichette[x]) + "</option>"; }).join("") + "</select></label>"; }).join("") + "</div>";
      }
      app.innerHTML = '<div class="wrap quiz-play"><div class="quiz-top"><span>Compiti del ' + E(TD.dataIt(k.data)) + "</span><span>Domanda " + (i + 1) + " di " + k.quiz.length + "</span></div>" + TD.barra(Object.keys(k.risposte).length, k.quiz.length) +
        '<div class="card q-card">' + corpo + '<p class="muted text-small">Le risposte le corregge il tutor: puoi cambiarle finché non invii.</p></div>' +
        '<div class="quiz-nav"><button class="btn" id="prev"' + (i ? "" : " disabled") + ">" + I("back") + 'Indietro</button><button class="btn" id="leggiQ">' + I("speaker") + 'Leggi</button><button class="btn btn-primary" id="next">' + (i === k.quiz.length - 1 ? "Ho finito " : "Avanti ") + I("arrow") + "</button></div></div>";
      app.querySelectorAll("[data-o]").forEach(function (b) { b.onclick = function () { k.risposte[i] = q.opzioni[+b.dataset.o]; TD.salva(); app.querySelectorAll("[data-o]").forEach(function (x) { x.classList.toggle("sel", x === b); }); }; });
      const seq = document.getElementById("seq");
      if (seq) seq.onclick = function (e) {
        const b = e.target.closest("button"); if (!b) return; const a = k.risposte[i];
        if (b.dataset.su) { const j = +b.dataset.su; [a[j - 1], a[j]] = [a[j], a[j - 1]]; }
        if (b.dataset.giu) { const j = +b.dataset.giu; [a[j + 1], a[j]] = [a[j], a[j + 1]]; }
        TD.salva(); mostra();
      };
      app.querySelectorAll("[data-t]").forEach(function (s) { s.onchange = function () { const a = Array.isArray(k.risposte[i]) ? k.risposte[i] : []; a[+s.dataset.t] = s.value === "" ? "" : q.definizioni[+s.value]; k.risposte[i] = a; TD.salva(); }; });
      document.getElementById("prev").onclick = function () { i--; mostra(); };
      document.getElementById("next").onclick = function () {
        if (k.risposte[i] == null) { TD.toast("Scegli una risposta (oppure vai avanti e tornaci dopo)."); k.risposte[i] = k.risposte[i]; }
        if (i < k.quiz.length - 1) { i++; mostra(); return; }
        const mancano = k.quiz.filter(function (_, j) { return k.risposte[j] == null; }).length;
        TD.salva();
        app.innerHTML = '<div class="wrap"><div class="card result"><h1>' + (mancano ? "Quasi finito" : "Quiz completato!") + "</h1><p>" + (mancano ? "Mancano " + mancano + " risposte: puoi tornare indietro o inviare così." : "Ora invia le risposte al tutor: te le correggerà e riceverai la correzione.") + '</p><div class="actions"><a class="btn btn-primary btn-lg" href="#/invia?c=' + k.id + '">' + I("upload") + 'Invia al tutor</a><a class="btn" href="#/consegna/' + k.id + '">Rivedi</a></div></div></div>';
      };
      document.getElementById("leggiQ").onclick = function () { TD.leggi(q.testo.replace("___", "puntini") + (q.proposta ? ". Risposta proposta: " + q.proposta : "") + (q.opzioni && !q.proposta ? ". " + q.opzioni.map(function (o, j) { return q.etichette[j] + ": " + o; }).join(". ") : "")); };
    }
    mostra();
  });

  /* ------------------------------------------------------------ invio */
  function riduciImmagine(file) {
    return new Promise(function (ok) {
      if (!/^image\//.test(file.type)) {
        if (file.size > 700000) { TD.toast("«" + file.name + "» è troppo grande: massimo 700 kB."); return ok(null); }
        const r = new FileReader(); r.onload = function () { ok({ nome: file.name, dati: r.result }); }; r.readAsDataURL(file); return;
      }
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        const sc = Math.min(1, 1280 / Math.max(im.width, im.height));
        const c = document.createElement("canvas"); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        ok({ nome: file.name.replace(/\.\w+$/, "") + ".jpg", dati: c.toDataURL("image/jpeg", 0.78) });
      };
      im.onerror = function () { ok(null); };
      im.src = url;
    });
  }

  TD.rotta("/invia", function (app, p, q) {
    const d = db();
    if (!d.allievo) { TD.vai("#/"); return; }
    const da = (d.consegne || []).filter(function (k) { return !k.correzione; }).slice().reverse();
    const sel = consegna(q.c) || da[0];
    const t = d.tutor || {};
    let allegati = [];
    app.innerHTML = TD.intest("Invia al tutor", "Prepara il pacchetto con i compiti fatti, le risposte del quiz, un messaggio e, se vuoi, una foto. Poi scegli come mandarlo.") +
      '<div class="wrap">' + (da.length ? '<div class="grid-2"><section class="card form">' +
        '<label class="field"><span>Compiti</span><select id="iC">' + da.map(function (k) { return '<option value="' + k.id + '"' + (sel && k.id === sel.id ? " selected" : "") + ">Compiti del " + E(TD.dataIt(k.data)) + (k.inviata ? " (già inviati)" : "") + "</option>"; }).join("") + "</select></label>" +
        '<div id="iRiep"></div>' +
        '<label class="field"><span>Messaggio per ' + E(t.nome || "il tutor") + '</span><textarea id="iNota" rows="3" placeholder="Es. Il vocale l\'ho mandato, la foto non riesco a ritagliarla."></textarea></label>' +
        '<label class="btn">' + I("upload") + 'Aggiungi foto o file (max 3)<input type="file" id="iAll" accept="image/*,.pdf,.txt" multiple hidden></label><div id="iAllList" class="muted text-small"></div>' +
      "</section>" +
      '<section class="card"><h2>' + I("upload") + "Come lo mando?</h2><div class=\"action-list\">" +
        '<button class="action" id="iShare">' + I("upload") + "<span><strong>Condividi</strong><small>WhatsApp, email, Telegram… (sul telefono e sul tablet)</small></span>" + I("arrow") + "</button>" +
        (t.email ? '<button class="action" id="iMail">' + I("doc") + "<span><strong>Email al tutor</strong><small>Scarica il file e apre l'email: allegalo prima di inviare</small></span>" + I("arrow") + "</button>" : "") +
        '<button class="action" id="iCopia">' + I("copy") + "<span><strong>Copia come codice</strong><small>Da incollare in un messaggio, senza allegati</small></span>" + I("arrow") + "</button>" +
        '<button class="action" id="iFile">' + I("download") + "<span><strong>Salva il file</strong><small>Per mandarlo dopo o portarlo su chiavetta</small></span>" + I("arrow") + "</button>" +
        (TD.sessioneRemota && TD.sessioneRemota.fase === "collegato" ? '<button class="action" id="iRem">' + I("screen") + "<span><strong>Invia nella sessione a distanza</strong><small>Siete collegati: arriva subito</small></span>" + I("arrow") + "</button>" : "") +
      "</div></section></div>" : '<div class="card empty"><p>Nessun compito da inviare.</p></div>') + "</div>";
    if (!da.length) return;
    function k() { return consegna(document.getElementById("iC").value); }
    function riep() {
      const c = k(); const fatti = c.compiti.filter(function (x) { return ((c.statoCompiti || {})[x.id] || {}).fatto; }).length;
      const risp = c.quiz.filter(function (_, j) { return (c.risposte || {})[j] != null; }).length;
      document.getElementById("iRiep").innerHTML = '<ul class="checks"><li>' + fatti + " compiti su " + c.compiti.length + " segnati come fatti</li>" + (c.quiz.length ? "<li>" + risp + " risposte su " + c.quiz.length + ' al quiz' + (risp < c.quiz.length ? ' — <a href="#/consegna/' + c.id + '">completa</a>' : "") + "</li>" : "") + "</ul>";
    }
    document.getElementById("iC").onchange = riep; riep();
    document.getElementById("iAll").onchange = async function () {
      for (const f of Array.from(this.files).slice(0, 3 - allegati.length)) { const a = await riduciImmagine(f); if (a) allegati.push(a); }
      document.getElementById("iAllList").textContent = allegati.map(function (a) { return a.nome; }).join(", ");
    };
    async function pronto() { const c = k(); const pk = await pacchettoRisposte(c, document.getElementById("iNota").value.trim(), allegati); return { c: c, pk: pk, file: TD.scambio.file(pk, nomeFileRisposte(c)) }; }
    function fatto(c) { c.inviata = true; TD.salva(); }
    document.getElementById("iShare").onclick = async function () { const x = await pronto(); const e = await TD.scambio.condividi(x.file, "Compiti per " + (t.nome || "il tutor"), "Compiti di " + d.allievo.nome); if (e !== "annullato") { fatto(x.c); TD.toast(e === "scaricato" ? "File salvato: allegalo a un messaggio per il tutor." : "Inviato!"); } };
    const m = document.getElementById("iMail");
    if (m) m.onclick = async function () {
      const x = await pronto(); TD.scarica(x.file, x.file.name); fatto(x.c);
      setTimeout(function () { location.href = TD.scambio.mailto(t.email, "Compiti di " + d.allievo.nome, "Ciao " + (t.nome || "") + ",\nti allego i miei compiti (file " + x.file.name + ", lo trovi nella cartella Download).\n\n" + document.getElementById("iNota").value); }, 600);
    };
    document.getElementById("iCopia").onclick = async function () {
      const x = await pronto(); x.pk.dati.allegati = [];
      const codice = await TD.scambio.comprimi(await TD.scambio.impacchetta(x.pk.tipo, x.pk.cliente, x.pk.dati, d.segreto));
      if (await TD.scambio.copia(codice)) { fatto(x.c); TD.toast("Codice copiato (" + codice.length + " caratteri): incollalo in un messaggio per il tutor."); } else TD.toast("Non riesco a copiare: usa «Salva il file».");
    };
    document.getElementById("iFile").onclick = async function () { const x = await pronto(); TD.scarica(x.file, x.file.name); fatto(x.c); };
    const r = document.getElementById("iRem");
    if (r) r.onclick = async function () { const x = await pronto(); await TD.inviaFileRemoto(x.file); fatto(x.c); TD.toast("Inviato nella sessione."); };
  });

  /* ------------------------------------------------------------ correzione */
  TD.rotta("/correzione/:id", function (app, p) {
    const k = consegna(p.id);
    if (!k || !k.correzione) { TD.vai("#/compiti"); return; }
    k.correzioneVista = true; TD.salva();
    const c = k.correzione, e = c.esito;
    app.innerHTML = TD.intest("La correzione", "Compiti del " + E(TD.dataIt(k.data)) + " · corretti da " + E((c.tutor && c.tutor.nome) || "il tutor")) +
      '<div class="wrap">' + (e ? '<div class="card result"><div class="score" style="--p:' + e.perc + '"><strong>' + e.perc + "%</strong><span>" + e.giuste + " su " + e.totale + "</span></div><h2>" + (e.perc >= 90 ? "Eccellente!" : e.perc >= 75 ? "Molto bene!" : e.perc >= 60 ? "Superato!" : "Ripassiamo insieme") + "</h2></div>" : "") +
      (c.commento ? '<section class="card"><h2>' + I("user") + "Il messaggio del tutor</h2><p class=\"read\">" + E(c.commento) + "</p></section>" : "") +
      (e ? '<section class="block"><h2>Domanda per domanda</h2><ol class="review">' + e.dettagli.map(function (x) {
        return '<li class="' + (x.ok ? "ok" : "ko") + '"><span class="rv-mark">' + I(x.ok ? "check" : "x") + "</span><div><p><strong>" + E(x.testo) + "</strong>" + (x.proposta ? " — «" + E(x.proposta) + "»" : "") + "</p><p>La tua risposta: " + E(x.data || "—") + "</p>" + (x.ok ? "" : "<p>Giusta: <strong>" + E(x.giusta) + "</strong></p>") + '<p class="muted">' + E(x.spiegazione) + "</p></div></li>";
      }).join("") + "</ol></section>" : "") +
      '<div class="actions"><a class="btn btn-primary" href="#/compiti">Torna ai compiti</a><a class="btn" href="#/quiz">Allenati ancora</a></div></div>';
  });

  /* ------------------------------------------------------------ profilo */
  TD.rotta("/info", function (app) {
    const d = db();
    const media = (d.allenamenti || []).length ? Math.round(d.allenamenti.reduce(function (s, x) { return s + x.perc; }, 0) / d.allenamenti.length) : null;
    app.innerHTML = TD.intest("Il mio profilo", "Tutto resta su questo dispositivo.") +
      '<div class="wrap"><div class="grid-2">' +
        '<section class="card"><h2>' + I("user") + "Io</h2>" + (d.allievo ? '<dl class="dl"><dt>Nome</dt><dd>' + E(d.allievo.nome) + "</dd>" + (d.allievo.ente ? "<dt>Gruppo</dt><dd>" + E(d.allievo.ente) + "</dd>" : "") + "<dt>Tutor</dt><dd>" + E((d.tutor || {}).nome || "") + "</dd><dt>Lezioni ripassate</dt><dd>" + (d.ripassate || []).length + "</dd><dt>Allenamenti</dt><dd>" + (d.allenamenti || []).length + (media == null ? "" : " · media " + media + "%") + "</dd></dl>" : "<p>App non ancora attivata.</p>") + "</section>" +
        '<section class="card"><h2>' + I("download") + 'Copia di sicurezza</h2><p>Se cambi telefono o computer, salva la copia e aprila sul nuovo dispositivo.</p><div class="actions"><button class="btn btn-primary" id="exp">' + I("download") + 'Salva copia</button><label class="btn">' + I("upload") + 'Ripristina<input type="file" id="imp" accept=".json" hidden></label><button class="btn btn-danger" id="del">' + I("trash") + "Azzera l'app</button></div></section>" +
        '<section class="card"><h2>' + I("eye") + 'Lettura comoda</h2><p>Usa il pulsante <strong>Aa</strong> in alto per ingrandire i caratteri e il sole/luna per il tema scuro. Nelle lezioni c\'è «Leggi ad alta voce».</p></section>' +
        '<section class="card"><h2>' + I("info") + 'Informazioni</h2><p>Tutor Digitale · Allievo, versione ' + TD.VERSIONE + '. Ideato e sviluppato da Danilo D\'Auria. Codice MIT, contenuti CC BY-NC-SA 4.0.</p><p><a href="../#/licenze">Licenze</a> · <a href="../#/installa">Come si installa</a></p></section>' +
      "</div></div>";
    document.getElementById("exp").onclick = function () { TD.scarica(new Blob([JSON.stringify(TD.db)], { type: "application/json" }), "tutor-digitale-allievo-copia_" + TD.oggi() + ".json"); };
    document.getElementById("imp").onchange = function () {
      const r = new FileReader(); r.onload = function () { try { const o = JSON.parse(r.result); if (!("consegne" in o)) throw 0; TD.db = o; TD.salva(); TD.toast("Copia ripristinata."); TD.vai("#/"); } catch (e) { TD.toast("Non è una copia valida."); } }; r.readAsText(this.files[0]);
    };
    document.getElementById("del").onclick = function () { if (TD.conferma("Cancellare profilo, compiti e risultati da questo dispositivo?")) { TD.azzera(); TD.vai("#/"); } };
  });

  TD.clienteAttivo = TD.clienteAttivo || function () { return null; };
})();
