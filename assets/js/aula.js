/* ==========================================================================
   Tutor Digitale · modalità gruppo in aula e quiz dal telefono (individuale)
   Il tutor proietta la domanda sullo schermo; i partecipanti inquadrano il
   QR e rispondono dal loro telefono con l'app Allievo. I messaggi passano dal
   canale cifrato di relay.js. Senza Internet resta la «conta per alzata di
   mano»: ognuno alza il cartellino A, B, C o D e il tutor tocca i numeri.
   Con «Trasmetti allo schermo» le domande vanno su un Chromecast, su un
   Fire TV o su una seconda finestra da portare sul televisore.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const URL_AULA = "https://danilodauria.github.io/tutor-digitale/allievo/#/aula";
  const COLORI = ["#2f7fc0", "#c98a24", "#3f9a63", "#7d55c0"];
  const FORME = ["▲", "◆", "●", "■"];

  /* ------------------------------------------------------------ calcoli puri (anche per i test) */
  TD.aula = {
    domandePubbliche: function (qz) {
      /* la proposta si mostra tra caporali: se il testo ne ha già, si tolgono,
         altrimenti in aula comparirebbe ««Rimozione sicura»» */
      const proposta = function (s) { return String(s || "").replace(/[«»]/g, "").trim(); };
      return qz.filter(function (q) { return q.opzioni && q.opzioni.length >= 2; }).map(function (q, i) {
        return { n: i + 1, tipo: q.tipo, testo: q.testo, proposta: proposta(q.proposta), opzioni: q.opzioni.map(function (o) { return o.t; }), giusta: q.opzioni.findIndex(function (o) { return o.ok; }), spiegazione: q.spiegazione || "" };
      });
    },
    /* punteggio: 1000 punti alla risposta giusta, meno quanto più si è lenti (minimo 500) */
    punti: function (giusta, ms, tempoMax) { return giusta ? Math.round(1000 - 500 * Math.min(1, Math.max(0, ms) / tempoMax)) : 0; },
    classifica: function (giocatori) {
      return Object.keys(giocatori).map(function (id) { return Object.assign({ id: id }, giocatori[id]); })
        .sort(function (a, b) { return b.punti - a.punti || b.giuste - a.giuste || a.nome.localeCompare(b.nome); });
    },
    distribuzione: function (risposte, nOpzioni) {
      const d = new Array(nOpzioni).fill(0);
      Object.keys(risposte).forEach(function (id) { const s = risposte[id].scelta; if (s >= 0 && s < nOpzioni) d[s]++; });
      return d;
    },
    /* riepilogo del quiz individuale: una sola persona, un solo punteggio */
    riepilogoSolo: function (giocatori, totale) {
      const g = TD.aula.classifica(giocatori)[0];
      if (!g) return null;
      const tot = Math.max(0, Number(totale) || 0);
      return { nome: g.nome, punti: g.punti, giuste: g.giuste, totale: tot, perc: tot ? Math.round(100 * g.giuste / tot) : 0 };
    },
    /* il quiz dal telefono accetta una persona o un piccolo gruppo (massimo 4);
       l'aula di gruppo resta senza limite pratico */
    maxPartecipanti: function (solo, scelta) { return solo ? (Number(scelta) > 1 ? 4 : 1) : 200; },
    /* chi chiude il telefono smette di riannunciarsi: dopo la tolleranza il
       posto torna libero (in attesa il telefono manda «entra» ogni 5 secondi) */
    scaduti: function (giocatori, ora, tolleranza) {
      const t = Math.max(1000, Number(tolleranza) || 20000);
      return Object.keys(giocatori || {}).filter(function (id) {
        return Number(ora) - (Number(giocatori[id].visto) || 0) > t;
      });
    },
    /* confronto dei nomi senza maiuscole, accenti o spazi doppi: «Maria Rossi»
       e «maria rossi» sono la stessa persona, «Nicola» e «Nicolò» no */
    nomeChiave: function (s) {
      return String(s == null ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/\s+/g, " ").trim();
    },
    /* il partecipante dell'elenco che corrisponde al nome usato sul telefono:
       prima il nome intero, poi il solo nome di battesimo se è l'unico */
    trovaPartecipante: function (nome, partecipanti) {
      const n = TD.aula.nomeChiave(nome);
      const elenco = (partecipanti || []).filter(function (p) { return p && p.id && p.nome; });
      if (!n) return "";
      const pieno = elenco.find(function (p) { return TD.aula.nomeChiave(p.nome) === n; });
      if (pieno) return pieno.id;
      const primo = n.split(" ")[0];
      const omonimi = elenco.filter(function (p) { return TD.aula.nomeChiave(p.nome).split(" ")[0] === primo; });
      return omonimi.length === 1 ? omonimi[0].id : "";
    },
    /* testo letto ad alta voce: domanda, proposta e risposte con la loro lettera,
       così chi non legge bene può rispondere anche dal telefono in gruppo */
    testoDaLeggere: function (q) {
      if (!q) return "";
      const parti = [String(q.testo || "")];
      if (q.proposta) parti.push("Proposta: " + q.proposta + ".");
      const opzioni = Array.isArray(q.opzioni) ? q.opzioni : [];
      if (opzioni.length) parti.push("Risposte: " + opzioni.map(function (o, i) { return "ABCD"[i] + ", " + o; }).join("; ") + ".");
      return parti.join(" ").trim();
    }
  };

  /* ================================================================ TUTOR: proiettore */
  const H = { fase: "pronto", stanza: "", chiave: "", canale: null, domande: [], i: -1, giocatori: Object.create(null), risposte: Object.create(null), abbinamenti: Object.create(null), inizio: 0, tempo: 30, mostra: false, manuale: false, solo: false, max: 1, conta: [], timer: null, pulizia: null, clienteId: "" };
  TD.aulaStato = H;

  function linkAula() { return URL_AULA + "?s=" + H.stanza + "&k=" + H.chiave; }
  function domanda() { return H.domande[H.i]; }
  function trasmetti(obj) { if (H.canale) H.canale.invia(obj).catch(function () {}); }
  function statoPubblico() {
    const q = domanda(), ids = Object.keys(H.giocatori);
    return { t: "stato", fase: H.fase, n: q ? q.n : 0, totale: H.domande.length, tempo: H.tempo, inizio: H.inizio,
      solo: !!H.solo, max: H.max,
      domanda: q ? { n: q.n, testo: q.testo, proposta: q.proposta, opzioni: q.opzioni } : null,
      giusta: H.mostra && q ? q.giusta : -1, spiegazione: H.mostra && q ? q.spiegazione : "",
      risposte: Object.keys(H.risposte).length,
      distribuzione: H.mostra && q ? TD.aula.distribuzione(H.risposte, q.opzioni.length) : null,
      giocatori: ids.length,
      nomi: ids.slice(0, 12).map(function (id) { return H.giocatori[id].nome; }),
      classifica: H.fase === "fine" || H.mostra ? TD.aula.classifica(H.giocatori).slice(0, 10).map(function (g) { return { id: g.id, nome: g.nome, punti: g.punti, giuste: g.giuste }; }) : [] };
  }
  async function apriStanza(manuale, solo, max) {
    clearInterval(H.timer); clearInterval(H.eco); clearInterval(H.pulizia);
    H.manuale = !!manuale; H.solo = !!solo; H.max = TD.aula.maxPartecipanti(!!solo, max); H.conta = []; H.giocatori = Object.create(null); H.risposte = Object.create(null); H.abbinamenti = Object.create(null); H.i = -1; H.mostra = false;
    if (manuale) { H.fase = "attesa"; ridisegna(); return; }
    H.chiave = TD.relay.nuovaChiave(); H.stanza = ""; H.fase = "collegamento"; ridisegna();
    let scelta = null;
    try {
      /* un solo broker per tutta la stanza: lo sceglie il monitor e la stanza
         (quindi il QR, il link e la pagina dello schermo) lo porta con sé */
      scelta = await TD.relay.scegli();
      if (!scelta) throw new Error("Nessun canale raggiungibile: serve Internet su tutti i dispositivi.");
      H.stanza = TD.relay.nuovaStanza(scelta.indice);
      H.canale = await TD.relay.collega({ stanza: H.stanza, chiave: H.chiave, connessione: scelta, suMessaggio: ricevi, suStato: function (s) { if (s === "chiuso" && H.fase !== "pronto") { TD.toast("Canale interrotto: riapri l'aula."); } } });
      H.fase = "attesa"; ridisegna();
      clearInterval(H.eco); H.eco = setInterval(function () { if (H.canale && H.fase !== "pronto") trasmetti(statoPubblico()); }, 4000);
      /* nella sala d'attesa i telefoni si riannunciano ogni 5 secondi: chi non
         lo fa più ha chiuso la pagina e libera il posto per il quinto */
      clearInterval(H.pulizia); H.pulizia = setInterval(function () {
        if (!H.solo || H.fase !== "attesa") return;
        const via = TD.aula.scaduti(H.giocatori, Date.now(), 20000);
        if (!via.length) return;
        via.forEach(function (id) { delete H.giocatori[id]; });
        trasmetti(statoPubblico()); ridisegna();
      }, 5000);
    } catch (e) { try { if (scelta && scelta.ws) scelta.ws.close(); } catch (x) {} H.fase = "pronto"; TD.toast(e.message + " Puoi usare la conta per alzata di mano."); ridisegna(); }
  }
  function ricevi(m) {
    if (!TD.idOk(m.id)) return;   // identificativi strani (anche «__proto__») si ignorano
    if (m.t === "schermo" || m.t === "ping") {
      if (m.t === "ping" && H.giocatori[m.id]) H.giocatori[m.id].visto = Date.now();
      trasmetti(statoPubblico()); return;   // lo schermo (o un telefono rimasto indietro) chiede subito lo stato
    }
    if (m.t === "entra" && Object.keys(H.giocatori).length < 200) {
      /* quiz dal telefono: una persona o al massimo quattro; gli altri ricevono un avviso solo per loro */
      /* a partita iniziata non entra un telefono nuovo (chi c'era può rientrare);
         nella sala d'attesa il limite è il numero scelto dal tutor */
      if (H.solo && !H.giocatori[m.id] && (H.fase !== "attesa" || Object.keys(H.giocatori).length >= H.max)) { trasmetti({ t: "pieno", id: m.id, max: H.max, fase: H.fase }); return; }
      const nome = String(m.nome || "Partecipante").slice(0, 24);
      const nuovo = !H.giocatori[m.id];
      const rinominato = !nuovo && H.giocatori[m.id].nome !== nome;
      if (nuovo) H.giocatori[m.id] = { nome: nome, punti: 0, giuste: 0, visto: Date.now() };
      else { H.giocatori[m.id].visto = Date.now(); if (rinominato) H.giocatori[m.id].nome = nome; }
      /* il telefono si riannuncia ogni 5 secondi finché si aspetta: si risponde sempre,
         ma si ridisegna solo se è cambiato qualcosa (altrimenti i clic vanno persi) */
      trasmetti({ t: "dentro", id: m.id });
      trasmetti(statoPubblico());
      if (nuovo || rinominato) ridisegna();
    } else if (m.t === "risposta" && Object.prototype.hasOwnProperty.call(H.giocatori, m.id) && domanda() && m.n === domanda().n && !H.mostra && !H.risposte[m.id]) {
      const sc = Math.floor(Number(m.scelta));
      if (!(sc >= 0 && sc < domanda().opzioni.length)) return;
      H.giocatori[m.id].visto = Date.now();
      H.risposte[m.id] = { scelta: sc, ms: Date.now() - H.inizio };
      ridisegna();
      if (Object.keys(H.risposte).length >= Object.keys(H.giocatori).length) rivela();
    }
  }
  function prossima() {
    H.i++; H.mostra = false; H.risposte = Object.create(null);
    if (H.i >= H.domande.length) {
      H.fase = "fine"; clearInterval(H.timer);
      /* nomi dei telefoni ↔ partecipanti dell'elenco: la corrispondenza parte dal
         nome intero e, se è l'unico, dal solo nome di battesimo */
      H.abbinamenti = Object.create(null);
      const cli = TD.cliente(H.clienteId), elenco = (cli && cli.partecipanti) || [];
      Object.keys(H.giocatori).forEach(function (id) { H.abbinamenti[id] = TD.aula.trovaPartecipante(H.giocatori[id].nome, elenco); });
      trasmetti(statoPubblico()); ridisegna(); return;
    }
    if (H.manuale) H.conta = new Array(domanda().opzioni.length).fill(0);
    H.fase = "domanda"; H.inizio = Date.now();
    trasmetti(statoPubblico()); ridisegna();
    clearInterval(H.timer);
    H.timer = setInterval(function () {
      const resto = H.tempo - Math.floor((Date.now() - H.inizio) / 1000);
      const el = document.getElementById("aTempo"); if (el) el.textContent = Math.max(0, resto);
      if (resto <= 0) rivela();
    }, 250);
  }
  function rivela() {
    if (H.mostra || !domanda()) return;
    clearInterval(H.timer); H.mostra = true;
    const q = domanda();
    Object.keys(H.risposte).forEach(function (id) {
      const r = H.risposte[id], g = H.giocatori[id]; if (!g) return;
      const ok = r.scelta === q.giusta;
      g.punti += TD.aula.punti(ok, r.ms, H.tempo * 1000); if (ok) g.giuste++;
    });
    trasmetti(statoPubblico()); ridisegna();
  }
  function chiudiAula() {
    clearInterval(H.timer); clearInterval(H.eco); clearInterval(H.pulizia);
    if (H.canale) { trasmetti({ t: "stato", fase: "chiusa" }); setTimeout(function () { if (H.canale) H.canale.chiudi(); H.canale = null; }, 300); }
    Object.assign(H, { fase: "pronto", domande: [], i: -1, giocatori: Object.create(null), risposte: Object.create(null), abbinamenti: Object.create(null), mostra: false, manuale: false, solo: rottaSolo });
    TD.trasmissione.ferma(true);
    ridisegna();
  }

  /* ================================================================ TRASMISSIONE SULLO SCHERMO
     Un pulsante solo: se il browser sa parlare con i dispositivi di
     trasmissione (Chrome + Chromecast) apre direttamente lo schermo; altrimenti
     apre la pagina dello schermo in una finestra da portare sul televisore.
     La pagina «schermo» riceve le domande dallo stesso canale cifrato. */
  const T = { connessione: null, finestra: null, attivo: false };
  function chiudiFinestra() {
    try { if (T.finestra && !T.finestra.closed) T.finestra.close(); } catch (e) {}
    T.finestra = null;
  }
  TD.trasmissione = {
    indirizzo: function (base, stanza, chiave) {
      const b = base || location.href;
      const rel = /\/allievo\//.test(new URL(b).pathname) ? "../schermo/index.html" : "schermo/index.html";
      return new URL(rel, b).href + "#/schermo?s=" + encodeURIComponent(stanza || "") + "&k=" + encodeURIComponent(chiave || "");
    },
    attiva: function () {
      if (!T.connessione && T.finestra && T.finestra.closed) { T.finestra = null; T.attivo = false; }
      return T.attivo;
    },
    /* La pagina dello schermo si apre SUBITO, dentro il clic: nessuna attesa prima di
       window.open, così il browser non può bloccare la finestra. */
    finestra: function () {
      if (!H.stanza || !H.chiave) { TD.toast("Apri prima l'aula: la trasmissione parte con la stanza."); return false; }
      if (T.connessione) { TD.toast("Stai già trasmettendo su un dispositivo."); return true; }
      if (T.finestra && !T.finestra.closed) { try { T.finestra.focus(); } catch (e) {} return true; }
      const url = TD.trasmissione.indirizzo(location.href, H.stanza, H.chiave);
      let w = null;
      try { w = window.open(url, "td_schermo", "popup=yes,width=1280,height=760"); } catch (e) { w = null; }
      if (!w) { TD.toast("Il browser ha bloccato la finestra: consenti i popup per questo sito e riprova."); return false; }
      T.finestra = w; T.attivo = true;
      TD.toast("Finestra dello schermo aperta: trascinala sul televisore, oppure usa Chrome → Trasmetti.");
      ridisegna(); return true;
    },
    /* Selettore dei dispositivi (Chromecast), separato dalla finestra: se si annulla
       non apre nulla, quindi niente finestre a sorpresa dopo l'attesa. */
    dispositivo: async function () {
      if (!H.stanza || !H.chiave) { TD.toast("Apri prima l'aula: la trasmissione parte con la stanza."); return false; }
      const PR = window.PresentationRequest;
      if (!PR) { TD.toast("Questo browser non ha il selettore dei dispositivi: usa «Trasmetti allo schermo»."); return false; }
      const url = TD.trasmissione.indirizzo(location.href, H.stanza, H.chiave);
      let conn = null;
      try { conn = await new PR([url]).start(); }
      catch (e) { TD.toast("Nessun dispositivo scelto: usa «Trasmetti allo schermo» e porta la finestra sul televisore, oppure Chrome → Trasmetti."); return false; }
      T.connessione = conn; T.attivo = true;
      chiudiFinestra();
      conn.addEventListener("close", function () { T.connessione = null; T.attivo = false; ridisegna(); });
      TD.toast("Trasmissione avviata: le domande compaiono sullo schermo scelto.");
      ridisegna(); return true;
    },
    ferma: function (silenzioso) {
      try { if (T.connessione) T.connessione.close(); } catch (e) {}
      chiudiFinestra();
      T.connessione = null; T.attivo = false;
      if (!silenzioso) ridisegna();
    }
  };

  let appEl = null, rottaSolo = false;
  function ridisegna() {
    if (!appEl || !appEl.isConnected) return;
    const h = location.hash;
    if (h.indexOf("#/aula") !== 0 && h.indexOf("#/quiz-telefono") !== 0) return;
    if (TD.MODO === "allievo") disegnaGiocatore(); else disegnaHost();
  }

  function barreDistribuzione(d, giusta, etichette) {
    const max = Math.max.apply(null, d.concat([1]));
    return '<div class="aula-distr">' + d.map(function (n, i) {
      return '<div class="aula-col' + (i === giusta ? " giusta" : "") + '"><span class="aula-n">' + n + '</span><i style="height:' + Math.round(100 * n / max) + "%;background:" + COLORI[i % 4] + '\"></i><b>' + FORME[i % 4] + " " + E(etichette[i]) + "</b></div>";
    }).join("") + "</div>";
  }

  function barraTrasmissione() {
    if (!H.canale || H.fase === "pronto") return "";
    if (TD.trasmissione.attiva()) return '<div class="aula-cast attiva">' + I("check") + '<div><strong>Stai trasmettendo</strong><small>Le domande sono sullo schermo scelto; i comandi restano qui.</small></div><button class="btn btn-ghost" id="aFerma">' + I("x") + "Smetti</button></div>";
    return '<div class="aula-cast">' + I("tv") + '<div><strong>Trasmetti allo schermo</strong><small>«Trasmetti allo schermo» apre la pagina in una finestra, da portare sul televisore col cavo HDMI o da mostrare con Chrome → Trasmetti. Con un Chromecast in Wi-Fi premi «Chromecast».</small></div><div class="aula-cast-bottoni"><button class="btn btn-primary" id="aCasta" title="Apre la pagina dello schermo in una finestra">' + I("screen") + "Trasmetti allo schermo</button>" + (window.PresentationRequest ? '<button class="btn btn-ghost" id="aCastaDev" title="Cerca un Chromecast o uno schermo collegato">' + I("tv") + "Chromecast</button>" : "") + "</div></div>";
  }
  function linkAltraModalita() {
    if (H.fase !== "pronto") return "";
    return '<p class="aula-altra muted text-small">' + (H.solo
      ? 'Fai giocare tutto il gruppo? <a href="#/aula">Apri l\'aula di gruppo</a>.'
      : 'Una persona o un piccolo gruppo? <a href="#/quiz-telefono">Apri il quiz dal telefono</a>.') + "</p>";
  }

  function disegnaHost() {
    const q = domanda(), nG = Object.keys(H.giocatori).length;
    let corpo = "";
    if (H.fase === "pronto") {
      const c = TD.cliente(H.clienteId);
      const spiega = H.solo
        ? "Le domande restano su questo schermo, anche il monitor del computer, senza televisore: risponde una persona, oppure fino a quattro, ognuna dal proprio telefono. Alla fine i risultati si salvano nella scheda del cliente."
        : "Le domande vanno sullo schermo grande, le risposte arrivano dai telefoni: una classifica per finire in allegria.";
      const nota = H.solo
        ? "Dopo l'apertura compare un QR: inquadralo con la fotocamera del telefono, scrivi il nome e comincia. Con «Fino a 4 persone» ogni telefono entra col proprio nome. Il pulsante «Trasmetti allo schermo» manda le domande a un Chromecast o a un Fire TV; con il cavo HDMI basta il monitor."
        : "Collega il computer alla Smart TV (cavo HDMI o trasmissione dello schermo) e premi F11 per il tutto schermo. Le domande sono a scelta multipla, vero o falso e completa la frase, sempre in ordine diverso.";
      const azioni = H.solo
        ? '<button class="btn btn-primary btn-lg" type="submit" name="modo" value="rete">' + I("phone") + "Apri il quiz sul monitor</button>"
        : '<button class="btn btn-primary btn-lg" type="submit" name="modo" value="rete">' + I("wifi") + 'Apri l\'aula: rispondono dal telefono</button><button class="btn btn-lg" type="submit" name="modo" value="mano">' + I("hand") + "Senza Internet: alzata di mano</button>";
      corpo = '<form class="card form" id="aForm" data-solo="' + (H.solo ? "1" : "0") + '"><h2>' + I(H.solo ? "phone" : "users") + (H.solo ? "Quiz dal telefono" : "Prepara la partita") + "</h2>" +
        '<p class="muted">' + spiega + "</p>" +
        '<div class="grid-3">' +
        '<label class="field"><span>Livello</span><select name="liv"><option value="">Tutti</option>' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '">' + E(l.nome) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Percorso</span><select name="dev"><option value="tutti">Tutti</option>' + TD.PERCORSI.map(function (p) { return '<option value="' + p.id + '">' + E(p.nome) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Domande</span><select name="n">' + [5, 8, 10, 15].map(function (n) { return "<option" + (n === 8 ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Secondi per domanda</span><select name="tempo">' + [20, 30, 45, 60, 90].map(function (n) { return "<option" + (n === 45 ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></label>" +
        (H.solo ? '<label class="field"><span>Partecipanti</span><select name="max"><option value="1"' + (H.max <= 1 ? " selected" : "") + '>1 persona</option><option value="4"' + (H.max > 1 ? " selected" : "") + '>Fino a 4 persone</option></select></label>' : "") +
        '<label class="field"><span>' + (H.solo ? (H.max === 1 ? "Risultato da salvare per" : "Risultati da salvare per") : "Gruppo (per salvare i risultati)") + '</span><select name="cliente">' + TD.opzioniClienti(c ? c.id : "") + "</select></label></div>" +
        '<div class="actions">' + azioni + "</div>" +
        '<p class="muted text-small">' + nota + "</p></form>";
    } else if (H.fase === "collegamento") {
      corpo = '<section class="card"><p>Apro il canale cifrato…</p></section>';
    } else if (H.fase === "attesa") {
      const qr = '<div class="aula-entra">' + TD.qr.svg(linkAula(), { etichetta: H.max === 1 ? "QR per rispondere dal telefono" : H.solo ? "QR per entrare nel quiz" : "QR per entrare in aula" }) +
        '<div><h2>' + (H.max === 1 ? "Inquadra col telefono" : "Inquadra e gioca!") + '</h2><p class="aula-grande">' +
        (H.solo ? "Le domande compaiono qui, sul monitor: dal telefono si risponde soltanto." : "Fotocamera del telefono sul QR, poi scrivi il tuo nome.") +
        '</p><p class="aula-grande">Collegati: <strong>' + nG + "</strong>" + (H.max <= 4 ? " su " + H.max : "") + "</p><p>" +
        Object.keys(H.giocatori).map(function (id) { return '<span class="pill">' + E(H.giocatori[id].nome) + "</span>"; }).join(" ") + "</p></div></div>";
      corpo = '<section class="aula-tv">' + (H.manuale
        ? '<h2>Alzata di mano</h2><p class="aula-grande">Ognuno prepara quattro cartellini: ▲ A · ◆ B · ● C · ■ D. Alla domanda li alza, tu tocchi i numeri.</p>'
        : qr) +
        '<div class="actions"><button class="btn btn-primary btn-lg" id="aVia"' + (H.solo && !nG ? " disabled" : "") + '>' + I("play") + "Prima domanda</button><button class=\"btn\" id=\"aChiudi\">Chiudi l\'aula</button>" + (H.manuale ? "" : '<button class="btn" id="aLink">' + I("copy") + "Copia il link</button>") + "</div></section>";
    } else if (H.fase === "domanda" && q) {
      const nr = Object.keys(H.risposte).length;
      const d = H.manuale ? H.conta : TD.aula.distribuzione(H.risposte, q.opzioni.length);
      corpo = '<section class="aula-tv"><p class="aula-top"><span>Domanda ' + q.n + " di " + H.domande.length + "</span>" + (H.mostra ? "" : '<span class="aula-tempo" id="aTempo">' + H.tempo + "</span>") + "<span>" + (H.manuale ? "" : H.max === 1 ? (nr ? "Risposta ricevuta" : "In attesa della risposta") : nr + " / " + nG + " risposte") + "</span></p>" +
        '<h2 class="aula-domanda">' + E(q.testo) + (q.proposta ? "<br><em>«" + E(q.proposta) + "»</em>" : "") + "</h2>" +
        '<div class="aula-opzioni">' + q.opzioni.map(function (o, i) {
          return '<div class="aula-opz' + (H.mostra ? (i === q.giusta ? " giusta" : " spenta") : "") + '" style="--c:' + COLORI[i % 4] + '"><span class="aula-forma">' + FORME[i % 4] + " " + "ABCD"[i] + "</span><span>" + E(o) + "</span>" +
            (H.manuale && !H.mostra ? '<span class="aula-conta"><button class="icon-btn" data-meno="' + i + '" aria-label="Togli uno">−</button><b>' + H.conta[i] + '</b><button class="icon-btn" data-piu="' + i + '" aria-label="Aggiungi uno">+</button></span>' : "") + "</div>";
        }).join("") + "</div>" +
        (H.mostra ? barreDistribuzione(d, q.giusta, q.opzioni.map(function (_, i) { return "ABCD"[i]; })) + '<p class="aula-spiega">' + E(q.spiegazione) + "</p>" + (H.manuale ? "" : H.max === 1 ? esitoSoloHtml() : classificaHtml(5)) : "") +
        '<div class="actions">' + (H.mostra ? '<button class="btn btn-primary btn-lg" id="aAvanti">' + I("arrow") + (H.i + 1 < H.domande.length ? "Domanda successiva" : "Risultato finale") + "</button>" : '<button class="btn btn-primary btn-lg" id="aRivela">' + I("eye") + "Mostra la risposta</button>") + '<button class="btn" id="aLeggi" title="Legge la domanda e le risposte ad alta voce">' + I("speaker") + "Leggi</button>" + '<button class="btn" id="aChiudi">Chiudi</button></div></section>';
    } else if (H.fase === "fine") {
      const r = H.max === 1 ? TD.aula.riepilogoSolo(H.giocatori, H.domande.length) : null;
      /* prima l'abbinamento dei nomi, poi le azioni: il pulsante Salva resta
         sotto la scheda, così non si può salvare senza averla vista */
      corpo = abbinamentoHtml() + '<section class="aula-tv"><h2>' + (H.max === 1 ? "Quiz concluso" : "Classifica finale") + "</h2>" +
        (H.max === 1
          ? r ? '<p class="aula-grande">' + E(r.nome) + ": " + r.giuste + " risposte giuste su " + r.totale + " (" + r.perc + "%) · " + r.punti + " punti.</p>" : '<p class="muted">Nessuna risposta ricevuta.</p>'
          : H.manuale ? '<p class="aula-grande">Bravi tutti! Le risposte per alzata di mano non hanno classifica.</p>' : classificaHtml(20)) +
        '<div class="actions">' + (!H.manuale && nG && TD.cliente(H.clienteId) ? '<button class="btn btn-primary" id="aSalva">' + I("check") + "Salva i risultati nella scheda " + (H.max === 1 ? "del cliente" : "del gruppo") + "</button>" : "") + '<button class="btn" id="aChiudi">Chiudi l\'aula</button></div></section>';
    }
    const titoloSolo = H.fase === "pronto" ? "Quiz dal telefono" : H.max === 1 ? "Quiz dal telefono · una persona" : "Quiz dal telefono · fino a 4 persone";
    appEl.innerHTML = TD.intest(H.solo ? titoloSolo : "Modalità gruppo in aula",
      H.solo ? (H.max === 1 ? "Le domande sul monitor del computer, le risposte dal telefono: un solo partecipante, senza televisore." : "Le domande sul monitor del computer, le risposte da uno a quattro telefoni: nessun televisore.") : "La domanda sulla Smart TV, le risposte dai telefoni: quiz tutti insieme con classifica.") +
      '<div class="wrap">' + barraTrasmissione() + corpo + linkAltraModalita() + "</div>";
    collegaHost();
  }
  function esitoSoloHtml() {
    const r = TD.aula.riepilogoSolo(H.giocatori, H.domande.length);
    return r ? '<p class="aula-grande">' + E(r.nome) + ": " + r.giuste + " giuste su " + r.totale + " · " + r.punti + " punti</p>" : "";
  }
  function classificaHtml(n) {
    const cl = TD.aula.classifica(H.giocatori).slice(0, n);
    return cl.length ? '<ol class="aula-classifica">' + cl.map(function (g, i) { return "<li><span>" + (i + 1) + ".</span><strong>" + E(g.nome) + "</strong><span>" + g.punti + " punti · " + g.giuste + " giuste</span></li>"; }).join("") + "</ol>" : '<p class="muted">Nessun partecipante collegato.</p>';
  }
  /* elenco del gruppo: si sceglie chi è ogni telefono prima di salvare */
  function abbinamentoHtml() {
    const c = TD.cliente(H.clienteId), parti = (c && c.partecipanti) || [];
    if (H.max <= 1 || !parti.length) return "";
    const cl = TD.aula.classifica(H.giocatori);
    if (!cl.length) return "";
    const abbinati = cl.filter(function (g) { return H.abbinamenti[g.id]; }).length;
    return '<section class="card"><h2>' + I("users") + 'Chi ha risposto</h2><p class="muted">Abbina ogni telefono al partecipante del gruppo: il risultato entra nella scheda con il nome giusto.</p><div class="grid-2">' +
      cl.map(function (g) {
        return '<label class="field"><span>' + E(g.nome) + " · " + g.giuste + "/" + H.domande.length + '</span><select data-part="' + E(g.id) + '" aria-label="Partecipante per ' + E(g.nome) + '"><option value="">— non in elenco —</option>' +
          parti.map(function (p) { return '<option value="' + E(p.id) + '"' + (H.abbinamenti[g.id] === p.id ? " selected" : "") + ">" + E(p.nome) + "</option>"; }).join("") + "</select></label>";
      }).join("") + '</div><p class="muted text-small" id="aAbbinati">' + abbinati + " di " + cl.length + " abbinati. Chi resta «non in elenco» si salva comunque con il nome scritto sul telefono.</p></section>";
  }
  function collegaHost() {
    const $ = function (id) { return document.getElementById(id); };
    const f = $("aForm");
    if (f) f.onsubmit = function (e) {
      e.preventDefault();
      const o = TD.form(f), modo = e.submitter ? e.submitter.value : "rete", solo = f.dataset.solo === "1";
      H.solo = solo;
      H.domande = TD.aula.domandePubbliche(TD.generaQuiz({ liv: o.liv === "" ? "" : Number(o.liv), dev: o.dev, n: Number(o.n), tipi: ["mc", "vf", "completa"], cumulativo: true }));
      H.tempo = Number(o.tempo) || 45; H.clienteId = o.cliente;
      apriStanza(modo === "mano", solo, o.max);
    };
    if ($("aVia")) $("aVia").onclick = prossima;
    if ($("aAvanti")) $("aAvanti").onclick = prossima;
    if ($("aRivela")) $("aRivela").onclick = rivela;
    if ($("aLeggi")) $("aLeggi").onclick = function () {
      const q = domanda(); if (!q) return;
      TD.leggi(TD.aula.testoDaLeggere(q) + (H.mostra && q.spiegazione ? " " + q.spiegazione : ""));
    };
    appEl.querySelectorAll("[data-part]").forEach(function (s) {
      s.onchange = function () {
        H.abbinamenti[s.dataset.part] = s.value;
        const tot = Object.keys(H.abbinamenti).length, n = Object.keys(H.abbinamenti).filter(function (k) { return H.abbinamenti[k]; }).length;
        const el = document.getElementById("aAbbinati");
        if (el) el.textContent = n + " di " + tot + " abbinati. Chi resta «non in elenco» si salva comunque con il nome scritto sul telefono.";
      };
    });
    if ($("aChiudi")) $("aChiudi").onclick = function () { if (H.fase === "pronto" || TD.conferma("Chiudere l'aula? I telefoni verranno scollegati.")) chiudiAula(); };
    if ($("aLink")) $("aLink").onclick = function () { TD.scambio.copia(linkAula()).then(function (ok) { TD.toast(ok ? "Link copiato." : "Copia non riuscita."); }); };
    /* nessun await prima di window.open: la finestra si apre dentro il clic */
    if ($("aCasta")) $("aCasta").onclick = function () { TD.trasmissione.finestra(); };
    if ($("aCastaDev")) $("aCastaDev").onclick = function () { TD.trasmissione.dispositivo(); };
    if ($("aFerma")) $("aFerma").onclick = function () { TD.trasmissione.ferma(); };
    appEl.querySelectorAll("[data-piu]").forEach(function (b) { b.onclick = function () { H.conta[+b.dataset.piu]++; ridisegna(); }; });
    appEl.querySelectorAll("[data-meno]").forEach(function (b) { b.onclick = function () { H.conta[+b.dataset.meno] = Math.max(0, H.conta[+b.dataset.meno] - 1); ridisegna(); }; });
    if ($("aSalva")) $("aSalva").onclick = function () {
      const c = TD.cliente(H.clienteId); if (!c) return;
      c.quiz = c.quiz || []; const parts = c.partecipanti || [];
      const sessione = H.max > 1 ? TD.uid("s") : "";
      let salvati = 0;
      TD.aula.classifica(H.giocatori).forEach(function (g) {
        const pid = (H.abbinamenti && H.abbinamenti[g.id]) || TD.aula.trovaPartecipante(g.nome, parts);
        const voce = { id: TD.uid("q"), data: TD.oggi(), liv: "", dev: "aula", giuste: g.giuste, totale: H.domande.length, perc: Math.round(100 * g.giuste / H.domande.length), partecipante: pid || "", nome: g.nome, aula: true };
        if (H.max === 1) voce.individuale = true;
        else voce.sessione = sessione;
        c.quiz.push(voce);
        salvati++;
      });
      TD.salva(); TD.toast(salvati + " risultati salvati nella scheda di " + TD.nomeCliente(c) + ".");
    };
  }

  /* ================================================================ ALLIEVO: telefono */
  const G = { canale: null, stato: null, id: "", nome: "", scelta: -1, n: 0, s: "", k: "", errore: "", attesaPosto: false, posti: 4, ultimo: 0 };
  function idGiocatore() {
    try { let v = sessionStorage.getItem("td-aula-id"); if (!v) { v = TD.uid("g"); sessionStorage.setItem("td-aula-id", v); } return v; } catch (e) { return G.id || TD.uid("g"); }
  }
  /* ciò che arriva dalla «TV» si ricostruisce con tipi certi: numeri come numeri, testi come testi */
  function statoSicuro(m) {
    const n = function (x, d) { x = Number(x); return isFinite(x) ? x : (d || 0); };
    const t = function (x, max) { return String(x == null ? "" : x).slice(0, max || 500); };
    const q = m.domanda && typeof m.domanda === "object" ? { n: n(m.domanda.n), testo: t(m.domanda.testo), proposta: t(m.domanda.proposta), opzioni: (Array.isArray(m.domanda.opzioni) ? m.domanda.opzioni : []).slice(0, 4).map(function (o) { return t(o, 300); }) } : null;
    return { fase: ["attesa", "domanda", "fine", "chiusa"].indexOf(m.fase) >= 0 ? m.fase : "attesa", solo: m.solo === true, max: n(m.max, 1), n: n(m.n), totale: n(m.totale), giusta: n(m.giusta, -1), domanda: q, giocatori: n(m.giocatori),
      classifica: (Array.isArray(m.classifica) ? m.classifica : []).slice(0, 20).map(function (g) { return { id: t(g && g.id, 80), nome: t(g && g.nome, 24), punti: n(g && g.punti) }; }) };
  }
  async function entraAula() {
    G.id = idGiocatore();
    try {
      G.canale = await TD.relay.collega({ stanza: G.s, chiave: G.k, suMessaggio: function (m) {
        if (m.t === "dentro" && m.id === G.id) {
          if (G.attesaPosto || G.errore) { G.attesaPosto = false; G.errore = ""; ridisegna(); }
          return;
        }
        if (m.t === "pieno" && m.id === G.id) {
          const cap = Math.min(4, Math.max(1, Number(m.max) || 1)); G.posti = cap;
          if (m.fase === "attesa") { G.attesaPosto = true; G.errore = ""; }
          else if (m.fase === "chiusa") { G.attesaPosto = false; G.errore = "L'aula è stata chiusa."; }
          else { G.attesaPosto = false; G.errore = "Il quiz è già iniziato: non è possibile entrare ora. Chiedi al tutor di riaprire l'aula."; }
          ridisegna(); return;
        }
        if (m.t !== "stato") return;
        G.stato = statoSicuro(m);
        G.ultimo = Date.now();
        if (G.attesaPosto && G.stato.fase !== "attesa") { G.attesaPosto = false; G.errore = "Il quiz è già iniziato: non è possibile entrare ora. Chiedi al tutor di riaprire l'aula."; }
        if (G.stato.fase === "chiusa") { G.attesaPosto = false; G.errore = ""; }
        if (G.stato.n !== G.n) { G.n = G.stato.n; G.scelta = -1; }
        ridisegna();
      }, suStato: function (s) { if (s === "chiuso") { G.errore = "Collegamento interrotto. Inquadra di nuovo il QR."; ridisegna(); } } });
      await G.canale.invia({ t: "entra", id: G.id, nome: G.nome });
      clearInterval(G.rientra); G.rientra = setInterval(function () {
        if (!G.canale) return;
        if (!G.stato || G.stato.fase === "attesa") G.canale.invia({ t: "entra", id: G.id, nome: G.nome });
        /* in una stanza piccola, se lo stato non arriva da un po' lo richiede:
           un messaggio perso non lascia il telefono fermo sulla domanda vecchia */
        else if ((G.stato.giocatori || 0) <= 4 && Date.now() - (G.ultimo || 0) > 9000) G.canale.invia({ t: "ping", id: G.id });
      }, 5000);
    } catch (e) { G.errore = e.message; }
    ridisegna();
  }
  function disegnaGiocatore() {
    const st = G.stato;
    let corpo;
    if (!G.s || !G.k) corpo = '<section class="card"><h2>Aula</h2><p>Per entrare inquadra il QR mostrato dal tutor sullo schermo del computer o sulla TV.</p></section>';
    else if (G.errore) corpo = '<section class="card"><h2>Non riesco a entrare</h2><p>' + E(G.errore) + "</p></section>";
    else if (G.attesaPosto) corpo = '<section class="card"><h2>Aula al completo</h2><p>' + (G.posti === 1 ? "C'è già un partecipante." : "Ci sono già " + G.posti + " partecipanti.") + (G.posti === 1 ? " Resta su questa pagina: appena si libera, entri automaticamente." : " Resta su questa pagina: appena uno esce, entri automaticamente.") + '</p><p class="muted">Controllo ogni pochi secondi…</p></section>';
    else if (!G.canale) corpo = '<form class="card form" id="gForm"><h2>' + I("users") + 'Entra in aula</h2><label class="field"><span>Il tuo nome</span><input name="nome" required maxlength="24" value="' + E(G.nome || (TD.db.allievo && TD.db.allievo.nome) || "") + '" autocomplete="given-name"></label><div class="actions"><button class="btn btn-primary btn-lg" type="submit">' + I("play") + "Entra</button></div></form>";
    else if (!st || st.fase === "attesa") corpo = '<section class="card aula-tel"><h2>Ci sei, ' + E(G.nome) + '!</h2><p class="aula-grande">Guarda lo schermo del tutor: si comincia tra poco.</p></section>';
    else if (st.fase === "chiusa") corpo = '<section class="card"><h2>Aula chiusa</h2><p>Grazie per aver partecipato!</p><a class="btn" href="#/">Torna all\'inizio</a></section>';
    else if (st.fase === "domanda" && st.domanda) {
      const q = st.domanda, mostra = st.giusta >= 0;
      const mia = (st.classifica || []).findIndex(function (x) { return x.id === G.id; });
      corpo = '<section class="aula-tel"><p class="muted">Domanda ' + q.n + " di " + st.totale + "</p><h2>" + E(q.testo) + (q.proposta ? "<br><em>«" + E(q.proposta) + "»</em>" : "") + "</h2>" +
        '<div class="actions"><button class="btn btn-sm" id="gLeggi" title="Legge la domanda e le risposte ad alta voce">' + I("speaker") + "Leggi la domanda</button></div>" +
        '<div class="aula-tasti">' + q.opzioni.map(function (o, i) {
          const cls = mostra ? (i === st.giusta ? " giusta" : (i === G.scelta ? " sbagliata" : " spenta")) : (G.scelta === i ? " scelta" : "");
          return '<button class="aula-tasto' + cls + '" style="--c:' + COLORI[i % 4] + '" data-sc="' + i + '"' + (G.scelta >= 0 || mostra ? " disabled" : "") + '><span class="aula-forma">' + FORME[i % 4] + " " + "ABCD"[i] + "</span>" + E(o) + "</button>";
        }).join("") + "</div>" +
        (mostra ? '<p class="aula-grande">' + (G.scelta === st.giusta ? "✓ Giusto!" : G.scelta < 0 ? "Tempo scaduto" : "✗ Non questa volta") + "</p>" + (st.max > 1 && mia >= 0 ? "<p>Sei " + (mia + 1) + "° in classifica.</p>" : "") : G.scelta >= 0 ? '<p class="aula-grande">Risposta inviata: aspetta gli altri…</p>' : "") + "</section>";
    } else if (st.fase === "fine") {
      const cl = st.classifica || [], mia = cl.findIndex(function (x) { return x.id === G.id; });
      corpo = '<section class="card aula-tel"><h2>Fine!</h2><p class="aula-grande">' + (st.max === 1 ? "Grazie! Il risultato è sul monitor del tutor." : mia >= 0 ? "Sei arrivato " + (mia + 1) + "° con " + cl[mia].punti + " punti." : "Grazie per aver giocato!") + "</p></section>";
    } else corpo = '<section class="card"><p>In attesa del tutor…</p></section>';
    appEl.innerHTML = '<div class="wrap aula-tel-wrap">' + corpo + "</div>";
    const f = document.getElementById("gForm");
    if (f) f.onsubmit = function (e) { e.preventDefault(); G.nome = f.nome.value.trim().slice(0, 24); if (!G.nome) return; f.querySelector("button").disabled = true; entraAula(); };
    const gl = document.getElementById("gLeggi");
    if (gl) gl.onclick = function () { if (G.stato && G.stato.domanda) TD.leggi(TD.aula.testoDaLeggere(G.stato.domanda)); };
    appEl.querySelectorAll("[data-sc]").forEach(function (b) {
      b.onclick = function () {
        if (G.scelta >= 0 || !G.stato) return;
        G.scelta = +b.dataset.sc; ridisegna();
        G.canale.invia({ t: "risposta", id: G.id, n: G.stato.domanda.n, scelta: G.scelta });
        if (navigator.vibrate) navigator.vibrate(40);
      };
    });
  }

  /* la rotta /aula (gruppo) e /quiz-telefono (una persona o fino a quattro)
     portano alla stessa pagina: nel programma del tutor si comanda, nell'app
     Allievo si risponde */
  function apriGiocatore(q) {
    if (q.s && q.k && (q.s !== G.s || q.k !== G.k)) { if (G.canale) G.canale.chiudi(); Object.assign(G, { canale: null, stato: null, s: q.s, k: q.k, errore: "", scelta: -1, n: 0 }); }
    disegnaGiocatore();
  }
  function rottaAula(app, q, solo) {
    appEl = app; rottaSolo = solo;
    if (TD.MODO === "allievo") { apriGiocatore(q); return; }
    if (H.fase === "pronto") { H.solo = solo; H.max = TD.aula.maxPartecipanti(solo, 1); }
    disegnaHost();
  }

  TD.rotta("/aula", function (app, p, q) { rottaAula(app, q, false); });
  TD.rotta("/quiz-telefono", function (app, p, q) { rottaAula(app, q, true); });
})();
