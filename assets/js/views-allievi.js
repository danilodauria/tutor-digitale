/* ==========================================================================
   Tutor Digitale · lato tutor dello scambio con l'app Allievo
   Crea il kit personalizzato (compiti + quiz senza soluzioni), riceve le
   risposte, corregge in automatico e prepara la correzione da rimandare.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  TD.URL_ALLIEVO = "https://danilodauria.github.io/tutor-digitale/allievo/";

  function app(c) {
    c.app = c.app || {};
    if (!c.app.segreto) { c.app.segreto = TD.scambio.segreto(); c.app.creato = TD.oggi(); }
    c.consegne = c.consegne || [];
    return c.app;
  }
  function nomeAllievo(c, partId) {
    if (partId) { const p = (c.partecipanti || []).find(function (x) { return x.id === partId; }); if (p) return p.nome; }
    return TD.nomeCliente(c);
  }
  function datiTutor() {
    const p = TD.db.profilo;
    return { nome: p.nome, qualifica: p.qualifica, email: p.email, telefono: p.telefono, sito: p.sito };
  }
  const STATI = { inviata: ["Inviata", "warn"], ricevuta: ["Ricevuta", "warn"], corretta: ["Corretta", "ok"], rimandata: ["Correzione inviata", "ok"] };

  /* ------------------------------------------------ scheda cliente › App allievo */
  TD.tabAllievo = function (body, c) {
    app(c);
    const aperti = (c.compiti || []).filter(function (k) { return !k.fatto; });
    const livMax = Math.max.apply(null, [0].concat((c.dispositivi || []).map(function (d) { return (c.livelli || {})[d] || 0; })));
    const lista = c.consegne.slice().reverse();
    body.innerHTML =
      '<div class="note-box">' + I("info") + '<div>L\'<strong>app Allievo</strong> è la versione per il cliente: lezioni, compiti, quiz, palestra e assistenza a distanza, senza dati degli altri clienti né documenti. Si apre da <a href="' + TD.URL_ALLIEVO + '" target="_blank" rel="noopener">' + TD.URL_ALLIEVO.replace("https://", "") + "</a> e si installa come la tua. Il kit la personalizza con il nome del cliente.</div></div>" +
      '<div class="grid-2">' +
      '<form class="card form" id="fk"><h2>' + I("upload") + "Nuova consegna</h2>" +
        ((c.partecipanti || []).length ? '<label class="field"><span>Per chi</span><select name="part"><option value="">Tutto il gruppo (' + E(TD.nomeCliente(c)) + ")</option>" + c.partecipanti.map(function (p) { return '<option value="' + p.id + '">' + E(p.nome) + "</option>"; }).join("") + "</select></label>" : "") +
        '<fieldset class="field"><legend>Compiti da includere</legend>' + (aperti.length ? aperti.map(function (k) { return '<label class="check"><input type="checkbox" name="compiti" data-multi="1" value="' + k.id + '" checked> ' + E(k.testo) + "</label>"; }).join("") : '<p class="muted text-small">Nessun compito aperto: assegnane dalla scheda «Compiti» o dalle lezioni.</p>') + "</fieldset>" +
        '<label class="check"><input type="checkbox" name="conQuiz" checked> Includi un quiz da correggere</label>' +
        '<div class="grid-3"><label class="field"><span>Livello</span><select name="liv">' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '"' + (l.id === livMax ? " selected" : "") + ">" + E(l.nome) + "</option>"; }).join("") + "</select></label>" +
          '<label class="field"><span>Percorso</span><select name="dev"><option value="tutti">Tutti</option>' + TD.PERCORSI.map(function (p) { return '<option value="' + p.id + '"' + ((c.dispositivi || []).length === 1 && c.dispositivi[0] === p.id ? " selected" : "") + ">" + E(p.nome) + "</option>"; }).join("") + "</select></label>" +
          '<label class="field"><span>Domande</span><select name="n"><option>5</option><option selected>8</option><option>10</option><option>15</option></select></label></div>' +
        '<div class="grid-2"><label class="field"><span>Entro il</span><input type="date" name="scadenza"></label><label class="check"><input type="checkbox" name="cumulativo" checked> Anche i livelli precedenti</label></div>' +
        '<label class="field"><span>Messaggio per l\'allievo</span><textarea name="messaggio" rows="2" placeholder="Es. Brava Maria! Questa settimana ripassiamo WhatsApp."></textarea></label>' +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + I("upload") + "Crea il kit e invialo</button></div></form>" +
      '<section class="card"><h2>' + I("layers") + "Consegne</h2>" +
        (lista.length ? '<ul class="reg-list">' + lista.map(function (k) {
          const st = STATI[k.stato] || STATI.inviata;
          return '<li><div class="consegna"><span class="when"><strong>' + E(TD.dataIt(k.data)) + "</strong>" + E(nomeAllievo(c, k.partecipante)) + "</span><span>" + (k.quiz.length ? k.quiz.length + " domande" : "senza quiz") + " · " + k.compiti.length + " compiti" +
            (k.esito ? " · <strong>" + k.esito.perc + "%</strong>" : "") + '</span><span class="pill ' + st[1] + '">' + st[0] + "</span>" +
            '<span class="actions"><button class="btn btn-sm" data-kit="' + k.id + '">' + I("upload") + "Rimanda il kit</button>" + (k.esito ? '<a class="btn btn-sm btn-primary" href="#/allievi?consegna=' + k.id + "&cliente=" + c.id + '">' + I("check") + "Correzione</a>" : "") + "</span></div></li>";
        }).join("") + "</ul>" : '<p class="muted">Ancora nessuna consegna.</p>') +
        '<p class="muted text-small">Le risposte dell\'allievo arrivano come file .json, codice o tramite l\'assistenza a distanza: aprile in <a href="#/allievi">Scambio con gli allievi</a>.</p></section></div>';

    const f = document.getElementById("fk");
    f.onsubmit = async function (e) {
      e.preventDefault();
      const o = TD.form(f);
      const scelti = (c.compiti || []).filter(function (k) { return (o.compiti || []).indexOf(k.id) >= 0; });
      if (!scelti.length && !o.conQuiz) { TD.toast("Scegli almeno un compito o il quiz."); return; }
      const quiz = o.conQuiz ? TD.generaQuiz({ liv: o.liv, dev: o.dev, n: Number(o.n), cumulativo: o.cumulativo }) : [];
      const k = { id: TD.uid("cs"), data: TD.oggi(), scadenza: o.scadenza || "", partecipante: o.part || "", messaggio: o.messaggio || "",
        compiti: scelti.map(function (x) { return { id: x.id, testo: x.testo, lezione: x.lezione || "", scadenza: x.scadenza || o.scadenza || "" }; }),
        quiz: quiz, stato: "inviata" };
      c.consegne.push(k); TD.salva();
      await mostraKit(c, k);
    };
    body.querySelectorAll("[data-kit]").forEach(function (b) { b.onclick = function () { mostraKit(c, c.consegne.find(function (x) { return x.id === b.dataset.kit; })); }; });
  };

  async function pacchettoKit(c, k) {
    const a = app(c);
    const p = await TD.scambio.impacchetta("kit", { id: c.id, partecipante: k.partecipante || "" }, {
      allievo: { nome: nomeAllievo(c, k.partecipante), clienteId: c.id, partecipante: k.partecipante || "", tipo: c.tipo, ente: c.tipo === "ente" ? TD.nomeCliente(c) : "", livelli: c.livelli || {}, dispositivi: c.dispositivi || [] },
      tutor: datiTutor(), segreto: a.segreto,
      consegna: { id: k.id, data: k.data, scadenza: k.scadenza, messaggio: k.messaggio, compiti: k.compiti, quiz: TD.scambio.senzaSoluzioni(k.quiz) }
    }, a.segreto);
    try { await TD.scambio.firmaPacchetto(p, await TD.chiaviTutor()); } catch (e) {}
    return p;
  }

  async function mostraKit(c, k) {
    const p = await pacchettoKit(c, k);
    const codice = await TD.scambio.comprimi(p);
    const link = TD.URL_ALLIEVO + "#/attiva?k=" + codice;
    const nome = nomeAllievo(c, k.partecipante);
    const file = TD.scambio.file(p, "tutor-digitale-kit_" + TD.nomeFile(nome) + "_" + k.data + ".json");
    const testo = "Ciao " + nome.split(" ")[0] + ", ecco i tuoi compiti di Tutor Digitale. Apri questo link (la prima volta installa l'app «Tutor Digitale · Allievo»):\n" + link;
    dialogo("Kit per " + E(nome) + " pronto",
      '<p>Il link apre l\'app Allievo già personalizzata con nome, compiti' + (k.quiz.length ? " e quiz (senza soluzioni)" : "") + '. Il kit è firmato con la tua chiave digitale: l\'allievo vede «kit verificato» e le risposte che tornano si verificano da sole.</p>' +
      (TD.qr.adatto(link) ? '<div class="qr-box">' + TD.qr.svg(link, { etichetta: "QR del kit" }) + "<p><strong>A lezione:</strong> fai inquadrare questo QR con la fotocamera del telefono o del tablet dell'allievo. Si apre l'app già personalizzata.</p></div>" : '<p class="muted text-small">Il kit è troppo grande per un QR leggibile: usa link, condivisione o file.</p>') +
      '<label class="field"><span>Link personale (' + link.length + ' caratteri)</span><textarea readonly rows="3" class="code">' + E(link) + "</textarea></label>" +
      '<div class="actions"><button class="btn btn-primary" data-a="copia">' + I("copy") + 'Copia il link</button><button class="btn" data-a="share">' + I("upload") + 'Condividi (WhatsApp, email…)</button>' +
      (c.email ? '<a class="btn" href="' + TD.scambio.mailto(c.email, "Tutor Digitale · i tuoi compiti", testo) + '">' + I("doc") + "Email con il link</a>" : "") +
      '<button class="btn" data-a="file">' + I("download") + "File del kit</button></div>" +
      '<p class="muted text-small">Il file del kit serve quando il link è troppo lungo per il programma di messaggi: l\'allievo lo apre da «Attiva o aggiorna» nella sua app.</p>',
      { copia: function () { TD.scambio.copia(testo).then(function (ok) { TD.toast(ok ? "Messaggio con il link copiato." : "Copia il link a mano."); }); },
        share: function () { if (navigator.share) navigator.share({ title: "Tutor Digitale", text: testo }).catch(function () {}); else TD.scambio.copia(testo).then(function () { TD.toast("Condivisione non disponibile: messaggio copiato."); }); },
        file: function () { TD.scambio.condividi(file, "Kit Tutor Digitale", "Apri questo file con l'app Tutor Digitale · Allievo"); } });
  }

  function dialogo(titolo, html, azioni) {
    const box = document.createElement("div");
    box.className = "modal";
    box.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true"><h2>' + titolo + "</h2>" + html + '<div class="actions"><button class="btn btn-ghost" data-a="chiudi">Chiudi</button></div></div>';
    document.body.appendChild(box);
    box.addEventListener("click", function (e) {
      const b = e.target.closest("[data-a]"); if (!b) { if (e.target === box) box.remove(); return; }
      if (b.dataset.a === "chiudi") box.remove(); else if (azioni && azioni[b.dataset.a]) azioni[b.dataset.a]();
    });
    return box;
  }
  TD.dialogo = dialogo;

  /* ------------------------------------------------ ricezione e correzione */
  TD.apriPacchetto = async function (p) {
    if (p.tipo !== "risposte") { TD.toast(p.tipo === "kit" ? "Questo è un kit: va aperto nell'app Allievo." : "Questo pacchetto va aperto nell'app Allievo."); return; }
    const c = TD.cliente(p.cliente && p.cliente.id);
    if (!c) { TD.toast("Il cliente di queste risposte non è in questo archivio."); return; }
    const k = (c.consegne || []).find(function (x) { return x.id === p.dati.consegnaId; });
    if (!k) { TD.toast("Non trovo la consegna di queste risposte nella scheda di " + TD.nomeCliente(c) + "."); return; }
    const firma = await TD.scambio.verifica(p, (c.app || {}).segreto);
    if (firma === false) { TD.toast("Attenzione: il file risulta modificato dopo l'invio. Non lo importo."); return; }
    k.risposte = p.dati.risposte || {};
    k.compitiAllievo = p.dati.compiti || {};
    k.allegati = (p.dati.allegati || []).slice(0, 4);
    k.notaAllievo = p.dati.nota || "";
    k.ricevuta = new Date().toISOString();
    k.firma = firma === true ? "verificata" : "non verificabile";
    k.esito = k.quiz.length ? TD.scambio.correggi(k.quiz, k.risposte) : null;
    k.stato = "corretta";
    // compiti: segna quelli fatti dall'allievo
    (c.compiti || []).forEach(function (cp) {
      const r = k.compitiAllievo[cp.id];
      if (r && r.fatto) { cp.fatto = true; cp.esito = cp.esito || "Fatto da solo"; if (r.nota) cp.notaAllievo = r.nota; }
    });
    if (k.esito && !k.registrato) {
      c.quiz = c.quiz || [];
      c.quiz.push({ id: TD.uid("q"), data: TD.oggi(), liv: "", dev: "tutti", giuste: k.esito.giuste, totale: k.esito.totale, perc: k.esito.perc, partecipante: k.partecipante || "", consegna: k.id });
      k.registrato = true;
    }
    TD.salva();
    TD.toast("Risposte di " + nomeAllievo(c, k.partecipante) + " corrette: " + (k.esito ? k.esito.perc + "%" : "solo compiti"));
    TD.vai("#/allievi?consegna=" + k.id + "&cliente=" + c.id);
  };

  TD.rotta("/allievi", function (appEl, par, q) {
    const c = TD.cliente(q.cliente);
    const k = c && (c.consegne || []).find(function (x) { return x.id === q.consegna; });
    const attesa = [];
    TD.db.clienti.forEach(function (cl) { (cl.consegne || []).forEach(function (x) { attesa.push({ c: cl, k: x }); }); });
    attesa.sort(function (a, b) { return (b.k.data + b.k.id).localeCompare(a.k.data + a.k.id); });

    appEl.innerHTML = TD.intest("Scambio con gli allievi", "Qui arrivano i compiti fatti nell'app Allievo: il programma li verifica, corregge il quiz da solo e prepara la correzione da rimandare.") +
      '<div class="wrap">' +
      (k ? correzioneHtml(c, k) : "") +
      '<div class="grid-2">' +
        '<section class="card"><h2>' + I("download") + 'Ricevi le risposte</h2><label class="btn btn-primary">' + I("upload") + 'Apri i file .json ricevuti<input type="file" id="fRisp" accept=".json,application/json" multiple hidden></label>' +
          '<div class="drop-zone" id="dz">oppure trascina qui i file</div>' +
          '<label class="field"><span>…oppure incolla il codice ricevuto (inizia con TD1.)</span><textarea id="tRisp" rows="3"></textarea></label><button class="btn" id="bRisp">' + I("check") + "Correggi</button></section>" +
        '<section class="card"><h2>' + I("layers") + "Tutte le consegne</h2>" + (attesa.length ? '<ul class="reg-list">' + attesa.slice(0, 30).map(function (x) {
          const st = STATI[x.k.stato] || STATI.inviata;
          return '<li><a href="' + (x.k.esito ? "#/allievi?consegna=" + x.k.id + "&cliente=" + x.c.id : "#/cliente/" + x.c.id + "?tab=allievo") + '"><span class="when"><strong>' + E(TD.dataIt(x.k.data)) + "</strong>" + E(nomeAllievo(x.c, x.k.partecipante)) + "</span><span>" + (x.k.esito ? x.k.esito.perc + "% · " : "") + x.k.compiti.length + ' compiti</span><span class="pill ' + st[1] + '">' + st[0] + "</span></a></li>";
        }).join("") + "</ul>" : '<p class="muted">Nessuna consegna: creale dalla scheda del cliente › App allievo.</p>') + "</section>" +
      "</div></div>";

    async function apriFiles(files) { for (const f of Array.from(files)) { try { await TD.apriPacchetto(await TD.scambio.leggiFile(f)); } catch (e) { TD.toast(e.message); } } }
    document.getElementById("fRisp").onchange = function () { apriFiles(this.files); };
    const dz = document.getElementById("dz");
    dz.ondragover = function (e) { e.preventDefault(); dz.classList.add("on"); };
    dz.ondragleave = function () { dz.classList.remove("on"); };
    dz.ondrop = function (e) { e.preventDefault(); dz.classList.remove("on"); apriFiles(e.dataTransfer.files); };
    document.getElementById("bRisp").onclick = async function () {
      try { await TD.apriPacchetto(await TD.scambio.leggi(document.getElementById("tRisp").value)); } catch (e) { TD.toast(e.message); }
    };
    if (k) collegaCorrezione(c, k);
  });

  function correzioneHtml(c, k) {
    const e = k.esito;
    return '<section class="card correction"><h2>' + I("check") + "Correzione · " + E(nomeAllievo(c, k.partecipante)) + " · consegna del " + E(TD.dataIt(k.data)) + "</h2>" +
      '<p class="meta"><span class="pill ' + (k.firma === "verificata" ? "ok" : "warn") + '">' + I(k.firma === "verificata" ? "shield" : "info") + "Firma " + E(k.firma || "") + "</span><span>Ricevuta " + E(TD.dataIt((k.ricevuta || "").slice(0, 10))) + "</span></p>" +
      (e ? '<div class="corr-score"><div class="score" style="--p:' + e.perc + '"><strong>' + e.perc + "%</strong><span>" + e.giuste + " su " + e.totale + "</span></div>" +
        '<ol class="review">' + e.dettagli.map(function (d) {
          return '<li class="' + (d.ok ? "ok" : "ko") + '"><span class="rv-mark">' + I(d.ok ? "check" : "x") + "</span><div><p><strong>" + E(d.testo) + "</strong>" + (d.proposta ? " — «" + E(d.proposta) + "»" : "") + "</p><p>Risposta: " + E(d.data || "—") + (d.ok ? "" : ' · <span class="muted">giusta: ' + E(d.giusta) + "</span>") + "</p></div></li>";
        }).join("") + "</ol></div>" : "") +
      (k.compiti.length ? "<h3>Compiti pratici</h3><p class=\"muted text-small\">Approva o fai rifare ogni compito: l'esito torna all'allievo con la correzione. Quelli «da rifare» restano aperti per il prossimo kit.</p><ul class=\"task-list\">" + k.compiti.map(function (cp) {
        const r = (k.compitiAllievo || {})[cp.id] || {}, v = ((k.valutazioni || {}).compiti || {})[cp.id] || {};
        return '<li class="' + (r.fatto ? "" : "") + '"><span class="check">' + I(r.fatto ? "check" : "x") + "<span>" + E(cp.testo) + "<small>" + (r.fatto ? "L'allievo l'ha segnato come fatto" : "Non segnato come fatto") + (r.nota ? " · nota: " + E(r.nota) : "") + "</small></span></span>" + valuta("c", cp.id, v, r.fatto) + "</li>";
      }).join("") + "</ul>" : "") +
      (k.notaAllievo ? '<p class="q-proposta">«' + E(k.notaAllievo) + "»</p>" : "") +
      ((k.allegati || []).length ? "<h3>Foto e file allegati</h3><div class=\"allegati\">" + k.allegati.map(function (a, i) {
        const v = ((k.valutazioni || {}).allegati || [])[i] || {};
        return "<figure>" + (/^data:image\//.test(a.dati) ? '<a href="' + a.dati + '" target="_blank" rel="noopener"><img src="' + a.dati + '" alt="Foto inviata: ' + E(a.nome) + '"></a>' : '<a class="btn btn-sm" download="' + E(a.nome) + '" href="' + a.dati + '">' + I("download") + E(a.nome) + "</a>") + "<figcaption>" + E(a.nome) + "</figcaption>" + valuta("a", String(i), v, true) + "</figure>";
      }).join("") + "</div>" : "") +
      '<label class="field"><span>Il tuo commento per l\'allievo</span><textarea id="comm" rows="3">' + E(k.commento || (e ? (e.perc >= 80 ? "Ottimo lavoro! " : e.perc >= 60 ? "Bene, ci siamo quasi. " : "Ripassiamo insieme alla prossima lezione. ") : "Grazie per i compiti! ")) + "</textarea></label>" +
      '<div class="actions"><button class="btn btn-primary" id="bCorr">' + I("upload") + "Rimanda la correzione</button>" + (c.email ? '<a class="btn" id="mCorr" href="#">' + I("doc") + "Email</a>" : "") + '<button class="btn" id="cCorr">' + I("copy") + 'Copia come codice</button><button class="btn" id="qCorr">' + I("screen") + 'QR per il telefono</button><a class="btn btn-ghost" href="#/cliente/' + c.id + '?tab=allievo">Scheda cliente</a></div></section>';
  }
  function valuta(tipo, id, v, fatto) {
    const es = v.esito || (fatto ? "approvato" : "rifare");
    return '<div class="valuta" data-val="' + tipo + ":" + id + '"><div class="seg small"><label><input type="radio" name="v_' + tipo + id + '" value="approvato"' + (es === "approvato" ? " checked" : "") + "><span>" + I("check") + 'Approvato</span></label><label><input type="radio" name="v_' + tipo + id + '" value="rifare"' + (es === "rifare" ? " checked" : "") + "><span>" + I("x") + 'Da rifare</span></label></div><input type="text" placeholder="Nota per l\'allievo (facoltativa)" value="' + E(v.nota || "") + '"></div>';
  }
  function leggiValutazioni(c, k) {
    const val = { compiti: {}, allegati: [] };
    document.querySelectorAll("[data-val]").forEach(function (box) {
      const p = box.dataset.val.split(":"), sel = box.querySelector("input[type=radio]:checked");
      const o = { esito: sel ? sel.value : "approvato", nota: box.querySelector("input[type=text]").value.trim() };
      if (p[0] === "c") val.compiti[p[1]] = o; else val.allegati[Number(p[1])] = Object.assign({ nome: (k.allegati[Number(p[1])] || {}).nome || "" }, o);
    });
    k.valutazioni = val;
    // nella scheda del cliente: approvato = chiuso, da rifare = riaperto per il prossimo kit
    (c.compiti || []).forEach(function (cp) {
      const v = val.compiti[cp.id]; if (!v) return;
      if (v.esito === "approvato") { cp.fatto = true; cp.esito = "Approvato"; }
      else { cp.fatto = false; cp.esito = "Da rifare"; }
      if (v.nota) cp.notaTutor = v.nota;
    });
    TD.salva();
    return val;
  }
  function collegaCorrezione(c, k) {
    async function pacchetto() {
      k.commento = document.getElementById("comm").value.trim(); k.stato = "rimandata";
      const val = leggiValutazioni(c, k);
      return TD.scambio.impacchetta("correzione", { id: c.id, partecipante: k.partecipante || "" }, {
        consegnaId: k.id, data: TD.oggi(), esito: k.esito, commento: k.commento,
        compiti: k.compiti.map(function (cp) { const r = (k.compitiAllievo || {})[cp.id] || {}, v = val.compiti[cp.id] || {}; return { id: cp.id, testo: cp.testo, fatto: !!r.fatto, esito: v.esito || "", nota: v.nota || "" }; }),
        allegati: val.allegati.map(function (a) { return a ? { nome: a.nome, esito: a.esito, nota: a.nota } : null; }).filter(Boolean), tutor: datiTutor()
      }, app(c).segreto).then(function (p) { return TD.chiaviTutor().then(function (ch) { return TD.scambio.firmaPacchetto(p, ch); }).catch(function () { return p; }); });
    }
    document.getElementById("bCorr").onclick = async function () {
      const p = await pacchetto();
      const nome = "tutor-digitale-correzione_" + TD.nomeFile(nomeAllievo(c, k.partecipante)) + "_" + TD.oggi() + ".json";
      if (TD.sessioneRemota && TD.sessioneRemota.fase === "collegato") { await TD.inviaFileRemoto(TD.scambio.file(p, nome)); TD.toast("Correzione inviata nella sessione a distanza."); return; }
      const esito = await TD.scambio.condividi(TD.scambio.file(p, nome), "Correzione Tutor Digitale", "Apri questo file con l'app Tutor Digitale · Allievo");
      TD.toast(esito === "scaricato" ? "File salvato: allegalo all'email o al messaggio per l'allievo." : "Correzione pronta.");
    };
    const cc = document.getElementById("cCorr");
    cc.onclick = async function () { const t = await TD.scambio.comprimi(await pacchetto()); TD.scambio.copia(t).then(function (ok) { TD.toast(ok ? "Codice copiato: l'allievo lo incolla in «Ricevi dal tutor»." : "Non riesco a copiare."); }); };
    document.getElementById("qCorr").onclick = async function () {
      const link = TD.URL_ALLIEVO + "#/ricevi?k=" + await TD.scambio.comprimi(await pacchetto());
      dialogo("Correzione da inquadrare", TD.qr.adatto(link) ? '<div class="qr-box big">' + TD.qr.svg(link, { etichetta: "QR della correzione" }) + "<p>L'allievo inquadra il QR con la fotocamera: la correzione si apre nella sua app.</p></div>" : "<p>La correzione è troppo lunga per un QR leggibile (molte domande o commento lungo): usa «Rimanda la correzione».</p>");
    };
    const m = document.getElementById("mCorr");
    if (m) m.onclick = async function (e) {
      e.preventDefault();
      const t = await TD.scambio.comprimi(await pacchetto());
      const link = TD.URL_ALLIEVO + "#/ricevi?k=" + t;
      location.href = TD.scambio.mailto(c.email, "Tutor Digitale · la correzione dei tuoi compiti", "Ciao " + nomeAllievo(c, k.partecipante).split(" ")[0] + ",\napri questo link per vedere la correzione nella tua app:\n" + link + "\n\n" + (k.commento || ""));
    };
  }
})();
