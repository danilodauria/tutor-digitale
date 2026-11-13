/* ==========================================================================
   Tutor Digitale · quiz con domande casuali e risposte che cambiano posto
   e lettera a ogni partita, verifiche stampabili con chiave separata
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;

  const STILI = [
    ["A", "B", "C", "D", "E", "F"],
    ["1", "2", "3", "4", "5", "6"],
    ["a", "b", "c", "d", "e", "f"],
    ["I", "II", "III", "IV", "V", "VI"]
  ];
  const TIPI = { mc: "Scelta multipla", vf: "Vero o falso", completa: "Completa la frase", seq: "Metti in ordine", abbina: "Abbina" };

  function memo(k) { return TD.db.memo[k] || {}; }
  function ricorda(k, dati) { TD.db.memo[k] = Object.assign({}, memo(k), dati, { t: Date.now() }); }

  /* dispone le opzioni in modo che la giusta non torni nella posizione
     dell'ultima volta e l'ordine non sia mai identico */
  function disponi(k, opzioni, stileEscluso) {
    const m = memo(k);
    let ord, tent = 0;
    do { ord = TD.mescola(opzioni); tent++; }
    while (tent < 30 && opzioni.length > 1 && (ord.findIndex(function (o) { return o.ok; }) === m.pos || ord.map(function (o) { return o.t; }).join("|") === m.firma));
    const candidati = [0, 1, 2, 3].filter(function (s) { return s !== m.stile && s !== stileEscluso; });
    const stile = candidati[TD.rnd(candidati.length)];
    ricorda(k, { pos: ord.findIndex(function (o) { return o.ok; }), firma: ord.map(function (o) { return o.t; }).join("|"), stile: stile });
    return { opzioni: ord, etichette: STILI[stile], stile: stile };
  }

  function filtra(arr, liv, dev, cumul, iLiv, iDev) {
    return arr.filter(function (x) {
      const okL = liv == null || liv === "" ? true : (cumul ? x[iLiv] <= Number(liv) : x[iLiv] === Number(liv));
      const okD = !dev || dev === "tutti" || iDev == null ? true : x[iDev] === dev;
      return okL && okD;
    });
  }
  function piuVecchie(lista, chiave) {
    return lista.map(function (x) { return { x: x, t: (memo(chiave(x)).t || 0) + TD.rnd(1000) }; })
      .sort(function (a, b) { return a.t - b.t; }).map(function (o) { return o.x; });
  }

  TD.generaQuiz = function (opz) {
    const liv = opz.liv, dev = opz.dev, cumul = !!opz.cumulativo, n = opz.n || 10;
    const tipi = opz.tipi && opz.tipi.length ? opz.tipi : ["mc", "vf", "completa", "seq", "abbina"];
    const pool = {
      mc: filtra(TD.DOMANDE, liv, dev, cumul, 0, 1),
      vf: filtra(TD.DOMANDE, liv, dev, cumul, 0, 1),
      completa: filtra(TD.COMPLETA, liv, dev, cumul, 0, 1),
      seq: filtra(TD.SEQUENZE, liv, dev, cumul, 0, 1),
      abbina: filtra(TD.GLOSSARIO, liv, null, true, 0, null)
    };
    if (pool.abbina.length < 4) pool.abbina = TD.GLOSSARIO.slice();
    // se il filtro è troppo stretto si allarga a tutti i percorsi del livello
    if (pool.mc.length < 4) { pool.mc = filtra(TD.DOMANDE, liv, null, true, 0, 1); pool.vf = pool.mc; }
    if (pool.completa.length < 1) pool.completa = filtra(TD.COMPLETA, liv, null, true, 0, 1);
    if (pool.seq.length < 1) pool.seq = filtra(TD.SEQUENZE, liv, null, true, 0, 1);

    // quote per tipo: la scelta multipla è la base, gli altri tipi danno varietà
    const quote = {};
    const pesi = { mc: 4, vf: 2, completa: 2, seq: 1, abbina: 1 };
    const attivi = tipi.filter(function (t) { return pool[t] && pool[t].length; });
    const somma = attivi.reduce(function (s, t) { return s + pesi[t]; }, 0);
    attivi.forEach(function (t) { quote[t] = Math.max(attivi.length > 1 ? 1 : n, Math.round(n * pesi[t] / somma)); });
    let tot = attivi.reduce(function (s, t) { return s + quote[t]; }, 0);
    while (tot > n) { const t = attivi.slice().sort(function (a, b) { return quote[b] - quote[a]; })[0]; quote[t]--; tot--; }
    while (tot < n) { quote[attivi[TD.rnd(attivi.length)]]++; tot++; }

    const usateMc = {};
    const out = [];
    attivi.forEach(function (t) {
      const lista = piuVecchie(pool[t], function (x) { return t + ":" + (x[2] || x[1]); });
      let presi = 0;
      for (let i = 0; i < lista.length && presi < quote[t]; i++) {
        const x = lista[i];
        if (t === "mc" || t === "vf") { if (usateMc[x[2]]) continue; usateMc[x[2]] = 1; }
        out.push(costruisci(t, x, pool)); presi++;
      }
    });
    // se il percorso scelto ha poche domande, si completa con lo stesso livello degli altri percorsi
    if (out.length < n) {
      const largo = piuVecchie(filtra(TD.DOMANDE, liv, null, cumul, 0, 1), function (x) { return "mc:" + x[2]; });
      const tipoExtra = attivi.indexOf("mc") >= 0 ? "mc" : attivi.indexOf("vf") >= 0 ? "vf" : "mc";
      for (let i = 0; i < largo.length && out.length < n; i++) {
        if (usateMc[largo[i][2]]) continue;
        usateMc[largo[i][2]] = 1;
        out.push(costruisci(tipoExtra, largo[i], pool));
      }
    }
    let ord = TD.mescola(out);
    let stilePrec = -1;
    ord.forEach(function (q) {
      if (q.opzioni) {
        const d = disponi(q.key, q.opzioni, stilePrec);
        q.opzioni = d.opzioni; q.etichette = d.etichette; stilePrec = d.stile;
      } else if (q.tipo === "abbina") {
        const d = disponi(q.key, q.definizioni.map(function (t, i) { return { t: t, ok: i === 0 }; }), stilePrec);
        q.definizioni = d.opzioni.map(function (o) { return o.t; }); q.etichette = d.etichette; stilePrec = d.stile;
      }
    });
    TD.salva();
    return ord;
  };

  function costruisci(t, x, pool) {
    if (t === "mc") return { tipo: "mc", key: "mc:" + x[2], liv: x[0], dev: x[1], testo: x[2], opzioni: [{ t: x[3], ok: true }].concat(x[4].map(function (w) { return { t: w, ok: false }; })), spiegazione: x[5] };
    if (t === "vf") {
      const vero = TD.rnd(2) === 0;
      const proposta = vero ? x[3] : x[4][TD.rnd(x[4].length)];
      return { tipo: "vf", key: "vf:" + x[2], liv: x[0], dev: x[1], testo: x[2], proposta: proposta,
        opzioni: [{ t: "Vero", ok: vero }, { t: "Falso", ok: !vero }],
        spiegazione: (vero ? "È vero. " : "È falso: la risposta giusta è «" + x[3] + "». ") + x[5] };
    }
    if (t === "completa") return { tipo: "completa", key: "completa:" + x[2], liv: x[0], dev: x[1], testo: x[2], opzioni: [{ t: x[3], ok: true }].concat(x[4].map(function (w) { return { t: w, ok: false }; })), spiegazione: "La parola giusta è «" + x[3] + "»." };
    if (t === "seq") {
      let mes; let k = 0;
      do { mes = TD.mescola(x[3]); k++; } while (k < 20 && mes.join("|") === x[3].join("|"));
      return { tipo: "seq", key: "seq:" + x[2], liv: x[0], dev: x[1], testo: x[2], giusto: x[3], mescolato: mes, spiegazione: "Ordine corretto: " + x[3].map(function (s, i) { return (i + 1) + ". " + s; }).join(" · ") };
    }
    if (t === "abbina") {
      const scelti = TD.mescola(pool.abbina).slice(0, 4);
      return { tipo: "abbina", key: "abbina:" + scelti.map(function (s) { return s[1]; }).sort().join(","), liv: Math.max.apply(null, scelti.map(function (s) { return s[0]; })), dev: "",
        termini: scelti.map(function (s) { return s[1]; }), corrette: scelti.map(function (s) { return s[2]; }),
        definizioni: scelti.map(function (s) { return s[2]; }), testo: "Abbina ogni parola alla sua spiegazione",
        spiegazione: scelti.map(function (s) { return s[1] + " = " + s[2]; }).join(" · ") };
    }
  }

  function valuta(q, risposta) {
    if (q.tipo === "seq") return Array.isArray(risposta) && risposta.join("|") === q.giusto.join("|");
    if (q.tipo === "abbina") return Array.isArray(risposta) && q.termini.every(function (_, i) { return q.definizioni[risposta[i]] === q.corrette[i]; });
    return q.opzioni[risposta] && q.opzioni[risposta].ok;
  }

  /* ---------------------------------------------------------------- vista */
  TD.rotta("/quiz", function (app, p, query) {
    const c = TD.clienteAttivo();
    const imp = TD.db.impostazioni;
    app.innerHTML = TD.intest("Quiz", "Domande scelte a caso, risposte che cambiano posizione e cambiano lettera o numero a ogni partita: mai due quiz uguali.") +
      '<div class="wrap"><form class="card quiz-setup" id="setup">' +
        '<div class="grid-3">' +
          '<label class="field"><span>Livello</span><select name="liv"><option value="">Tutti</option>' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '"' + (String(query.liv) === String(l.id) ? " selected" : "") + ">" + E(l.nome) + "</option>"; }).join("") + "</select></label>" +
          '<label class="field"><span>Percorso</span><select name="dev"><option value="tutti">Tutti i percorsi</option>' + TD.PERCORSI.map(function (x) { return '<option value="' + x.id + '"' + (query.dev === x.id ? " selected" : "") + ">" + E(x.nome) + "</option>"; }).join("") + "</select></label>" +
          '<label class="field"><span>Numero di domande</span><select name="n"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label>' +
        "</div>" +
        '<fieldset class="field"><legend>Tipi di domanda</legend><div class="checkrow">' +
          Object.keys(TIPI).map(function (t) { return '<label class="check"><input type="checkbox" name="tipi" data-multi="1" value="' + t + '" checked> ' + TIPI[t] + "</label>"; }).join("") +
        "</div></fieldset>" +
        '<div class="grid-3">' +
          '<label class="check"><input type="checkbox" name="cumulativo" checked> Includi anche i livelli precedenti</label>' +
          '<label class="field"><span>Correzione</span><select name="correzione"><option value="subito"' + (imp.correzione !== "fine" ? " selected" : "") + '>Subito, con spiegazione (esercitazione)</option><option value="fine"' + (imp.correzione === "fine" ? " selected" : "") + ">Alla fine (verifica)</option></select></label>" +
          (TD.MODO === "allievo" ? "" : '<label class="field"><span>Risultato da salvare per</span><select name="cliente">' + TD.opzioniClienti(c ? c.id : "") + "</select></label>") +
        "</div>" +
        '<div class="actions"><button class="btn btn-primary btn-lg" type="submit">' + I("play") + 'Inizia il quiz</button>' + (TD.MODO === "allievo" ? "" : '<button class="btn" type="button" id="stampaVer">' + I("print") + "Verifica stampabile + chiave</button>") + "</div>" +
      "</form>" +
      '<p class="muted text-small">Il programma ricorda in che posizione e con quale lettera è uscita ogni risposta giusta e la sposta la volta successiva; sceglie prima le domande che non escono da più tempo.</p></div>';

    const form = document.getElementById("setup");
    form.onsubmit = function (e) {
      e.preventDefault();
      const o = TD.form(form);
      if (!o.tipi.length) { TD.toast("Scegli almeno un tipo di domanda."); return; }
      imp.correzione = o.correzione; TD.salva();
      gioca(app, o);
    };
    const sv = document.getElementById("stampaVer");
    if (sv) sv.onclick = function () {
      const o = TD.form(form);
      if (!o.tipi.length) { TD.toast("Scegli almeno un tipo di domanda."); return; }
      verificaStampabile(o);
    };
  });

  TD.rotta("/quiz/gioco", function () { TD.vai("#/quiz"); });

  function gioca(app, o) {
    if (location.hash !== "#/quiz/gioco") history.pushState(null, "", "#/quiz/gioco");
    const domande = TD.generaQuiz({ liv: o.liv, dev: o.dev, n: Number(o.n), tipi: o.tipi, cumulativo: o.cumulativo });
    const risposte = new Array(domande.length);
    const esiti = new Array(domande.length);
    let i = 0;
    const subito = o.correzione !== "fine";
    function mostra() {
      const q = domande[i];
      let corpo = "";
      if (q.tipo === "mc" || q.tipo === "completa") {
        corpo = '<p class="q-text">' + E(q.testo).replace("___", '<span class="blank">______</span>') + "</p>" + opzioniHtml(q);
      } else if (q.tipo === "vf") {
        corpo = '<p class="q-text">' + E(q.testo) + '</p><p class="q-proposta">Risposta proposta: <strong>' + E(q.proposta) + "</strong></p><p class=\"muted\">È giusta?</p>" + opzioniHtml(q);
      } else if (q.tipo === "seq") {
        const cur = risposte[i] || q.mescolato.slice();
        risposte[i] = cur;
        corpo = '<p class="q-text">Metti in ordine i passaggi: <strong>' + E(q.testo) + '</strong></p><ol class="seq" id="seq">' +
          cur.map(function (s, k) { return '<li><span>' + E(s) + '</span><span class="seq-btns"><button type="button" data-su="' + k + '" aria-label="Sposta su"' + (k === 0 ? " disabled" : "") + '>▲</button><button type="button" data-giu="' + k + '" aria-label="Sposta giù"' + (k === cur.length - 1 ? " disabled" : "") + ">▼</button></span></li>"; }).join("") +
          '</ol><button class="btn btn-primary" id="confSeq"' + (esiti[i] != null ? " disabled" : "") + ">" + I("check") + "Conferma l'ordine</button>";
      } else if (q.tipo === "abbina") {
        const cur = risposte[i] || [];
        corpo = '<p class="q-text">' + E(q.testo) + '</p><ul class="defs">' + q.definizioni.map(function (d, k) { return "<li><b>" + E(q.etichette[k]) + "</b> " + E(d) + "</li>"; }).join("") + "</ul>" +
          '<div class="match">' + q.termini.map(function (t, k) {
            return '<label class="match-row"><span>' + E(t) + '</span><select data-term="' + k + '"><option value="">—</option>' + q.definizioni.map(function (_, j) { return '<option value="' + j + '"' + (String(cur[k]) === String(j) ? " selected" : "") + ">" + E(q.etichette[j]) + "</option>"; }).join("") + "</select></label>";
          }).join("") + '</div><button class="btn btn-primary" id="confAbb"' + (esiti[i] != null ? " disabled" : "") + ">" + I("check") + "Conferma</button>";
      }
      const fb = esiti[i] != null && subito ? '<div class="feedback ' + (esiti[i] ? "ok" : "ko") + '"><strong>' + (esiti[i] ? "Giusto!" : "Non proprio.") + "</strong> " + E(q.spiegazione || "") + "</div>" : "";
      app.innerHTML = '<div class="wrap quiz-play"><div class="quiz-top"><span>' + E(TIPI[q.tipo]) + " · " + TD.badgeLiv(q.liv) + "</span><span>Domanda " + (i + 1) + " di " + domande.length + "</span></div>" +
        TD.barra(i + (esiti[i] != null ? 1 : 0), domande.length) +
        '<div class="card q-card">' + corpo + fb + "</div>" +
        '<div class="quiz-nav"><button class="btn" id="prev"' + (i === 0 ? " disabled" : "") + ">" + I("back") + 'Indietro</button><button class="btn" id="leggiQ">' + I("speaker") + "Leggi</button>" +
        '<button class="btn btn-primary" id="next"' + (esiti[i] == null && !(q.tipo === "seq" || q.tipo === "abbina") && subito ? " disabled" : "") + ">" + (i === domande.length - 1 ? "Risultato " : "Avanti ") + I("arrow") + "</button></div></div>";

      app.querySelectorAll("[data-opt]").forEach(function (b) {
        b.onclick = function () {
          if (esiti[i] != null && subito) return;
          risposte[i] = Number(b.dataset.opt); esiti[i] = valuta(q, risposte[i]);
          if (subito) mostra(); else { app.querySelectorAll("[data-opt]").forEach(function (x) { x.classList.toggle("sel", x === b); }); document.getElementById("next").disabled = false; }
        };
      });
      const seq = document.getElementById("seq");
      if (seq) seq.onclick = function (e) {
        const b = e.target.closest("button"); if (!b || esiti[i] != null) return;
        const arr = risposte[i];
        if (b.dataset.su) { const k = +b.dataset.su; const t = arr[k - 1]; arr[k - 1] = arr[k]; arr[k] = t; }
        if (b.dataset.giu) { const k = +b.dataset.giu; const t = arr[k + 1]; arr[k + 1] = arr[k]; arr[k] = t; }
        mostra();
      };
      const cs = document.getElementById("confSeq");
      if (cs) cs.onclick = function () { esiti[i] = valuta(q, risposte[i]); if (subito) mostra(); else TD.toast("Ordine registrato."); };
      app.querySelectorAll("[data-term]").forEach(function (s) {
        s.onchange = function () { risposte[i] = risposte[i] || []; risposte[i][+s.dataset.term] = s.value === "" ? "" : Number(s.value); };
      });
      const ca = document.getElementById("confAbb");
      if (ca) ca.onclick = function () { esiti[i] = valuta(q, risposte[i] || []); if (subito) mostra(); else TD.toast("Abbinamenti registrati."); };
      document.getElementById("prev").onclick = function () { i--; mostra(); };
      document.getElementById("next").onclick = function () {
        if ((q.tipo === "seq" || q.tipo === "abbina") && esiti[i] == null) esiti[i] = valuta(q, risposte[i] || []);
        if (i < domande.length - 1) { i++; mostra(); } else fine();
      };
      document.getElementById("leggiQ").onclick = function () {
        let t = q.testo.replace("___", "puntini");
        if (q.proposta) t += ". Risposta proposta: " + q.proposta + ". È giusta?";
        if (q.opzioni && q.tipo !== "vf") t += ". " + q.opzioni.map(function (op, k) { return q.etichette[k] + ": " + op.t; }).join(". ");
        TD.leggi(t);
      };
    }
    function opzioniHtml(q) {
      return '<div class="opts">' + q.opzioni.map(function (op, k) {
        let cls = "opt";
        if (esiti[i] != null && subito) { if (op.ok) cls += " right"; else if (risposte[i] === k) cls += " wrong"; }
        else if (risposte[i] === k) cls += " sel";
        return '<button type="button" class="' + cls + '" data-opt="' + k + '"><b>' + E(q.etichette[k]) + "</b><span>" + E(op.t) + "</span></button>";
      }).join("") + "</div>";
    }
    function fine() {
      const giuste = esiti.filter(Boolean).length, tot = domande.length;
      const perc = Math.round(100 * giuste / tot);
      const cl = TD.cliente(o.cliente);
      if (TD.MODO === "allievo") {
        TD.db.allenamenti = TD.db.allenamenti || [];
        TD.db.allenamenti.push({ data: TD.oggi(), liv: o.liv, dev: o.dev, giuste: giuste, totale: tot, perc: perc });
        TD.salva();
      }
      if (cl) {
        cl.quiz = cl.quiz || [];
        cl.quiz.push({ id: TD.uid("q"), data: TD.oggi(), liv: o.liv, dev: o.dev, giuste: giuste, totale: tot, perc: perc });
        TD.salva();
      }
      const giudizio = perc >= 90 ? "Eccellente!" : perc >= 75 ? "Molto bene!" : perc >= 60 ? "Superato." : "Da ripassare con calma.";
      app.innerHTML = '<div class="wrap"><div class="card result"><div class="score" style="--p:' + perc + '"><strong>' + perc + "%</strong><span>" + giuste + " su " + tot + "</span></div>" +
        "<h1>" + E(giudizio) + "</h1>" + (cl ? '<p class="muted">Risultato salvato nella scheda di ' + E(TD.nomeCliente(cl)) + ".</p>" : "") +
        '<div class="actions"><button class="btn btn-primary" id="ancora">' + I("play") + 'Nuovo quiz (domande diverse)</button><a class="btn" href="#/quiz">Cambia impostazioni</a></div></div>' +
        '<section class="block"><h2>Correzione</h2><ol class="review">' + domande.map(function (q, k) {
          return '<li class="' + (esiti[k] ? "ok" : "ko") + '"><span class="rv-mark">' + I(esiti[k] ? "check" : "x") + "</span><div><p><strong>" + E(q.testo) + "</strong>" + (q.proposta ? " — proposta: «" + E(q.proposta) + "»" : "") + "</p><p class=\"muted\">" + E(q.spiegazione || "") + "</p></div></li>";
        }).join("") + "</ol></section></div>";
      document.getElementById("ancora").onclick = function () { gioca(app, o); };
    }
    mostra();
  }

  /* --------------------------------------------------- verifica cartacea */
  function verificaStampabile(o) {
    const tipi = o.tipi;
    const domande = TD.generaQuiz({ liv: o.liv, dev: o.dev, n: Number(o.n), tipi: tipi, cumulativo: o.cumulativo });
    const codice = "V-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const liv = o.liv !== "" ? TD.livello(Number(o.liv)) : null;
    const titolo = "Verifica" + (liv ? " · " + liv.nome : "") + (o.dev && o.dev !== "tutti" ? " · " + TD.percorso(o.dev).nome : "");
    const cl = TD.cliente(o.cliente);

    const d = new TD.Documento({ titolo: titolo + " · " + codice, piede: "Tutor Digitale · " + titolo + " · versione " + codice, colore: liv ? liv.colore : "#1d3557" });
    d.intestazione(TD.db.profilo, "Verifica delle competenze");
    d.h1(titolo);
    d.campi([["Nome e cognome", cl && cl.tipo !== "ente" ? TD.nomeCliente(cl) : ""], ["Data", TD.dataIt(TD.oggi())], ["Versione", codice], ["Punteggio", "        / " + domande.length]], 2);
    d.piccolo("Segna una sola risposta per domanda. Nelle domande «Metti in ordine» scrivi il numero del passaggio nella casella.", { dopo: 20 });
    const chiave = [];
    domande.forEach(function (q, k) {
      d.spazio(220);
      const n = (k + 1) + ". ";
      if (q.tipo === "seq") {
        d.p(n + "Metti in ordine: " + q.testo, { peso: 700 });
        q.mescolato.forEach(function (s) { d.casella(s, false, { dopo: 8 }); });
        chiave.push(n + q.mescolato.map(function (s) { return q.giusto.indexOf(s) + 1; }).join(" – "));
      } else if (q.tipo === "abbina") {
        d.p(n + q.testo + " (scrivi la lettera accanto alla parola)", { peso: 700 });
        q.definizioni.forEach(function (df, j) { d.p(q.etichette[j] + ")  " + df, { rientro: 30, dopo: 4 }); });
        q.termini.forEach(function (t) { d.p("______  " + t, { rientro: 30, dopo: 4 }); });
        chiave.push(n + q.termini.map(function (t, j) { return t + " = " + q.etichette[q.definizioni.indexOf(q.corrette[j])]; }).join(" · "));
      } else {
        d.p(n + q.testo + (q.proposta ? "  —  Risposta proposta: «" + q.proposta + "». È giusta?" : ""), { peso: 700 });
        q.opzioni.forEach(function (op, j) { d.casella(q.etichette[j] + ")  " + op.t, false, { dopo: 6 }); });
        const g = q.opzioni.findIndex(function (op) { return op.ok; });
        chiave.push(n + q.etichette[g] + ")  " + q.opzioni[g].t);
      }
      d.y += 10;
    });
    const pagine = d.chiudi();

    const k = new TD.Documento({ titolo: "Chiave · " + codice, piede: "Solo per il docente · versione " + codice, colore: "#7f1d1d" });
    k.intestazione(TD.db.profilo, "Chiave di correzione · riservata al docente");
    k.h1("Chiave di correzione " + codice);
    k.piccolo(titolo + " · " + domande.length + " domande · soglia di superamento consigliata: 60%", { dopo: 20 });
    chiave.forEach(function (r) { k.p(r, { dopo: 8 }); });
    const pagChiave = k.chiudi();

    const box = document.createElement("div");
    box.className = "modal";
    box.innerHTML = '<div class="modal-box"><h2>Verifica ' + E(codice) + ' pronta</h2><p>Ogni verifica stampata ha domande, ordine e lettere diversi. La chiave è un file a parte, da tenere per te.</p>' +
      '<div class="actions"><button class="btn btn-primary" id="vPdf">' + I("download") + 'Verifica PDF</button><button class="btn" id="vPrint">' + I("print") + 'Stampa verifica</button><button class="btn" id="kPdf">' + I("lock") + 'Chiave PDF</button><button class="btn" id="kPrint">' + I("print") + 'Stampa chiave</button></div>' +
      '<div class="doc-preview" id="vPrev"></div><button class="btn btn-ghost" id="vChiudi">Chiudi</button></div>';
    document.body.appendChild(box);
    TD.anteprima(box.querySelector("#vPrev"), pagine.slice(0, 1));
    box.querySelector("#vPdf").onclick = function () { TD.scaricaPdf(pagine, "verifica-" + codice + ".pdf", { titolo: titolo }); };
    box.querySelector("#vPrint").onclick = function () { TD.stampa(pagine); };
    box.querySelector("#kPdf").onclick = function () { TD.scaricaPdf(pagChiave, "chiave-" + codice + ".pdf", { titolo: "Chiave " + codice }); };
    box.querySelector("#kPrint").onclick = function () { TD.stampa(pagChiave); };
    box.querySelector("#vChiudi").onclick = function () { box.remove(); };
  }
  TD.verificaStampabile = verificaStampabile;
})();
