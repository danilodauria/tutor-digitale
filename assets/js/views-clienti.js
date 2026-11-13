/* ==========================================================================
   Tutor Digitale · clienti (persone, enti e gruppi), registro, percorso,
   compiti e risultati
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const DISP = [["pc", "Computer"], ["tablet", "Tablet"], ["smartphone", "Smartphone"], ["tv", "Smart TV"]];

  TD.statoLiberatoria = function (c) {
    if (c.liberatoria && c.liberatoria.firmata) return '<span class="pill ok">' + I("check") + "Liberatoria firmata " + E(TD.dataIt(c.liberatoria.data)) + "</span>";
    return '<span class="pill warn">' + I("alert") + "Liberatoria da firmare</span>";
  };
  TD.oreCliente = function (c) {
    return (c.registro || []).filter(function (r) { return r.stato !== "pianificata"; }).reduce(function (s, r) { return s + (Number(r.durata) || 0); }, 0) / 60;
  };
  TD.mediaQuiz = function (c, partId) {
    const q = (c.quiz || []).filter(function (x) { return !partId || !x.partecipante || x.partecipante === partId; });
    if (!q.length) return null;
    return Math.round(q.reduce(function (s, x) { return s + x.perc; }, 0) / q.length);
  };

  /* --------------------------------------------------------------- elenco */
  TD.rotta("/clienti", function (app, p, q) {
    const cerca = (q.q || "").toLowerCase(), stato = q.stato || "attivi";
    const lista = TD.db.clienti.filter(function (c) {
      const s = (TD.nomeCliente(c) + " " + (c.citta || "") + " " + (c.email || "") + " " + (c.referente || "")).toLowerCase();
      return (!cerca || s.indexOf(cerca) >= 0) && (stato === "tutti" || (stato === "attivi" ? c.stato !== "concluso" : c.stato === "concluso"));
    }).sort(function (a, b) { return TD.nomeCliente(a).localeCompare(TD.nomeCliente(b)); });

    app.innerHTML = TD.intest("Clienti", "Persone, famiglie, aziende ed enti: dati, liberatoria, registro delle lezioni, compiti, quiz e attestati in un'unica scheda.") +
      '<div class="wrap"><div class="toolbar">' +
        '<form id="cerca" class="search"><input name="q" type="search" placeholder="Cerca per nome, città, email…" value="' + E(q.q || "") + '" aria-label="Cerca cliente"></form>' +
        '<nav class="chips">' + [["attivi", "Attivi"], ["conclusi", "Conclusi"], ["tutti", "Tutti"]].map(function (s) { return '<a class="chip' + (stato === s[0] ? " on" : "") + '" href="#/clienti?stato=' + s[0] + '">' + s[1] + "</a>"; }).join("") + "</nav>" +
        '<a class="btn btn-primary" href="#/nuovo-cliente">' + I("plus") + "Nuovo cliente</a>" +
        '<button class="btn" id="csv">' + I("download") + "Esporta CSV</button>" +
      "</div>" +
      (lista.length ? '<div class="client-grid">' + lista.map(function (c) {
        const ore = TD.oreCliente(c);
        return '<a class="client-card" href="#/cliente/' + c.id + '"><span class="avatar' + (c.tipo === "ente" ? " ente" : "") + '">' + I(c.tipo === "ente" ? "users" : "user") + "</span>" +
          "<div><h3>" + E(TD.nomeCliente(c)) + "</h3><p class=\"muted\">" + E(c.tipo === "ente" ? (c.referente ? "Ref. " + c.referente + " · " : "") + (c.partecipanti || []).length + " partecipanti" : (c.citta || c.luogo || "")) + "</p>" +
          '<p class="client-devs">' + (c.dispositivi || []).map(function (d) { return '<span title="' + E(TD.percorso(d).nome) + '">' + TD.iconaPercorso(d) + TD.badgeLiv((c.livelli || {})[d] || 0) + "</span>"; }).join("") + "</p>" +
          '<p class="text-small">' + (c.registro || []).filter(function (r) { return r.stato !== "pianificata"; }).length + " lezioni · " + ore.toLocaleString("it-IT", { maximumFractionDigits: 1 }) + " ore</p>" + TD.statoLiberatoria(c) + "</div></a>";
      }).join("") + "</div>" :
      '<div class="card empty"><p>' + (TD.db.clienti.length ? "Nessun cliente corrisponde alla ricerca." : "Ancora nessun cliente. Inizia dal primo: bastano nome e luogo delle lezioni.") + '</p><a class="btn btn-primary" href="#/nuovo-cliente">' + I("plus") + "Nuovo cliente</a></div>") +
      "</div>";
    document.getElementById("cerca").onsubmit = function (e) { e.preventDefault(); TD.vai("#/clienti?stato=" + stato + "&q=" + encodeURIComponent(this.q.value)); };
    document.getElementById("csv").onclick = function () {
      const col = ["tipo", "nome", "cognome", "ragione", "referente", "cf", "piva", "indirizzo", "citta", "telefono", "email", "luogo", "dispositivi", "lezioni", "ore", "liberatoria"];
      const righe = [col.join(";")].concat(TD.db.clienti.map(function (c) {
        return col.map(function (k) {
          let v = k === "dispositivi" ? (c.dispositivi || []).join(",") : k === "lezioni" ? (c.registro || []).length : k === "ore" ? TD.oreCliente(c).toFixed(1) : k === "liberatoria" ? (c.liberatoria && c.liberatoria.firmata ? "firmata " + c.liberatoria.data : "no") : (c[k] || "");
          return '"' + String(v).replace(/"/g, '""') + '"';
        }).join(";");
      }));
      TD.scarica(new Blob(["﻿" + righe.join("\r\n")], { type: "text/csv;charset=utf-8" }), "clienti-tutor-digitale-" + TD.oggi() + ".csv");
    };
  });

  /* ------------------------------------------------------------ modulo */
  function modulo(app, c) {
    const nuovo = !c;
    c = c || { id: TD.uid("c"), tipo: "persona", dispositivi: [], livelli: {}, partecipanti: [], forma: "individuale", stato: "attivo", luogo: TD.LUOGHI[0], creato: TD.oggi() };
    const tipo = c.tipo;
    app.innerHTML = TD.intest(nuovo ? "Nuovo cliente" : "Modifica cliente", "I dati restano su questo dispositivo. Chiedi solo quelli che servono davvero (principio di minimizzazione).") +
      '<div class="wrap"><form class="card form" id="f">' +
        '<fieldset class="field"><legend>Tipo di cliente</legend>' +
          '<div class="seg"><label><input type="radio" name="tipo" value="persona"' + (tipo !== "ente" ? " checked" : "") + '><span>' + I("user") + 'Persona</span></label><label><input type="radio" name="tipo" value="ente"' + (tipo === "ente" ? " checked" : "") + "><span>" + I("users") + "Ente, azienda o gruppo</span></label></div></fieldset>" +
        '<div class="grid-2 solo-persona">' +
          campo("nome", "Nome", c.nome) + campo("cognome", "Cognome", c.cognome) +
          campo("nascita", "Data di nascita (facoltativa)", c.nascita, "date") + campo("cf", "Codice fiscale (per la ricevuta)", c.cf) +
          campo("tutore", "Genitore, tutore o amministratore di sostegno (se serve)", c.tutore) +
        "</div>" +
        '<div class="grid-2 solo-ente">' +
          campo("ragione", "Ragione sociale o nome del gruppo", c.ragione) + campo("referente", "Referente", c.referente) +
          campo("piva", "Partita IVA o codice fiscale", c.piva) + campo("pec", "PEC o codice destinatario (facoltativo)", c.pec) +
        "</div>" +
        '<div class="grid-2">' +
          campo("indirizzo", "Indirizzo", c.indirizzo) + campo("citta", "Città", c.citta) +
          campo("telefono", "Telefono", c.telefono, "tel") + campo("email", "Email", c.email, "email") +
          '<label class="field"><span>Dove si fanno le lezioni</span><select name="luogo">' + TD.LUOGHI.map(function (l) { return "<option" + (c.luogo === l ? " selected" : "") + ">" + E(l) + "</option>"; }).join("") + "</select></label>" +
          '<label class="field"><span>Forma</span><select name="forma"><option value="individuale"' + (c.forma !== "gruppo" ? " selected" : "") + '>Individuale</option><option value="gruppo"' + (c.forma === "gruppo" ? " selected" : "") + ">Di gruppo</option></select></label>" +
        "</div>" +
        '<fieldset class="field"><legend>Dispositivi su cui lavorare e livello di partenza</legend><div class="dev-levels">' +
          DISP.map(function (d) {
            const on = (c.dispositivi || []).indexOf(d[0]) >= 0, lv = (c.livelli || {})[d[0]] || 0;
            return '<div class="dev-level"><label class="check"><input type="checkbox" name="dispositivi" data-multi="1" value="' + d[0] + '"' + (on ? " checked" : "") + "> " + TD.iconaPercorso(d[0]) + E(d[1]) + "</label>" +
              '<select name="liv_' + d[0] + '" aria-label="Livello ' + E(d[1]) + '">' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '"' + (lv === l.id ? " selected" : "") + ">" + E(l.nome) + "</option>"; }).join("") + "</select></div>";
          }).join("") +
          '<div class="dev-level"><label class="check"><input type="checkbox" name="dispositivi" data-multi="1" value="rete"' + ((c.dispositivi || []).indexOf("rete") >= 0 ? " checked" : "") + "> " + TD.iconaPercorso("rete") + "Internet e sicurezza</label>" +
            '<select name="liv_rete" aria-label="Livello Internet">' + TD.LIVELLI.map(function (l) { return '<option value="' + l.id + '"' + (((c.livelli || {}).rete || 0) === l.id ? " selected" : "") + ">" + E(l.nome) + "</option>"; }).join("") + "</select></div>" +
        '</div><p class="muted text-small">Non sai il livello? Dopo il salvataggio usa il <strong>test d\'ingresso</strong> dalla scheda cliente.</p></fieldset>' +
        campo("sistemi", "Modelli e sistemi (es. Windows 11, iPhone 13, TV Samsung)", c.sistemi) +
        '<label class="field solo-ente"><span>Partecipanti (uno per riga: Nome Cognome)</span><textarea name="partecipanti" rows="5">' + E((c.partecipanti || []).map(function (x) { return x.nome; }).join("\n")) + "</textarea></label>" +
        '<label class="field"><span>Obiettivi del cliente</span><textarea name="obiettivi" rows="3" placeholder="Es. videochiamare i nipoti, usare lo SPID, gestire le email di lavoro">' + E(c.obiettivi || "") + "</textarea></label>" +
        '<label class="field"><span>Esigenze di accessibilità (facoltativo, solo con consenso nella liberatoria)</span><textarea name="accessibilita" rows="2" placeholder="Es. caratteri grandi, parlare lentamente, preferisce il tablet al mouse">' + E(c.accessibilita || "") + "</textarea></label>" +
        '<label class="field"><span>Note</span><textarea name="note" rows="3">' + E(c.note || "") + "</textarea></label>" +
        '<label class="field"><span>Stato</span><select name="stato"><option value="attivo"' + (c.stato !== "concluso" ? " selected" : "") + '>Attivo</option><option value="concluso"' + (c.stato === "concluso" ? " selected" : "") + ">Percorso concluso</option></select></label>" +
        '<div class="actions"><button class="btn btn-primary btn-lg" type="submit">' + I("check") + "Salva</button>" +
          '<a class="btn" href="' + (nuovo ? "#/clienti" : "#/cliente/" + c.id) + '">Annulla</a>' +
          (nuovo ? "" : '<button class="btn btn-danger" type="button" id="elimina">' + I("trash") + "Elimina cliente</button>") + "</div>" +
      "</form></div>";

    const f = document.getElementById("f");
    function aggiornaTipo() {
      const ente = f.querySelector('input[name="tipo"]:checked').value === "ente";
      f.querySelectorAll(".solo-ente").forEach(function (x) { x.hidden = !ente; });
      f.querySelectorAll(".solo-persona").forEach(function (x) { x.hidden = ente; });
    }
    f.querySelectorAll('input[name="tipo"]').forEach(function (r) { r.onchange = aggiornaTipo; });
    aggiornaTipo();
    f.onsubmit = function (e) {
      e.preventDefault();
      const o = TD.form(f);
      if (o.tipo === "ente" ? !o.ragione : !(o.nome || o.cognome)) { TD.toast(o.tipo === "ente" ? "Scrivi il nome dell'ente o del gruppo." : "Scrivi almeno nome o cognome."); return; }
      ["tipo", "nome", "cognome", "nascita", "cf", "tutore", "ragione", "referente", "piva", "pec", "indirizzo", "citta", "telefono", "email", "luogo", "forma", "sistemi", "obiettivi", "accessibilita", "note", "stato"].forEach(function (k) { c[k] = o[k] || ""; });
      c.dispositivi = o.dispositivi || [];
      c.livelli = c.livelli || {};
      ["pc", "tablet", "smartphone", "tv", "rete"].forEach(function (d) { c.livelli[d] = Number(o["liv_" + d] || 0); });
      if (c.tipo === "ente") {
        const vecchi = c.partecipanti || [];
        c.partecipanti = (o.partecipanti || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean).map(function (nome) {
          const v = vecchi.find(function (x) { return x.nome === nome; });
          return v || { id: TD.uid("p"), nome: nome };
        });
        if (c.forma !== "gruppo" && c.partecipanti.length > 1) c.forma = "gruppo";
      }
      if (nuovo) TD.db.clienti.push(c);
      TD.salva();
      TD.toast("Cliente salvato.");
      TD.vai("#/cliente/" + c.id + (nuovo ? "?tab=panoramica&nuovo=1" : ""));
    };
    const el = document.getElementById("elimina");
    if (el) el.onclick = function () {
      if (!TD.conferma("Eliminare definitivamente " + TD.nomeCliente(c) + " e tutti i suoi dati (registro, compiti, quiz)? I documenti fiscali già emessi restano nell'archivio documenti.")) return;
      TD.db.clienti = TD.db.clienti.filter(function (x) { return x.id !== c.id; });
      if (TD.db.impostazioni.clienteAttivo === c.id) TD.db.impostazioni.clienteAttivo = "";
      TD.salva(); TD.aggiornaChip(); TD.vai("#/clienti");
    };
  }
  function campo(n, l, v, t) {
    return '<label class="field"><span>' + E(l) + '</span><input name="' + n + '" type="' + (t || "text") + '" value="' + E(v || "") + '"></label>';
  }
  TD.rotta("/nuovo-cliente", function (app) { modulo(app, null); });
  TD.rotta("/cliente/:id/modifica", function (app, p) { const c = TD.cliente(p.id); if (!c) return TD.vai("#/clienti"); modulo(app, c); });

  /* ------------------------------------------------------------ scheda */
  const TABS = [["panoramica", "Panoramica"], ["registro", "Registro lezioni"], ["percorso", "Percorso"], ["compiti", "Compiti"], ["quiz", "Quiz"], ["allievo", "App allievo"], ["documenti", "Documenti"]];

  TD.rotta("/cliente/:id", function (app, p, q) {
    const c = TD.cliente(p.id);
    if (!c) { TD.vai("#/clienti"); return; }
    const tab = q.tab || "panoramica";
    const attivo = TD.db.impostazioni.clienteAttivo === c.id;
    app.innerHTML =
      '<header class="page-head"><div class="wrap client-head">' +
        '<span class="avatar big' + (c.tipo === "ente" ? " ente" : "") + '">' + I(c.tipo === "ente" ? "users" : "user") + "</span>" +
        '<div><p class="crumbs"><a href="#/clienti">Clienti</a></p><h1>' + E(TD.nomeCliente(c)) + "</h1>" +
        '<p class="meta"><span>' + I("map") + E(c.luogo || "") + "</span>" + (c.citta ? "<span>" + E(c.citta) + "</span>" : "") + (c.telefono ? '<a href="tel:' + E(c.telefono) + '">' + E(c.telefono) + "</a>" : "") + (c.email ? '<a href="mailto:' + E(c.email) + '">' + E(c.email) + "</a>" : "") + TD.statoLiberatoria(c) + "</p></div>" +
        '<div class="head-actions">' +
          '<button class="btn ' + (attivo ? "btn-ok" : "btn-primary") + '" id="attiva">' + I(attivo ? "check" : "play") + (attivo ? "In lezione ora" : "Inizia la lezione") + "</button>" +
          '<a class="btn" href="#/cliente/' + c.id + '/modifica">' + I("pen") + "Modifica</a>" +
        "</div>" +
      "</div>" +
      '<div class="wrap"><nav class="tabs" role="tablist">' + TABS.map(function (t) { return '<a role="tab" class="' + (t[0] === tab ? "on" : "") + '" href="#/cliente/' + c.id + "?tab=" + t[0] + '">' + t[1] + "</a>"; }).join("") + "</nav></div></header>" +
      '<div class="wrap" id="tabBody"></div>';

    document.getElementById("attiva").onclick = function () {
      TD.impostaClienteAttivo(attivo ? "" : c.id);
      TD.toast(attivo ? "Lezione chiusa." : "Ora le lezioni, i quiz e gli esercizi si registrano per " + TD.nomeCliente(c) + ".");
      TD.render();
    };
    const body = document.getElementById("tabBody");
    ({ panoramica: panoramica, registro: registro, percorso: percorso, compiti: compiti, quiz: quiz, allievo: TD.tabAllievo, documenti: documenti }[tab] || panoramica)(body, c, q);
  });

  function panoramica(body, c, q) {
    const ore = TD.oreCliente(c);
    const media = TD.mediaQuiz(c);
    const compitiAperti = (c.compiti || []).filter(function (k) { return !k.fatto; }).length;
    const percorsi = (c.dispositivi || []).length ? c.dispositivi : ["pc", "tablet", "smartphone", "tv", "rete"];
    body.innerHTML =
      (q.nuovo ? '<div class="note-box">' + I("info") + '<div><strong>Primo passo consigliato:</strong> fai firmare la liberatoria (anche su carta) e poi il test d\'ingresso per decidere da dove partire.</div></div>' : "") +
      '<section class="stats">' +
        '<div class="stat">' + I("calendar") + "<strong>" + (c.registro || []).filter(function (r) { return r.stato !== "pianificata"; }).length + "</strong><span>lezioni svolte</span></div>" +
        '<div class="stat">' + I("clock") + "<strong>" + ore.toLocaleString("it-IT", { maximumFractionDigits: 1 }) + "</strong><span>ore</span></div>" +
        '<div class="stat">' + I("quiz") + "<strong>" + (media == null ? "—" : media + "%") + "</strong><span>media quiz</span></div>" +
        '<div class="stat">' + I("pen") + "<strong>" + compitiAperti + "</strong><span>compiti aperti</span></div>" +
      "</section>" +
      '<div class="grid-2">' +
        '<section class="card"><h2>Azioni</h2><div class="action-list">' +
          azione("#/liberatoria/" + c.id, "doc", "Liberatoria e consensi", c.liberatoria && c.liberatoria.firmata ? "Firmata, si può ristampare" : "Da compilare e firmare") +
          azione("#/strumenti/test?cliente=" + c.id, "target", "Test d'ingresso", "Calcola il livello di partenza per ogni dispositivo") +
          azione("#/percorsi", "book", "Scegli la lezione", "Il cliente diventa quello attivo") +
          azione("#/quiz", "quiz", "Quiz", "Il risultato si salva qui") +
          azione("#/attestato/" + c.id, "award", "Attestato finale", "PDF stampabile con competenze e codice") +
          azione("#/preventivo?cliente=" + c.id, "euro", "Preventivo o ricevuta", "Dal listino, numerazione automatica") +
          azione("#/cliente/" + c.id + "?tab=allievo", "upload", "App allievo e compiti a distanza", "Kit personalizzato, correzione automatica") +
        "</div></section>" +
        '<section class="card"><h2>Progressi</h2>' + percorsi.map(function (d) {
          const tutte = TD.lezioniDi(d), fatte = tutte.filter(function (l) { return (c.completate || []).indexOf(l.id) >= 0; }).length;
          return '<div class="prog"><span>' + TD.iconaPercorso(d) + E(TD.percorso(d).nome) + " " + TD.badgeLiv((c.livelli || {})[d] || 0) + "</span><span>" + fatte + "/" + tutte.length + "</span></div>" + TD.barra(fatte, tutte.length);
        }).join("") + "</section>" +
      "</div>" +
      '<section class="card"><h2>Scheda</h2><dl class="dl">' +
        dd("Tipo", c.tipo === "ente" ? "Ente, azienda o gruppo" : "Persona") +
        (c.tipo === "ente" ? dd("Referente", c.referente) + dd("P. IVA / CF", c.piva) + dd("Partecipanti", (c.partecipanti || []).map(function (x) { return x.nome; }).join(", ")) : dd("Data di nascita", TD.dataIt(c.nascita)) + dd("Codice fiscale", c.cf) + dd("Tutore", c.tutore)) +
        dd("Indirizzo", [c.indirizzo, c.citta].filter(Boolean).join(", ")) + dd("Forma", c.forma) + dd("Modelli e sistemi", c.sistemi) +
        dd("Obiettivi", c.obiettivi) + dd("Accessibilità", c.accessibilita) + dd("Note", c.note) + dd("Cliente dal", TD.dataIt(c.creato)) +
      "</dl></section>";
  }
  function azione(h, ic, t, d) { return '<a class="action" href="' + h + '">' + I(ic) + "<span><strong>" + E(t) + "</strong><small>" + E(d) + "</small></span>" + I("arrow") + "</a>"; }
  function dd(k, v) { return v ? "<dt>" + E(k) + "</dt><dd>" + E(v) + "</dd>" : ""; }

  /* registro */
  function registro(body, c, q) {
    c.registro = c.registro || [];
    const lista = c.registro.slice().sort(function (a, b) { return (b.data + (b.ora || "")).localeCompare(a.data + (a.ora || "")); });
    const mod = q.r ? c.registro.find(function (r) { return r.id === q.r; }) : null;
    const r = mod || { id: TD.uid("r"), data: TD.oggi(), ora: "10:00", durata: 60, luogo: c.luogo, argomenti: [], note: "", importo: "", pagato: false, stato: "svolta", presenti: (c.partecipanti || []).map(function (x) { return x.id; }) };
    const totDovuto = c.registro.reduce(function (s, x) { return s + (Number(x.importo) || 0); }, 0);
    const totPagato = c.registro.filter(function (x) { return x.pagato; }).reduce(function (s, x) { return s + (Number(x.importo) || 0); }, 0);
    body.innerHTML =
      '<div class="grid-2 reg">' +
      '<form class="card form" id="fr"><h2>' + (mod ? "Modifica incontro" : "Nuovo incontro") + "</h2>" +
        '<div class="grid-3">' + campo("data", "Data", r.data, "date") + campo("ora", "Ora", r.ora, "time") + campo("durata", "Durata (minuti)", r.durata, "number") + "</div>" +
        '<div class="grid-2"><label class="field"><span>Stato</span><select name="stato"><option value="svolta"' + (r.stato !== "pianificata" ? " selected" : "") + '>Svolta</option><option value="pianificata"' + (r.stato === "pianificata" ? " selected" : "") + ">Pianificata</option></select></label>" +
          '<label class="field"><span>Luogo</span><select name="luogo">' + TD.LUOGHI.map(function (l) { return "<option" + (r.luogo === l ? " selected" : "") + ">" + E(l) + "</option>"; }).join("") + "</select></label></div>" +
        '<label class="field"><span>Argomenti (lezioni del programma)</span><select name="argomenti" multiple size="7">' +
          TD.PERCORSI.map(function (pc) { return '<optgroup label="' + E(pc.nome) + '">' + TD.lezioniDi(pc.id).map(function (l) { return '<option value="' + l.id + '"' + (r.argomenti.indexOf(l.id) >= 0 ? " selected" : "") + ">" + E(TD.livello(l.liv).breve + " · " + l.titolo) + "</option>"; }).join("") + "</optgroup>"; }).join("") +
        '</select><small class="muted">Tieni premuto Ctrl (o Cmd) per sceglierne più di una.</small></label>' +
        ((c.partecipanti || []).length ? '<fieldset class="field"><legend>Presenti</legend><div class="checkrow">' + c.partecipanti.map(function (x) { return '<label class="check"><input type="checkbox" name="presenti" data-multi="1" value="' + x.id + '"' + (r.presenti && r.presenti.indexOf(x.id) >= 0 ? " checked" : "") + "> " + E(x.nome) + "</label>"; }).join("") + "</div></fieldset>" : "") +
        '<label class="field"><span>Note della lezione</span><textarea name="note" rows="3">' + E(r.note) + "</textarea></label>" +
        '<div class="grid-2">' + campo("importo", "Importo (€)", r.importo, "number") + '<label class="check"><input type="checkbox" name="pagato"' + (r.pagato ? " checked" : "") + "> Pagato</label></div>" +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + I("check") + "Salva incontro</button>" + (mod ? '<a class="btn" href="#/cliente/' + c.id + '?tab=registro">Annulla</a><button class="btn btn-danger" type="button" id="delR">' + I("trash") + "Elimina</button>" : "") + "</div>" +
      "</form>" +
      '<section class="card"><h2>Storico</h2><p class="muted">Incassato ' + TD.euro(totPagato) + " su " + TD.euro(totDovuto) + " · " + TD.oreCliente(c).toLocaleString("it-IT", { maximumFractionDigits: 1 }) + ' ore svolte</p><div class="actions"><button class="btn btn-sm" id="pdfReg">' + I("download") + "Registro PDF</button></div>" +
        (lista.length ? '<ul class="reg-list">' + lista.map(function (x) {
          return '<li class="' + (x.stato === "pianificata" ? "plan" : "") + '"><a href="#/cliente/' + c.id + "?tab=registro&r=" + x.id + '"><span class="when"><strong>' + E(TD.dataIt(x.data)) + "</strong>" + E(x.ora || "") + " · " + E(x.durata) + "′</span><span>" +
            (x.stato === "pianificata" ? '<em class="pill">pianificata</em> ' : "") + E((x.argomenti || []).map(function (id) { const l = TD.lezione(id); return l ? l.titolo : id; }).join(" · ") || x.note || "—") +
            (x.importo ? '<small>' + TD.euro(x.importo) + (x.pagato ? " · pagato" : " · da incassare") + "</small>" : "") + "</span></a></li>";
        }).join("") + "</ul>" : '<p class="muted">Nessun incontro registrato.</p>') +
      "</section></div>";

    const f = document.getElementById("fr");
    f.onsubmit = function (e) {
      e.preventDefault();
      const o = TD.form(f);
      r.data = o.data; r.ora = o.ora; r.durata = Number(o.durata) || 60; r.stato = o.stato; r.luogo = o.luogo; r.note = o.note; r.importo = o.importo; r.pagato = !!o.pagato;
      r.argomenti = Array.from(f.querySelector('[name="argomenti"]').selectedOptions).map(function (x) { return x.value; });
      if (o.presenti) r.presenti = o.presenti;
      if (r.stato === "svolta") { c.completate = c.completate || []; r.argomenti.forEach(function (id) { if (c.completate.indexOf(id) < 0) c.completate.push(id); }); }
      if (!mod) c.registro.push(r);
      TD.salva(); TD.toast("Incontro salvato."); TD.vai("#/cliente/" + c.id + "?tab=registro");
    };
    const del = document.getElementById("delR");
    if (del) del.onclick = function () { if (!TD.conferma("Eliminare questo incontro?")) return; c.registro = c.registro.filter(function (x) { return x.id !== r.id; }); TD.salva(); TD.vai("#/cliente/" + c.id + "?tab=registro"); };
    document.getElementById("pdfReg").onclick = function () {
      TD.immagine(TD.db.profilo.firma).then(function (firmaDoc) { pdfRegistro(firmaDoc); });
    };
    function pdfRegistro(firmaDoc) {
      const d = new TD.Documento({ titolo: "Registro lezioni · " + TD.nomeCliente(c), piede: "Tutor Digitale · registro lezioni" });
      d.intestazione(TD.db.profilo, "Registro delle lezioni");
      d.h1("Registro lezioni");
      d.campi([["Cliente", TD.nomeCliente(c)], ["Ore svolte", TD.oreCliente(c).toLocaleString("it-IT", { maximumFractionDigits: 1 })]]);
      d.tabella(["Data", "Durata", "Argomenti e note", "Importo"], lista.filter(function (x) { return x.stato !== "pianificata"; }).map(function (x) {
        return [TD.dataIt(x.data) + " " + (x.ora || ""), x.durata + " min", ((x.argomenti || []).map(function (id) { const l = TD.lezione(id); return l ? l.titolo : id; }).join("; ") + (x.note ? " — " + x.note : "")) || "—", x.importo ? TD.euro(x.importo) + (x.pagato ? " ✓" : "") : ""];
      }), [0.18, 0.12, 0.52, 0.18], { destra: [3] });
      d.firme([{ etichetta: "Firma del docente", immagine: firmaDoc, nome: TD.db.profilo.nome }, { etichetta: "Firma del cliente", nome: c.tipo === "ente" ? c.referente : TD.nomeCliente(c) }]);
      TD.scaricaPdf(d.chiudi(), "registro-" + TD.nomeFile(TD.nomeCliente(c)) + ".pdf", { titolo: "Registro lezioni" });
    }
  }

  /* percorso */
  function percorso(body, c) {
    c.completate = c.completate || [];
    body.innerHTML = '<p class="muted">Spunta le lezioni svolte. Queste compaiono come competenze nell\'attestato.</p>' +
      TD.PERCORSI.map(function (pc) {
        return '<section class="card"><h2 class="with-ico">' + I(pc.icona) + E(pc.nome) + ' <span class="muted text-small">livello attuale: ' + E(TD.livello((c.livelli || {})[pc.id] || 0).nome) + "</span></h2>" +
          TD.LIVELLI.map(function (lv) {
            return '<div class="path-row"><span class="path-liv">' + TD.badgeLiv(lv.id) + "</span><div>" + TD.lezioniDi(pc.id, lv.id).map(function (l) {
              return '<label class="check"><input type="checkbox" data-lez="' + l.id + '"' + (c.completate.indexOf(l.id) >= 0 ? " checked" : "") + '> <a href="#/lezione/' + l.id + '">' + E(l.titolo) + "</a></label>";
            }).join("") + "</div></div>";
          }).join("") + "</section>";
      }).join("");
    body.querySelectorAll("[data-lez]").forEach(function (cb) {
      cb.onchange = function () {
        const id = cb.dataset.lez;
        c.completate = c.completate.filter(function (x) { return x !== id; });
        if (cb.checked) {
          c.completate.push(id);
          const l = TD.lezione(id);
          if (l && ((c.livelli || {})[l.dev] || 0) < l.liv) { c.livelli[l.dev] = l.liv; }
        }
        TD.salva();
      };
    });
  }

  /* compiti */
  function compiti(body, c) {
    c.compiti = c.compiti || [];
    body.innerHTML = '<div class="grid-2"><form class="card form" id="fk"><h2>Nuovo compito</h2>' +
      '<label class="field"><span>Compito</span><textarea name="testo" rows="3" required placeholder="Es. Invia una foto su WhatsApp a tua figlia"></textarea></label>' +
      '<div class="grid-2">' + campo("scadenza", "Entro il", "", "date") + '<label class="field"><span>Da una lezione</span><select name="lezione"><option value="">—</option>' + TD.LEZIONI.map(function (l) { return '<option value="' + l.id + '">' + E(TD.percorso(l.dev).nome + " · " + l.titolo) + "</option>"; }).join("") + "</select></label></div>" +
      '<div class="actions"><button class="btn btn-primary" type="submit">' + I("plus") + "Assegna</button></div></form>" +
      '<section class="card"><h2>Compiti assegnati</h2><div class="actions"><button class="btn btn-sm" id="pdfK">' + I("print") + "Scheda compiti PDF</button></div>" +
      (c.compiti.length ? '<ul class="task-list">' + c.compiti.slice().reverse().map(function (k) {
        return '<li class="' + (k.fatto ? "done" : "") + '"><label class="check"><input type="checkbox" data-k="' + k.id + '"' + (k.fatto ? " checked" : "") + "> <span>" + E(k.testo) + "<small>Assegnato " + E(TD.dataIt(k.assegnato)) + (k.scadenza ? " · entro " + E(TD.dataIt(k.scadenza)) : "") + (k.notaAllievo ? " · allievo: " + E(k.notaAllievo) : "") + (k.notaTutor ? " · tua nota: " + E(k.notaTutor) : "") + "</small></span></label>" +
          '<select data-esito="' + k.id + '" aria-label="Esito"><option value="">esito…</option>' + ["Approvato", "Fatto da solo", "Fatto con aiuto", "Da rifare", "Da rivedere"].map(function (e) { return "<option" + (k.esito === e ? " selected" : "") + ">" + e + "</option>"; }).join("") + "</select>" +
          '<button class="icon-btn" data-delk="' + k.id + '" aria-label="Elimina compito">' + I("trash") + "</button></li>";
      }).join("") + "</ul>" : '<p class="muted">Nessun compito.</p>') + "</section></div>";
    const f = document.getElementById("fk");
    f.onsubmit = function (e) {
      e.preventDefault(); const o = TD.form(f);
      let testo = o.testo; if (!testo && o.lezione) testo = TD.lezione(o.lezione).compito;
      TD.assegnaCompito(c, testo, o.lezione, o.scadenza); TD.render();
    };
    f.querySelector('[name="lezione"]').onchange = function () { const l = TD.lezione(this.value); if (l && !f.testo.value) f.testo.value = l.compito; };
    body.querySelectorAll("[data-k]").forEach(function (cb) { cb.onchange = function () { const k = c.compiti.find(function (x) { return x.id === cb.dataset.k; }); k.fatto = cb.checked; TD.salva(); cb.closest("li").classList.toggle("done", cb.checked); }; });
    body.querySelectorAll("[data-esito]").forEach(function (s) { s.onchange = function () { const k = c.compiti.find(function (x) { return x.id === s.dataset.esito; }); k.esito = s.value; if (s.value) k.fatto = s.value !== "Da rivedere" && s.value !== "Da rifare"; TD.salva(); TD.render(); }; });
    body.querySelectorAll("[data-delk]").forEach(function (b) { b.onclick = function () { c.compiti = c.compiti.filter(function (x) { return x.id !== b.dataset.delk; }); TD.salva(); TD.render(); }; });
    document.getElementById("pdfK").onclick = function () {
      const d = new TD.Documento({ titolo: "Compiti · " + TD.nomeCliente(c), piede: "Tutor Digitale · scheda compiti" });
      d.intestazione(TD.db.profilo, "Scheda compiti");
      d.h1("I miei compiti");
      d.campi([["Nome", TD.nomeCliente(c)], ["Data", TD.dataIt(TD.oggi())]]);
      const aperti = c.compiti.filter(function (k) { return !k.fatto; });
      (aperti.length ? aperti : c.compiti).forEach(function (k) { d.casella(k.testo + (k.scadenza ? "  (entro il " + TD.dataIt(k.scadenza) + ")" : ""), k.fatto); });
      d.h2("Domande da fare alla prossima lezione"); for (let i = 0; i < 6; i++) d.linea();
      TD.scaricaPdf(d.chiudi(), "compiti-" + TD.nomeFile(TD.nomeCliente(c)) + ".pdf", { titolo: "Scheda compiti" });
    };
  }

  /* quiz */
  function quiz(body, c) {
    const l = (c.quiz || []).slice().reverse();
    body.innerHTML = '<section class="card"><h2>Risultati dei quiz</h2><div class="actions"><a class="btn btn-primary" href="#/quiz" id="fq">' + I("play") + "Nuovo quiz per questo cliente</a></div>" +
      (l.length ? '<table class="table"><thead><tr><th>Data</th><th>Livello</th><th>Percorso</th><th>Risultato</th></tr></thead><tbody>' + l.map(function (x) {
        return "<tr><td>" + E(TD.dataIt(x.data)) + "</td><td>" + (x.liv !== "" && x.liv != null ? TD.badgeLiv(Number(x.liv)) : "Tutti") + "</td><td>" + E(x.dev && x.dev !== "tutti" ? TD.percorso(x.dev).nome : "Tutti") + "</td><td><strong>" + x.perc + "%</strong> (" + x.giuste + "/" + x.totale + ")</td></tr>";
      }).join("") + "</tbody></table>" : '<p class="muted">Nessun quiz ancora.</p>') + "</section>";
    document.getElementById("fq").onclick = function () { TD.impostaClienteAttivo(c.id); };
  }

  /* documenti del cliente */
  function documenti(body, c) {
    const docs = TD.db.documenti.filter(function (d) { return d.cliente === c.id; });
    const att = TD.db.attestati.filter(function (a) { return a.cliente === c.id; });
    body.innerHTML = '<div class="grid-2">' +
      '<section class="card"><h2>Liberatoria</h2><p>' + TD.statoLiberatoria(c) + '</p><div class="actions"><a class="btn btn-primary" href="#/liberatoria/' + c.id + '">' + I("doc") + "Apri liberatoria</a></div></section>" +
      '<section class="card"><h2>Attestati</h2>' + (att.length ? '<ul class="list">' + att.map(function (a) { return "<li><span><strong>" + E(a.codice) + "</strong> · " + E(TD.dataIt(a.data)) + " · " + E(a.intestatario) + "</span></li>"; }).join("") + "</ul>" : '<p class="muted">Nessun attestato.</p>') + '<div class="actions"><a class="btn" href="#/attestato/' + c.id + '">' + I("award") + "Nuovo attestato</a></div></section>" +
      '<section class="card"><h2>Preventivi e ricevute</h2>' + (docs.length ? '<ul class="list">' + docs.map(function (d) { return '<li><a href="#/preventivo?doc=' + d.id + '"><span><strong>' + E(d.tipo === "ricevuta" ? "Ricevuta" : "Preventivo") + " " + E(d.numero) + "</strong> · " + E(TD.dataIt(d.data)) + " · " + TD.euro(d.totale) + "</span>" + I("arrow") + "</a></li>"; }).join("") + "</ul>" : '<p class="muted">Nessun documento.</p>') + '<div class="actions"><a class="btn" href="#/preventivo?cliente=' + c.id + '">' + I("euro") + "Nuovo documento</a></div></section>" +
    "</div>";
  }
})();
