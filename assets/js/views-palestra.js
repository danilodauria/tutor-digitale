/* ==========================================================================
   Tutor Digitale · esercizi per livello e palestra interattiva
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const DIFF = { facile: "Facile", medio: "Medio", esperto: "Esperto" };

  /* --------------------------------------------------------------- ESERCIZI */
  TD.rotta("/esercizi", function (app, p, q) {
    const dev = q.dev || "", liv = q.liv != null && q.liv !== "" ? Number(q.liv) : null, diff = q.diff || "";
    const lez = TD.LEZIONI.filter(function (l) { return (!dev || l.dev === dev) && (liv == null || l.liv === liv); });
    const elenco = [];
    lez.forEach(function (l) { Object.keys(DIFF).forEach(function (k) { if (!diff || diff === k) elenco.push({ l: l, k: k, t: l.esercizi[k] }); }); });
    const c = TD.clienteAttivo();
    function link(par) { const o = Object.assign({ dev: dev, liv: liv == null ? "" : liv, diff: diff }, par); return "#/esercizi?dev=" + o.dev + "&liv=" + o.liv + "&diff=" + o.diff; }

    app.innerHTML = TD.intest("Esercizi", "Ogni lezione ha tre esercizi pratici di difficoltà crescente. Si fanno insieme o si assegnano come compito.") +
      '<div class="wrap">' +
        '<nav class="chips">' + '<a class="chip' + (!dev ? " on" : "") + '" href="' + link({ dev: "" }) + '">Tutti i percorsi</a>' + TD.PERCORSI.map(function (x) { return '<a class="chip' + (dev === x.id ? " on" : "") + '" href="' + link({ dev: x.id }) + '">' + E(x.nome) + "</a>"; }).join("") + "</nav>" +
        '<nav class="chips">' + '<a class="chip' + (liv == null ? " on" : "") + '" href="' + link({ liv: "" }) + '">Tutti i livelli</a>' + TD.LIVELLI.map(function (x) { return '<a class="chip liv-' + x.id + (liv === x.id ? " on" : "") + '" href="' + link({ liv: x.id }) + '">' + E(x.nome) + "</a>"; }).join("") + "</nav>" +
        '<nav class="chips">' + '<a class="chip' + (!diff ? " on" : "") + '" href="' + link({ diff: "" }) + '">Ogni difficoltà</a>' + Object.keys(DIFF).map(function (k) { return '<a class="chip diff-' + k + (diff === k ? " on" : "") + '" href="' + link({ diff: k }) + '">' + DIFF[k] + "</a>"; }).join("") + "</nav>" +
        '<div class="toolbar"><span class="muted">' + elenco.length + " esercizi" + (c ? " · cliente attivo: <strong>" + E(TD.nomeCliente(c)) + "</strong>" : " · scegli un cliente nella lezione per assegnarli") + '</span><button class="btn" id="pdfEs">' + I("download") + "Scheda esercizi PDF</button></div>" +
        '<div class="ex-list">' + elenco.map(function (x, i) {
          return '<div class="ex-item ex-' + x.k + '"><span class="ex-tag">' + DIFF[x.k] + "</span>" + TD.badgeLiv(x.l.liv) +
            '<p>' + E(x.t) + '</p><a class="muted text-small" href="#/lezione/' + x.l.id + '">' + I(TD.percorso(x.l.dev).icona) + E(x.l.titolo) + "</a>" +
            (c ? '<button class="btn btn-sm" data-ass="' + i + '">' + I("pen") + "Assegna</button>" : "") + "</div>";
        }).join("") + "</div>" +
        '<section class="block"><h2>Esercizi interattivi</h2><p>Per allenare mano, occhio e prudenza c\'è la <a href="#/palestra">Palestra</a>: mouse, trascinamento, tastiera, «Truffa o no?» e password.</p></section>' +
      "</div>";
    app.querySelectorAll("[data-ass]").forEach(function (b) {
      b.onclick = function () { const x = elenco[+b.dataset.ass]; TD.assegnaCompito(c, "[" + DIFF[x.k] + "] " + x.t, x.l.id); b.disabled = true; b.textContent = "Assegnato"; };
    });
    document.getElementById("pdfEs").onclick = function () {
      const d = new TD.Documento({ titolo: "Scheda esercizi", piede: "Tutor Digitale · scheda esercizi" });
      d.intestazione(TD.db.profilo, "Scheda esercizi");
      d.h1("Esercizi da svolgere");
      d.campi([["Nome", c && c.tipo !== "ente" ? TD.nomeCliente(c) : ""], ["Data", TD.dataIt(TD.oggi())]]);
      elenco.slice(0, 60).forEach(function (x) { d.casella("[" + DIFF[x.k] + " · " + TD.livello(x.l.liv).breve + "] " + x.t + "  (" + x.l.titolo + ")", false); });
      TD.scaricaPdf(d.chiudi(), "esercizi.pdf", { titolo: "Scheda esercizi" });
    };
  });

  /* --------------------------------------------------------------- PALESTRA */
  const GIOCHI = [
    { id: "mouse", ic: "mouse", t: "Palestra del mouse", d: "Bersagli da colpire: clic, doppio clic e clic destro, in tre difficoltà." },
    { id: "trascina", ic: "hand", t: "Trascina e rilascia", d: "Porta ogni oggetto nella scatola giusta: con il mouse o con il dito." },
    { id: "tastiera", ic: "keyboard", t: "Palestra della tastiera", d: "Ricopia la frase: misura precisione e velocità." },
    { id: "truffe", ic: "alert", t: "Truffa o no?", d: "Messaggi veri e falsi da riconoscere, con la spiegazione." },
    { id: "password", ic: "lock", t: "Laboratorio password", d: "Misura la forza di una password e crea frasi-password sicure." }
  ];
  TD.rotta("/palestra", function (app) {
    app.innerHTML = TD.intest("Palestra", "Esercizi interattivi da fare durante la lezione o a casa. Funzionano con mouse e con il tocco.") +
      '<div class="wrap"><div class="tiles">' + GIOCHI.map(function (g) {
        return '<a class="tile" href="#/palestra/' + g.id + '"><span class="tile-ico">' + I(g.ic) + "</span><strong>" + E(g.t) + "</strong><small>" + E(g.d) + "</small></a>";
      }).join("") + "</div></div>";
  });

  function testata(t, sotto) { return '<header class="page-head"><div class="wrap"><p class="crumbs"><a href="#/palestra">Palestra</a></p><h1>' + t + '</h1><p class="lead">' + sotto + "</p></div></header>"; }
  function scelta(nome, voci, sel) {
    return '<div class="seg" role="radiogroup">' + voci.map(function (v) { return '<label><input type="radio" name="' + nome + '" value="' + v[0] + '"' + (v[0] === sel ? " checked" : "") + "><span>" + v[1] + "</span></label>"; }).join("") + "</div>";
  }

  /* mouse */
  TD.rotta("/palestra/mouse", function (app) {
    app.innerHTML = testata("Palestra del mouse", "Colpisci 10 bersagli. Facile: clic su bersagli grandi. Medio: doppio clic. Esperto: bersagli piccoli e clic destro sui rossi.") +
      '<div class="wrap"><div class="toolbar">' + scelta("diff", [["facile", "Facile"], ["medio", "Medio"], ["esperto", "Esperto"]], "facile") + '<button class="btn btn-primary" id="via">' + I("play") + 'Via!</button><span id="info" class="muted"></span></div>' +
      '<div class="arena" id="arena"><p class="arena-msg">Premi «Via!» per iniziare.</p></div></div>';
    const arena = document.getElementById("arena"), info = document.getElementById("info");
    let colpiti = 0, errori = 0, t0 = 0, diff = "facile";
    function bersaglio() {
      arena.innerHTML = "";
      const r = arena.getBoundingClientRect();
      const size = diff === "facile" ? 110 : diff === "medio" ? 80 : 50;
      const destro = diff === "esperto" && TD.rnd(3) === 0;
      const b = document.createElement("button");
      b.type = "button"; b.className = "target" + (destro ? " right" : "");
      b.style.width = b.style.height = size + "px";
      b.style.left = (10 + TD.rnd(Math.max(1, r.width - size - 20))) + "px";
      b.style.top = (10 + TD.rnd(Math.max(1, r.height - size - 20))) + "px";
      b.setAttribute("aria-label", destro ? "Bersaglio: clic destro" : diff === "medio" ? "Bersaglio: doppio clic" : "Bersaglio: clic");
      b.textContent = destro ? "destro" : diff === "medio" ? "2×" : "";
      function colpito(e) { e.preventDefault(); colpiti++; aggiorna(); if (colpiti >= 10) fine(); else bersaglio(); }
      if (destro) b.addEventListener("contextmenu", colpito);
      else if (diff === "medio") b.addEventListener("dblclick", colpito);
      else b.addEventListener("click", colpito);
      arena.appendChild(b);
    }
    arena.addEventListener("click", function (e) { if (t0 && e.target === arena) { errori++; aggiorna(); } });
    arena.addEventListener("contextmenu", function (e) { if (t0) e.preventDefault(); });
    function aggiorna() { info.textContent = "Colpiti " + colpiti + "/10 · fuori bersaglio " + errori; }
    function fine() {
      const s = ((Date.now() - t0) / 1000).toFixed(1);
      t0 = 0;
      arena.innerHTML = '<div class="arena-msg"><strong>Fatto in ' + s + " secondi</strong><br>Fuori bersaglio: " + errori + (errori === 0 ? " — mano sicura!" : "") + "</div>";
    }
    document.getElementById("via").onclick = function () {
      diff = (app.querySelector('input[name="diff"]:checked') || {}).value || "facile";
      colpiti = 0; errori = 0; t0 = Date.now(); aggiorna(); bersaglio();
    };
  });

  /* trascina */
  TD.rotta("/palestra/trascina", function (app) {
    const gruppi = [
      { nome: "Dispositivi", voci: ["Tablet", "Smartphone", "Smart TV", "Portatile"] },
      { nome: "Programmi e app", voci: ["Browser", "WhatsApp", "Blocco note", "RaiPlay"] },
      { nome: "Sicurezza", voci: ["Password", "Backup", "Verifica in due passaggi", "Antivirus"] }
    ];
    app.innerHTML = testata("Trascina e rilascia", "Tieni premuto su una parola e portala nella scatola giusta, poi lascia.") +
      '<div class="wrap"><div class="toolbar"><button class="btn btn-primary" id="nuovo">' + I("play") + 'Nuova partita</button><span id="info" class="muted"></span></div><div id="campo"></div></div>';
    const campo = document.getElementById("campo"), info = document.getElementById("info");
    function nuova() {
      const voci = [];
      gruppi.forEach(function (g, gi) { TD.mescola(g.voci).slice(0, 3).forEach(function (v) { voci.push({ v: v, g: gi }); }); });
      campo.innerHTML = '<div class="drag-pool" id="pool">' + TD.mescola(voci).map(function (x) { return '<span class="drag" data-g="' + x.g + '">' + E(x.v) + "</span>"; }).join("") + "</div>" +
        '<div class="drop-row">' + gruppi.map(function (g, gi) { return '<div class="drop" data-g="' + gi + '"><strong>' + E(g.nome) + "</strong></div>"; }).join("") + "</div>";
      let giuste = 0, errori = 0;
      info.textContent = "";
      campo.querySelectorAll(".drag").forEach(function (el) {
        let dx = 0, dy = 0, attivo = false;
        el.addEventListener("pointerdown", function (e) {
          attivo = true; el.setPointerCapture(e.pointerId);
          const r = el.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top;
          el.classList.add("dragging"); el.style.position = "fixed"; el.style.left = r.left + "px"; el.style.top = r.top + "px"; el.style.width = r.width + "px";
        });
        el.addEventListener("pointermove", function (e) { if (!attivo) return; el.style.left = (e.clientX - dx) + "px"; el.style.top = (e.clientY - dy) + "px"; });
        el.addEventListener("pointerup", function (e) {
          if (!attivo) return; attivo = false;
          el.style.visibility = "hidden";
          const sotto = document.elementFromPoint(e.clientX, e.clientY);
          el.style.visibility = "";
          const drop = sotto && sotto.closest(".drop");
          el.classList.remove("dragging"); el.style.position = ""; el.style.left = ""; el.style.top = ""; el.style.width = "";
          if (drop && drop.dataset.g === el.dataset.g) { drop.appendChild(el); el.classList.add("ok"); giuste++; }
          else if (drop) { errori++; el.classList.add("shake"); setTimeout(function () { el.classList.remove("shake"); }, 500); }
          info.textContent = "Giuste " + giuste + "/9 · errori " + errori;
          if (giuste === 9) info.textContent = "Completato con " + errori + " errori. Bravissimo!";
        });
      });
    }
    document.getElementById("nuovo").onclick = nuova;
    nuova();
  });

  /* tastiera */
  TD.rotta("/palestra/tastiera", function (app) {
    app.innerHTML = testata("Palestra della tastiera", "Ricopia la frase esattamente com'è, con maiuscole, accenti e punteggiatura.") +
      '<div class="wrap"><div class="toolbar">' + scelta("liv", TD.LIVELLI.map(function (l) { return [String(l.id), l.breve]; }), "0") + '<button class="btn btn-primary" id="nuova">' + I("play") + "Nuova frase</button></div>" +
      '<div class="card"><p class="type-model" id="modello"></p><textarea id="scrivi" rows="3" class="type-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Scrivi qui la frase"></textarea><p id="esito" class="muted"></p></div></div>';
    let frase = "", t0 = 0;
    const mod = document.getElementById("modello"), inp = document.getElementById("scrivi"), es = document.getElementById("esito");
    function nuova() {
      const liv = Number((app.querySelector('input[name="liv"]:checked') || {}).value || 0);
      const lista = TD.FRASI.filter(function (f) { return f[0] === liv; });
      let f; do { f = lista[TD.rnd(lista.length)][1]; } while (lista.length > 1 && f === frase);
      frase = f; t0 = 0; inp.value = ""; es.textContent = ""; disegna(); inp.focus();
    }
    function disegna() {
      const v = inp.value;
      mod.innerHTML = frase.split("").map(function (ch, i) {
        const cls = i < v.length ? (v[i] === ch ? "ok" : "ko") : i === v.length ? "cur" : "";
        return '<span class="' + cls + '">' + (ch === " " ? "&nbsp;" : E(ch)) + "</span>";
      }).join("");
    }
    inp.addEventListener("input", function () {
      if (!t0) t0 = Date.now();
      disegna();
      if (inp.value.length >= frase.length) {
        let ok = 0; for (let i = 0; i < frase.length; i++) if (inp.value[i] === frase[i]) ok++;
        const sec = (Date.now() - t0) / 1000;
        const ppm = Math.round((inp.value.trim().split(/\s+/).length) / (sec / 60));
        es.innerHTML = "<strong>Precisione " + Math.round(100 * ok / frase.length) + "%</strong> · " + sec.toFixed(1) + " secondi · circa " + ppm + " parole al minuto";
      }
    });
    document.getElementById("nuova").onclick = nuova;
    nuova();
  });

  /* truffe */
  TD.rotta("/palestra/truffe", function (app) {
    app.innerHTML = testata("Truffa o no?", "Leggi il messaggio e decidi. Dopo ogni risposta trovi il perché.") + '<div class="wrap" id="gioco"></div>';
    const box = document.getElementById("gioco");
    let lista, i, punti;
    function inizia() { lista = TD.mescola(TD.TRUFFE).slice(0, 8); i = 0; punti = 0; mostra(); }
    function mostra(risp) {
      const m = lista[i];
      let fb = "";
      if (risp != null) {
        const ok = risp === m[2]; if (ok) punti++;
        fb = '<div class="feedback ' + (ok ? "ok" : "ko") + '"><strong>' + (ok ? "Giusto!" : "Attenzione.") + "</strong> " + (m[2] ? "È una truffa. " : "È un messaggio legittimo. ") + E(m[3]) + '</div><button class="btn btn-primary" id="avanti">' + (i < lista.length - 1 ? "Prossimo messaggio" : "Risultato") + " " + I("arrow") + "</button>";
      }
      box.innerHTML = '<p class="muted">Messaggio ' + (i + 1) + " di " + lista.length + " · punti " + punti + "</p>" +
        '<div class="sms"><span class="sms-from">' + E(m[1]) + '</span><p>' + E(m[0]) + "</p></div>" +
        (risp == null ? '<div class="actions"><button class="btn btn-danger btn-lg" data-r="1">' + I("alert") + 'È una truffa</button><button class="btn btn-ok btn-lg" data-r="0">' + I("check") + "È legittimo</button></div>" : fb);
      box.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { mostra(b.dataset.r === "1"); }; });
      const av = document.getElementById("avanti");
      if (av) av.onclick = function () { if (i < lista.length - 1) { i++; mostra(); } else fine(); };
    }
    function fine() {
      box.innerHTML = '<div class="card result"><h2>' + punti + " su " + lista.length + "</h2><p>" + (punti >= 7 ? "Occhio da esperto!" : punti >= 5 ? "Buono: ripassa i segnali di truffa." : "Ripassiamo insieme la lezione sulle truffe.") + '</p><p class="muted">Regola d\'oro: banche, Poste e INPS non chiedono mai codici o password per messaggio o telefono.</p><div class="actions"><button class="btn btn-primary" id="ancora">Gioca ancora</button><a class="btn" href="#/lezione/rete-1-2">Lezione sulle truffe</a></div></div>';
      document.getElementById("ancora").onclick = inizia;
    }
    inizia();
  });

  /* password */
  const PAROLE = ["lampada", "fiume", "ottobre", "gatto", "montagna", "biscotto", "tramonto", "chitarra", "nuvola", "pianeta", "orologio", "girasole", "matita", "treno", "farfalla", "limone", "castello", "vento", "barca", "ombrello", "pepe", "quaderno", "violino", "sentiero", "cometa", "ciliegia", "lanterna", "zaino", "faro", "cuscino", "pinguino", "acero", "ponte", "tamburo", "bussola", "ruscello"];
  const COMUNI = ["password", "123456", "qwerty", "admin", "ciao", "amore", "juventus", "napoli", "roma", "milan", "inter", "12345678", "111111", "abc123"];
  TD.forzaPassword = function (pw) {
    if (!pw) return { punti: 0, voto: "—", consigli: [] };
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26; if (/[A-Z]/.test(pw)) pool += 26; if (/\d/.test(pw)) pool += 10; if (/[^a-zA-Z0-9]/.test(pw)) pool += 30;
    let bit = pw.length * Math.log2(Math.max(pool, 1));
    const consigli = [];
    const low = pw.toLowerCase();
    if (COMUNI.some(function (c) { return low.indexOf(c) >= 0; })) { bit *= 0.4; consigli.push("Contiene una parola tra le più usate: chi attacca la prova per prima."); }
    if (/(19|20)\d\d/.test(pw)) { bit -= 10; consigli.push("Un anno (come quello di nascita) è facile da indovinare."); }
    if (/(.)\1\1/.test(pw)) { bit -= 8; consigli.push("Evita caratteri ripetuti."); }
    if (pw.length < 12) consigli.push("Allungala: almeno 12 caratteri, meglio una frase di 4 parole.");
    const punti = Math.max(0, Math.min(100, Math.round(bit)));
    const voto = punti >= 70 ? "Molto forte" : punti >= 55 ? "Forte" : punti >= 40 ? "Discreta" : punti >= 25 ? "Debole" : "Molto debole";
    return { punti: punti, voto: voto, consigli: consigli };
  };
  TD.rotta("/palestra/password", function (app) {
    app.innerHTML = testata("Laboratorio password", "Prova una password inventata (non quella vera!): il controllo avviene solo su questo dispositivo, niente esce.") +
      '<div class="wrap"><div class="card"><label class="field"><span>Password di prova</span><input id="pw" type="text" autocomplete="off" spellcheck="false" placeholder="Scrivi qui"></label>' +
      '<div class="pw-meter"><span id="pwBar"></span></div><p id="pwVoto" class="pw-voto"></p><ul id="pwCons" class="muted"></ul></div>' +
      '<div class="card"><h2>Generatore di frasi-password</h2><p>Quattro parole a caso, un numero e un segno: lunga, forte e facile da ricordare.</p><p class="pw-gen" id="gen"></p><div class="actions"><button class="btn btn-primary" id="genera">' + I("star") + 'Genera</button><button class="btn" id="prova">Prova la forza</button></div></div></div>';
    const pw = document.getElementById("pw");
    function valuta() {
      const r = TD.forzaPassword(pw.value);
      const bar = document.getElementById("pwBar");
      bar.style.width = r.punti + "%";
      bar.style.background = r.punti >= 55 ? "var(--ok)" : r.punti >= 40 ? "var(--liv2)" : "var(--ko)";
      document.getElementById("pwVoto").textContent = pw.value ? r.voto : "";
      document.getElementById("pwCons").innerHTML = r.consigli.map(function (c) { return "<li>" + E(c) + "</li>"; }).join("");
    }
    pw.addEventListener("input", valuta);
    function genera() {
      const p = TD.mescola(PAROLE).slice(0, 4);
      p[TD.rnd(4)] = p[TD.rnd(4)].replace(/^./, function (c) { return c.toUpperCase(); });
      document.getElementById("gen").textContent = p.join("-") + "-" + (10 + TD.rnd(90)) + "!?#".charAt(TD.rnd(3));
    }
    document.getElementById("genera").onclick = genera;
    document.getElementById("prova").onclick = function () { pw.value = document.getElementById("gen").textContent; valuta(); };
    genera();
  });
})();
