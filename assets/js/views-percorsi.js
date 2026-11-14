/* ==========================================================================
   Tutor Digitale · percorsi su misura (miglioria 7)
   Il tutor compone un percorso («SPID in 4 incontri») scegliendo le lezioni
   per ogni incontro, lo stampa come programma e lo assegna a un cliente:
   compiti, appuntamenti e kit per l'app Allievo partono da lì.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;

  /* modelli pronti: si copiano e si modificano */
  TD.PERCORSI_MODELLO = [
    { id: "m-spid", nome: "SPID e servizi pubblici in 4 incontri", descr: "Dall'email al Fascicolo sanitario: attivare e usare SPID, CIE e app IO in sicurezza.", livello: 1,
      incontri: [{ titolo: "Email e password", lezioni: ["rete-0-2", "rete-1-1"] }, { titolo: "Il telefono pronto", lezioni: ["smartphone-0-2", "smartphone-3-1"] }, { titolo: "SPID, CIE e app IO", lezioni: ["smartphone-2-1"] }, { titolo: "Fascicolo sanitario e truffe", lezioni: ["smartphone-2-1", "rete-1-2"] }] },
    { id: "m-smart", nome: "Smartphone da zero in 6 incontri", descr: "Per chi ha appena ricevuto il primo smartphone: chiamate, rubrica, WhatsApp, foto e sicurezza.", livello: 0,
      incontri: [{ titolo: "Chiamare e rispondere", lezioni: ["smartphone-0-1"] }, { titolo: "Rubrica e messaggi", lezioni: ["smartphone-0-2"] }, { titolo: "WhatsApp", lezioni: ["smartphone-1-1"] }, { titolo: "Foto e spazio", lezioni: ["smartphone-1-2"] }, { titolo: "Truffe e messaggi strani", lezioni: ["rete-1-2"] }, { titolo: "Blocco, backup e ripasso", lezioni: ["smartphone-3-1"] }] },
    { id: "m-truffe", nome: "Truffe? No grazie (2 incontri di gruppo)", descr: "Laboratorio per centri anziani e associazioni: riconoscere phishing, SMS e telefonate, password sicure.", livello: 1,
      incontri: [{ titolo: "Riconoscere le truffe", lezioni: ["rete-1-2"] }, { titolo: "Password e verifica in due passaggi", lezioni: ["rete-1-1", "rete-2-1"] }] },
    { id: "m-nonni", nome: "Nonni e nipoti: videochiamate e foto (3 incontri)", descr: "Tablet o telefono per restare in contatto con la famiglia.", livello: 0,
      incontri: [{ titolo: "Gesti e caratteri grandi", lezioni: ["tablet-0-1", "tablet-0-2"] }, { titolo: "Videochiamate", lezioni: ["tablet-1-1", "smartphone-1-1"] }, { titolo: "Foto da guardare e condividere", lezioni: ["tablet-1-2"] }] },
    { id: "m-ufficio", nome: "Ufficio in ordine (4 incontri)", descr: "Per piccoli negozi e studi: file, cloud, backup, password e rete sicura.", livello: 2,
      incontri: [{ titolo: "File e cartelle", lezioni: ["pc-1-1"] }, { titolo: "Cloud e lavoro di gruppo", lezioni: ["rete-2-2", "tablet-2-2"] }, { titolo: "Backup e password", lezioni: ["pc-3-1", "rete-1-1"] }, { titolo: "Rete sicura", lezioni: ["rete-3-1"] }] },
    { id: "m-tv", nome: "Smart TV senza stress (2 incontri)", descr: "Telecomando, app, sottotitoli, abbonamenti e trasmissione dal telefono.", livello: 0,
      incontri: [{ titolo: "Telecomando e canali", lezioni: ["tv-0-1", "tv-0-2"] }, { titolo: "App e trasmissione dal telefono", lezioni: ["tv-1-1", "tv-2-1"] }] }
  ];

  function tutti() { return (TD.db.percorsiMisura || []).concat(TD.PERCORSI_MODELLO.map(function (m) { return Object.assign({ modello: true }, m); })); }
  TD.percorsoMisura = function (id) { return tutti().find(function (p) { return p.id === id; }); };
  TD.lezioniPercorso = function (p) {
    const viste = [];
    (p.incontri || []).forEach(function (inc) { (inc.lezioni || []).forEach(function (id) { if (viste.indexOf(id) < 0 && TD.lezione(id)) viste.push(id); }); });
    return viste;
  };
  TD.durataPercorso = function (p) { return (p.incontri || []).reduce(function (s, inc) { return s + (Number(inc.minuti) || 0); }, 0) || (p.incontri || []).length * 60; };

  /* assegna: compiti dalle lezioni, appuntamenti in agenda, percorso nella scheda */
  TD.assegnaPercorso = function (c, p, opz) {
    opz = opz || {};
    const copia = JSON.parse(JSON.stringify({ id: p.id, nome: p.nome, descr: p.descr, incontri: p.incontri }));
    copia.assegnato = TD.oggi(); copia.fatti = [];
    c.percorsoMisura = copia;
    c.compiti = c.compiti || []; c.registro = c.registro || [];
    let nCompiti = 0, nApp = 0;
    const inizio = opz.dal ? new Date(opz.dal + "T12:00:00") : null;
    copia.incontri.forEach(function (inc, i) {
      let data = "";
      if (inizio) {
        const d = new Date(inizio); d.setDate(d.getDate() + i * (Number(opz.ogni) || 7));
        data = d.toISOString().slice(0, 10);
        c.registro.push({ id: TD.uid("r"), data: data, ora: opz.ora || "10:00", durata: Number(inc.minuti) || 60, luogo: c.luogo, argomenti: (inc.lezioni || []).slice(), note: p.nome + " · incontro " + (i + 1) + ": " + inc.titolo, importo: "", pagato: false, stato: "pianificata", presenti: (c.partecipanti || []).map(function (x) { return x.id; }) });
        nApp++;
      }
      if (opz.compiti !== false) (inc.lezioni || []).forEach(function (id) {
        const l = TD.lezione(id); if (!l) return;
        if (c.compiti.some(function (k) { return k.lezione === id && !k.fatto; })) return;
        let scad = "";
        if (data) { const s = new Date(data + "T12:00:00"); s.setDate(s.getDate() + (Number(opz.ogni) || 7) - 1); scad = s.toISOString().slice(0, 10); }
        c.compiti.push({ id: TD.uid("k"), testo: l.compito, lezione: id, assegnato: TD.oggi(), scadenza: scad, fatto: false, esito: "", percorso: p.id });
        nCompiti++;
      });
    });
    return { compiti: nCompiti, appuntamenti: nApp };
  };

  TD.pdfPercorso = function (p, c) {
    const d = new TD.Documento({ titolo: p.nome, piede: "Tutor Digitale · programma del percorso" });
    d.intestazione(TD.db.profilo, "Programma del percorso");
    d.h1(p.nome);
    if (p.descr) d.p(p.descr, { size: 30, colore: "#374151" });
    d.campi([["Destinatario", c ? TD.nomeCliente(c) : ""], ["Incontri", String(p.incontri.length)], ["Durata complessiva", (TD.durataPercorso(p) / 60).toLocaleString("it-IT", { maximumFractionDigits: 1 }) + " ore"], ["Livello di partenza", TD.livello(p.livello || 0).nome]], 4);
    p.incontri.forEach(function (inc, i) {
      d.h2("Incontro " + (i + 1) + " · " + inc.titolo);
      (inc.lezioni || []).forEach(function (id) {
        const l = TD.lezione(id); if (!l) return;
        d.p(l.titolo, { size: 28, peso: 700, dopo: 4 });
        d.piccolo("Obiettivi: " + l.obiettivi.join("; ") + ".", { dopo: 10 });
      });
      if (inc.note) d.piccolo(inc.note);
    });
    d.linea();
    d.piccolo("Ogni incontro segue il metodo in cinque tempi: accogliere, mostrare, fare insieme, fare da solo, fissare. Al termine: verifica con quiz e attestato con QR di verifica.");
    return d.chiudi();
  };

  /* ------------------------------------------------------------ elenco */
  TD.rotta("/percorsi-misura", function (app, p, q) {
    const miei = TD.db.percorsiMisura || [];
    const cliente = TD.cliente(q.cliente);
    function scheda(x) {
      const lez = TD.lezioniPercorso(x);
      return '<article class="card pm-card"><h3>' + E(x.nome) + (x.modello ? ' <span class="pill">modello</span>' : "") + "</h3><p>" + E(x.descr || "") + "</p>" +
        '<p class="muted text-small">' + x.incontri.length + " incontri · " + lez.length + " lezioni · " + TD.badgeLiv(x.livello || 0) + "</p>" +
        '<div class="actions"><a class="btn btn-sm btn-primary" href="#/percorso-misura/' + x.id + (cliente ? "?cliente=" + cliente.id : "") + '">' + I(cliente ? "check" : "pen") + (cliente ? "Assegna a " + E(TD.nomeCliente(cliente)) : x.modello ? "Apri" : "Modifica") + "</a></div></article>";
    }
    app.innerHTML = TD.intest("Percorsi su misura", "Componi un percorso scegliendo le lezioni incontro per incontro, stampalo come programma per il cliente o l'ente e assegnalo con un solo gesto: compiti, appuntamenti e kit per l'app Allievo." + (cliente ? " Scegli il percorso per <strong>" + E(TD.nomeCliente(cliente)) + "</strong>." : "")) +
      '<div class="wrap"><div class="actions"><a class="btn btn-primary" href="#/percorso-misura/nuovo' + (cliente ? "?cliente=" + cliente.id : "") + '">' + I("plus") + "Nuovo percorso</a></div>" +
      (miei.length ? '<section class="block"><h2>I tuoi percorsi</h2><div class="pm-grid">' + miei.map(scheda).join("") + "</div></section>" : "") +
      '<section class="block"><h2>Modelli pronti</h2><div class="pm-grid">' + TD.PERCORSI_MODELLO.map(function (m) { return scheda(Object.assign({ modello: true }, m)); }).join("") + "</div></section></div>";
  });

  /* ------------------------------------------------------------ editor e assegnazione */
  TD.rotta("/percorso-misura/:id", function (app, par, q) {
    const orig = par.id === "nuovo" ? null : TD.percorsoMisura(par.id);
    if (par.id !== "nuovo" && !orig) { TD.vai("#/percorsi-misura"); return; }
    const pm = orig ? JSON.parse(JSON.stringify(orig)) : { id: TD.uid("pm"), nome: "", descr: "", livello: 0, incontri: [{ titolo: "Primo incontro", lezioni: [], minuti: 60 }] };
    if (pm.modello) { delete pm.modello; }
    const cliente = TD.cliente(q.cliente);
    function opzioniLezioni(sel) {
      return '<option value="">+ aggiungi una lezione…</option>' + TD.PERCORSI.map(function (pc) {
        return '<optgroup label="' + E(pc.nome) + '">' + TD.lezioniDi(pc.id).map(function (l) { return '<option value="' + l.id + '">' + E(TD.livello(l.liv).breve + " · " + l.titolo) + "</option>"; }).join("") + "</optgroup>";
      }).join("");
    }
    function disegna() {
      app.innerHTML = TD.intest(orig && !orig.modello ? "Modifica percorso" : orig ? "Modello: " + E(orig.nome) : "Nuovo percorso", orig && orig.modello ? "Puoi assegnarlo così com'è o modificarlo: le modifiche vengono salvate come percorso tuo." : "Scegli le lezioni per ogni incontro. L'ordine conta: è quello che vedrà l'allievo.") +
        '<div class="wrap"><div class="grid-2 pm-edit">' +
        '<form class="card form" id="pmForm"><label class="field"><span>Nome del percorso</span><input name="nome" required value="' + E(pm.nome) + '" placeholder="Es. SPID in 4 incontri"></label>' +
          '<label class="field"><span>Descrizione (va nel programma stampato)</span><textarea name="descr" rows="2">' + E(pm.descr || "") + "</textarea></label>" +
          '<label class="field"><span>Livello di partenza</span><select name="livello">' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '"' + (l.id === (pm.livello || 0) ? " selected" : "") + ">" + E(l.nome) + "</option>"; }).join("") + "</select></label>" +
          '<ol class="pm-incontri">' + pm.incontri.map(function (inc, i) {
            return '<li class="pm-inc"><div class="grid-2"><label class="field"><span>Incontro ' + (i + 1) + '</span><input data-tit="' + i + '" value="' + E(inc.titolo) + '"></label><label class="field"><span>Minuti</span><input type="number" step="15" data-min="' + i + '" value="' + (inc.minuti || 60) + '"></label></div>' +
              '<ul class="pm-lez">' + (inc.lezioni || []).map(function (id, k) { const l = TD.lezione(id); return "<li>" + (l ? TD.badgeLiv(l.liv) + " " + E(l.titolo) : E(id)) + ' <button type="button" class="icon-btn" data-tog="' + i + ":" + k + '" aria-label="Togli la lezione">' + I("x") + "</button></li>"; }).join("") + "</ul>" +
              '<select data-agg="' + i + '" aria-label="Aggiungi una lezione all\'incontro ' + (i + 1) + '">' + opzioniLezioni() + "</select>" +
              '<div class="actions"><button type="button" class="btn btn-sm btn-ghost" data-su="' + i + '"' + (i ? "" : " disabled") + '>Sposta su</button><button type="button" class="btn btn-sm btn-ghost" data-via="' + i + '">' + I("trash") + "Togli incontro</button></div></li>";
          }).join("") + "</ol>" +
          '<div class="actions"><button type="button" class="btn" id="pmAgg">' + I("plus") + 'Aggiungi incontro</button><button class="btn btn-primary" type="submit">' + I("check") + 'Salva percorso</button><button type="button" class="btn" id="pmPdf">' + I("print") + "Programma PDF</button>" + (orig && !orig.modello ? '<button type="button" class="btn btn-danger" id="pmDel">' + I("trash") + "Elimina</button>" : "") + "</div></form>" +
        '<form class="card form" id="pmAss"><h2>' + I("users") + 'Assegna a un cliente</h2><label class="field"><span>Cliente o gruppo</span><select name="cliente" required>' + TD.opzioniClienti(cliente ? cliente.id : "") + "</select></label>" +
          '<div class="grid-3"><label class="field"><span>Primo incontro (facoltativo)</span><input type="date" name="dal"></label><label class="field"><span>Ora</span><input type="time" name="ora" value="10:00"></label><label class="field"><span>Ogni quanti giorni</span><input type="number" name="ogni" value="7" min="1"></label></div>' +
          '<label class="check"><input type="checkbox" name="compiti" checked> Crea i compiti a casa delle lezioni</label>' +
          '<label class="check"><input type="checkbox" name="kit" checked> Poi apri il kit per l\'app Allievo</label>' +
          '<div class="actions"><button class="btn btn-primary" type="submit">' + I("check") + "Assegna il percorso</button></div>" +
          '<p class="muted text-small">Con la data del primo incontro gli appuntamenti finiscono in agenda e i compiti ricevono la scadenza. Il percorso compare nella scheda cliente e, con il kit, nell\'app Allievo come «Il mio percorso».</p></form>' +
        "</div></div>";
      collega();
    }
    function leggiForm() {
      const f = document.getElementById("pmForm");
      pm.nome = f.nome.value.trim(); pm.descr = f.descr.value.trim(); pm.livello = Number(f.livello.value) || 0;
      f.querySelectorAll("[data-tit]").forEach(function (x) { pm.incontri[+x.dataset.tit].titolo = x.value.trim() || "Incontro " + (+x.dataset.tit + 1); });
      f.querySelectorAll("[data-min]").forEach(function (x) { pm.incontri[+x.dataset.min].minuti = Number(x.value) || 60; });
    }
    function salva() {
      leggiForm();
      if (!pm.nome) { TD.toast("Dai un nome al percorso."); return false; }
      if (!TD.lezioniPercorso(pm).length) { TD.toast("Aggiungi almeno una lezione."); return false; }
      TD.db.percorsiMisura = TD.db.percorsiMisura || [];
      if (orig && orig.modello) pm.id = TD.uid("pm");
      const i = TD.db.percorsiMisura.findIndex(function (x) { return x.id === pm.id; });
      if (i >= 0) TD.db.percorsiMisura[i] = pm; else TD.db.percorsiMisura.push(pm);
      TD.salva(); return true;
    }
    function collega() {
      app.querySelectorAll("[data-agg]").forEach(function (s) { s.onchange = function () { if (!s.value) return; leggiForm(); pm.incontri[+s.dataset.agg].lezioni.push(s.value); disegna(); }; });
      app.querySelectorAll("[data-tog]").forEach(function (b) { b.onclick = function () { leggiForm(); const p = b.dataset.tog.split(":"); pm.incontri[+p[0]].lezioni.splice(+p[1], 1); disegna(); }; });
      app.querySelectorAll("[data-via]").forEach(function (b) { b.onclick = function () { leggiForm(); if (pm.incontri.length > 1) { pm.incontri.splice(+b.dataset.via, 1); disegna(); } }; });
      app.querySelectorAll("[data-su]").forEach(function (b) { b.onclick = function () { leggiForm(); const i = +b.dataset.su; const t = pm.incontri[i - 1]; pm.incontri[i - 1] = pm.incontri[i]; pm.incontri[i] = t; disegna(); }; });
      document.getElementById("pmAgg").onclick = function () { leggiForm(); pm.incontri.push({ titolo: "Incontro " + (pm.incontri.length + 1), lezioni: [], minuti: 60 }); disegna(); };
      document.getElementById("pmForm").onsubmit = function (e) { e.preventDefault(); if (salva()) { TD.toast("Percorso salvato."); history.replaceState(null, "", "#/percorso-misura/" + pm.id); } };
      document.getElementById("pmPdf").onclick = function () { leggiForm(); TD.scaricaPdf(TD.pdfPercorso(pm, TD.cliente(document.getElementById("pmAss").cliente.value)), "percorso-" + TD.nomeFile(pm.nome || "su-misura") + ".pdf", { titolo: pm.nome }); };
      const del = document.getElementById("pmDel");
      if (del) del.onclick = function () { if (!TD.conferma("Eliminare il percorso «" + pm.nome + "»? Resta nelle schede dei clienti a cui è già assegnato.")) return; TD.db.percorsiMisura = (TD.db.percorsiMisura || []).filter(function (x) { return x.id !== pm.id; }); TD.salva(); TD.vai("#/percorsi-misura"); };
      document.getElementById("pmAss").onsubmit = function (e) {
        e.preventDefault();
        leggiForm();
        if (!TD.lezioniPercorso(pm).length) { TD.toast("Aggiungi almeno una lezione."); return; }
        const o = TD.form(this), c = TD.cliente(o.cliente);
        if (!c) { TD.toast("Scegli il cliente."); return; }
        if (c.percorsoMisura && !TD.conferma(TD.nomeCliente(c) + " ha già il percorso «" + c.percorsoMisura.nome + "». Sostituirlo?")) return;
        if (!orig || !orig.modello) salva();
        const r = TD.assegnaPercorso(c, pm, { dal: o.dal, ora: o.ora, ogni: o.ogni, compiti: !!o.compiti });
        TD.salva();
        TD.toast("Percorso assegnato: " + r.compiti + " compiti" + (r.appuntamenti ? ", " + r.appuntamenti + " appuntamenti in agenda" : "") + ".");
        TD.vai("#/cliente/" + c.id + "?tab=" + (o.kit ? "allievo" : "percorso"));
      };
    }
    disegna();
  });

  /* riquadro per la scheda cliente › Percorso */
  TD.riquadroPercorsoMisura = function (c) {
    const p = c.percorsoMisura;
    if (!p) return '<section class="card"><h2>' + I("layers") + 'Percorso su misura</h2><p class="muted">Nessun percorso assegnato.</p><div class="actions"><a class="btn btn-sm btn-primary" href="#/percorsi-misura?cliente=' + c.id + '">' + I("plus") + "Scegli o componi un percorso</a></div></section>";
    const fatte = c.completate || [];
    return '<section class="card"><h2>' + I("layers") + E(p.nome) + '</h2><p class="muted text-small">Assegnato il ' + E(TD.dataIt(p.assegnato)) + "</p><ol class=\"pm-incontri compatto\">" +
      p.incontri.map(function (inc) {
        const tutte = (inc.lezioni || []).filter(function (id) { return TD.lezione(id); });
        const ok = tutte.length && tutte.every(function (id) { return fatte.indexOf(id) >= 0; });
        return '<li class="' + (ok ? "fatto" : "") + '"><strong>' + E(inc.titolo) + "</strong>" + (ok ? " " + I("check") : "") + "<br><small>" + tutte.map(function (id) { return '<a href="#/lezione/' + id + '">' + E(TD.lezione(id).titolo) + "</a>"; }).join(" · ") + "</small></li>";
      }).join("") + '</ol><div class="actions"><button class="btn btn-sm" id="pmStampa">' + I("print") + 'Programma PDF</button><a class="btn btn-sm" href="#/cliente/' + c.id + '?tab=allievo">' + I("upload") + 'Manda il kit</a><button class="btn btn-sm btn-ghost" id="pmTogli">Togli il percorso</button></div></section>';
  };
  TD.collegaPercorsoMisura = function (c) {
    const s = document.getElementById("pmStampa"); if (s) s.onclick = function () { TD.scaricaPdf(TD.pdfPercorso(c.percorsoMisura, c), "percorso-" + TD.nomeFile(c.percorsoMisura.nome) + ".pdf", { titolo: c.percorsoMisura.nome }); };
    const t = document.getElementById("pmTogli"); if (t) t.onclick = function () { if (TD.conferma("Togliere il percorso dalla scheda? Compiti e appuntamenti già creati restano.")) { c.percorsoMisura = null; TD.salva(); TD.render(); } };
  };
})();
