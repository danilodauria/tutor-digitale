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
  function essenziale() { return !!(db().impostazioni || {}).essenziale; }

  function consegna(id) { return (db().consegne || []).find(function (k) { return k.id === id; }); }
  function aperte() { return (db().consegne || []).filter(function (k) { return !k.inviata; }); }
  function nomeBreve() { return db().allievo ? db().allievo.nome.split(" ")[0] : ""; }
  function compitiAperti() {
    let n = 0;
    (db().consegne || []).forEach(function (k) { if (!k.inviata) k.compiti.forEach(function (c) { if (!((k.statoCompiti || {})[c.id] || {}).fatto) n++; }); });
    return n;
  }
  function quizFatto(k) { return k.quiz.length && Object.keys(k.risposte || {}).length >= k.quiz.length; }

  /* ------------------------------------------------------------ scadenze e promemoria */
  function giorni(data) {
    const a = new Date(TD.oggi() + "T12:00:00"), b = new Date(data + "T12:00:00");
    return Math.round((b - a) / 86400000);
  }
  TD.scadenze = function () {
    const out = [];
    (db().consegne || []).forEach(function (k) {
      if (k.inviata) return;
      k.compiti.forEach(function (c) {
        const sc = c.scadenza || k.scadenza;
        if (!sc || ((k.statoCompiti || {})[c.id] || {}).fatto) return;
        out.push({ k: k, testo: c.testo, data: sc, g: giorni(sc) });
      });
      if (k.quiz.length && k.scadenza && !quizFatto(k)) out.push({ k: k, testo: "Quiz di " + k.quiz.length + " domande", data: k.scadenza, g: giorni(k.scadenza) });
      if (k.scadenza && !k.inviata && !out.some(function (x) { return x.k === k; })) out.push({ k: k, testo: "Inviare i compiti al tutor", data: k.scadenza, g: giorni(k.scadenza) });
    });
    return out.sort(function (a, b) { return a.g - b.g; });
  };
  function classe(g) { return g < 0 ? "scaduto" : g === 0 ? "oggi" : g === 1 ? "domani" : "presto"; }
  function quando(g) { return g < 0 ? "scaduto da " + (-g) + (g === -1 ? " giorno" : " giorni") : g === 0 ? "scade oggi" : g === 1 ? "scade domani" : "entro " + g + " giorni"; }
  function listaScadenze(l) {
    return '<ul class="scadenze">' + l.map(function (x) { return '<li class="' + classe(x.g) + '">' + I(x.g <= 0 ? "alert" : "clock") + "<span>" + E(x.testo) + "<small>" + quando(x.g) + " · " + E(TD.dataIt(x.data)) + "</small></span></li>"; }).join("") + "</ul>";
  }

  /* calendario: evento il giorno della scadenza con due avvisi (il giorno prima e la mattina) */
  function icsConsegna(k) {
    const sc = k.scadenza || k.compiti.map(function (c) { return c.scadenza; }).filter(Boolean).sort()[0];
    if (!sc) return null;
    const d = sc.replace(/-/g, "");
    const esc = function (t) { return String(t || "").replace(/[\\;,]/g, function (c) { return "\\" + c; }).replace(/\n/g, "\\n"); };
    const descr = k.compiti.map(function (c) { return "- " + c.testo; }).join("\n") + (k.quiz.length ? "\n- Quiz di " + k.quiz.length + " domande" : "") + "\nApri l'app Tutor Digitale · Allievo e premi «Invia al tutor».";
    const righe = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Danilo D'Auria//Tutor Digitale Allievo//IT", "BEGIN:VEVENT",
      "UID:" + k.id + "@tutor-digitale-allievo", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART:" + d + "T170000", "DTEND:" + d + "T173000", "SUMMARY:" + esc("Compiti per " + ((db().tutor || {}).nome || "il tutor")), "DESCRIPTION:" + esc(descr),
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc("Domani scadono i compiti di Tutor Digitale"), "TRIGGER:-PT24H", "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc("Oggi scadono i compiti di Tutor Digitale"), "TRIGGER:-PT8H", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"];
    return new Blob([righe.join("\r\n")], { type: "text/calendar" });
  }

  /* notifiche: all'apertura dell'app e, dove il sistema lo consente, anche ad app chiusa (Periodic Background Sync) */
  TD.controllaAvvisi = async function () {
    const d = db();
    const imminenti = TD.scadenze().filter(function (x) { return x.g <= 1; });
    try {
      // copia delle scadenze leggibile dal service worker
      const c = await caches.open("tda-promemoria");
      await c.put("scadenze.json", new Response(JSON.stringify({ attivi: !!(d.impostazioni || {}).avvisi, nome: d.allievo ? d.allievo.nome : "", voci: TD.scadenze().map(function (x) { return { testo: x.testo, data: x.data }; }) }), { headers: { "Content-Type": "application/json" } }));
    } catch (e) {}
    if (!(d.impostazioni || {}).avvisi || typeof Notification === "undefined" || Notification.permission !== "granted" || !imminenti.length) return;
    if (d.impostazioni.ultimoAvviso === TD.oggi()) return;
    d.impostazioni.ultimoAvviso = TD.oggi(); TD.salva();
    const testo = imminenti.length === 1 ? imminenti[0].testo + " · " + quando(imminenti[0].g) : imminenti.length + " compiti in scadenza: apri l'app per vederli";
    try { const reg = await navigator.serviceWorker.ready; reg.showNotification("Tutor Digitale · promemoria", { body: testo, icon: "../assets/img/icon-allievo-192.png", badge: "../assets/img/icon-allievo-192.png", tag: "scadenze", data: { url: "./#/compiti" } }); }
    catch (e) { try { new Notification("Tutor Digitale · promemoria", { body: testo }); } catch (x) {} }
  };
  async function attivaAvvisi() {
    if (typeof Notification === "undefined") { TD.toast("Questo dispositivo non mostra notifiche: usa «Aggiungi al calendario»."); return false; }
    const p = await Notification.requestPermission();
    if (p !== "granted") { TD.toast("Notifiche non consentite: puoi attivarle dalle impostazioni del browser."); return false; }
    db().impostazioni.avvisi = true; db().impostazioni.ultimoAvviso = ""; TD.salva();
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.periodicSync) {
        const st = await navigator.permissions.query({ name: "periodic-background-sync" }).catch(function () { return { state: "denied" }; });
        if (st.state === "granted") await reg.periodicSync.register("scadenze", { minInterval: 12 * 60 * 60 * 1000 });
      }
    } catch (e) {}
    await TD.controllaAvvisi();
    TD.toast("Avvisi attivati: ti ricordo le scadenze il giorno prima.");
    return true;
  }

  /* ------------------------------------------------------------ pacchetti */
  TD.apriPacchetto = async function (p) {
    const d = db();
    if (p.tipo === "kit") {
      const a = p.dati.allievo;
      const ver = await TD.scambio.verificaPacchetto(p);
      if (ver.stato === "alterata") { TD.toast("Kit rifiutato: la firma del tutor non corrisponde, il kit è stato modificato. Chiedi al tutor di rimandarlo."); return; }
      if (ver.stato === "valida" && d.chiaveTutor && d.chiaveTutor !== ver.chiave &&
        !TD.conferma("Attenzione: questo kit è firmato da una chiave diversa da quella del tuo tutor (impronta " + ver.impronta + "). Aprilo solo se il tutor ti ha detto che ha cambiato dispositivo. Continuare?")) return;
      if (ver.stato === "assente" && d.chiaveTutor &&
        !TD.conferma("Attenzione: questo kit NON porta la firma digitale del tuo tutor (gli altri la portavano). Potrebbe venire da qualcun altro. Aprilo solo se il tutor ti conferma di avertelo mandato lui. Continuare?")) return;
      if (ver.stato === "valida") { d.chiaveTutor = ver.chiave; d.improntaTutor = ver.impronta; }
      d.ultimaVerifica = ver.stato;
      if (d.allievo && d.allievo.clienteId !== a.clienteId && !TD.conferma("Questa app è di " + d.allievo.nome + ". Sostituire con il profilo di " + a.nome + "? I compiti attuali verranno tolti.")) return;
      if (d.allievo && d.allievo.clienteId !== a.clienteId) d.consegne = [];
      d.allievo = a; d.tutor = p.dati.tutor; d.segreto = p.dati.segreto;
      d.profilo = Object.assign({}, d.profilo, { nome: p.dati.tutor.nome || "", qualifica: p.dati.tutor.qualifica || "", email: p.dati.tutor.email || "", telefono: p.dati.tutor.telefono || "" });
      if (p.dati.percorso && Array.isArray(p.dati.percorso.incontri)) d.percorso = { nome: String(p.dati.percorso.nome || "Il mio percorso").slice(0, 120), descr: String(p.dati.percorso.descr || "").slice(0, 600),
        incontri: p.dati.percorso.incontri.slice(0, 40).map(function (inc) { return { titolo: String((inc && inc.titolo) || "").slice(0, 120), lezioni: (inc && Array.isArray(inc.lezioni) ? inc.lezioni : []).filter(TD.idOk).slice(0, 20) }; }) };
      if (p.dati.casella && TD.idOk(p.dati.casella.stanza) && /^[A-Za-z0-9_-]{43}$/.test(String(p.dati.casella.chiave || ""))) d.casella = { stanza: p.dati.casella.stanza, chiave: p.dati.casella.chiave };
      if (p.dati.marchio) { d.marchio = { nome: String(p.dati.marchio.nome || "").slice(0, 40), colore: /^#[0-9a-f]{6}$/i.test(p.dati.marchio.colore || "") ? p.dati.marchio.colore : "" }; if (TD.applicaMarchio) TD.applicaMarchio(); }
      if ((p.dati.lezioniPersonali || []).length) {
        d.personali = d.personali || { lezioni: [], domande: [] };
        p.dati.lezioniPersonali.slice(0, 60).map(TD.lezioneSicura).filter(Boolean).forEach(function (l) { d.personali.lezioni = d.personali.lezioni.filter(function (x) { return x.id !== l.id; }).concat([l]); });
        if (TD.applicaPersonali) TD.applicaPersonali();
      }
      const k = p.dati.consegna;
      d.consegne = (d.consegne || []).filter(function (x) { return x.id !== k.id; });
      d.consegne.push(Object.assign({ risposte: {}, statoCompiti: {}, inviata: false, correzione: null, ricevuta: new Date().toISOString() }, k));
      TD.salva();
      TD.toast((d.ultimaVerifica === "valida" ? "Kit verificato ✓ " : "") + "Benvenuto " + a.nome.split(" ")[0] + "! " + (k.compiti.length || k.quiz.length ? "Hai nuovi compiti." : ""));
      TD.vai("#/");
      return;
    }
    if (p.tipo === "correzione") {
      const firma = await TD.scambio.verifica(p, d.segreto);
      if (firma === false || (firma !== true && TD.scambio.sicuro && d.segreto)) { TD.toast("La correzione non risulta firmata dal tuo tutor."); return; }
      const ver = await TD.scambio.verificaPacchetto(p);
      if (ver.stato === "alterata" || (ver.stato === "valida" && d.chiaveTutor && d.chiaveTutor !== ver.chiave)) { TD.toast("La correzione non porta la firma digitale del tuo tutor: non la apro."); return; }
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
    const devs = (d.allievo.dispositivi || []).length ? d.allievo.dispositivi : TD.PERCORSI.map(function (p) { return p.id; });
    if (essenziale()) { homeEssenziale(app, d, t, ap, nc, nuoveCorr); return; }
    app.innerHTML =
      '<section class="hero allievo-hero"><div class="wrap">' +
        '<p class="hero-kicker"><span class="spia" data-spia><i></i><span class="spia-testo">Online</span></span>' + (d.allievo.ente ? E(d.allievo.ente) : "Il tuo spazio per imparare") + "</p>" +
        "<h1>Ciao, " + E(nomeBreve()) + "!</h1>" +
        '<p class="hero-lead">' + (ap.length ? "Hai <strong>" + (nc ? nc + " compit" + (nc === 1 ? "o" : "i") : "") + (nc && ap.some(function (k) { return k.quiz.length && !quizFatto(k); }) ? " e " : "") + (ap.some(function (k) { return k.quiz.length && !quizFatto(k); }) ? "un quiz" : "") + "</strong> da fare." : "Niente compiti in sospeso: puoi ripassare le lezioni o allenarti.") + "</p>" +
        '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/compiti">' + I("pen") + "I miei compiti</a>" + (ap.length ? '<a class="btn btn-lg" href="#/invia">' + I("upload") + "Invia al tutor</a>" : "") + "</div>" +
      "</div></section>" +
      '<div class="wrap">' +
        (TD.scadenze().length ? '<section class="card"><div class="block-head"><h2>' + I("clock") + 'Scadenze</h2><a href="#/compiti">Vai ai compiti ' + I("arrow") + "</a></div>" + listaScadenze(TD.scadenze().slice(0, 4)) +
          (!(d.impostazioni || {}).avvisi && typeof Notification !== "undefined" ? '<div class="actions"><button class="btn btn-sm" id="attAvvisi">' + I("alert") + "Avvisami il giorno prima</button></div>" : "") + "</section>" : "") +
        (nuoveCorr.length ? '<a class="note-box ok-box" href="#/correzione/' + E(nuoveCorr[0].id) + '">' + I("award") + "<div><strong>È arrivata la correzione dei compiti del " + E(TD.dataIt(nuoveCorr[0].data)) + "</strong><br>Tocca per vedere com'è andata.</div></a>" : "") +
        '<section class="tiles">' +
          tile("#/compiti", "pen", "Compiti", nc ? nc + " da fare" : "Tutto fatto") +
          tile("#/percorsi", "book", "Lezioni", "Ripassa quando vuoi") +
          tile("#/quiz", "quiz", "Allenamento", "Quiz sempre diversi") +
          tile("#/palestra", "mouse", "Palestra", "Mouse, tastiera, truffe") +
          tile("#/invia", "upload", "Invia al tutor", "Compiti e messaggi") +
          tile("#/ricevi", "download", "Ricevi dal tutor", "Nuovi compiti e correzioni") +
          tile("#/remoto", "screen", "Aiuto a distanza", "Codice e password") +
          tile("#/info", "user", "Il mio profilo", "Dati e copia di sicurezza") +
          (d.percorso ? tile("#/mio-percorso", "layers", "Il mio percorso", d.percorso.nome) : "") +
          tile("#/aula", "users", "Aula", "Quiz di gruppo con la TV") +
          tile("#/segni", "hand", "Segni e voce", "Video in LIS e frasi da leggere") +
          (d.casella ? tile("#/casella", "lock", "Casella", "Note e password dal tutor") : "") +
          tile("#/assistente", "speaker", "Chiedi all'assistente", "A voce o scrivendo") +
        "</section>" +
        '<section class="block"><div class="block-head"><h2>Le mie lezioni</h2></div><div class="paths">' + devs.map(function (id) {
          const p = TD.percorso(id), liv = (d.allievo.livelli || {})[id] || 0;
          return '<a class="path-card" href="#/percorso/' + id + '"><span class="path-ico">' + I(p.icona) + "</span><h3>" + E(p.nome) + "</h3><p>" + TD.badgeLiv(liv) + "</p></a>";
        }).join("") + "</div></section>" +
        '<section class="card tutor-card"><h2>' + I("user") + "Il tuo tutor</h2><p><strong>" + E(t.nome || "") + "</strong>" + (t.qualifica ? " · " + E(t.qualifica) : "") + "</p><p>" +
          (t.telefono ? '<a class="btn" href="tel:' + E(t.telefono) + '">' + I("phone") + E(t.telefono) + "</a> " : "") +
          (t.email ? '<a class="btn" href="mailto:' + E(t.email) + '">' + I("doc") + E(t.email) + "</a>" : "") + "</p></section>" +
        '<div class="actions"><button class="btn btn-ghost" id="attEssenziale">' + I("eye") + "Modalità essenziale: mostra solo l'essenziale</button></div>" +
      "</div>";
    dopoHome();
  });
  function homeEssenziale(app, d, t, ap, nc, nuoveCorr) {
    const sc = TD.scadenze().slice(0, 3);
    app.innerHTML =
      '<section class="hero allievo-hero"><div class="wrap">' +
        '<p class="hero-kicker"><span class="spia" data-spia><i></i><span class="spia-testo">Online</span></span>' + (d.allievo.ente ? E(d.allievo.ente) : "Il tuo spazio per imparare") + "</p>" +
        "<h1>Ciao, " + E(nomeBreve()) + "!</h1>" +
        '<p class="hero-lead">' + (nc ? "Hai <strong>" + nc + " compit" + (nc === 1 ? "o" : "i") + "</strong> da fare." : (sc.length ? "Il prossimo impegno: <strong>" + E(sc[0].testo) + "</strong> · " + quando(sc[0].g) + "." : "Niente compiti in sospeso: scegli cosa vuoi fare.")) + "</p>" +
        '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/compiti">' + I("pen") + "I miei compiti</a>" + (ap.length ? '<a class="btn btn-lg" href="#/invia">' + I("upload") + "Invia al tutor</a>" : "") + "</div>" +
      "</div></section>" +
      '<div class="wrap">' +
        (nuoveCorr.length ? '<a class="note-box ok-box" href="#/correzione/' + E(nuoveCorr[0].id) + '">' + I("award") + "<div><strong>È arrivata la correzione dei compiti del " + E(TD.dataIt(nuoveCorr[0].data)) + "</strong><br>Tocca per vedere com'è andata.</div></a>" : "") +
        '<section class="tiles tiles-essenziali">' +
          tile("#/compiti", "pen", "Compiti", nc ? nc + " da fare" : "Tutto fatto") +
          tile("#/percorsi", "book", "Lezioni", "Ripassa quando vuoi") +
          tile("#/remoto", "screen", "Aiuto", "Codice e password") +
          tile("#/info", "user", "Il mio profilo", "Dati e impostazioni") +
        "</section>" +
        (sc.length ? '<section class="card"><h2>' + I("clock") + "Prossime scadenze</h2>" + listaScadenze(sc) + '<div class="actions"><a class="btn btn-sm" href="#/compiti">Tutti i compiti</a></div></section>' : "") +
        '<section class="card tutor-card"><h2>' + I("user") + "Il tuo tutor</h2><p><strong>" + E(t.nome || "") + "</strong>" + (t.qualifica ? " · " + E(t.qualifica) : "") + "</p>" +
          ((t.telefono || t.email) ? '<div class="actions">' + (t.telefono ? '<a class="btn btn-primary" href="tel:' + E(t.telefono) + '">' + I("phone") + "Chiama</a>" : "") + (t.email ? '<a class="btn" href="mailto:' + E(t.email) + '">' + I("doc") + "Scrivi</a>" : "") + "</div>" : '<p class="muted">Chiedi al tutor i suoi contatti.</p>') + "</section>" +
        '<div class="actions"><button class="btn btn-ghost" id="mostraTutto">' + I("layers") + "Mostra tutte le funzioni</button></div>" +
      "</div>";
    dopoHome();
  }
  function dopoHome() {
    const b = document.getElementById("attAvvisi");
    if (b) b.onclick = function () { attivaAvvisi().then(function (ok) { if (ok) TD.render(); }); };
    const ae = document.getElementById("attEssenziale");
    if (ae) ae.onclick = function () { db().impostazioni.essenziale = true; TD.salva(); TD.render(); };
    const mt = document.getElementById("mostraTutto");
    if (mt) mt.onclick = function () { db().impostazioni.essenziale = false; TD.salva(); TD.render(); };
    TD.controllaAvvisi();
  }
  function tile(h, ic, t, d) { return '<a class="tile" href="' + h + '"><span class="tile-ico">' + I(ic) + "</span><strong>" + E(t) + "</strong><small>" + E(d) + "</small></a>"; }

  function benvenuto(app) {
    app.innerHTML = '<section class="hero"><div class="wrap"><p class="hero-kicker"><span class="spia" data-spia><i></i><span class="spia-testo">Online</span></span> Tutor Digitale · Allievo</p>' +
      "<h1>Benvenuto!</h1><p class=\"hero-lead\">Questa è l'app per chi segue le lezioni di Tutor Digitale. Per personalizzarla apri il <strong>link</strong> o il <strong>file</strong> che ti ha mandato il tuo tutor.</p></div></section>" +
      '<div class="wrap"><div class="grid-2">' + importatore("Attiva l'app") +
      '<section class="card"><h2>' + I("book") + "Intanto puoi</h2><div class=\"action-list\">" +
        '<a class="action" href="#/percorsi">' + I("book") + "<span><strong>Guardare le lezioni</strong><small>" + TD.LEZIONI.length + " lezioni, dai primi passi a esperto</small></span>" + I("arrow") + "</a>" +
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
            return '<li class="' + (s.fatto ? "done" : "") + '"><label class="check"><input type="checkbox" data-k="' + k.id + '" data-c="' + c.id + '"' + (s.fatto ? " checked" : "") + (k.inviata ? " disabled" : "") + "> <span>" + E(c.testo) + (c.lezione ? ' <a href="#/lezione/' + E(c.lezione) + '">rivedi la lezione</a>' : "") + "</span></label>" +
              (k.inviata ? (s.nota ? "<small>" + E(s.nota) + "</small>" : "") : '<input class="nota" data-nk="' + k.id + '" data-nc="' + c.id + '" placeholder="Com\'è andata? (facoltativo)" value="' + E(s.nota || "") + '">') + "</li>";
          }).join("") + "</ul>" : "") +
          (k.quiz.length ? '<div class="actions">' + (k.inviata ? "" : '<a class="btn ' + (fatto ? "" : "btn-primary") + '" href="#/consegna/' + k.id + '">' + I("quiz") + (fatto ? "Rivedi il quiz" : "Fai il quiz (" + k.quiz.length + " domande)") + "</a>") + (fatto ? '<span class="pill ok">' + I("check") + "Quiz completato</span>" : "") + "</div>" : "") +
          (k.inviata ? "" : '<div class="actions"><a class="btn btn-primary" href="#/invia?c=' + k.id + '">' + I("upload") + "Invia al tutor</a>" + (icsConsegna(k) ? '<button class="btn" data-cal="' + k.id + '">' + I("calendar") + "Promemoria nel calendario</button>" : "") + "</div>") + "</section>";
      }).join("") : '<div class="card empty"><p>Nessun compito per ora.</p><a class="btn" href="#/ricevi">Ricevi dal tutor</a></div>') + "</div>";
    app.querySelectorAll("[data-k]").forEach(function (cb) {
      cb.onchange = function () {
        const k = consegna(cb.dataset.k); k.statoCompiti = k.statoCompiti || {};
        k.statoCompiti[cb.dataset.c] = Object.assign({}, k.statoCompiti[cb.dataset.c], { fatto: cb.checked });
        TD.salva(); cb.closest("li").classList.toggle("done", cb.checked); TD.controllaAvvisi();
      };
    });
    app.querySelectorAll("[data-cal]").forEach(function (b) {
      b.onclick = function () { const k = consegna(b.dataset.cal); TD.scarica(icsConsegna(k), "promemoria-compiti-" + k.data + ".ics"); TD.toast("Apri il file scaricato: il promemoria entra nel calendario del telefono o del computer, con l'avviso il giorno prima."); };
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
      ((c.compiti || []).some(function (x) { return x.esito; }) || (c.allegati || []).length ? '<section class="card"><h2>' + I("pen") + "I tuoi compiti pratici</h2><ul class=\"task-list\">" +
        (c.compiti || []).filter(function (x) { return x.esito; }).map(function (x) { return "<li><span class=\"check\">" + I(x.esito === "approvato" ? "check" : "x") + "<span>" + E(x.testo || "") + '<small class="' + (x.esito === "approvato" ? "esito-ok" : "esito-ko") + '">' + (x.esito === "approvato" ? "Approvato" : "Da rifare: lo ritroverai nei prossimi compiti") + "</small>" + (x.nota ? "<small>" + E(x.nota) + "</small>" : "") + "</span></span></li>"; }).join("") +
        (c.allegati || []).map(function (a) { return "<li><span class=\"check\">" + I(a.esito === "approvato" ? "check" : "x") + "<span>Foto «" + E(a.nome) + '»<small class="' + (a.esito === "approvato" ? "esito-ok" : "esito-ko") + '">' + (a.esito === "approvato" ? "Approvata" : "Da rifare") + "</small>" + (a.nota ? "<small>" + E(a.nota) + "</small>" : "") + "</span></span></li>"; }).join("") +
        "</ul></section>" : "") +
      (e ? '<section class="block"><h2>Domanda per domanda</h2><ol class="review">' + e.dettagli.map(function (x) {
        return '<li class="' + (x.ok ? "ok" : "ko") + '"><span class="rv-mark">' + I(x.ok ? "check" : "x") + "</span><div><p><strong>" + E(x.testo) + "</strong>" + (x.proposta ? " — «" + E(x.proposta) + "»" : "") + "</p><p>La tua risposta: " + E(x.data || "—") + "</p>" + (x.ok ? "" : "<p>Giusta: <strong>" + E(x.giusta) + "</strong></p>") + '<p class="muted">' + E(x.spiegazione) + "</p></div></li>";
      }).join("") + "</ol></section>" : "") +
      '<div class="actions"><a class="btn btn-primary" href="#/compiti">Torna ai compiti</a><a class="btn" href="#/quiz">Allenati ancora</a></div></div>';
  });

  /* ------------------------------------------------------------ il mio percorso (7) */
  TD.rotta("/mio-percorso", function (app) {
    const d = db(), p = d.percorso;
    if (!p) { app.innerHTML = '<div class="wrap"><div class="card"><h1>Il mio percorso</h1><p>Il tutor non ti ha ancora assegnato un percorso.</p><a class="btn" href="#/">Torna all\'inizio</a></div></div>'; return; }
    const rip = d.ripassate || [];
    const tutte = []; p.incontri.forEach(function (inc) { (inc.lezioni || []).forEach(function (id) { if (tutte.indexOf(id) < 0 && TD.lezione(id)) tutte.push(id); }); });
    const fatte = tutte.filter(function (id) { return rip.indexOf(id) >= 0; }).length;
    app.innerHTML = TD.intest(E(p.nome), E(p.descr || "Le lezioni del tuo percorso, incontro per incontro."), TD.barra(fatte, tutte.length) + '<p class="muted text-small">' + fatte + " lezioni ripassate su " + tutte.length + "</p>") +
      '<div class="wrap"><ol class="pm-incontri allievo">' + p.incontri.map(function (inc, i) {
        const lez = (inc.lezioni || []).filter(function (id) { return TD.lezione(id); });
        const ok = lez.length && lez.every(function (id) { return rip.indexOf(id) >= 0; });
        return '<li class="card' + (ok ? " fatto" : "") + '"><h2>' + (ok ? I("check") : "") + "Incontro " + (i + 1) + " · " + E(inc.titolo) + '</h2><ul class="list">' + lez.map(function (id) {
          const l = TD.lezione(id);
          return '<li><a href="#/lezione/' + E(id) + '"><span>' + E(l.titolo) + "<small>" + (rip.indexOf(id) >= 0 ? "ripassata ✓" : "da ripassare") + "</small></span>" + I("arrow") + "</a></li>";
        }).join("") + "</ul></li>";
      }).join("") + "</ol></div>";
  });

  /* ------------------------------------------------------------ profilo */
  TD.rotta("/info", function (app) {
    const d = db();
    const media = (d.allenamenti || []).length ? Math.round(d.allenamenti.reduce(function (s, x) { return s + x.perc; }, 0) / d.allenamenti.length) : null;
    app.innerHTML = TD.intest("Il mio profilo", "Tutto resta su questo dispositivo.") +
      '<div class="wrap"><div class="grid-2">' +
        '<section class="card"><h2>' + I("user") + "Io</h2>" + (d.allievo ? '<dl class="dl"><dt>Nome</dt><dd>' + E(d.allievo.nome) + "</dd>" + (d.allievo.ente ? "<dt>Gruppo</dt><dd>" + E(d.allievo.ente) + "</dd>" : "") + "<dt>Tutor</dt><dd>" + E((d.tutor || {}).nome || "") + "</dd>" + (d.improntaTutor ? "<dt>Firma del tutor</dt><dd>" + I("check") + " verificata · impronta <code>" + E(d.improntaTutor) + "</code></dd>" : "") + "<dt>Lezioni ripassate</dt><dd>" + (d.ripassate || []).length + "</dd><dt>Allenamenti</dt><dd>" + (d.allenamenti || []).length + (media == null ? "" : " · media " + media + "%") + "</dd></dl>" : "<p>App non ancora attivata.</p>") + "</section>" +
        '<section class="card"><h2>' + I("download") + 'Copia di sicurezza</h2><p>Se cambi telefono o computer, salva la copia e aprila sul nuovo dispositivo.</p><div class="actions"><button class="btn btn-primary" id="exp">' + I("download") + 'Salva copia</button><label class="btn">' + I("upload") + 'Ripristina<input type="file" id="imp" accept=".json" hidden></label><button class="btn btn-danger" id="del">' + I("trash") + "Azzera l'app</button></div></section>" +
        '<section class="card"><h2>' + I("alert") + 'Promemoria</h2><p>' + ((d.impostazioni || {}).avvisi ? "Gli avvisi delle scadenze sono attivi." : "Ricevi un avviso il giorno prima della scadenza dei compiti.") + '</p><div class="actions">' + ((d.impostazioni || {}).avvisi ? '<button class="btn" id="disAvvisi">Disattiva gli avvisi</button>' : '<button class="btn btn-primary" id="attAvvisi2">' + I("alert") + "Attiva gli avvisi</button>") + '</div><p class="muted text-small">Sui telefoni dove le notifiche non arrivano ad app chiusa, usa «Promemoria nel calendario» nei compiti: il calendario avvisa sempre.</p></section>' +
        TD.cardAccessibilita() +
        '<section class="card"><h2>' + I("eye") + 'Lettura comoda</h2><p>Usa il pulsante <strong>Aa</strong> in alto per ingrandire i caratteri e il sole/luna per il tema scuro. Nelle lezioni c\'è «Leggi ad alta voce».</p></section>' +
        '<section class="card"><h2>' + I("layers") + 'Modalità essenziale</h2><p>' + ((d.impostazioni || {}).essenziale ? "È attiva: la home mostra solo compiti, lezioni, aiuto e profilo, con azioni grandi." : "Una home con quattro azioni grandi, per chi si confonde tra troppi pulsanti.") + '</p><div class="actions"><button class="btn" id="toggleEss">' + ((d.impostazioni || {}).essenziale ? "Mostra tutte le funzioni" : "Attiva la modalità essenziale") + "</button></div></section>" +
        '<section class="card"><h2>' + I("info") + 'Informazioni</h2><p>Tutor Digitale · Allievo, versione ' + TD.VERSIONE + '. Ideato e sviluppato da Danilo D\'Auria. Codice MIT, contenuti CC BY-NC-SA 4.0.</p><p><a href="../#/licenze">Licenze</a> · <a href="../#/installa">Come si installa</a></p></section>' +
      "</div></div>";
    TD.collegaAccessibilita();
    const a2 = document.getElementById("attAvvisi2"); if (a2) a2.onclick = function () { attivaAvvisi().then(function () { TD.render(); }); };
    const d2 = document.getElementById("disAvvisi"); if (d2) d2.onclick = function () { d.impostazioni.avvisi = false; TD.salva(); TD.controllaAvvisi(); TD.render(); };
    const te = document.getElementById("toggleEss"); if (te) te.onclick = function () { d.impostazioni.essenziale = !d.impostazioni.essenziale; TD.salva(); TD.render(); };
    document.getElementById("exp").onclick = function () { TD.scarica(new Blob([JSON.stringify(TD.db)], { type: "application/json" }), "tutor-digitale-allievo-copia_" + TD.oggi() + ".json"); };
    document.getElementById("imp").onchange = function () {
      const r = new FileReader(); r.onload = function () { try { const o = TD.jsonSicuro(r.result); if (!("consegne" in o)) throw 0; TD.db = o; TD.salva(); TD.toast("Copia ripristinata."); TD.vai("#/"); } catch (e) { TD.toast("Non è una copia valida."); } }; r.readAsText(this.files[0]);
    };
    document.getElementById("del").onclick = function () { if (TD.conferma("Cancellare profilo, compiti e risultati da questo dispositivo?")) { TD.azzera(); TD.vai("#/"); } };
  });

  TD.clienteAttivo = TD.clienteAttivo || function () { return null; };
})();
