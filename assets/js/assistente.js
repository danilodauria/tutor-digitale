/* ==========================================================================
   Tutor Digitale · assistente vocale (miglioria 15)
   L'allievo (o il tutor) chiede a voce o scrivendo «come si fa a…» e
   l'assistente risponde cercando nelle lezioni, nelle schermate guida, nel
   glossario e nelle domande frequenti, tutto sul dispositivo: la ricerca e la
   risposta funzionano senza Internet. La risposta si legge anche ad alta voce.
   Il microfono usa il riconoscimento vocale del browser, che su alcuni
   dispositivi passa da Internet: senza rete si scrive la domanda.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;

  const VUOTE = new Set(("a ad al alla alle allo agli ai anche che chi ci come con cosa da dal dalla dalle dei del della delle dello di e ed fa fare faccio fai " +
    "gli ha hai ho i il in io la le li lo ma mi mio mia ne nel nella non o per perche piu po puo posso posso puoi qual quale quando quanto se si sia sono su sul sulla " +
    "suo sua tra tu tuo un una uno vorrei voglio devo dove essere e' c'e serve servono riesco riuscire sapere spiegami spiega dimmi aiuto aiutami grazie ciao mio miei mie modo").split(" "));
  function parole(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").split(" ")
      .filter(function (w) { return w.length > 1 && !VUOTE.has(w); })
      .map(function (w) { return w.length > 5 ? w.slice(0, 5) : w; });
  }

  /* domande frequenti sull'uso del programma */
  const FAQ = [
    { q: "installare app allievo telefono tablet schermata home", r: "Apri il link del tutor con Chrome (Android) o Safari (iPhone), poi «Installa app» o «Aggiungi alla schermata Home». C'è una guida illustrata.", link: "#/guida/g-installa-android" },
    { q: "inviare mandare compiti tutor risposte consegna", r: "Fai i compiti e il quiz, poi tocca «Invia al tutor»: puoi mandarli con WhatsApp, email, un codice o durante l'assistenza a distanza.", link: "#/invia", solo: "allievo" },
    { q: "ricevere kit nuovi compiti correzione aprire file", r: "Apri il link che ti ha mandato il tutor, oppure «Ricevi dal tutor» e scegli il file ricevuto.", link: "#/ricevi", solo: "allievo" },
    { q: "aiuto distanza vedere schermo tutor codice password", r: "Apri «Aiuto a distanza», manda il codice al tutor e scrivi la password di 6 cifre che ti detta: vedrà il tuo schermo.", link: "#/remoto" },
    { q: "promemoria scadenze avvisi notifiche calendario", r: "Nella home c'è il riquadro «Scadenze»: tocca «Avvisami il giorno prima» o aggiungi il promemoria al calendario del telefono.", link: "#/compiti", solo: "allievo" },
    { q: "caratteri grandi leggere meglio ingrandire testo", r: "Tocca il pulsante «Aa» in alto per ingrandire i caratteri. Nelle impostazioni del profilo c'è anche il contrasto elevato.", link: "#/info" },
    { q: "backup copia sicurezza salvare dati", r: "Fai un backup cifrato: Impostazioni › «Backup cifrato con password», e tieni il file anche su una chiavetta.", link: "#/impostazioni", solo: "tutor" },
    { q: "fattura elettronica xml partita iva", r: "Documenti › Preventivo o ricevuta › tipo «Fattura elettronica»: il programma crea il file XML e il PDF di cortesia.", link: "#/preventivo", solo: "tutor" },
    { q: "attestato verifica qr codice", r: "L'attestato si rilascia dalla scheda cliente › Attestato; il QR in alto a destra porta alla pagina di verifica.", link: "#/documenti", solo: "tutor" },
    { q: "aula gruppo tv quiz telefoni insieme", r: "Altro › Modalità gruppo in aula: la domanda va sulla TV e i partecipanti rispondono dal telefono inquadrando il QR.", link: "#/aula" },
    { q: "casella password nota file tutor condivisa", r: "La casella condivisa serve a lasciarsi note, password con scadenza e piccoli file in modo cifrato.", link: TD.MODO === "allievo" ? "#/casella" : "#/clienti" },
    { q: "truffa sms messaggio strano link sospetto phishing", r: "Non toccare il link e non dare mai codici o dati della carta. Guarda la guida «Riconoscere un SMS truffa».", link: "#/guida/g-sms-truffa" },
    { q: "spid cie app io fascicolo sanitario", r: "Ne parla la lezione sui servizi pubblici in tasca: SPID, CIE, app IO e Fascicolo sanitario.", link: "#/lezione/smartphone-2-1" }
  ];

  /* indice costruito una volta, all'apertura */
  let INDICE = null;
  function costruisci() {
    const doc = [];
    TD.LEZIONI.forEach(function (l) {
      doc.push({ tipo: "lezione", id: l.id, titolo: l.titolo, link: "#/lezione/" + l.id, l: l,
        campi: [[l.titolo, 3], [l.obiettivi.join(" "), 2], [l.passi.join(" "), 1.2], [(l.spiegazione || []).join(" "), 1], [l.compito, 0.6]] });
    });
    (TD.GUIDE || []).forEach(function (g) {
      doc.push({ tipo: "guida", id: g.id, titolo: g.titolo, link: "#/guida/" + g.id, g: g, campi: [[g.titolo + " " + g.dispositivo, 3], [g.passi.map(function (x) { return x[2]; }).join(" "), 1.2]] });
    });
    (TD.GLOSSARIO || []).forEach(function (x) { doc.push({ tipo: "glossario", titolo: x[1], testo: x[2], campi: [[x[1], 4], [x[2], 1]] }); });
    FAQ.filter(function (f) { return !f.solo || f.solo === (TD.MODO === "allievo" ? "allievo" : "tutor"); }).forEach(function (f) { doc.push({ tipo: "faq", titolo: f.r, testo: f.r, link: f.link, campi: [[f.q, 3], [f.r, 1]] }); });
    const df = {};
    doc.forEach(function (d) {
      d.tf = {};
      d.campi.forEach(function (c) { parole(c[0]).forEach(function (w) { d.tf[w] = (d.tf[w] || 0) + c[1]; }); });
      Object.keys(d.tf).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
    });
    INDICE = { doc: doc, df: df, n: doc.length };
  }
  TD.assistenteCerca = function (domanda, quanti) {
    if (!INDICE || INDICE.n !== TD.LEZIONI.length + (TD.GUIDE || []).length + (TD.GLOSSARIO || []).length + FAQ.filter(function (f) { return !f.solo || f.solo === (TD.MODO === "allievo" ? "allievo" : "tutor"); }).length) costruisci();
    const q = Array.from(new Set(parole(domanda)));
    if (!q.length) return [];
    return INDICE.doc.map(function (d) {
      let s = 0, presi = 0;
      q.forEach(function (w) { if (d.tf[w]) { presi++; s += Math.log(1 + INDICE.n / INDICE.df[w]) * Math.min(d.tf[w], 6); } });
      return { d: d, s: s * (0.5 + presi / q.length) };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, quanti || 3).map(function (x) { return x.d; });
  };
  TD.assistenteRisposta = function (domanda) {
    const r = TD.assistenteCerca(domanda, 4);
    if (!r.length) return { testo: "Non ho trovato niente su questo. Prova con altre parole, per esempio «come mando una foto su WhatsApp», oppure chiedi al tuo tutor.", risultati: [] };
    const p = r[0];
    let testo;
    if (p.tipo === "lezione") testo = "Ne parla la lezione «" + p.titolo + "». " + ((p.l.spiegazione || [])[0] || "") + " I passi: " + p.l.passi.slice(0, 5).map(function (x, i) { return (i + 1) + ") " + x; }).join("; ") + ".";
    else if (p.tipo === "guida") testo = "C'è una guida illustrata: «" + p.titolo + "». " + p.g.passi.map(function (x, i) { return (i + 1) + ") " + x[2]; }).join(" ");
    else if (p.tipo === "glossario") testo = "«" + p.titolo + "»: " + p.testo + ".";
    else testo = p.testo;
    return { testo: testo, risultati: r };
  };

  const A = { storia: [], ascolto: null };
  TD.rotta("/assistente", function (app) {
    const Ric = window.SpeechRecognition || window.webkitSpeechRecognition;
    function disegna() {
      app.innerHTML = TD.intest("Chiedi all'assistente", "Fai una domanda a voce o scrivendo: «come mando una foto su WhatsApp?», «cosa vuol dire Wi-Fi?». La risposta arriva dalle lezioni, sul dispositivo.") +
        '<div class="wrap assistente">' +
        '<form class="card form" id="asForm"><label class="field"><span>La tua domanda</span><input name="d" id="asD" autocomplete="off" placeholder="Es. Come faccio a ingrandire i caratteri?" required></label>' +
          '<div class="actions">' + (Ric ? '<button type="button" class="btn btn-lg' + (A.ascolto ? " btn-primary" : "") + '" id="asMic" aria-pressed="' + !!A.ascolto + '">' + I("speaker") + (A.ascolto ? "Ti ascolto… tocca per fermare" : "Parla") + "</button>" : "") + '<button class="btn btn-primary btn-lg" type="submit">' + I("arrow") + 'Chiedi</button><button type="button" class="btn" id="asZitto">' + I("pause") + "Silenzio</button></div>" +
          (Ric ? '<p class="muted text-small">Il microfono usa il riconoscimento vocale del browser, che su alcuni dispositivi ha bisogno di Internet. Senza rete puoi sempre scrivere: la risposta viene trovata qui.</p>' : '<p class="muted text-small">Questo browser non riconosce la voce: scrivi la domanda. La risposta viene comunque letta ad alta voce.</p>') + "</form>" +
        '<div aria-live="polite">' + A.storia.map(function (x) {
          return '<section class="card as-scambio"><p class="as-domanda">' + I("user") + " " + E(x.d) + '</p><p class="read">' + E(x.r.testo) + "</p>" +
            (x.r.risultati.length ? '<div class="actions">' + x.r.risultati.filter(function (d) { return d.link; }).slice(0, 3).map(function (d) { return '<a class="btn btn-sm" href="' + d.link + '">' + I(d.tipo === "guida" ? "screen" : d.tipo === "lezione" ? "book" : "info") + E(d.tipo === "faq" ? "Apri" : d.titolo) + "</a>"; }).join("") + '<button class="btn btn-sm btn-ghost" data-rileggi="' + A.storia.indexOf(x) + '">' + I("speaker") + "Rileggi</button></div>" : "") + "</section>";
        }).join("") + "</div></div>";
      const f = document.getElementById("asForm");
      f.onsubmit = function (e) { e.preventDefault(); chiedi(f.d.value); };
      document.getElementById("asZitto").onclick = TD.zitto;
      app.querySelectorAll("[data-rileggi]").forEach(function (b) { b.onclick = function () { TD.leggi(A.storia[+b.dataset.rileggi].r.testo); }; });
      const mic = document.getElementById("asMic");
      if (mic) mic.onclick = function () {
        if (A.ascolto) { try { A.ascolto.stop(); } catch (e) {} A.ascolto = null; disegna(); return; }
        const r = new Ric(); r.lang = "it-IT"; r.interimResults = false; r.maxAlternatives = 1;
        r.onresult = function (e) { const t = e.results[0][0].transcript; A.ascolto = null; chiedi(t); };
        r.onerror = function (e) { A.ascolto = null; TD.toast(e.error === "network" ? "Il riconoscimento della voce ha bisogno di Internet: scrivi la domanda." : e.error === "not-allowed" ? "Consenti l'uso del microfono nelle impostazioni del browser." : "Non ho sentito bene: riprova o scrivi."); disegna(); };
        r.onend = function () { if (A.ascolto) { A.ascolto = null; disegna(); } };
        try { r.start(); A.ascolto = r; TD.zitto(); disegna(); } catch (e) { TD.toast("Microfono non disponibile."); }
      };
      const inp = document.getElementById("asD"); if (inp && !A.ascolto) inp.focus();
    }
    function chiedi(d) {
      d = String(d || "").trim(); if (!d) return;
      const r = TD.assistenteRisposta(d);
      A.storia.unshift({ d: d, r: r }); A.storia = A.storia.slice(0, 8);
      disegna(); TD.leggi(r.testo);
    }
    disegna();
  });
})();
