/* ==========================================================================
   Tutor Digitale · modalità gruppo in aula (miglioria 12)
   Il tutor proietta la domanda sulla Smart TV; i partecipanti inquadrano il
   QR e rispondono dal loro telefono con l'app Allievo. I messaggi passano dal
   canale cifrato di relay.js. Senza Internet resta la «conta per alzata di
   mano»: ognuno alza il cartellino A, B, C o D e il tutor tocca i numeri.
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
      return qz.filter(function (q) { return q.opzioni && q.opzioni.length >= 2; }).map(function (q, i) {
        return { n: i + 1, tipo: q.tipo, testo: q.testo, proposta: q.proposta || "", opzioni: q.opzioni.map(function (o) { return o.t; }), giusta: q.opzioni.findIndex(function (o) { return o.ok; }), spiegazione: q.spiegazione || "" };
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
    }
  };

  /* ================================================================ TUTOR: proiettore */
  const H = { fase: "pronto", stanza: "", chiave: "", canale: null, domande: [], i: -1, giocatori: Object.create(null), risposte: Object.create(null), inizio: 0, tempo: 30, mostra: false, manuale: false, conta: [], timer: null, clienteId: "" };
  TD.aulaStato = H;

  function linkAula() { return URL_AULA + "?s=" + H.stanza + "&k=" + H.chiave; }
  function domanda() { return H.domande[H.i]; }
  function trasmetti(obj) { if (H.canale) H.canale.invia(obj).catch(function () {}); }
  function statoPubblico() {
    const q = domanda();
    return { t: "stato", fase: H.fase, n: q ? q.n : 0, totale: H.domande.length, tempo: H.tempo, inizio: H.inizio,
      domanda: q ? { n: q.n, testo: q.testo, proposta: q.proposta, opzioni: q.opzioni, tipo: q.tipo } : null,
      giusta: H.mostra && q ? q.giusta : -1, spiegazione: H.mostra && q ? q.spiegazione : "",
      classifica: H.fase === "fine" || H.mostra ? TD.aula.classifica(H.giocatori).slice(0, 10).map(function (g) { return { id: g.id, nome: g.nome, punti: g.punti }; }) : [] };
  }
  async function apriStanza(manuale) {
    H.manuale = !!manuale; H.giocatori = Object.create(null); H.risposte = Object.create(null); H.i = -1; H.mostra = false;
    if (manuale) { H.fase = "attesa"; ridisegna(); return; }
    H.stanza = TD.relay.nuovaStanza(); H.chiave = TD.relay.nuovaChiave(); H.fase = "collegamento"; ridisegna();
    try {
      H.canale = await TD.relay.collega({ stanza: H.stanza, chiave: H.chiave, suMessaggio: ricevi, suStato: function (s) { if (s === "chiuso" && H.fase !== "pronto") { TD.toast("Canale interrotto: riapri l'aula."); } } });
      H.fase = "attesa"; ridisegna();
      clearInterval(H.eco); H.eco = setInterval(function () { if (H.canale && H.fase !== "pronto") trasmetti(statoPubblico()); }, 4000);
    } catch (e) { H.fase = "pronto"; TD.toast(e.message + " Puoi usare la conta per alzata di mano."); ridisegna(); }
  }
  function ricevi(m) {
    if (!TD.idOk(m.id)) return;   // identificativi strani (anche «__proto__») si ignorano
    if (m.t === "entra" && Object.keys(H.giocatori).length < 200) {
      const nome = String(m.nome || "Partecipante").slice(0, 24);
      if (!H.giocatori[m.id]) H.giocatori[m.id] = { nome: nome, punti: 0, giuste: 0 };
      else H.giocatori[m.id].nome = nome;
      trasmetti(statoPubblico()); ridisegna();
    } else if (m.t === "risposta" && Object.prototype.hasOwnProperty.call(H.giocatori, m.id) && domanda() && m.n === domanda().n && !H.mostra && !H.risposte[m.id]) {
      const sc = Math.floor(Number(m.scelta));
      if (!(sc >= 0 && sc < domanda().opzioni.length)) return;
      H.risposte[m.id] = { scelta: sc, ms: Date.now() - H.inizio };
      ridisegna();
      if (Object.keys(H.risposte).length >= Object.keys(H.giocatori).length) rivela();
    }
  }
  function prossima() {
    H.i++; H.mostra = false; H.risposte = Object.create(null);
    if (H.i >= H.domande.length) { H.fase = "fine"; clearInterval(H.timer); trasmetti(statoPubblico()); ridisegna(); return; }
    H.conta = new Array(domanda().opzioni.length).fill(0);
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
    clearInterval(H.timer); clearInterval(H.eco);
    if (H.canale) { trasmetti({ t: "stato", fase: "chiusa" }); setTimeout(function () { if (H.canale) H.canale.chiudi(); H.canale = null; }, 300); }
    Object.assign(H, { fase: "pronto", domande: [], i: -1, giocatori: Object.create(null), risposte: Object.create(null), mostra: false, manuale: false });
    ridisegna();
  }

  let appEl = null;
  function ridisegna() { if (appEl && appEl.isConnected && location.hash.indexOf("#/aula") === 0) (TD.MODO === "allievo" ? disegnaGiocatore : disegnaHost)(); }

  function barreDistribuzione(d, giusta, etichette) {
    const max = Math.max.apply(null, d.concat([1]));
    return '<div class="aula-distr">' + d.map(function (n, i) {
      return '<div class="aula-col' + (i === giusta ? " giusta" : "") + '"><span class="aula-n">' + n + '</span><i style="height:' + Math.round(100 * n / max) + "%;background:" + COLORI[i % 4] + '"></i><b>' + FORME[i % 4] + " " + E(etichette[i]) + "</b></div>";
    }).join("") + "</div>";
  }

  function disegnaHost() {
    const q = domanda(), nG = Object.keys(H.giocatori).length;
    let corpo = "";
    if (H.fase === "pronto") {
      const c = TD.cliente(H.clienteId);
      corpo = '<form class="card form" id="aForm"><h2>' + I("users") + 'Prepara la partita</h2><div class="grid-3">' +
        '<label class="field"><span>Livello</span><select name="liv"><option value="">Tutti</option>' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '">' + E(l.nome) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Percorso</span><select name="dev"><option value="tutti">Tutti</option>' + TD.PERCORSI.map(function (p) { return '<option value="' + p.id + '">' + E(p.nome) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Domande</span><select name="n">' + [5, 8, 10, 15].map(function (n) { return "<option" + (n === 8 ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Secondi per domanda</span><select name="tempo">' + [20, 30, 45, 60, 90].map(function (n) { return "<option" + (n === 45 ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Gruppo (per salvare i risultati)</span><select name="cliente">' + TD.opzioniClienti(c ? c.id : "") + "</select></label></div>" +
        '<div class="actions"><button class="btn btn-primary btn-lg" type="submit" name="modo" value="rete">' + I("wifi") + 'Apri l\'aula: rispondono dal telefono</button><button class="btn btn-lg" type="submit" name="modo" value="mano">' + I("hand") + "Senza Internet: alzata di mano</button></div>" +
        '<p class="muted text-small">Collega il computer alla Smart TV (cavo HDMI o trasmissione dello schermo) e premi F11 per il tutto schermo. Le domande sono a scelta multipla, vero o falso e completa la frase, sempre in ordine diverso.</p></form>';
    } else if (H.fase === "collegamento") {
      corpo = '<section class="card"><p>Apro il canale cifrato…</p></section>';
    } else if (H.fase === "attesa") {
      corpo = '<section class="aula-tv">' + (H.manuale ? '<h2>Alzata di mano</h2><p class="aula-grande">Ognuno prepara quattro cartellini: ▲ A · ◆ B · ● C · ■ D. Alla domanda li alza, tu tocchi i numeri.</p>'
        : '<div class="aula-entra">' + TD.qr.svg(linkAula(), { etichetta: "QR per entrare in aula" }) + '<div><h2>Inquadra e gioca!</h2><p class="aula-grande">Fotocamera del telefono sul QR, poi scrivi il tuo nome.</p><p class="aula-grande">Collegati: <strong>' + nG + "</strong></p><p>" + Object.keys(H.giocatori).map(function (id) { return '<span class="pill">' + E(H.giocatori[id].nome) + "</span>"; }).join(" ") + "</p></div></div>") +
        '<div class="actions"><button class="btn btn-primary btn-lg" id="aVia">' + I("play") + "Prima domanda</button><button class=\"btn\" id=\"aChiudi\">Chiudi l'aula</button>" + (H.manuale ? "" : '<button class="btn" id="aLink">' + I("copy") + "Copia il link</button>") + "</div></section>";
    } else if (H.fase === "domanda" && q) {
      const nr = Object.keys(H.risposte).length;
      const d = H.manuale ? H.conta : TD.aula.distribuzione(H.risposte, q.opzioni.length);
      corpo = '<section class="aula-tv"><p class="aula-top"><span>Domanda ' + q.n + " di " + H.domande.length + "</span>" + (H.mostra ? "" : '<span class="aula-tempo" id="aTempo">' + H.tempo + "</span>") + "<span>" + (H.manuale ? "" : nr + " / " + nG + " risposte") + "</span></p>" +
        '<h2 class="aula-domanda">' + E(q.testo) + (q.proposta ? "<br><em>«" + E(q.proposta) + "»</em>" : "") + "</h2>" +
        '<div class="aula-opzioni">' + q.opzioni.map(function (o, i) {
          return '<div class="aula-opz' + (H.mostra ? (i === q.giusta ? " giusta" : " spenta") : "") + '" style="--c:' + COLORI[i % 4] + '"><span class="aula-forma">' + FORME[i % 4] + " " + "ABCD"[i] + "</span><span>" + E(o) + "</span>" +
            (H.manuale && !H.mostra ? '<span class="aula-conta"><button class="icon-btn" data-meno="' + i + '" aria-label="Togli uno">−</button><b>' + H.conta[i] + '</b><button class="icon-btn" data-piu="' + i + '" aria-label="Aggiungi uno">+</button></span>' : "") + "</div>";
        }).join("") + "</div>" +
        (H.mostra ? barreDistribuzione(d, q.giusta, q.opzioni.map(function (_, i) { return "ABCD"[i]; })) + '<p class="aula-spiega">' + E(q.spiegazione) + "</p>" + (H.manuale ? "" : classificaHtml(5)) : "") +
        '<div class="actions">' + (H.mostra ? '<button class="btn btn-primary btn-lg" id="aAvanti">' + I("arrow") + (H.i + 1 < H.domande.length ? "Domanda successiva" : "Classifica finale") + "</button>" : '<button class="btn btn-primary btn-lg" id="aRivela">' + I("eye") + "Mostra la risposta</button>") + '<button class="btn" id="aChiudi">Chiudi</button></div></section>';
    } else if (H.fase === "fine") {
      corpo = '<section class="aula-tv"><h2>Classifica finale</h2>' + (H.manuale ? '<p class="aula-grande">Bravi tutti! Le risposte per alzata di mano non hanno classifica.</p>' : classificaHtml(20)) +
        '<div class="actions">' + (!H.manuale && TD.cliente(H.clienteId) ? '<button class="btn btn-primary" id="aSalva">' + I("check") + "Salva i risultati nel registro del gruppo</button>" : "") + '<button class="btn" id="aChiudi">Chiudi l\'aula</button></div></section>';
    }
    appEl.innerHTML = TD.intest("Modalità gruppo in aula", "La domanda sulla Smart TV, le risposte dai telefoni: quiz tutti insieme con classifica.") + '<div class="wrap">' + corpo + "</div>";
    collegaHost();
  }
  function classificaHtml(n) {
    const cl = TD.aula.classifica(H.giocatori).slice(0, n);
    return cl.length ? '<ol class="aula-classifica">' + cl.map(function (g, i) { return "<li><span>" + (i + 1) + ".</span><strong>" + E(g.nome) + "</strong><span>" + g.punti + " punti · " + g.giuste + " giuste</span></li>"; }).join("") + "</ol>" : '<p class="muted">Nessun partecipante collegato.</p>';
  }
  function collegaHost() {
    const $ = function (id) { return document.getElementById(id); };
    const f = $("aForm");
    if (f) f.onsubmit = function (e) {
      e.preventDefault();
      const o = TD.form(f), modo = e.submitter ? e.submitter.value : "rete";
      H.domande = TD.aula.domandePubbliche(TD.generaQuiz({ liv: o.liv === "" ? "" : Number(o.liv), dev: o.dev, n: Number(o.n), tipi: ["mc", "vf", "completa"], cumulativo: true }));
      H.tempo = Number(o.tempo) || 45; H.clienteId = o.cliente;
      apriStanza(modo === "mano");
    };
    if ($("aVia")) $("aVia").onclick = prossima;
    if ($("aAvanti")) $("aAvanti").onclick = prossima;
    if ($("aRivela")) $("aRivela").onclick = rivela;
    if ($("aChiudi")) $("aChiudi").onclick = function () { if (H.fase === "pronto" || TD.conferma("Chiudere l'aula? I telefoni verranno scollegati.")) chiudiAula(); };
    if ($("aLink")) $("aLink").onclick = function () { TD.scambio.copia(linkAula()).then(function (ok) { TD.toast(ok ? "Link copiato." : "Copia non riuscita."); }); };
    appEl.querySelectorAll("[data-piu]").forEach(function (b) { b.onclick = function () { H.conta[+b.dataset.piu]++; ridisegna(); }; });
    appEl.querySelectorAll("[data-meno]").forEach(function (b) { b.onclick = function () { H.conta[+b.dataset.meno] = Math.max(0, H.conta[+b.dataset.meno] - 1); ridisegna(); }; });
    if ($("aSalva")) $("aSalva").onclick = function () {
      const c = TD.cliente(H.clienteId); if (!c) return;
      c.quiz = c.quiz || []; const parts = c.partecipanti || [];
      let salvati = 0;
      TD.aula.classifica(H.giocatori).forEach(function (g) {
        const p = parts.find(function (x) { return x.nome.toLowerCase() === g.nome.toLowerCase() || x.nome.toLowerCase().split(" ")[0] === g.nome.toLowerCase().split(" ")[0]; });
        c.quiz.push({ id: TD.uid("q"), data: TD.oggi(), liv: "", dev: "aula", giuste: g.giuste, totale: H.domande.length, perc: Math.round(100 * g.giuste / H.domande.length), partecipante: p ? p.id : "", nome: g.nome, aula: true });
        salvati++;
      });
      TD.salva(); TD.toast(salvati + " risultati salvati nella scheda di " + TD.nomeCliente(c) + ".");
    };
  }

  /* ================================================================ ALLIEVO: telefono */
  const G = { canale: null, stato: null, id: "", nome: "", scelta: -1, n: 0, s: "", k: "", errore: "" };
  function idGiocatore() {
    try { let v = sessionStorage.getItem("td-aula-id"); if (!v) { v = TD.uid("g"); sessionStorage.setItem("td-aula-id", v); } return v; } catch (e) { return G.id || TD.uid("g"); }
  }
  /* ciò che arriva dalla «TV» si ricostruisce con tipi certi: numeri come numeri, testi come testi */
  function statoSicuro(m) {
    const n = function (x, d) { x = Number(x); return isFinite(x) ? x : (d || 0); };
    const t = function (x, max) { return String(x == null ? "" : x).slice(0, max || 500); };
    const q = m.domanda && typeof m.domanda === "object" ? { n: n(m.domanda.n), testo: t(m.domanda.testo), proposta: t(m.domanda.proposta), tipo: t(m.domanda.tipo, 20), opzioni: (Array.isArray(m.domanda.opzioni) ? m.domanda.opzioni : []).slice(0, 4).map(function (o) { return t(o, 300); }) } : null;
    return { fase: ["attesa", "domanda", "fine", "chiusa"].indexOf(m.fase) >= 0 ? m.fase : "attesa", n: n(m.n), totale: n(m.totale), giusta: n(m.giusta, -1), domanda: q,
      classifica: (Array.isArray(m.classifica) ? m.classifica : []).slice(0, 20).map(function (g) { return { id: t(g && g.id, 80), nome: t(g && g.nome, 24), punti: n(g && g.punti) }; }) };
  }
  async function entraAula() {
    G.id = idGiocatore();
    try {
      G.canale = await TD.relay.collega({ stanza: G.s, chiave: G.k, suMessaggio: function (m) {
        if (m.t !== "stato") return;
        G.stato = statoSicuro(m);
        if (G.stato.n !== G.n) { G.n = G.stato.n; G.scelta = -1; }
        ridisegna();
      }, suStato: function (s) { if (s === "chiuso") { G.errore = "Collegamento interrotto. Inquadra di nuovo il QR."; ridisegna(); } } });
      await G.canale.invia({ t: "entra", id: G.id, nome: G.nome });
      clearInterval(G.rientra); G.rientra = setInterval(function () { if (G.canale && (!G.stato || G.stato.fase === "attesa")) G.canale.invia({ t: "entra", id: G.id, nome: G.nome }); }, 5000);
    } catch (e) { G.errore = e.message; }
    ridisegna();
  }
  function disegnaGiocatore() {
    const st = G.stato;
    let corpo;
    if (!G.s || !G.k) corpo = '<section class="card"><h2>Aula</h2><p>Per entrare inquadra il QR mostrato sulla TV dal tutor.</p></section>';
    else if (G.errore) corpo = '<section class="card"><h2>Non riesco a entrare</h2><p>' + E(G.errore) + "</p></section>";
    else if (!G.canale) corpo = '<form class="card form" id="gForm"><h2>' + I("users") + 'Entra in aula</h2><label class="field"><span>Il tuo nome</span><input name="nome" required maxlength="24" value="' + E(G.nome || (TD.db.allievo && TD.db.allievo.nome) || "") + '" autocomplete="given-name"></label><div class="actions"><button class="btn btn-primary btn-lg" type="submit">' + I("play") + "Entra</button></div></form>";
    else if (!st || st.fase === "attesa") corpo = '<section class="card aula-tel"><h2>Ci sei, ' + E(G.nome) + '!</h2><p class="aula-grande">Guarda la TV: si comincia tra poco.</p></section>';
    else if (st.fase === "chiusa") corpo = '<section class="card"><h2>Aula chiusa</h2><p>Grazie per aver partecipato!</p><a class="btn" href="#/">Torna all\'inizio</a></section>';
    else if (st.fase === "domanda" && st.domanda) {
      const q = st.domanda, mostra = st.giusta >= 0;
      const mia = (st.classifica || []).findIndex(function (x) { return x.id === G.id; });
      corpo = '<section class="aula-tel"><p class="muted">Domanda ' + q.n + " di " + st.totale + "</p><h2>" + E(q.testo) + (q.proposta ? "<br><em>«" + E(q.proposta) + "»</em>" : "") + "</h2>" +
        '<div class="aula-tasti">' + q.opzioni.map(function (o, i) {
          const cls = mostra ? (i === st.giusta ? " giusta" : (i === G.scelta ? " sbagliata" : " spenta")) : (G.scelta === i ? " scelta" : "");
          return '<button class="aula-tasto' + cls + '" style="--c:' + COLORI[i % 4] + '" data-sc="' + i + '"' + (G.scelta >= 0 || mostra ? " disabled" : "") + '><span class="aula-forma">' + FORME[i % 4] + " " + "ABCD"[i] + "</span>" + E(o) + "</button>";
        }).join("") + "</div>" +
        (mostra ? '<p class="aula-grande">' + (G.scelta === st.giusta ? "✓ Giusto!" : G.scelta < 0 ? "Tempo scaduto" : "✗ Non questa volta") + "</p>" + (mia >= 0 ? "<p>Sei " + (mia + 1) + "° in classifica.</p>" : "") : G.scelta >= 0 ? '<p class="aula-grande">Risposta inviata: aspetta gli altri…</p>' : "") + "</section>";
    } else if (st.fase === "fine") {
      const cl = st.classifica || [], mia = cl.findIndex(function (x) { return x.id === G.id; });
      corpo = '<section class="card aula-tel"><h2>Fine!</h2><p class="aula-grande">' + (mia >= 0 ? "Sei arrivato " + (mia + 1) + "° con " + cl[mia].punti + " punti." : "Grazie per aver giocato!") + "</p></section>";
    } else corpo = '<section class="card"><p>In attesa del tutor…</p></section>';
    appEl.innerHTML = '<div class="wrap aula-tel-wrap">' + corpo + "</div>";
    const f = document.getElementById("gForm");
    if (f) f.onsubmit = function (e) { e.preventDefault(); G.nome = f.nome.value.trim().slice(0, 24); if (!G.nome) return; f.querySelector("button").disabled = true; entraAula(); };
    appEl.querySelectorAll("[data-sc]").forEach(function (b) {
      b.onclick = function () {
        if (G.scelta >= 0 || !G.stato) return;
        G.scelta = +b.dataset.sc; ridisegna();
        G.canale.invia({ t: "risposta", id: G.id, n: G.stato.domanda.n, scelta: G.scelta });
        if (navigator.vibrate) navigator.vibrate(40);
      };
    });
  }

  TD.rotta("/aula", function (app, p, q) {
    appEl = app;
    if (TD.MODO === "allievo") {
      if (q.s && q.k && (q.s !== G.s || q.k !== G.k)) { if (G.canale) G.canale.chiudi(); Object.assign(G, { canale: null, stato: null, s: q.s, k: q.k, errore: "", scelta: -1, n: 0 }); }
      disegnaGiocatore();
    } else disegnaHost();
  });
})();
