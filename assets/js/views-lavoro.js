/* ==========================================================================
   Tutor Digitale · registro presenze per gli enti e statistiche del lavoro
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  function nomeMese(ym) { const p = String(ym).split("-"); return MESI[(+p[1] || 1) - 1] + " " + p[0]; }
  function fineOra(ora, min) {
    if (!ora) return "";
    const t = ora.split(":"); const tot = (+t[0]) * 60 + (+t[1] || 0) + (Number(min) || 0);
    return String(Math.floor(tot / 60) % 24).padStart(2, "0") + ":" + String(tot % 60).padStart(2, "0");
  }
  function oreTesto(min) { return (min / 60).toLocaleString("it-IT", { maximumFractionDigits: 1 }); }
  function partecipanti(c) {
    if ((c.partecipanti || []).length) return c.partecipanti;
    return [{ id: "_", nome: TD.nomeCliente(c) }];
  }
  function presente(r, x) { return x.id === "_" ? true : (r.presenti || []).indexOf(x.id) >= 0; }
  function argomenti(r) { return (r.argomenti || []).map(function (id) { const l = TD.lezione(id); return l ? l.titolo : id; }).join("; "); }

  /* ======================================================= (7) cruscotto del tutor */
  TD.prioritaTutor = function (db, oggi) {
    oggi = oggi || TD.oggi();
    const giorniDa = function (data) {
      if (!data) return null;
      return Math.round((new Date(oggi + "T12:00:00") - new Date(data + "T12:00:00")) / 86400000);
    };
    const out = [];
    (db.clienti || []).forEach(function (c) {
      if (c.stato === "concluso") return;
      const reg = (c.registro || []).filter(function (r) { return r.stato !== "pianificata" && r.data; });
      const compiti = (c.compiti || []).filter(function (k) { return !k.fatto; });
      const scaduti = compiti.filter(function (k) { return k.scadenza && k.scadenza < oggi; });
      const quiz = (c.quiz || []).slice().sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); });
      const ultimoQuiz = quiz[quiz.length - 1];
      const media = TD.mediaQuiz(c);
      const quizBasso = ultimoQuiz ? Number(ultimoQuiz.perc) < 60 : (media != null && media < 60);
      const ultima = reg.slice().sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); }).pop();
      const fermo = ultima ? giorniDa(ultima.data) : (c.creato ? giorniDa(c.creato) : null);
      const daIncassare = reg.filter(function (r) { return Number(r.importo) > 0 && !r.pagato && r.data < oggi; }).reduce(function (s, r) { return s + Number(r.importo); }, 0);
      const prossimo = (c.registro || []).filter(function (r) { return r.stato === "pianificata" && r.data >= oggi; }).sort(function (a, b) { return (a.data + (a.ora || "")).localeCompare(b.data + (b.ora || "")); })[0] || null;
      const attestato = (c.completate || []).length >= 8 && (media == null || media >= 60) && !(db.attestati || []).some(function (a) { return a.cliente === c.id; });
      const flags = [];
      if (compiti.length) flags.push({ tipo: "compiti", icona: "alert", testo: scaduti.length ? scaduti.length + (scaduti.length === 1 ? " compito scaduto" : " compiti scaduti") : compiti.length + (compiti.length === 1 ? " compito aperto" : " compiti aperti"), peso: scaduti.length ? 4 : 2, href: "#/cliente/" + c.id + "?tab=compiti" });
      if (fermo != null && fermo >= 21) flags.push({ tipo: "fermo", icona: "clock", testo: "Fermo da " + fermo + " giorni", peso: 3, href: "#/cliente/" + c.id + "?tab=registro" });
      if (quizBasso) flags.push({ tipo: "quiz", icona: "quiz", testo: "Quiz " + (ultimoQuiz ? ultimoQuiz.perc + "%" : "media " + media + "%"), peso: 2, href: "#/cliente/" + c.id + "?tab=quiz" });
      if (daIncassare > 0) flags.push({ tipo: "incasso", icona: "euro", testo: TD.euro(daIncassare) + " da incassare", peso: 1, href: "#/cliente/" + c.id + "?tab=registro" });
      if (attestato) flags.push({ tipo: "attestato", icona: "award", testo: "Attestato da valutare", peso: 1, href: "#/cliente/" + c.id + "?tab=percorso" });
      if (!flags.length) return;
      out.push({ cliente: c, flags: flags, peso: flags.reduce(function (s, f) { return s + f.peso; }, 0), scaduti: scaduti.length, daIncassare: daIncassare, fermo: fermo, prossimo: prossimo });
    });
    return out.sort(function (a, b) { return b.peso - a.peso || TD.nomeCliente(a.cliente).localeCompare(TD.nomeCliente(b.cliente)); });
  };

  TD.rotta("/cruscotto", function (app) {
    const lista = TD.prioritaTutor(TD.db, TD.oggi());
    const scaduti = lista.reduce(function (s, x) { return s + x.scaduti; }, 0);
    const daIncassare = lista.reduce(function (s, x) { return s + x.daIncassare; }, 0);
    const fermi = lista.filter(function (x) { return x.flags.some(function (f) { return f.tipo === "fermo"; }); }).length;
    app.innerHTML = TD.intest("Cruscotto del tutor", "Chi ha bisogno di cosa, oggi: compiti scaduti, quiz sotto soglia, allievi fermi, incassi e attestati da valutare. Le priorità vengono dal registro, dai compiti e dai quiz.",
      '<div class="actions"><a class="btn" href="#/agenda">' + I("calendar") + 'Agenda</a><a class="btn" href="#/clienti">' + I("users") + "Tutti i clienti</a></div>") +
      '<div class="wrap">' +
        '<div class="stats">' +
          '<a class="stat" href="#/clienti">' + I("users") + "<strong>" + lista.length + "</strong><span>clienti da seguire</span></a>" +
          '<a class="stat" href="#/clienti">' + I("alert") + "<strong>" + scaduti + "</strong><span>compiti scaduti</span></a>" +
          '<a class="stat" href="#/statistiche">' + I("euro") + "<strong>" + TD.euro(daIncassare) + "</strong><span>da incassare</span></a>" +
          '<a class="stat" href="#/clienti">' + I("clock") + "<strong>" + fermi + "</strong><span>allievi fermi</span></a>" +
        "</div>" +
        (lista.length ? '<div class="grid-2">' + lista.map(function (x) {
          const c = x.cliente;
          return '<article class="card"><div class="block-head"><h3><a href="#/cliente/' + c.id + '">' + E(TD.nomeCliente(c)) + '</a></h3><span class="pill">' + x.peso + " priorità</span></div>" +
            '<ul class="list">' + x.flags.map(function (f) { return '<li>' + I(f.icona) + ' <a href="' + E(f.href) + '">' + E(f.testo) + "</a></li>"; }).join("") + "</ul>" +
            (x.prossimo ? '<p class="muted text-small">Prossimo incontro: ' + E(TD.dataIt(x.prossimo.data)) + (x.prossimo.ora ? " · " + E(x.prossimo.ora) : "") + "</p>" : '<p class="muted text-small">Nessun prossimo incontro in agenda.</p>') +
            '<div class="actions"><a class="btn btn-sm" href="#/cliente/' + c.id + '">Apri la scheda</a><a class="btn btn-sm btn-ghost" href="#/agenda">Agenda</a></div></article>';
        }).join("") + "</div>" : '<div class="card empty"><p>Nessuna priorità: compiti in ordine, quiz sopra la soglia, nessun incasso arretrato. Buon lavoro.</p><a class="btn" href="#/agenda">Guarda l\'agenda</a></div>') +
        '<section class="card"><h2>Scorciatoie</h2><div class="actions"><a class="btn btn-primary" href="#/agenda">' + I("calendar") + 'Agenda</a><a class="btn" href="#/statistiche">' + I("layers") + 'Statistiche</a><a class="btn" href="#/strumenti/test">' + I("target") + 'Test d\'ingresso</a><a class="btn" href="#/documenti">' + I("doc") + "Documenti</a></div></section>" +
      "</div>";
  });

  /* ======================================================= (6) registro presenze */
  TD.incontriDelMese = function (c, ym, conPianificati) {
    return (c.registro || []).filter(function (r) { return String(r.data).slice(0, 7) === ym && (conPianificati || r.stato !== "pianificata"); })
      .sort(function (a, b) { return (a.data + (a.ora || "")).localeCompare(b.data + (b.ora || "")); });
  };

  TD.pdfPresenze = function (c, ym, opz, firmaDoc) {
    opz = opz || {};
    const pr = TD.db.profilo;
    const inc = TD.incontriDelMese(c, ym, opz.pianificati);
    const parts = partecipanti(c);
    const totMin = inc.filter(function (r) { return r.stato !== "pianificata"; }).reduce(function (s, r) { return s + (Number(r.durata) || 0); }, 0);
    const d = new TD.Documento({ orizzontale: true, titolo: "Registro presenze · " + TD.nomeCliente(c) + " · " + nomeMese(ym), piede: "Tutor Digitale · registro presenze " + nomeMese(ym) });
    d.intestazione(pr, "Registro presenze");
    d.h1("Registro presenze · " + nomeMese(ym));
    d.campi([
      [c.tipo === "ente" ? "Ente o gruppo" : "Allievo", TD.nomeCliente(c)],
      ["Referente", c.tipo === "ente" ? (c.referente || "") : (c.tutore || "")],
      ["Sede delle lezioni", [c.luogo, c.indirizzo, c.citta].filter(Boolean).join(" · ")],
      ["Docente", pr.nome + (pr.qualifica ? " · " + pr.qualifica : "")],
      ["Incontri svolti", String(inc.filter(function (r) { return r.stato !== "pianificata"; }).length)],
      ["Ore svolte", oreTesto(totMin)]
    ], 3);

    d.h2("Incontri del mese");
    if (inc.length) {
      d.tabella(["N.", "Data", "Orario", "Durata", "Argomenti", "Presenti", "Firma docente"], inc.map(function (r, i) {
        const n = parts.filter(function (x) { return presente(r, x); }).length;
        return [String(i + 1), TD.dataIt(r.data) + (r.stato === "pianificata" ? " (prev.)" : ""), (r.ora || "") + (r.ora ? "–" + fineOra(r.ora, r.durata) : ""), (r.durata || 0) + " min",
          (argomenti(r) + (r.note ? " — " + r.note : "")) || "—", n + "/" + parts.length, " "];
      }), [0.04, 0.11, 0.12, 0.08, 0.37, 0.08, 0.2]);
    } else d.p("Nessun incontro registrato in questo mese.", { colore: "#6b7280" });

    /* griglia: partecipanti × date, a blocchi di 10 date */
    if (inc.length && parts.length) {
      for (let k = 0; k < inc.length; k += 10) {
        const blocco = inc.slice(k, k + 10);
        d.h2("Presenze" + (inc.length > 10 ? " (" + (k + 1) + "–" + (k + blocco.length) + ")" : ""));
        const col = 0.34 + 0.11; const resto = (1 - col) / blocco.length;
        const larg = [0.34].concat(blocco.map(function () { return resto; })).concat([0.11]);
        d.tabella(["Partecipante"].concat(blocco.map(function (r) { return TD.dataIt(r.data).slice(0, 5); })).concat(["Ore"]),
          parts.map(function (x) {
            const min = blocco.filter(function (r) { return r.stato !== "pianificata" && presente(r, x); }).reduce(function (s, r) { return s + (Number(r.durata) || 0); }, 0);
            return [x.nome].concat(blocco.map(function (r) { return r.stato === "pianificata" ? "" : presente(r, x) ? "P" : "A"; })).concat([oreTesto(min)]);
          }), larg);
      }
      d.piccolo("P = presente · A = assente. Ore calcolate sulla durata degli incontri svolti.");
    }

    d.firme([{ etichetta: "Firma del docente", immagine: firmaDoc, nome: pr.nome }, { etichetta: c.tipo === "ente" ? "Visto del referente dell'ente" : "Firma dell'allievo", nome: c.tipo === "ente" ? (c.referente || "") : TD.nomeCliente(c) }]);

    /* fogli firme a mano, uno per incontro */
    if (opz.fogliFirme) inc.forEach(function (r) {
      d.nuovaPagina();
      d.h2("Foglio firme · " + TD.dataLunga(r.data) + (r.ora ? " · ore " + r.ora + "–" + fineOra(r.ora, r.durata) : ""));
      d.piccolo((argomenti(r) || "Argomenti: ____________________________") + " · " + TD.nomeCliente(c));
      d.tabella(["N.", "Nome e cognome", "Ora ingresso", "Ora uscita", "Firma"], parts.map(function (x, i) { return [String(i + 1), x.nome, " \n ", " ", " "]; }), [0.05, 0.35, 0.14, 0.14, 0.32]);
      d.firme([{ etichetta: "Firma del docente", immagine: firmaDoc, nome: pr.nome }]);
    });
    return d.chiudi();
  };

  TD.rotta("/presenze", function (app, p, q) {
    const clienti = TD.db.clienti.slice().sort(function (a, b) { return (b.tipo === "ente") - (a.tipo === "ente") || TD.nomeCliente(a).localeCompare(TD.nomeCliente(b)); });
    const c = TD.cliente(q.cliente) || TD.clienteAttivo() || clienti.find(function (x) { return x.tipo === "ente"; }) || clienti[0];
    const ym = /^\d{4}-\d{2}$/.test(q.mese || "") ? q.mese : TD.oggi().slice(0, 7);
    app.innerHTML = TD.intest("Registro presenze", "Il foglio mensile per rendicontare a Comuni, associazioni e scuole: incontri, orari, ore, presenze di ogni partecipante e firme.") +
      '<div class="wrap">' + (c ? "" : '<div class="card"><p>Prima aggiungi un cliente o un ente.</p><a class="btn btn-primary" href="#/nuovo-cliente">' + I("plus") + "Nuovo cliente</a></div>") +
      (c ? '<form class="card form" id="fpres"><div class="grid-3">' +
        '<label class="field"><span>Ente o cliente</span><select name="cliente">' + clienti.map(function (x) { return '<option value="' + x.id + '"' + (x.id === c.id ? " selected" : "") + ">" + E(TD.nomeCliente(x)) + (x.tipo === "ente" ? " (ente)" : "") + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Mese</span><input type="month" name="mese" value="' + ym + '"></label>' +
        '<div class="field"><span>Opzioni</span><label class="check"><input type="checkbox" name="fogli"> Fogli firme a mano, uno per incontro</label><label class="check"><input type="checkbox" name="pian"> Includi gli incontri pianificati</label></div></div>' +
        '<div class="actions"><button class="btn btn-primary" type="button" id="pdfP">' + I("download") + 'Scarica il PDF</button><button class="btn" type="button" id="stP">' + I("print") + 'Stampa</button><button class="btn" type="button" id="csvP">' + I("download") + "Tabella per Excel (.csv)</button></div></form>" +
        '<section class="card"><h2>Anteprima</h2><p class="muted text-small" id="riassP"></p><div class="doc-preview land" id="prevP"></div></section>' : "") + "</div>";
    if (!c) return;
    const f = document.getElementById("fpres");
    function opz() { const o = TD.form(f); return { cliente: TD.cliente(o.cliente), mese: o.mese || ym, fogliFirme: !!o.fogli, pianificati: !!o.pian }; }
    function costruisci() { const o = opz(); return TD.immagine(TD.db.profilo.firma).then(function (fd) { return TD.pdfPresenze(o.cliente, o.mese, o, fd); }); }
    function aggiorna() {
      const o = opz(); const inc = TD.incontriDelMese(o.cliente, o.mese, o.pianificati);
      document.getElementById("riassP").textContent = inc.length + " incontri in " + nomeMese(o.mese) + " · " + partecipanti(o.cliente).length + " partecipanti";
      costruisci().then(function (pg) { TD.anteprima(document.getElementById("prevP"), pg); });
    }
    f.addEventListener("change", aggiorna); aggiorna();
    document.getElementById("pdfP").onclick = function () { const o = opz(); costruisci().then(function (pg) { TD.scaricaPdf(pg, "presenze-" + TD.nomeFile(TD.nomeCliente(o.cliente)) + "-" + o.mese + ".pdf", { titolo: "Registro presenze " + nomeMese(o.mese) }); }); };
    document.getElementById("stP").onclick = function () { costruisci().then(TD.stampa); };
    document.getElementById("csvP").onclick = function () {
      const o = opz(), inc = TD.incontriDelMese(o.cliente, o.mese, o.pianificati), parts = partecipanti(o.cliente);
      const righe = [["Partecipante"].concat(inc.map(function (r) { return TD.csv(TD.dataIt(r.data)); })).concat(["Ore"]).join(";")].concat(parts.map(function (x) {
        const min = inc.filter(function (r) { return presente(r, x) && r.stato !== "pianificata"; }).reduce(function (s, r) { return s + (Number(r.durata) || 0); }, 0);
        return [TD.csv(x.nome)].concat(inc.map(function (r) { return presente(r, x) ? "P" : "A"; })).concat([oreTesto(min)]).join(";");
      }));
      TD.scarica(new Blob(["﻿" + righe.join("\r\n")], { type: "text/csv" }), "presenze-" + TD.nomeFile(TD.nomeCliente(o.cliente)) + "-" + o.mese + ".csv");
    };
  });

  /* ======================================================= (10) statistiche */
  TD.calcolaStatistiche = function (db, anno) {
    const mesi = MESI.map(function (m, i) { return { mese: i, nome: m, minuti: 0, incontri: 0, incassato: 0, dovuto: 0 }; });
    const luoghi = {}, citta = {}, argomentiConta = {}, perCliente = [];
    let minuti = 0, incontri = 0, incassato = 0, daIncassare = 0;
    (db.clienti || []).forEach(function (c) {
      let minC = 0, incC = 0, eurC = 0;
      (c.registro || []).forEach(function (r) {
        if (r.stato === "pianificata" || String(r.data).slice(0, 4) !== String(anno)) return;
        const m = mesi[(+String(r.data).slice(5, 7) || 1) - 1];
        const dur = Number(r.durata) || 0, imp = Number(r.importo) || 0;
        m.minuti += dur; m.incontri++; minuti += dur; incontri++; minC += dur; incC++;
        if (r.pagato) { m.incassato += imp; incassato += imp; eurC += imp; } else { m.dovuto += imp; daIncassare += imp; }
        (r.argomenti || []).forEach(function (id) { argomentiConta[id] = (argomentiConta[id] || 0) + 1; });
      });
      if (incC) {
        const l = c.luogo || "Non indicato"; luoghi[l] = (luoghi[l] || 0) + 1;
        const ct = c.citta || "Non indicata"; citta[ct] = (citta[ct] || 0) + 1;
      }
      const quiz = (c.quiz || []).slice().sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); });
      perCliente.push({ id: c.id, nome: TD.nomeCliente(c), minuti: minC, incontri: incC, incassato: eurC, completate: (c.completate || []).length, quiz: quiz.map(function (x) { return x.perc; }), stato: c.stato || "" });
    });
    function ordina(o) { return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); }); }
    return { anno: anno, mesi: mesi, minuti: minuti, incontri: incontri, incassato: incassato, daIncassare: daIncassare,
      clientiAttivi: perCliente.filter(function (x) { return x.incontri; }).length, luoghi: ordina(luoghi), citta: ordina(citta),
      argomenti: ordina(argomentiConta).slice(0, 10), clienti: perCliente.sort(function (a, b) { return b.minuti - a.minuti || a.nome.localeCompare(b.nome); }) };
  }

  /* barre verticali (un solo valore per mese, una sola scala) */
  function colonne(valori, etichette, formato, titolo) {
    const W = 640, H = 220, pad = { l: 8, r: 8, t: 22, b: 28 };
    const max = Math.max.apply(null, valori.concat([0])) || 1;
    const bw = (W - pad.l - pad.r) / valori.length;
    const hBar = H - pad.t - pad.b;
    const top = valori.indexOf(Math.max.apply(null, valori));
    return '<figure class="grafico"><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + E(titolo) + '">' +
      '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + (H - pad.b) + '" y2="' + (H - pad.b) + '" class="g-asse"/>' +
      valori.map(function (v, i) {
        const h = Math.max(v ? 3 : 0, hBar * v / max), x = pad.l + i * bw + 3, y = H - pad.b - h, w = bw - 6;
        return '<g class="g-mark" tabindex="0"><title>' + E(etichette[i] + ": " + formato(v)) + "</title>" +
          '<rect class="g-hit" x="' + (pad.l + i * bw) + '" y="' + pad.t + '" width="' + bw + '" height="' + (hBar + pad.b) + '"/>' +
          (h ? '<path class="g-bar" d="M' + x + "," + (H - pad.b) + "V" + (y + Math.min(4, h)) + "q0,-" + Math.min(4, h) + " " + Math.min(4, h) + ",-" + Math.min(4, h) + "H" + (x + w - Math.min(4, h)) + "q" + Math.min(4, h) + ",0 " + Math.min(4, h) + "," + Math.min(4, h) + "V" + (H - pad.b) + 'Z"/>' : "") +
          (i === top && v ? '<text class="g-val" x="' + (x + w / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + E(formato(v)) + "</text>" : "") +
          '<text class="g-lab" x="' + (x + w / 2) + '" y="' + (H - 9) + '" text-anchor="middle">' + E(etichette[i].slice(0, 3)) + "</text></g>";
      }).join("") + "</svg></figure>";
  }
  /* barre orizzontali con etichetta e valore */
  function righeBarre(coppie, formato) {
    if (!coppie.length) return '<p class="muted">Ancora nessun dato.</p>';
    const max = coppie[0][1] || 1;
    return '<ul class="hbar">' + coppie.map(function (x) {
      return '<li title="' + E(x[0] + ": " + formato(x[1])) + '"><span class="hbar-lab">' + E(x[0]) + '</span><span class="hbar-track"><i style="width:' + Math.max(2, Math.round(100 * x[1] / max)) + '%"></i></span><span class="hbar-val">' + E(formato(x[1])) + "</span></li>";
    }).join("") + "</ul>";
  }
  /* andamento dei quiz di un allievo */
  function sparkline(valori) {
    if (!valori.length) return '<span class="muted text-small">nessun quiz</span>';
    const W = 120, H = 30, n = valori.length;
    const pt = valori.map(function (v, i) { return [n === 1 ? W / 2 : 4 + i * (W - 8) / (n - 1), H - 4 - (H - 8) * v / 100]; });
    const ult = pt[pt.length - 1];
    return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Quiz: ' + valori.join("%, ") + '%"><title>Quiz: ' + valori.join("% · ") + '%</title>' +
      '<line x1="0" x2="' + W + '" y1="' + (H - 4 - (H - 8) * 0.6) + '" y2="' + (H - 4 - (H - 8) * 0.6) + '" class="g-soglia"/>' +
      (n > 1 ? '<polyline points="' + pt.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" class="g-line"/>' : "") +
      '<circle cx="' + ult[0].toFixed(1) + '" cy="' + ult[1].toFixed(1) + '" r="4" class="g-dot"/></svg> <strong>' + valori[valori.length - 1] + "%</strong>";
  }

  TD.rotta("/statistiche", function (app, p, q) {
    const anni = {}; anni[TD.oggi().slice(0, 4)] = 1;
    TD.db.clienti.forEach(function (c) { (c.registro || []).forEach(function (r) { if (r.data) anni[String(r.data).slice(0, 4)] = 1; }); });
    const lista = Object.keys(anni).sort().reverse();
    const anno = lista.indexOf(q.anno) >= 0 ? q.anno : lista[0];
    const s = TD.calcolaStatistiche(TD.db, anno);
    const etich = s.mesi.map(function (m) { return m.nome; });
    const ore = function (min) { return oreTesto(min) + " h"; };
    app.innerHTML = TD.intest("Statistiche del lavoro", "Ore, incassi, clienti e argomenti più richiesti: i numeri vengono dal registro delle lezioni e restano su questo dispositivo.",
      '<nav class="chips">' + lista.map(function (a) { return '<a class="chip' + (a === anno ? " on" : "") + '" href="#/statistiche?anno=' + a + '">' + a + "</a>"; }).join("") + "</nav>") +
      '<div class="wrap">' +
        '<div class="stats">' +
          '<div class="stat">' + I("clock") + "<strong>" + oreTesto(s.minuti) + "</strong><span>ore di lezione · " + s.incontri + " incontri</span></div>" +
          '<div class="stat">' + I("euro") + "<strong>" + TD.euro(s.incassato) + "</strong><span>incassato</span></div>" +
          '<div class="stat">' + I("alert") + "<strong>" + TD.euro(s.daIncassare) + "</strong><span>da incassare</span></div>" +
          '<div class="stat">' + I("users") + "<strong>" + s.clientiAttivi + "</strong><span>clienti seguiti</span></div>" +
        "</div>" +
        '<div class="grid-2">' +
          '<section class="card"><h2>Ore di lezione per mese</h2>' + colonne(s.mesi.map(function (m) { return m.minuti; }), etich, ore, "Ore di lezione per mese " + anno) + "</section>" +
          '<section class="card"><h2>Incassato per mese</h2>' + colonne(s.mesi.map(function (m) { return m.incassato; }), etich, TD.euro, "Incassato per mese " + anno) + "</section>" +
        "</div>" +
        '<div class="grid-2">' +
          '<section class="card"><h2>Argomenti più richiesti</h2>' + righeBarre(s.argomenti.map(function (x) { const l = TD.lezione(x[0]); return [l ? l.titolo : x[0], x[1]]; }), function (n) { return n + (n === 1 ? " volta" : " volte"); }) + "</section>" +
          '<section class="card"><h2>Clienti per luogo</h2>' + righeBarre(s.luoghi, function (n) { return String(n); }) + '<h3>Per città</h3>' + righeBarre(s.citta, function (n) { return String(n); }) + "</section>" +
        "</div>" +
        '<section class="card"><h2>Progressi di ogni allievo</h2><div class="table-wrap"><table class="table"><thead><tr><th>Cliente</th><th>Ore ' + anno + '</th><th>Lezioni completate</th><th>Andamento dei quiz</th></tr></thead><tbody>' +
          (s.clienti.length ? s.clienti.map(function (c) {
            return '<tr><td><a href="#/cliente/' + c.id + '">' + E(c.nome) + "</a></td><td>" + oreTesto(c.minuti) + "</td><td>" + c.completate + " / " + TD.LEZIONI.length + " " + TD.barra(c.completate, TD.LEZIONI.length) + "</td><td>" + sparkline(c.quiz) + "</td></tr>";
          }).join("") : '<tr><td colspan="4" class="muted">Nessun cliente.</td></tr>') + '</tbody></table></div><p class="muted text-small">La linea sottile segna il 60%, la soglia consigliata per l\'attestato.</p></section>' +
        '<section class="card"><h2>Tabella mese per mese</h2><div class="table-wrap"><table class="table"><thead><tr><th>Mese</th><th>Incontri</th><th>Ore</th><th>Incassato</th><th>Da incassare</th></tr></thead><tbody>' +
          s.mesi.map(function (m) { return "<tr><td>" + E(m.nome) + "</td><td>" + m.incontri + "</td><td>" + oreTesto(m.minuti) + "</td><td>" + TD.euro(m.incassato) + "</td><td>" + TD.euro(m.dovuto) + "</td></tr>"; }).join("") +
          "</tbody></table></div>" +
          '<div class="actions"><button class="btn" id="csvS">' + I("download") + 'Tabella per Excel (.csv)</button><button class="btn" id="pdfS">' + I("print") + "Riepilogo PDF</button></div></section>" +
      "</div>";
    document.getElementById("csvS").onclick = function () {
      const r = ["Mese;Incontri;Ore;Incassato;Da incassare"].concat(s.mesi.map(function (m) { return [m.nome, m.incontri, oreTesto(m.minuti), m.incassato.toFixed(2).replace(".", ","), m.dovuto.toFixed(2).replace(".", ",")].join(";"); }));
      TD.scarica(new Blob(["﻿" + r.join("\r\n")], { type: "text/csv" }), "statistiche-tutor-digitale-" + anno + ".csv");
    };
    document.getElementById("pdfS").onclick = function () {
      const d = new TD.Documento({ titolo: "Statistiche " + anno, piede: "Tutor Digitale · statistiche " + anno });
      d.intestazione(TD.db.profilo, "Statistiche del lavoro");
      d.h1("Statistiche " + anno);
      d.campi([["Ore di lezione", oreTesto(s.minuti)], ["Incontri", String(s.incontri)], ["Incassato", TD.euro(s.incassato)], ["Da incassare", TD.euro(s.daIncassare)]], 4);
      d.h2("Mese per mese");
      d.tabella(["Mese", "Incontri", "Ore", "Incassato", "Da incassare"], s.mesi.map(function (m) { return [m.nome, String(m.incontri), oreTesto(m.minuti), TD.euro(m.incassato), TD.euro(m.dovuto)]; }), [0.28, 0.14, 0.14, 0.22, 0.22], { destra: [1, 2, 3, 4] });
      d.h2("Argomenti più richiesti");
      d.tabella(["Lezione", "Volte"], s.argomenti.map(function (x) { const l = TD.lezione(x[0]); return [l ? l.titolo : x[0], String(x[1])]; }), [0.8, 0.2], { destra: [1] });
      d.h2("Clienti per luogo");
      d.tabella(["Luogo", "Clienti"], s.luoghi.map(function (x) { return [x[0], String(x[1])]; }), [0.8, 0.2], { destra: [1] });
      TD.scaricaPdf(d.chiudi(), "statistiche-tutor-digitale-" + anno + ".pdf", { titolo: "Statistiche " + anno });
    };
  });
})();
