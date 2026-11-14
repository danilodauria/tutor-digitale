/* ==========================================================================
   Tutor Digitale · editor delle lezioni e delle domande (miglioria 8)
   Lezioni, domande e immagini proprie, con esportazione e importazione per
   portarle su un altro dispositivo o regalarle a un collega. Le immagini si
   annotano con frecce, cerchi, riquadri, numeri e scritte.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const FORMATO = "tutor-digitale-contenuti";

  function personali() { TD.db.personali = TD.db.personali || { lezioni: [], domande: [] }; TD.db.personali.lezioni = TD.db.personali.lezioni || []; TD.db.personali.domande = TD.db.personali.domande || []; return TD.db.personali; }

  /* le lezioni proprie viaggiano nel kit quando servono all'allievo */
  TD.lezioniPersonaliPer = function (c, k) {
    const ids = {};
    (k.compiti || []).forEach(function (x) { if (x.lezione) ids[x.lezione] = 1; });
    if (c.percorsoMisura) TD.lezioniPercorso(c.percorsoMisura).forEach(function (id) { ids[id] = 1; });
    return personali().lezioni.filter(function (l) { return ids[l.id]; });
  };

  /* ------------------------------------------------------------ immagini */
  TD.leggiImmagine = function (file, lato) {
    lato = lato || 1400;
    return new Promise(function (ok, ko) {
      const r = new FileReader();
      r.onload = function () {
        const im = new Image();
        im.onload = function () {
          const k = Math.min(1, lato / Math.max(im.width, im.height));
          const cv = document.createElement("canvas"); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
          cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
          ok(cv.toDataURL("image/jpeg", 0.85));
        };
        im.onerror = function () { ko(new Error("Immagine non leggibile")); };
        im.src = r.result;
      };
      r.onerror = function () { ko(new Error("File non leggibile")); };
      r.readAsDataURL(file);
    });
  };

  /* annotatore: freccia, cerchio, riquadro, numero, scritta, con annulla */
  TD.annotaImmagine = function (src) {
    return new Promise(function (risolvi) {
      const box = document.createElement("div");
      box.className = "modal";
      const COLORI = ["#e4572e", "#2f7fc0", "#3f9a63", "#111827", "#ffffff"];
      box.innerHTML = '<div class="modal-box annota" role="dialog" aria-modal="true" aria-label="Annota la schermata"><h2>Annota la schermata</h2>' +
        '<div class="annota-barra" role="toolbar" aria-label="Strumenti">' +
          [["freccia", "Freccia"], ["cerchio", "Cerchio"], ["riquadro", "Riquadro"], ["numero", "Numero"], ["scritta", "Scritta"]].map(function (s, i) { return '<button type="button" class="btn btn-sm' + (i === 0 ? " btn-primary" : "") + '" data-str="' + s[0] + '" aria-pressed="' + (i === 0) + '">' + s[1] + "</button>"; }).join("") +
          '<span class="annota-colori">' + COLORI.map(function (c, i) { return '<button type="button" class="annota-col' + (i === 0 ? " on" : "") + '" data-col="' + c + '" style="background:' + c + '" aria-label="Colore ' + (i + 1) + '"></button>'; }).join("") + "</span>" +
          '<button type="button" class="btn btn-sm btn-ghost" data-a="annulla">Annulla ultimo</button></div>' +
        '<div class="annota-tela"><canvas></canvas></div><p class="muted text-small">Trascina per frecce, cerchi e riquadri; tocca una volta per numeri e scritte.</p>' +
        '<div class="actions"><button type="button" class="btn btn-primary" data-a="ok">' + I("check") + 'Usa questa immagine</button><button type="button" class="btn btn-ghost" data-a="chiudi">Annulla</button></div></div>';
      document.body.appendChild(box);
      const cv = box.querySelector("canvas"), x = cv.getContext("2d");
      const segni = []; let strumento = "freccia", colore = COLORI[0], inizio = null, anteprima = null, numero = 1;
      const im = new Image();
      im.onload = function () { cv.width = im.width; cv.height = im.height; disegna(); };
      im.src = src;
      const sp = function () { return Math.max(3, Math.round(cv.width / 220)); };
      function freccia(a, b, col) {
        const ang = Math.atan2(b.y - a.y, b.x - a.x), L = sp() * 5;
        x.strokeStyle = col; x.fillStyle = col; x.lineWidth = sp(); x.lineCap = "round";
        x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x - Math.cos(ang) * L * 0.6, b.y - Math.sin(ang) * L * 0.6); x.stroke();
        x.beginPath(); x.moveTo(b.x, b.y); x.lineTo(b.x - L * Math.cos(ang - 0.45), b.y - L * Math.sin(ang - 0.45)); x.lineTo(b.x - L * Math.cos(ang + 0.45), b.y - L * Math.sin(ang + 0.45)); x.closePath(); x.fill();
      }
      function segno(s) {
        x.strokeStyle = s.col; x.fillStyle = s.col; x.lineWidth = sp();
        if (s.t === "freccia") freccia(s.a, s.b, s.col);
        else if (s.t === "cerchio") { x.beginPath(); x.ellipse((s.a.x + s.b.x) / 2, (s.a.y + s.b.y) / 2, Math.abs(s.b.x - s.a.x) / 2 + 1, Math.abs(s.b.y - s.a.y) / 2 + 1, 0, 0, 7); x.stroke(); }
        else if (s.t === "riquadro") { x.strokeRect(Math.min(s.a.x, s.b.x), Math.min(s.a.y, s.b.y), Math.abs(s.b.x - s.a.x), Math.abs(s.b.y - s.a.y)); }
        else if (s.t === "numero") {
          const rr = sp() * 4.5; x.beginPath(); x.arc(s.a.x, s.a.y, rr, 0, 7); x.fill();
          x.lineWidth = sp() / 1.5; x.strokeStyle = s.col === "#ffffff" ? "#111827" : "#ffffff"; x.stroke();
          x.fillStyle = s.col === "#ffffff" ? "#111827" : "#ffffff"; x.font = "700 " + Math.round(rr * 1.2) + "px system-ui,Arial,sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(s.n), s.a.x, s.a.y + 1);
          x.textAlign = "left"; x.textBaseline = "alphabetic";
        } else if (s.t === "scritta") {
          const fs = sp() * 6; x.font = "700 " + fs + "px system-ui,Arial,sans-serif";
          const w = x.measureText(s.testo).width;
          x.fillStyle = s.col === "#ffffff" ? "rgba(17,24,39,.8)" : "rgba(255,255,255,.88)"; x.fillRect(s.a.x - fs * 0.3, s.a.y - fs, w + fs * 0.6, fs * 1.35);
          x.fillStyle = s.col; x.fillText(s.testo, s.a.x, s.a.y);
        }
      }
      function disegna() { x.drawImage(im, 0, 0); segni.forEach(segno); if (anteprima) segno(anteprima); }
      function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
      cv.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        const p = pos(e);
        if (strumento === "numero") { segni.push({ t: "numero", a: p, n: numero++, col: colore }); disegna(); return; }
        if (strumento === "scritta") { const testo = window.prompt("Scritta da aggiungere", "Tocca qui"); if (testo) { segni.push({ t: "scritta", a: p, testo: testo.slice(0, 60), col: colore }); disegna(); } return; }
        inizio = p; cv.setPointerCapture(e.pointerId);
      });
      cv.addEventListener("pointermove", function (e) { if (!inizio) return; anteprima = { t: strumento, a: inizio, b: pos(e), col: colore }; disegna(); });
      cv.addEventListener("pointerup", function (e) {
        if (!inizio) return;
        const b = pos(e);
        if (Math.hypot(b.x - inizio.x, b.y - inizio.y) > 6) segni.push({ t: strumento, a: inizio, b: b, col: colore });
        inizio = null; anteprima = null; disegna();
      });
      function chiudi(v) { box.remove(); risolvi(v); }
      box.addEventListener("click", function (e) {
        const s = e.target.closest("[data-str]"), c = e.target.closest("[data-col]"), a = e.target.closest("[data-a]");
        if (s) { strumento = s.dataset.str; box.querySelectorAll("[data-str]").forEach(function (b) { b.classList.toggle("btn-primary", b === s); b.setAttribute("aria-pressed", b === s); }); }
        if (c) { colore = c.dataset.col; box.querySelectorAll("[data-col]").forEach(function (b) { b.classList.toggle("on", b === c); }); }
        if (a && a.dataset.a === "annulla") { const t = segni.pop(); if (t && t.t === "numero") numero--; disegna(); }
        if (a && a.dataset.a === "ok") chiudi(cv.toDataURL("image/jpeg", 0.88));
        if (a && a.dataset.a === "chiudi") chiudi(null);
      });
    });
  };

  /* ------------------------------------------------------------ editor */
  function righe(t) { return String(t || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean); }
  TD.validaLezione = function (l) {
    const err = [];
    if (!l.titolo) err.push("il titolo");
    if ((l.obiettivi || []).length < 1) err.push("almeno un obiettivo");
    if ((l.passi || []).length < 2) err.push("almeno due passi");
    if (!l.compito) err.push("il compito a casa");
    return err;
  };
  TD.validaDomanda = function (q) {
    const err = [];
    if (!q[2]) err.push("la domanda");
    if (!q[3]) err.push("la risposta giusta");
    if (!Array.isArray(q[4]) || q[4].filter(Boolean).length !== 3) err.push("tre risposte sbagliate");
    else if (q[4].indexOf(q[3]) >= 0) err.push("risposte sbagliate diverse da quella giusta");
    else if (new Set(q[4]).size !== 3) err.push("tre risposte sbagliate diverse tra loro");
    return err;
  };
  TD.esportaContenuti = function () { const p = personali(); return { formato: FORMATO, versione: 1, autore: TD.db.profilo.nome || "", creato: new Date().toISOString(), lezioni: p.lezioni, domande: p.domande }; };
  TD.importaContenuti = function (obj) {
    if (!obj || obj.formato !== FORMATO) throw new Error("Non è un file di contenuti di Tutor Digitale.");
    const p = personali(); let nl = 0, nd = 0;
    (obj.lezioni || []).forEach(function (l0) {
      if (!l0 || typeof l0 !== "object") return;
      const l = TD.lezioneSicura(Object.assign({}, l0, { id: /^my-/.test(String(l0.id)) ? l0.id : "my-" + String(l0.id || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 50) }));
      if (!l || TD.validaLezione(l).length) return;
      p.lezioni = p.lezioni.filter(function (x) { return x.id !== l.id; }).concat([l]); nl++;
    });
    (obj.domande || []).map(TD.domandaSicura).forEach(function (q) { if (!q || TD.validaDomanda(q).length) return; if (p.domande.some(function (x) { return x[2] === q[2]; }) || TD.DOMANDE.some(function (x) { return x[2] === q[2]; })) return; p.domande.push(q); nd++; });
    TD.salva(); TD.applicaPersonali();
    return { lezioni: nl, domande: nd };
  };

  TD.rotta("/editor", function (app, par, q) {
    const p = personali();
    const tab = q.tab || "lezioni";
    const lez = q.l ? p.lezioni.find(function (x) { return x.id === q.l; }) : null;
    const l = lez ? JSON.parse(JSON.stringify(lez)) : (q.l === "nuova" && TD.__bozza && !p.lezioni.some(function (x) { return x.id === TD.__bozza.id; })) ? TD.__bozza : (q.l === "nuova" ? { id: "my-" + TD.uid(""), dev: "pc", liv: 0, n: 9, titolo: "", durata: 60, obiettivi: [], spiegazione: [], passi: [], esercizi: { facile: "", medio: "", esperto: "" }, compito: "", digcomp: [1], immagini: [], personale: true } : null);
    let corpo = "";
    if (tab === "lezioni" && !l) {
      corpo = '<div class="actions"><a class="btn btn-primary" href="#/editor?l=nuova">' + I("plus") + "Nuova lezione</a></div>" +
        (p.lezioni.length ? '<ul class="list">' + p.lezioni.map(function (x) { return '<li><a href="#/editor?l=' + x.id + '"><span><strong>' + E(x.titolo) + "</strong><small>" + E(TD.percorso(x.dev).nome) + " · " + E(TD.livello(x.liv).nome) + " · " + (x.immagini || []).length + " immagini</small></span>" + I("arrow") + "</a></li>"; }).join("") + "</ul>" : '<p class="muted">Ancora nessuna lezione tua. Le lezioni nuove compaiono nei percorsi accanto alle 40 del programma, con il segno «tua».</p>');
    } else if (tab === "lezioni") {
      corpo = '<form class="card form" id="fl"><div class="grid-3"><label class="field"><span>Percorso</span><select name="dev">' + TD.PERCORSI.map(function (x) { return '<option value="' + x.id + '"' + (x.id === l.dev ? " selected" : "") + ">" + E(x.nome) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Livello</span><select name="liv">' + TD.LIVELLI.map(function (x) { return '<option value="' + x.id + '"' + (x.id === l.liv ? " selected" : "") + ">" + E(x.nome) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Minuti</span><input type="number" name="durata" step="15" value="' + (l.durata || 60) + '"></label></div>' +
        '<label class="field"><span>Titolo</span><input name="titolo" required value="' + E(l.titolo) + '" placeholder="Es. Prenotare una visita con il Fascicolo sanitario"></label>' +
        '<label class="field"><span>Obiettivi (uno per riga)</span><textarea name="obiettivi" rows="3">' + E(l.obiettivi.join("\n")) + "</textarea></label>" +
        '<label class="field"><span>Spiegazione (un paragrafo per riga)</span><textarea name="spiegazione" rows="4">' + E(l.spiegazione.join("\n")) + "</textarea></label>" +
        '<label class="field"><span>Passo per passo (un passo per riga)</span><textarea name="passi" rows="5">' + E(l.passi.join("\n")) + "</textarea></label>" +
        '<div class="grid-3">' + ["facile", "medio", "esperto"].map(function (k) { return '<label class="field"><span>Esercizio ' + k + '</span><textarea name="es_' + k + '" rows="2">' + E(l.esercizi[k] || "") + "</textarea></label>"; }).join("") + "</div>" +
        '<label class="field"><span>Compito a casa</span><textarea name="compito" rows="2">' + E(l.compito) + "</textarea></label>" +
        '<fieldset class="field"><legend>Aree DigComp</legend><div class="checkrow">' + Object.keys(TD.DIGCOMP).map(function (a) { return '<label class="check"><input type="checkbox" name="digcomp" data-multi="1" value="' + a + '"' + (l.digcomp.indexOf(Number(a)) >= 0 ? " checked" : "") + "> " + a + " · " + E(TD.DIGCOMP[a]) + "</label>"; }).join("") + "</div></fieldset>" +
        '<fieldset class="field"><legend>Immagini e schermate</legend><div class="ed-immagini">' + l.immagini.map(function (im, i) {
          return '<figure><img src="' + E(im.src) + '" alt=""><input data-did="' + i + '" value="' + E(im.didascalia || "") + '" placeholder="Didascalia" aria-label="Didascalia immagine ' + (i + 1) + '"><span class="actions"><button type="button" class="btn btn-sm" data-ann="' + i + '">' + I("pen") + 'Annota</button><button type="button" class="btn btn-sm btn-ghost" data-tog="' + i + '">' + I("trash") + "</button></span></figure>";
        }).join("") + '</div><div class="actions"><label class="btn btn-sm">' + I("upload") + 'Aggiungi immagine<input type="file" id="edImg" accept="image/*" hidden></label>' + ((TD.db.schermate || []).length ? '<select id="edSch" aria-label="Aggiungi una schermata annotata"><option value="">+ dalle tue schermate…</option>' + TD.db.schermate.map(function (s) { return '<option value="' + s.id + '">' + E(s.titolo) + "</option>"; }).join("") + "</select>" : "") + "</div></fieldset>" +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + I("check") + 'Salva la lezione</button><a class="btn" href="#/editor">Torna all\'elenco</a>' + (lez ? '<a class="btn" href="#/lezione/' + l.id + '">' + I("eye") + 'Apri</a><button type="button" class="btn btn-danger" id="edDel">' + I("trash") + "Elimina</button>" : "") + "</div></form>";
    } else if (tab === "domande") {
      corpo = '<form class="card form" id="fd"><h2>Nuova domanda</h2><div class="grid-2"><label class="field"><span>Percorso</span><select name="dev">' + TD.PERCORSI.map(function (x) { return '<option value="' + x.id + '">' + E(x.nome) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>Livello</span><select name="liv">' + TD.LIVELLI.map(function (x) { return '<option value="' + x.id + '">' + E(x.nome) + "</option>"; }).join("") + "</select></label></div>" +
        '<label class="field"><span>Domanda</span><input name="testo" required></label><label class="field"><span>Risposta giusta</span><input name="giusta" required></label>' +
        '<div class="grid-3"><label class="field"><span>Sbagliata 1</span><input name="s1" required></label><label class="field"><span>Sbagliata 2</span><input name="s2" required></label><label class="field"><span>Sbagliata 3</span><input name="s3" required></label></div>' +
        '<label class="field"><span>Spiegazione (si legge dopo la risposta)</span><input name="spieg"></label><div class="actions"><button class="btn btn-primary" type="submit">' + I("plus") + "Aggiungi</button></div></form>" +
        '<section class="card"><h2>Le tue domande (' + p.domande.length + ')</h2>' + (p.domande.length ? '<ul class="list">' + p.domande.map(function (d, i) { return "<li><span><strong>" + E(d[2]) + "</strong><small>" + E(TD.percorso(d[1]).nome) + " · " + E(TD.livello(d[0]).nome) + " · giusta: " + E(d[3]) + '</small></span><button class="icon-btn" data-dd="' + i + '" aria-label="Elimina la domanda">' + I("trash") + "</button></li>"; }).join("") + "</ul>" : '<p class="muted">Le tue domande entrano nei quiz, nelle verifiche e nella modalità aula insieme alle altre ' + TD.DOMANDE.length + ".</p>") + "</section>";
    } else {
      corpo = '<section class="card"><h2>' + I("download") + 'Esporta e importa</h2><p>Il file <code>.json</code> contiene le tue lezioni (con le immagini) e le tue domande: serve per portarle su un altro dispositivo o per darle a un collega che usa Tutor Digitale.</p>' +
        '<div class="actions"><button class="btn btn-primary" id="edExp">' + I("download") + 'Esporta i contenuti</button><label class="btn">' + I("upload") + 'Importa contenuti<input type="file" id="edImp" accept=".json,application/json" hidden></label></div>' +
        '<p class="muted text-small">I contenuti scritti da te restano tuoi; quelli del programma sono sotto licenza CC BY-NC-SA 4.0.</p></section>';
    }
    app.innerHTML = TD.intest("Editor delle lezioni e delle domande", "Aggiungi lezioni, domande e schermate tue: compaiono nel programma insieme a quelle esistenti e si possono assegnare nei percorsi e nei kit.",
      '<nav class="chips">' + [["lezioni", "Lezioni (" + p.lezioni.length + ")"], ["domande", "Domande (" + p.domande.length + ")"], ["file", "Esporta e importa"]].map(function (t) { return '<a class="chip' + (t[0] === tab ? " on" : "") + '" href="#/editor?tab=' + t[0] + '">' + t[1] + "</a>"; }).join("") + "</nav>") +
      '<div class="wrap">' + corpo + "</div>";

    const fl = document.getElementById("fl");
    if (fl) {
      const leggiF = function () {
        const o = TD.form(fl);
        Object.assign(l, { dev: o.dev, liv: Number(o.liv), durata: Number(o.durata) || 60, titolo: o.titolo, obiettivi: righe(o.obiettivi), spiegazione: righe(o.spiegazione), passi: righe(o.passi),
          esercizi: { facile: o.es_facile, medio: o.es_medio, esperto: o.es_esperto }, compito: o.compito, digcomp: (o.digcomp || []).map(Number) });
        fl.querySelectorAll("[data-did]").forEach(function (x) { l.immagini[+x.dataset.did].didascalia = x.value.trim(); });
      };
      if (TD.__bozza && TD.__bozza.id === l.id) Object.assign(l, TD.__bozza);
      fl.onsubmit = function (e) {
        e.preventDefault(); leggiF();
        const err = TD.validaLezione(l);
        if (err.length) { TD.toast("Manca " + err.join(", ") + "."); return; }
        if (!l.digcomp.length) l.digcomp = [1];
        const pr = personali();
        pr.lezioni = pr.lezioni.filter(function (x) { return x.id !== l.id; }).concat([l]);
        TD.__bozza = null; TD.salva(); TD.applicaPersonali(); TD.toast("Lezione salvata: la trovi nel percorso " + TD.percorso(l.dev).nome + ".");
        TD.vai("#/editor?l=" + l.id);
      };
      const aggiungi = function (src) { leggiF(); l.immagini.push({ src: src, didascalia: "" }); TD.__bozza = l; TD.render(); };
      document.getElementById("edImg").onchange = function () { const f = this.files[0]; if (!f) return; TD.leggiImmagine(f).then(TD.annotaImmagine).then(function (src) { if (src) aggiungi(src); }).catch(function (e) { TD.toast(e.message); }); };
      const sch = document.getElementById("edSch"); if (sch) sch.onchange = function () { const s = (TD.db.schermate || []).find(function (x) { return x.id === sch.value; }); if (s) { leggiF(); l.immagini.push({ src: s.src, didascalia: s.titolo }); TD.__bozza = l; TD.render(); } };
      fl.querySelectorAll("[data-ann]").forEach(function (b) { b.onclick = function () { leggiF(); const i = +b.dataset.ann; TD.annotaImmagine(l.immagini[i].src).then(function (src) { if (src) { l.immagini[i].src = src; TD.__bozza = l; TD.render(); } }); }; });
      fl.querySelectorAll("[data-tog]").forEach(function (b) { b.onclick = function () { leggiF(); l.immagini.splice(+b.dataset.tog, 1); TD.__bozza = l; TD.render(); }; });
      const del = document.getElementById("edDel");
      if (del) del.onclick = function () { if (!TD.conferma("Eliminare la lezione «" + l.titolo + "»?")) return; const pr = personali(); pr.lezioni = pr.lezioni.filter(function (x) { return x.id !== l.id; }); TD.__bozza = null; TD.salva(); TD.applicaPersonali(); TD.vai("#/editor"); };
    }
    const fd = document.getElementById("fd");
    if (fd) {
      fd.onsubmit = function (e) {
        e.preventDefault(); const o = TD.form(fd);
        const dom = [Number(o.liv), o.dev, o.testo, o.giusta, [o.s1, o.s2, o.s3], o.spieg || "La risposta giusta è «" + o.giusta + "»."];
        const err = TD.validaDomanda(dom);
        if (err.length) { TD.toast("Controlla: " + err.join(", ") + "."); return; }
        if (TD.DOMANDE.some(function (x) { return x[2] === dom[2]; })) { TD.toast("Esiste già una domanda con lo stesso testo."); return; }
        personali().domande.push(dom); TD.salva(); TD.applicaPersonali(); TD.toast("Domanda aggiunta ai quiz."); TD.render();
      };
      app.querySelectorAll("[data-dd]").forEach(function (b) { b.onclick = function () { if (!TD.conferma("Eliminare la domanda?")) return; personali().domande.splice(+b.dataset.dd, 1); TD.salva(); TD.applicaPersonali(); TD.render(); }; });
    }
    const ex = document.getElementById("edExp");
    if (ex) ex.onclick = function () { TD.scarica(new Blob([JSON.stringify(TD.esportaContenuti(), null, 1)], { type: "application/json" }), "tutor-digitale-contenuti_" + TD.oggi() + ".json"); };
    const im = document.getElementById("edImp");
    if (im) im.onchange = function () {
      const f = this.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = function () { try { const n = TD.importaContenuti(TD.jsonSicuro(r.result)); TD.toast("Importate " + n.lezioni + " lezioni e " + n.domande + " domande."); TD.render(); } catch (e) { TD.toast(e.message); } };
      r.readAsText(f);
    };
  });
})();
