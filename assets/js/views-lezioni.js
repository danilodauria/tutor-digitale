/* ==========================================================================
   Tutor Digitale · home, percorsi, lezioni, modalità lavagna
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;

  /* cliente con cui si sta facendo lezione */
  TD.clienteAttivo = function () { return TD.cliente(TD.db.impostazioni.clienteAttivo); };
  TD.impostaClienteAttivo = function (id) { TD.db.impostazioni.clienteAttivo = id || ""; TD.salva(); TD.aggiornaChip(); };
  TD.aggiornaChip = function () {
    const box = document.getElementById("chipCliente"); if (!box) return;
    const c = TD.clienteAttivo();
    box.hidden = !c;
    if (c) box.innerHTML = '<a href="#/cliente/' + c.id + '">' + I("user") + "<span>In lezione con <strong>" + E(TD.nomeCliente(c)) + "</strong></span></a>" +
      '<button type="button" aria-label="Termina la lezione con questo cliente" title="Nessun cliente attivo">' + I("x") + "</button>";
    const b = box.querySelector("button");
    if (b) b.onclick = function () { TD.impostaClienteAttivo(""); TD.toast("Nessun cliente attivo."); };
  };

  function inizioMese() { const d = TD.oggi(); return d.slice(0, 8) + "01"; }
  function tutteLeLezioni() {
    const out = [];
    TD.db.clienti.forEach(function (c) { (c.registro || []).forEach(function (r) { out.push({ c: c, r: r }); }); });
    return out;
  }
  TD.tutteLeLezioni = tutteLeLezioni;

  /* --------------------------------------------------------------- HOME */
  TD.rotta("/", function (app) {
    const oggi = TD.oggi(), mese = inizioMese();
    const reg = tutteLeLezioni();
    const svolteMese = reg.filter(function (x) { return x.r.stato !== "pianificata" && x.r.data >= mese && x.r.data <= oggi; });
    const oreMese = svolteMese.reduce(function (s, x) { return s + (Number(x.r.durata) || 0); }, 0) / 60;
    const prossime = reg.filter(function (x) { return x.r.stato === "pianificata" && x.r.data >= oggi; })
      .sort(function (a, b) { return (a.r.data + (a.r.ora || "")).localeCompare(b.r.data + (b.r.ora || "")); }).slice(0, 4);
    const attivi = TD.db.clienti.filter(function (c) { return c.stato !== "concluso"; }).length;
    const ora = new Date().getHours();
    const saluto = ora < 13 ? "Buongiorno" : ora < 18 ? "Buon pomeriggio" : "Buonasera";

    app.innerHTML =
      '<section class="hero"><div class="wrap hero-grid">' +
        '<div class="hero-text">' +
          '<p class="hero-kicker"><span class="spia" data-spia><i></i><span class="spia-testo">Online</span></span> ' + E(saluto) + (TD.db.profilo.nome ? ", " + E(TD.db.profilo.nome.split(" ")[0]) : "") + "</p>" +
          "<h1>Tutor Digitale</h1>" +
          '<p class="hero-lead">Lezioni di informatica, tablet, smartphone e Smart TV su misura: <strong>dai primi passi a esperto</strong>, a casa, al lavoro e nelle associazioni.</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-primary btn-lg" href="#/percorsi">' + I("book") + "Inizia una lezione</a>" +
            '<a class="btn btn-ghost btn-lg" href="#/nuovo-cliente">' + I("plus") + "Nuovo cliente</a>" +
          "</div>" +
          '<p class="hero-note">' + I("wifi") + " Tutto è già sul dispositivo: online e offline il programma è identico. La spia verde dice solo se c'è Internet.</p>" +
        "</div>" +
        '<div class="hero-art" aria-hidden="true">' + scala() + "</div>" +
      "</div></section>" +

      '<div class="wrap">' +
        '<section class="stats">' +
          stat(attivi, "clienti attivi", "users", "#/clienti") +
          stat(svolteMese.length, "lezioni questo mese", "calendar", "#/agenda") +
          stat(oreMese.toLocaleString("it-IT", { maximumFractionDigits: 1 }), "ore insegnate nel mese", "clock", "#/agenda") +
          stat(TD.db.attestati.length, "attestati rilasciati", "award", "#/documenti") +
        "</section>" +
        (TD.MODO !== "allievo" && TD.db.clienti.length && (!TD.db.esportato || Date.now() - new Date(TD.db.esportato).getTime() > 7 * 86400000)
          ? '<a class="note-box" href="#/impostazioni">' + I("lock") + "<div><strong>" + (TD.db.esportato ? "L'ultima copia di sicurezza è del " + E(TD.dataIt(TD.db.esportato)) : "Non hai ancora salvato una copia di sicurezza") + "</strong><br>Fai un backup cifrato con password: un minuto, e i dati dei clienti sono al sicuro anche su chiavetta o cloud.</div></a>" : "") +

        '<section class="tiles">' +
          tile("#/percorsi", "book", "Lezioni", TD.LEZIONI.length + " lezioni in " + TD.LIVELLI.length + " livelli e " + TD.PERCORSI.length + " percorsi") +
          tile("#/quiz", "quiz", "Quiz casuali", "Domande e risposte sempre in ordine diverso") +
          (TD.MODO !== "allievo" ? tile("#/quiz-telefono", "phone", "Quiz dal telefono", "Una persona o fino a quattro rispondono dal telefono, domande sul monitor") : "") +
          tile("#/segni", "hand", "Segni e voce", "Video in lingua dei segni e frasi da far leggere") +
          tile("#/esercizi", "target", "Esercizi", "Facile, medio, esperto per ogni lezione") +
          tile("#/allievi", "upload", "App allievi", "Compiti a distanza, correzione automatica") +
          tile("#/clienti", "users", "Clienti", "Schede, registro, compiti, progressi") +
          tile("#/cruscotto", "target", "Cruscotto", "Chi ha bisogno di cosa, oggi") +
          tile("#/documenti", "doc", "Documenti", "Liberatoria, attestati, preventivi, ricevute") +
          tile("#/agenda", "calendar", "Agenda", "Appuntamenti ed esportazione calendario") +
          tile("#/remoto", "screen", "Assistenza a distanza", "Codice e password che si rigenera") +
          (TD.MODO !== "allievo" ? tile("#/statistiche", "layers", "Statistiche", "Ore, incassi, argomenti, progressi") + tile("#/presenze", "print", "Registro presenze", "Foglio mensile per enti e Comuni") : "") +
        "</section>" +

        (prossime.length ? '<section class="block"><div class="block-head"><h2>Prossimi appuntamenti</h2><a href="#/agenda">Agenda completa ' + I("arrow") + '</a></div><ul class="list">' +
          prossime.map(function (x) {
            return '<li><a href="#/cliente/' + x.c.id + '"><span class="when"><strong>' + E(TD.dataIt(x.r.data)) + "</strong>" + E(x.r.ora || "") + "</span><span>" + E(TD.nomeCliente(x.c)) + '<small>' + E(x.r.luogo || "") + "</small></span>" + I("arrow") + "</a></li>";
          }).join("") + "</ul></section>" : "") +

        '<section class="block"><div class="block-head"><h2>I quattro livelli</h2><a href="#/strumenti/test">Test d\'ingresso ' + I("arrow") + "</a></div>" +
          '<div class="levels">' + TD.LIVELLI.map(function (l) {
            return '<a class="level-card liv-' + l.id + '" href="#/percorsi?liv=' + l.id + '"><span class="level-step">' + (l.id + 1) + "</span><h3>" + E(l.nome) + "</h3><p>" + E(l.descr) + '</p><small>' + E(l.ore) + " per percorso</small></a>";
          }).join("") + "</div></section>" +

        '<section class="block"><div class="block-head"><h2>Sei percorsi</h2></div><div class="paths">' +
          TD.PERCORSI.map(function (p) {
            return '<a class="path-card" href="#/percorso/' + p.id + '"><span class="path-ico">' + I(p.icona) + "</span><h3>" + E(p.nome) + "</h3><p>" + E(p.descr) + "</p><small>" + TD.lezioniDi(p.id).length + " lezioni</small></a>";
          }).join("") + "</div></section>" +

        '<section class="block"><div class="block-head"><h2>Dove portare le lezioni</h2><a href="#/idee">Idee per il lavoro ' + I("arrow") + "</a></div>" +
          '<div class="places">' + TD.LUOGHI_ESEMPI.slice(0, 6).map(function (l) { return '<div class="place"><h3>' + E(l.t) + "</h3><p>" + E(l.d) + "</p></div>"; }).join("") + "</div></section>" +
      "</div>";
  });

  function stat(n, label, ic, href) {
    return '<a class="stat" href="' + href + '">' + I(ic) + "<strong>" + E(n) + "</strong><span>" + E(label) + "</span></a>";
  }
  function tile(href, ic, t, d) {
    return '<a class="tile" href="' + href + '"><span class="tile-ico">' + I(ic) + "</span><strong>" + E(t) + "</strong><small>" + E(d) + "</small></a>";
  }
  function scala() {
    return '<svg viewBox="0 0 420 320" class="scala">' +
      '<rect x="20" y="230" width="86" height="72" rx="14" fill="var(--liv0)"/>' +
      '<rect x="116" y="180" width="86" height="122" rx="14" fill="var(--liv1)"/>' +
      '<rect x="212" y="130" width="86" height="172" rx="14" fill="var(--liv2)"/>' +
      '<rect x="308" y="80" width="86" height="222" rx="14" fill="var(--liv3)"/>' +
      '<text x="63" y="275" text-anchor="middle">1</text><text x="159" y="250" text-anchor="middle">2</text><text x="255" y="225" text-anchor="middle">3</text><text x="351" y="200" text-anchor="middle">4</text>' +
      '<path class="scala-cursore" d="M330 8 L330 74 L346 60 L357 84 L369 79 L358 55 L380 54 Z"/>' +
      "</svg>";
  }

  /* ------------------------------------------------------------ PERCORSI */
  TD.rotta("/percorsi", function (app, p, q) {
    const liv = q.liv != null && q.liv !== "" ? Number(q.liv) : null;
    app.innerHTML = TD.intest("Lezioni", "Scegli il percorso e il livello. Ogni lezione ha obiettivi, spiegazione, passi, tre esercizi (facile, medio, esperto) e un compito.") +
      '<div class="wrap">' + filtroLivelli(liv, "#/percorsi") +
      TD.PERCORSI.map(function (pc) {
        const lez = TD.lezioniDi(pc.id, liv);
        return '<section class="block"><div class="block-head"><h2 class="with-ico">' + I(pc.icona) + E(pc.nome) + '</h2><a href="#/percorso/' + pc.id + '">Tutto il percorso ' + I("arrow") + "</a></div>" +
          '<div class="lesson-grid">' + lez.map(cardLezione).join("") + "</div></section>";
      }).join("") + "</div>";
  });

  function filtroLivelli(liv, base) {
    return '<nav class="chips" aria-label="Filtra per livello"><a class="chip' + (liv == null ? " on" : "") + '" href="' + base + '">Tutti i livelli</a>' +
      TD.LIVELLI.map(function (l) { return '<a class="chip liv-' + l.id + (liv === l.id ? " on" : "") + '" href="' + base + "?liv=" + l.id + '">' + E(l.nome) + "</a>"; }).join("") + "</nav>";
  }
  TD.filtroLivelli = filtroLivelli;

  function cardLezione(l) {
    const c = TD.clienteAttivo();
    const fatta = c && (c.completate || []).indexOf(l.id) >= 0;
    return '<a class="lesson-card liv-' + l.liv + (fatta ? " done" : "") + '" href="#/lezione/' + l.id + '">' +
      '<span class="lesson-top">' + TD.badgeLiv(l.liv) + '<span class="mins">' + I("clock") + l.durata + " min</span></span>" +
      "<h3>" + E(l.titolo) + (l.personale ? ' <span class="pill">tua</span>' : "") + "</h3>" +
      "<p>" + E(l.obiettivi[0]) + "</p>" + (fatta ? '<span class="done-mark">' + I("check") + " svolta</span>" : "") + "</a>";
  }
  TD.cardLezione = cardLezione;

  TD.rotta("/percorso/:dev", function (app, p) {
    const pc = TD.percorso(p.dev);
    app.innerHTML = TD.intest('<span class="with-ico">' + I(pc.icona) + E(pc.nome) + "</span>", E(pc.descr)) +
      '<div class="wrap">' + TD.LIVELLI.map(function (l) {
        return '<section class="block level-block liv-' + l.id + '"><div class="block-head"><h2>' + E(l.nome) + '</h2><span class="muted">' + E(l.descr) + "</span></div>" +
          '<div class="lesson-grid">' + TD.lezioniDi(pc.id, l.id).map(cardLezione).join("") + "</div>" +
          '<p class="block-foot"><a class="btn btn-ghost btn-sm" href="#/quiz?dev=' + pc.id + "&liv=" + l.id + '">' + I("quiz") + "Quiz " + E(pc.nome) + " · " + E(l.breve) + "</a></p></section>";
      }).join("") + "</div>";
  });

  /* ------------------------------------------------------------ LEZIONE */
  function testoLezione(l) {
    return l.titolo + ". Obiettivi: " + l.obiettivi.join(". ") + ". " + l.spiegazione.join(" ") + " Passo per passo: " +
      l.passi.map(function (s, i) { return (i + 1) + ", " + s; }).join(". ") + ". Compito: " + l.compito;
  }

  TD.rotta("/lezione/:id", function (app, p) {
    const l = TD.lezione(p.id);
    if (!l) { TD.vai("#/percorsi"); return; }
    const pc = TD.percorso(l.dev), liv = TD.livello(l.liv);
    const tutte = TD.LEZIONI, idx = tutte.indexOf(l);
    const prec = tutte[idx - 1], succ = tutte[idx + 1];
    const c = TD.clienteAttivo();
    const fatta = c && (c.completate || []).indexOf(l.id) >= 0;
    const guide = TD.guidePer(l);

    app.innerHTML =
      '<header class="page-head lesson-head liv-' + l.liv + '"><div class="wrap">' +
        '<p class="crumbs"><a href="#/percorsi">Lezioni</a> › <a href="#/percorso/' + pc.id + '">' + E(pc.nome) + "</a> › " + E(liv.nome) + "</p>" +
        "<h1>" + E(l.titolo) + "</h1>" +
        '<p class="meta">' + TD.badgeLiv(l.liv) + "<span>" + I(pc.icona) + E(pc.nome) + "</span><span>" + I("clock") + l.durata + " minuti</span>" +
          l.digcomp.map(function (a) { return '<span class="dc" title="Area DigComp ' + a + '">DigComp ' + a + " · " + E(TD.DIGCOMP[a]) + "</span>"; }).join("") + "</p>" +
        '<div class="toolbar no-print">' +
          '<button class="btn btn-primary" id="leggi">' + I("speaker") + "Leggi ad alta voce</button>" +
          '<button class="btn" id="stop">' + I("pause") + "Ferma</button>" +
          '<a class="btn" href="#/lavagna/' + l.id + '">' + I("screen") + "Modalità lavagna</a>" +
          '<a class="btn" href="#/segni?lezione=' + E(l.id) + '">' + I("hand") + "Video in LIS</a>" +
          '<button class="btn" id="schedaPdf">' + I("download") + "Scheda PDF</button>" +
          '<a class="btn" href="#/quiz?dev=' + l.dev + "&liv=" + l.liv + '">' + I("quiz") + "Quiz</a>" +
        "</div>" +
      "</div></header>" +
      '<div class="wrap lesson-body">' +
        '<div class="lesson-main">' +
          '<section class="card"><h2>' + I("target") + "Obiettivi</h2><ul class=\"checks\">" + l.obiettivi.map(function (o) { return "<li>" + E(o) + "</li>"; }).join("") + "</ul></section>" +
          '<section class="card"><h2>' + I("bulb") + "Spiegazione</h2>" + l.spiegazione.map(function (s) { return '<p class="read">' + E(s) + "</p>"; }).join("") + "</section>" +
          '<section class="card"><h2>' + I("layers") + "Passo per passo</h2><ol class=\"steps\">" + l.passi.map(function (s) { return "<li><span>" + E(s) + "</span></li>"; }).join("") + "</ol></section>" +
          ((l.immagini || []).length || guide.length ? '<section class="card"><h2>' + I("screen") + "Schermate guida</h2>" + guide.map(function (g) { return TD.guidaHtml(g, true); }).join("") + (guide.length ? '<p class="actions"><a class="btn btn-ghost" href="' + E(TD.linkGuida("", l.id)) + '">' + I("screen") + "Tutte le guide di questa lezione</a></p>" : "") + (l.immagini || []).map(function (im) { return '<figure class="schermata"><img src="' + E(im.src) + '" alt="' + E(im.didascalia || "Schermata della lezione") + '" loading="lazy"><figcaption>' + E(im.didascalia || "") + "</figcaption></figure>"; }).join("") + "</section>" : "") +
          '<section class="card"><h2>' + I("star") + "Esercizi</h2><div class=\"ex-grid\">" +
            ["facile", "medio", "esperto"].map(function (k, i) {
              return '<div class="ex ex-' + k + '"><span class="ex-tag">' + ["Facile", "Medio", "Esperto"][i] + "</span><p>" + E(l.esercizi[k]) + "</p></div>";
            }).join("") + "</div></section>" +
          '<section class="card homework"><h2>' + I("pen") + "Compito a casa</h2><p class=\"read\">" + E(l.compito) + "</p></section>" +
        "</div>" +
        '<aside class="lesson-side no-print">' +
          (TD.MODO === "allievo" ? '<div class="card side-card"><h2>Il mio ripasso</h2><button class="btn btn-primary btn-block" id="ripassata">' + I("check") + ((TD.db.ripassate || []).indexOf(l.id) >= 0 ? "Ripassata ✓" : "Ho ripassato questa lezione") + '</button><a class="btn btn-block" href="#/invia">' + I("upload") + "Scrivi al tutor</a></div>" : "") +
          (TD.MODO === "allievo" ? "" : '<div class="card side-card"><h2>Con il cliente</h2>' +
            '<label class="field"><span>Cliente</span><select id="selCliente">' + TD.opzioniClienti(c ? c.id : "") + "</select></label>" +
            '<button class="btn btn-primary btn-block" id="svolta">' + I("check") + (fatta ? "Già svolta · aggiorna registro" : "Segna come svolta") + "</button>" +
            '<button class="btn btn-block" id="assegna">' + I("pen") + "Assegna il compito</button>" +
            '<p class="muted text-small">«Segna come svolta» aggiunge la lezione al percorso del cliente e al registro di oggi.</p>' +
          "</div>") +
          '<div class="card side-card"><h2>Navigazione</h2>' +
            (prec ? '<a class="side-link" href="#/lezione/' + prec.id + '">' + I("back") + "<span>" + E(prec.titolo) + "</span></a>" : "") +
            (succ ? '<a class="side-link" href="#/lezione/' + succ.id + '"><span>' + E(succ.titolo) + "</span>" + I("arrow") + "</a>" : "") +
          "</div>" +
        "</aside>" +
      "</div>";

    document.getElementById("leggi").onclick = function () { TD.leggi(testoLezione(l)); };
    document.getElementById("stop").onclick = TD.zitto;
    const rip = document.getElementById("ripassata");
    if (rip) rip.onclick = function () {
      TD.db.ripassate = TD.db.ripassate || [];
      if (TD.db.ripassate.indexOf(l.id) < 0) TD.db.ripassate.push(l.id);
      TD.salva(); rip.innerHTML = I("check") + "Ripassata ✓"; TD.toast("Bravo! Lo saprà anche il tutor con il prossimo invio.");
    };
    if (TD.MODO === "allievo") { document.getElementById("leggi").onclick = function () { TD.leggi(testoLezione(l)); }; document.getElementById("stop").onclick = TD.zitto; document.getElementById("schedaPdf").onclick = function () { TD.scaricaPdf(TD.schedaLezione(l), "lezione-" + l.id + ".pdf", { titolo: l.titolo }); }; return; }
    document.getElementById("selCliente").onchange = function () { TD.impostaClienteAttivo(this.value); TD.render(); };
    document.getElementById("svolta").onclick = function () {
      const cl = TD.clienteAttivo(); if (!cl) { TD.toast("Scegli prima il cliente."); return; }
      TD.segnaSvolta(cl, l.id); TD.toast("Lezione registrata per " + TD.nomeCliente(cl) + "."); TD.render();
    };
    document.getElementById("assegna").onclick = function () {
      const cl = TD.clienteAttivo(); if (!cl) { TD.toast("Scegli prima il cliente."); return; }
      TD.assegnaCompito(cl, l.compito, l.id); TD.toast("Compito assegnato a " + TD.nomeCliente(cl) + ".");
    };
    document.getElementById("schedaPdf").onclick = function () { TD.scaricaPdf(TD.schedaLezione(l), "lezione-" + l.id + ".pdf", { titolo: l.titolo, autore: TD.db.profilo.nome }); };
  });

  TD.segnaSvolta = function (cl, lezId) {
    cl.completate = cl.completate || [];
    if (cl.completate.indexOf(lezId) < 0) cl.completate.push(lezId);
    cl.registro = cl.registro || [];
    const oggi = TD.oggi();
    let r = cl.registro.find(function (x) { return x.data === oggi && x.stato !== "pianificata"; });
    if (!r) {
      const pian = cl.registro.find(function (x) { return x.data === oggi && x.stato === "pianificata"; });
      if (pian) { r = pian; r.stato = "svolta"; }
      else { r = { id: TD.uid("r"), data: oggi, ora: new Date().toTimeString().slice(0, 5), durata: 60, luogo: cl.luogo || "", argomenti: [], note: "", importo: "", pagato: false, stato: "svolta", presenti: (cl.partecipanti || []).map(function (x) { return x.id; }) }; cl.registro.push(r); }
    }
    r.argomenti = r.argomenti || [];
    if (r.argomenti.indexOf(lezId) < 0) r.argomenti.push(lezId);
    TD.salva();
  };
  TD.assegnaCompito = function (cl, testo, lezId, scadenza) {
    cl.compiti = cl.compiti || [];
    cl.compiti.push({ id: TD.uid("k"), testo: testo, lezione: lezId || "", assegnato: TD.oggi(), scadenza: scadenza || "", fatto: false, esito: "" });
    TD.salva();
  };

  TD.schedaLezione = function (l) {
    const pc = TD.percorso(l.dev), liv = TD.livello(l.liv);
    const d = new TD.Documento({ titolo: "Scheda lezione · " + l.titolo, piede: "Tutor Digitale · " + (TD.db.profilo.nome || ""), colore: liv.colore });
    d.intestazione(TD.db.profilo, "Scheda della lezione");
    d.piccolo(pc.nome.toUpperCase() + " · " + liv.nome.toUpperCase() + " · " + l.durata + " MINUTI", { peso: 700, colore: liv.colore });
    d.h1(l.titolo);
    d.h2("Obiettivi"); l.obiettivi.forEach(function (o) { d.p("•  " + o, { dopo: 4 }); });
    d.h2("Spiegazione"); l.spiegazione.forEach(function (s) { d.p(s); });
    d.h2("Passo per passo"); l.passi.forEach(function (s, i) { d.p((i + 1) + ".  " + s, { dopo: 6 }); });
    d.h2("Esercizi");
    d.p("Facile — " + l.esercizi.facile); d.p("Medio — " + l.esercizi.medio); d.p("Esperto — " + l.esercizi.esperto);
    d.h2("Compito a casa"); d.p(l.compito);
    d.h2("Appunti"); for (let i = 0; i < 5; i++) d.linea();
    return d.chiudi();
  };

  /* ------------------------------------------------------------ LAVAGNA */
  TD.rotta("/lavagna/:id", function (app, p) {
    const l = TD.lezione(p.id); if (!l) { TD.vai("#/percorsi"); return; }
    const slide = [{ k: "Lezione", t: l.titolo, s: TD.percorso(l.dev).nome + " · " + TD.livello(l.liv).nome }]
      .concat([{ k: "Obiettivi", lista: l.obiettivi }])
      .concat(l.spiegazione.map(function (s) { return { k: "Spiegazione", t: s, piccolo: true }; }))
      .concat(l.passi.map(function (s, i) { return { k: "Passo " + (i + 1) + " di " + l.passi.length, t: s }; }))
      .concat([{ k: "Esercizio facile", t: l.esercizi.facile, piccolo: true }, { k: "Esercizio medio", t: l.esercizi.medio, piccolo: true }, { k: "Esercizio esperto", t: l.esercizi.esperto, piccolo: true }, { k: "Compito a casa", t: l.compito, piccolo: true }]);
    let i = 0;
    document.documentElement.classList.add("board-mode");
    app.innerHTML = '<div class="board liv-' + l.liv + '"><div class="board-slide" id="slide"></div>' +
      '<div class="board-bar"><a class="btn" href="#/lezione/' + l.id + '">' + I("x") + 'Esci</a><button class="btn" id="bPrev">' + I("back") + 'Indietro</button><span id="bPos"></span><button class="btn btn-primary" id="bNext">Avanti ' + I("arrow") + '</button><button class="btn" id="bVoce">' + I("speaker") + 'Leggi</button><button class="btn" id="bFull">' + I("screen") + "Schermo intero</button></div></div>";
    function mostra() {
      const s = slide[i];
      document.getElementById("slide").innerHTML = '<p class="board-k">' + E(s.k) + "</p>" +
        (s.lista ? "<ul>" + s.lista.map(function (x) { return "<li>" + E(x) + "</li>"; }).join("") + "</ul>" : '<p class="board-t' + (s.piccolo ? " small" : "") + '">' + E(s.t) + "</p>") +
        (s.s ? '<p class="board-s">' + E(s.s) + "</p>" : "");
      document.getElementById("bPos").textContent = (i + 1) + " / " + slide.length;
    }
    function vai(d) { i = Math.max(0, Math.min(slide.length - 1, i + d)); TD.zitto(); mostra(); }
    document.getElementById("bPrev").onclick = function () { vai(-1); };
    document.getElementById("bNext").onclick = function () { vai(1); };
    document.getElementById("bVoce").onclick = function () { const s = slide[i]; TD.leggi(s.lista ? s.lista.join(". ") : s.t); };
    document.getElementById("bFull").onclick = function () { const el = document.documentElement; if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen(); else if (document.exitFullscreen) document.exitFullscreen(); };
    function tasti(e) {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); vai(1); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); vai(-1); }
      if (e.key === "Escape") TD.vai("#/lezione/" + l.id);
    }
    document.addEventListener("keydown", tasti);
    app._cleanup = function () { document.removeEventListener("keydown", tasti); document.documentElement.classList.remove("board-mode"); if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); };
    mostra();
  });
})();
