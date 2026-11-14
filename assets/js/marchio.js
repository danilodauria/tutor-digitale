/* ==========================================================================
   Tutor Digitale · kit per altri tutor (miglioria 20)
   - Marchio personale: nome dell'attività, colore e logo su documenti,
     attestati e app Allievo (con la dicitura «realizzato con Tutor Digitale»).
   - Licenza per formatori: Danilo emette un certificato di licenza firmato
     con la sua chiave; il formatore lo importa e il programma lo verifica.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const FORMATO = "tutor-digitale-licenza";

  TD.PIANI_LICENZA = [
    { id: "formatore", nome: "Formatore singolo", per: "una persona, fino a 3 dispositivi", prezzo: 60 },
    { id: "associazione", nome: "Associazione o cooperativa", per: "fino a 5 formatori della stessa organizzazione", prezzo: 150 },
    { id: "ente", nome: "Ente pubblico, scuola o azienda", per: "formatori illimitati di una sede, con marchio dell'ente", prezzo: 300 }
  ];

  /* ------------------------------------------------------------ marchio */
  TD.marchio = function () {
    if (TD.MODO === "allievo") return TD.db.marchio || null;
    const m = TD.db.profilo && TD.db.profilo.marchio;
    return m && (m.nome || m.colore || m.logo) ? m : null;
  };
  TD.marchioPubblico = function () { const m = TD.marchio(); return m ? { nome: m.nome || "", colore: m.colore || "" } : null; };
  TD.applicaMarchio = function () {
    const m = TD.marchio();
    const h = document.documentElement;
    if (m && /^#[0-9a-f]{6}$/i.test(m.colore || "")) h.style.setProperty("--marchio", m.colore); else h.style.removeProperty("--marchio");
    h.toggleAttribute("data-marchio", !!(m && m.colore));
    if (m && m.logo) { TD.logoMarchioImg = new Image(); TD.logoMarchioImg.src = m.logo; } else TD.logoMarchioImg = null;
    const b = document.querySelector(".brand-text");
    if (b && m && m.nome) { b.innerHTML = "<strong>" + E(m.nome) + "</strong><em>con Tutor Digitale</em>"; b.closest(".brand").setAttribute("aria-label", m.nome + ", pagina iniziale"); }
  };
  try { TD.applicaMarchio(); } catch (e) {}

  /* ------------------------------------------------------------ licenze */
  function corpoLicenza(l) { return JSON.stringify({ formato: FORMATO, v: 1, numero: l.numero, licenziatario: l.licenziatario, email: l.email || "", piano: l.piano, dal: l.dal, al: l.al, editore: l.editore }); }
  TD.emettiLicenza = async function (dati, chiavi) {
    const l = { formato: FORMATO, v: 1, numero: dati.numero, licenziatario: dati.licenziatario, email: dati.email || "", piano: dati.piano, dal: dati.dal, al: dati.al, editore: dati.editore || "Danilo D'Auria" };
    l.firma = { chiave: chiavi.pubblica, valore: await TD.scambio.firmaTesto(chiavi, corpoLicenza(l)) };
    return l;
  };
  /* Chiavi pubbliche dell'autore: solo una licenza firmata con una di queste è «valida».
     Si aggiungono qui (o in verifica/chiavi.json, con "editore": true) dopo averle copiate
     da Impostazioni › Firma digitale › «Copia la chiave pubblica». */
  TD.CHIAVI_AUTORE = [
    "BPA1VZRySleIsZmx-2rj4p2TQFMWkBSwRoUkzloOsUv_rsVQm4P9lXKueEZE82LjFFYxuYaqkHJC8vfJVZ8cxos" // Danilo D'Auria · impronta D875-1419-D6E1-1819 · dal 14/11/2026
  ];
  let chiaviPubblicate = null;
  TD.chiaviFidate = async function () {
    if (chiaviPubblicate === null) {
      chiaviPubblicate = [];
      try {
        const r = await fetch((TD.MODO === "allievo" ? "../" : "") + "verifica/chiavi.json", { cache: "no-store" });
        if (r.ok) chiaviPubblicate = ((await r.json()).chiavi || []).filter(function (k) { return k && k.editore && typeof k.chiave === "string"; }).map(function (k) { return k.chiave; });
      } catch (e) { /* offline: restano quelle scritte nel programma */ }
    }
    /* la propria chiave NON basta: altrimenti chiunque potrebbe firmarsi da solo una licenza «valida» */
    return TD.CHIAVI_AUTORE.concat(chiaviPubblicate);
  };
  /* { stato: "valida" | "scaduta" | "sconosciuta" | "alterata" | "illeggibile", impronta } */
  TD.verificaLicenza = async function (l, oggi, fidate) {
    if (!l || l.formato !== FORMATO || !l.firma || typeof l.firma.chiave !== "string") return { stato: "illeggibile" };
    const ok = await TD.scambio.verificaTesto(l.firma.chiave, corpoLicenza(l), l.firma.valore);
    const imp = await TD.scambio.impronta(l.firma.chiave);
    if (ok !== true) return { stato: "alterata", impronta: imp };
    if ((fidate || await TD.chiaviFidate()).indexOf(l.firma.chiave) < 0) return { stato: "sconosciuta", impronta: imp };
    return { stato: (oggi || TD.oggi()) > String(l.al) ? "scaduta" : "valida", impronta: imp };
  };

  function pdfCertificato(l, imp) {
    const d = new TD.Documento({ titolo: "Licenza " + l.numero, piede: "Tutor Digitale · licenza d'uso per formatori" });
    d.intestazione(TD.db.profilo, "Licenza d'uso per formatori");
    d.h1("Certificato di licenza n. " + l.numero);
    const piano = TD.PIANI_LICENZA.find(function (p) { return p.id === l.piano; }) || { nome: l.piano, per: "" };
    d.campi([["Licenziatario", l.licenziatario], ["Email", l.email], ["Piano", piano.nome], ["Validità", TD.dataIt(l.dal) + " – " + TD.dataIt(l.al)], ["Concessa da", l.editore], ["Impronta della firma", imp]]);
    d.p("Danilo D'Auria, autore di Tutor Digitale, concede al licenziatario il diritto di usare i contenuti del programma (lezioni, domande, esercizi, testi dei documenti, schermate guida e grafiche, rilasciati al pubblico con licenza CC BY-NC-SA 4.0) per la propria attività di formazione retribuita, per il periodo indicato e per " + (piano.per || "l'uso previsto dal piano") + ".", { size: 27 });
    d.p("Il licenziatario può mostrare il proprio marchio su documenti, attestati e app Allievo, mantenendo la dicitura «realizzato con Tutor Digitale di Danilo D'Auria». Non può rivendere né cedere il programma o i contenuti a terzi, né presentarli come propri. Il nome e il logo «Tutor Digitale» restano riservati.", { size: 27 });
    d.p("Il codice del programma resta sotto licenza MIT. La licenza non comprende assistenza, salvo accordi scritti.", { size: 27 });
    d.piccolo("Il file .tdlicenza firmato digitalmente accompagna questo certificato: importato nel programma (Altro › Licenza per formatori) ne verifica l'autenticità.");
    return d.chiudi();
  }

  if (TD.MODO !== "allievo") TD.rotta("/licenza-formatori", function (app) {
    const pr = TD.db.profilo, m = pr.marchio || {};
    const lic = pr.licenza;
    const emesse = TD.db.licenzeEmesse || [];
    const listino = TD.db.listinoLicenze || TD.PIANI_LICENZA;
    app.innerHTML = TD.intest("Kit per altri tutor", "Il tuo programma diventa un prodotto: marchio personale su documenti e app Allievo, licenze per formatori di associazioni ed enti, certificati firmati.") +
      '<div class="wrap"><div class="grid-2">' +
      '<form class="card form" id="mForm"><h2>' + I("star") + 'Il marchio sui documenti</h2>' +
        '<label class="field"><span>Nome dell\'attività (vuoto = «Tutor Digitale»)</span><input name="nome" maxlength="40" value="' + E(m.nome || "") + '" placeholder="Es. Digitale Facile – Associazione Rossi"></label>' +
        '<label class="field"><span>Colore principale</span><input type="color" name="colore" value="' + E(m.colore || "#1d3557") + '"></label>' +
        '<div class="field"><span>Logo (PNG o JPG, si riduce da solo)</span>' + (m.logo ? '<img src="' + E(m.logo) + '" alt="Logo attuale" class="marchio-logo">' : "") + '<label class="btn btn-sm">' + I("upload") + 'Scegli il logo<input type="file" id="mLogo" accept="image/*" hidden></label>' + (m.logo ? ' <button type="button" class="btn btn-sm btn-ghost" id="mTogliLogo">Togli il logo</button>' : "") + "</div>" +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + I("check") + 'Salva il marchio</button><button type="button" class="btn btn-ghost" id="mAzzera">Torna a «Tutor Digitale»</button></div>' +
        '<p class="muted text-small">Il marchio compare su liberatorie, preventivi, ricevute, fatture, registri, attestati e, con il kit, nell\'app Allievo. Resta sempre la dicitura «realizzato con Tutor Digitale di Danilo D\'Auria», richiesta dalla licenza dei contenuti.</p></form>' +
      '<section class="card"><h2>' + I("award") + 'La tua licenza</h2>' +
        (lic ? '<p id="licStato">Verifico…</p><dl class="dl"><dt>Licenziatario</dt><dd>' + E(lic.licenziatario) + "</dd><dt>Piano</dt><dd>" + E((TD.PIANI_LICENZA.find(function (p) { return p.id === lic.piano; }) || {}).nome || lic.piano) + "</dd><dt>Validità</dt><dd>" + E(TD.dataIt(lic.dal) + " – " + TD.dataIt(lic.al)) + "</dd><dt>Numero</dt><dd>" + E(lic.numero) + "</dd></dl>" : "<p>Se usi Tutor Digitale per lavoro e non sei Danilo D'Auria, i contenuti richiedono una licenza per formatori. Importa qui il file <code>.tdlicenza</code> ricevuto.</p>") +
        '<div class="actions"><label class="btn">' + I("upload") + 'Importa la licenza<input type="file" id="licImp" accept=".tdlicenza,.json" hidden></label></div></section></div>' +
      '<section class="card"><h2>' + I("euro") + 'Listino delle licenze</h2><p class="muted text-small">Prezzi proposti, da adattare: si modificano qui e finiscono nella scheda prodotto in PDF.</p>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Piano</th><th>Per chi</th><th>Prezzo annuo €</th></tr></thead><tbody>' + listino.map(function (p, i) { return "<tr><td>" + E(p.nome) + "</td><td>" + E(p.per) + '</td><td><input type="number" step="1" data-prezzo="' + i + '" value="' + E(p.prezzo) + '" aria-label="Prezzo ' + E(p.nome) + '"></td></tr>'; }).join("") + "</tbody></table></div>" +
        '<div class="actions"><button class="btn" id="lisSalva">' + I("check") + 'Salva i prezzi</button><button class="btn" id="lisPdf">' + I("download") + "Scheda prodotto PDF</button></div></section>" +
      '<form class="card form" id="eForm"><h2>' + I("shield") + 'Emetti una licenza</h2><p class="muted text-small">Per l\'autore: il certificato viene firmato con la tua chiave (Impostazioni › Firma digitale). Il formatore importa il file .tdlicenza nel suo programma.</p>' +
        '<div class="grid-2"><label class="field"><span>Licenziatario (persona o ente)</span><input name="licenziatario" required></label><label class="field"><span>Email</span><input name="email" type="email"></label>' +
        '<label class="field"><span>Piano</span><select name="piano">' + listino.map(function (p) { return '<option value="' + p.id + '">' + E(p.nome) + " · " + TD.euro(p.prezzo) + "/anno</option>"; }).join("") + '</select></label><label class="field"><span>Valida fino al</span><input type="date" name="al" value="' + (Number(TD.oggi().slice(0, 4)) + 1) + TD.oggi().slice(4) + '"></label></div>' +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + I("award") + "Emetti e scarica</button></div>" +
        (emesse.length ? '<h3>Licenze emesse</h3><ul class="list">' + emesse.slice().reverse().map(function (l) { return "<li><span><strong>" + E(l.numero) + "</strong> · " + E(l.licenziatario) + " · fino al " + E(TD.dataIt(l.al)) + "</span></li>"; }).join("") + "</ul>" : "") + "</form></div>";

    const mf = document.getElementById("mForm");
    mf.onsubmit = function (e) { e.preventDefault(); pr.marchio = Object.assign({}, pr.marchio || {}, { nome: mf.nome.value.trim(), colore: mf.colore.value }); TD.salva(); TD.applicaMarchio(); TD.toast("Marchio salvato: lo vedi nei prossimi documenti."); };
    document.getElementById("mAzzera").onclick = function () { pr.marchio = null; TD.salva(); location.reload(); };
    document.getElementById("mLogo").onchange = function () { const f = this.files[0]; if (!f) return; TD.leggiImmagine(f, 400).then(function (src) { pr.marchio = Object.assign({}, pr.marchio || {}, { logo: src }); TD.salva(); TD.applicaMarchio(); TD.render(); }); };
    const tl = document.getElementById("mTogliLogo"); if (tl) tl.onclick = function () { delete pr.marchio.logo; TD.salva(); TD.applicaMarchio(); TD.render(); };
    document.getElementById("lisSalva").onclick = function () { const l = JSON.parse(JSON.stringify(listino)); app.querySelectorAll("[data-prezzo]").forEach(function (x) { l[+x.dataset.prezzo].prezzo = Number(x.value) || 0; }); TD.db.listinoLicenze = l; TD.salva(); TD.toast("Prezzi salvati."); };
    document.getElementById("lisPdf").onclick = function () {
      const d = new TD.Documento({ titolo: "Tutor Digitale per formatori", piede: "Tutor Digitale · scheda prodotto" });
      d.intestazione(pr, "Il programma per chi insegna tecnologia");
      d.h1("Tutor Digitale per formatori");
      d.p("Il programma completo per le lezioni di tecnologia: " + TD.LEZIONI.length + " lezioni dai primi passi a esperto, quiz sempre diversi, esercizi, schermate guida, percorsi su misura, modalità aula con la TV, app per gli allievi con compiti e correzione automatica, clienti, liberatoria, registro presenze, attestati con QR di verifica, fattura elettronica. Funziona online e offline, su computer, tablet e telefono, senza account e senza pubblicità.", { size: 28 });
      d.h2("Piani di licenza");
      d.tabella(["Piano", "Per chi", "Prezzo annuo"], (TD.db.listinoLicenze || TD.PIANI_LICENZA).map(function (p) { return [p.nome, p.per, TD.euro(p.prezzo)]; }), [0.3, 0.5, 0.2], { destra: [2] });
      d.h2("Che cosa comprende");
      ["Uso dei contenuti per attività di formazione retribuita (altrimenti vietato dalla licenza CC BY-NC-SA 4.0).", "Il tuo marchio su documenti, attestati e app Allievo.", "Tutti gli aggiornamenti del periodo, con il vademecum aggiornato.", "Certificato di licenza firmato digitalmente e verificabile."].forEach(function (t) { d.casella(t, true); });
      d.piccolo("Contatti: " + [pr.nome, pr.email, pr.sito].filter(Boolean).join(" · "));
      TD.scaricaPdf(d.chiudi(), "tutor-digitale-per-formatori.pdf", { titolo: "Tutor Digitale per formatori" });
    };
    document.getElementById("eForm").onsubmit = async function (e) {
      e.preventDefault();
      const o = TD.form(this);
      const ch = await TD.chiaviTutor(); if (!ch) { TD.toast("Serve la firma digitale: apri il programma in https o installato."); return; }
      TD.db.licenzeEmesse = TD.db.licenzeEmesse || [];
      const numero = "TDL-" + TD.oggi().slice(0, 4) + "-" + String(TD.db.licenzeEmesse.length + 1).padStart(3, "0");
      const l = await TD.emettiLicenza({ numero: numero, licenziatario: o.licenziatario, email: o.email, piano: o.piano, dal: TD.oggi(), al: o.al, editore: pr.nome || "Danilo D'Auria" }, ch);
      TD.db.licenzeEmesse.push({ numero: numero, licenziatario: l.licenziatario, piano: l.piano, al: l.al, dal: l.dal }); TD.salva();
      TD.scarica(new Blob([JSON.stringify(l, null, 1)], { type: "application/json" }), numero + ".tdlicenza");
      const imp = await TD.scambio.impronta(ch.pubblica);
      TD.scaricaPdf(pdfCertificato(l, imp), numero + "-certificato.pdf", { titolo: "Licenza " + numero });
      TD.toast("Licenza " + numero + " emessa: manda al formatore il file .tdlicenza e il certificato PDF."); TD.render();
    };
    document.getElementById("licImp").onchange = function () {
      const f = this.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = async function () {
        let l; try { l = TD.jsonSicuro(r.result); } catch (e) { TD.toast("File di licenza non leggibile."); return; }
        const v = await TD.verificaLicenza(l);
        if (v.stato === "alterata" || v.stato === "illeggibile") { TD.toast("Licenza non valida: la firma non corrisponde."); return; }
        if (v.stato === "sconosciuta" && !TD.conferma("La firma è integra ma la chiave (impronta " + v.impronta + ") non è quella pubblicata dall'autore di Tutor Digitale. Importarla comunque? Verrà mostrata come «non riconosciuta».")) return;
        pr.licenza = l; TD.salva(); TD.toast(v.stato === "scaduta" ? "Licenza importata, ma è scaduta." : "Licenza valida importata."); TD.render();
      };
      r.readAsText(f);
    };
    if (lic) TD.verificaLicenza(lic).then(function (v) {
      const el = document.getElementById("licStato"); if (!el) return;
      el.innerHTML = v.stato === "valida" ? '<span class="pill ok">' + I("check") + "Licenza valida · firma " + E(v.impronta) + "</span>" : v.stato === "scaduta" ? '<span class="pill warn">Licenza scaduta: chiedi il rinnovo</span>' : v.stato === "sconosciuta" ? '<span class="pill warn">Firma integra ma chiave non riconosciuta (impronta ' + E(v.impronta) + ")</span>" : '<span class="pill ko">Licenza non valida</span>';
    });
  });
})();
