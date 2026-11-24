/* ==========================================================================
   Tutor Digitale · Segni e voce (accessibilità per sordi e per chi non parla)
   Due strumenti che funzionano interamente sul dispositivo, anche offline:
   · il comunicatore a frasi: si compone una frase con due tocchi e il
     programma la legge ad alta voce (per chi non può parlare);
   · i video in lingua dei segni: la webcam registra un saluto, una
     spiegazione o il segno di una parola, il video resta nel browser e si
     può rivedere, scaricare o condividere (per chi non può sentire).
   La webcam si accende solo quando si preme il pulsante.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const MAX_SEC = 90, MAX_BYTE = 60 * 1024 * 1024;
  const NOME_DB = "tutor-digitale-segni", MAGAZZINO = "video";

  const S = { cat: (TD.SEGNI && TD.SEGNI.categorie[0] ? TD.SEGNI.categorie[0].id : ""), frase: [], voci: [], urls: [], lezione: "", flusso: null, rec: null, parti: [], inizio: 0, timer: null, scarta: false, titoloRec: "" };

  /* ------------------------------------------------------------ funzioni pure (anche per i test) */
  TD.segni = {
    frase: function (voci) {
      const t = (Array.isArray(voci) ? voci : []).map(function (x) { return String(x == null ? "" : x).trim(); }).filter(Boolean);
      if (!t.length) return "";
      const s = t.join(" ").replace(/\s+/g, " ");
      return /[.!?…]$/.test(s) ? s : s + ".";
    },
    cerca: function (voci, q) {
      const lista = Array.isArray(voci) ? voci : [];
      const cerca = String(q == null ? "" : q).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (!cerca) return lista.slice();
      return lista.filter(function (v) {
        const testo = (String((v && v.titolo) || "") + " " + String((v && v.lezioneNome) || "")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return testo.indexOf(cerca) >= 0;
      });
    },
    nomeVideo: function (titolo, tipo) {
      const grezzo = String(titolo == null ? "" : titolo).trim();
      const base = !grezzo ? "" : TD.nomeFile ? TD.nomeFile(grezzo) : grezzo.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
      return (base || "video-lis") + (/mp4/i.test(String(tipo || "")) ? ".mp4" : ".webm");
    },
    durata: function (sec) {
      const s = Math.max(0, Math.round(Number(sec) || 0));
      return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }
  };

  /* ------------------------------------------------------------ archivio dei video (IndexedDB) */
  function apriDb() {
    return new Promise(function (ok, ko) {
      if (!window.indexedDB) { ko(new Error("Questo browser non ha una memoria per i video.")); return; }
      let richiesta;
      try { richiesta = indexedDB.open(NOME_DB, 1); } catch (e) { ko(e); return; }
      richiesta.onupgradeneeded = function () {
        const d = richiesta.result;
        if (!d.objectStoreNames.contains(MAGAZZINO)) d.createObjectStore(MAGAZZINO, { keyPath: "id" });
      };
      richiesta.onsuccess = function () { ok(richiesta.result); };
      richiesta.onerror = function () { ko(richiesta.error || new Error("Memoria dei video non disponibile.")); };
    });
  }
  function conDeposito(modo, azione) {
    return apriDb().then(function (d) {
      return new Promise(function (ok, ko) {
        const t = d.transaction(MAGAZZINO, modo), deposito = t.objectStore(MAGAZZINO);
        let esito;
        try { esito = azione(deposito); } catch (e) { ko(e); return; }
        t.oncomplete = function () { ok(esito && esito.result !== undefined ? esito.result : esito); };
        t.onerror = function () { ko(t.error || new Error("Salvataggio non riuscito.")); };
        t.onabort = function () { ko(t.error || new Error("Operazione annullata.")); };
      });
    });
  }
  function leggiTutti() {
    return conDeposito("readonly", function (d) { return d.getAll(); }).then(function (lista) {
      return (Array.isArray(lista) ? lista : []).sort(function (a, b) { return (b.creato || 0) - (a.creato || 0); });
    });
  }
  function scriviVoce(voce) { return conDeposito("readwrite", function (d) { return d.put(voce); }); }
  function cancellaVoce(id) { return conDeposito("readwrite", function (d) { return d.delete(id); }); }

  /* ------------------------------------------------------------ pagina */
  function lezioneNome(id) {
    if (!id) return "";
    const l = (TD.lezione && TD.lezione(id)) || (TD.LEZIONI || []).find(function (x) { return x.id === id; });
    return l ? l.titolo : "";
  }
  function stato(testo) { const el = document.getElementById("sStato"); if (el) el.textContent = testo; }

  function aggiornaFrase() {
    const el = document.getElementById("sFrase"); if (!el) return;
    const testo = TD.segni.frase(S.frase);
    el.innerHTML = testo ? E(testo) : '<span class="muted">Qui compare la frase: tocca una o più frasi qui sopra.</span>';
  }
  function disegnaCategorie() {
    const el = document.getElementById("sCat"); if (!el) return;
    el.innerHTML = TD.SEGNI.categorie.map(function (c) {
      return '<button type="button" class="chip' + (c.id === S.cat ? " on" : "") + '" role="tab" aria-selected="' + (c.id === S.cat ? "true" : "false") + '" data-cat="' + E(c.id) + '">' + E(c.nome) + "</button>";
    }).join("");
    el.querySelectorAll("[data-cat]").forEach(function (b) { b.onclick = function () { S.cat = b.dataset.cat; disegnaCategorie(); disegnaGriglia(); }; });
  }
  function disegnaGriglia() {
    const el = document.getElementById("sGriglia"); if (!el) return;
    const cat = TD.SEGNI.categorie.find(function (c) { return c.id === S.cat; }) || TD.SEGNI.categorie[0];
    if (!cat) { el.innerHTML = ""; return; }
    el.innerHTML = cat.voci.map(function (v, i) {
      return '<button type="button" class="segni-voce" data-voce="' + i + '"><span class="segni-emo" aria-hidden="true">' + E(v.e) + '</span><span class="segni-testo">' + E(v.t) + "</span></button>";
    }).join("");
    el.querySelectorAll("[data-voce]").forEach(function (b) {
      b.onclick = function () {
        const v = cat.voci[+b.dataset.voce]; if (!v) return;
        S.frase.push(v.t); aggiornaFrase();
      };
    });
  }
  function disegnaRapide() {
    const el = document.getElementById("sRapide"); if (!el) return;
    el.innerHTML = TD.SEGNI.rapide.map(function (v, i) {
      return '<button type="button" class="btn" data-rapida="' + i + '"><span aria-hidden="true">' + E(v.e) + "</span> " + E(v.t) + "</button>";
    }).join("");
    el.querySelectorAll("[data-rapida]").forEach(function (b) {
      b.onclick = function () { const v = TD.SEGNI.rapide[+b.dataset.rapida]; if (v) { S.frase.push(v.t); aggiornaFrase(); } };
    });
  }

  function mostraVideo() {
    const el = document.getElementById("sVideo"); if (!el) return;
    S.urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} });
    S.urls = [];
    const cercaEl = document.getElementById("sCerca");
    const lista = TD.segni.cerca(S.voci, cercaEl ? cercaEl.value : "");
    if (!lista.length) {
      el.innerHTML = '<p class="muted">' + (S.voci.length ? "Nessun video con questa ricerca." : "Nessun video salvato: accendi la webcam e registra il primo.") + "</p>";
      return;
    }
    el.innerHTML = lista.map(function (v, i) {
      const url = URL.createObjectURL(v.blob);
      S.urls.push(url);
      return '<article class="card segni-video"><h3>' + E(v.titolo || "Video in LIS") + "</h3>" +
        '<video controls playsinline preload="metadata" src="' + E(url) + '"></video>' +
        '<p class="muted text-small">' + E(TD.dataIt(v.data) + " · " + TD.segni.durata(v.durata)) + (v.lezioneNome ? " · " + E(v.lezioneNome) : "") + "</p>" +
        '<div class="actions"><button class="btn btn-sm" data-cond="' + i + '">' + I("upload") + 'Condividi</button><button class="btn btn-sm" data-scarica="' + i + '">' + I("download") + 'Scarica</button><button class="btn btn-sm btn-ghost" data-elimina="' + i + '">' + I("trash") + "Elimina</button></div></article>";
    }).join("");
    el.querySelectorAll("[data-cond]").forEach(function (b) { b.onclick = function () { condividi(lista[+b.dataset.cond]); }; });
    el.querySelectorAll("[data-scarica]").forEach(function (b) {
      b.onclick = function () { const v = lista[+b.dataset.scarica]; if (v) TD.scarica(v.blob, TD.segni.nomeVideo(v.titolo, v.tipo)); };
    });
    el.querySelectorAll("[data-elimina]").forEach(function (b) {
      b.onclick = function () {
        const v = lista[+b.dataset.elimina]; if (!v) return;
        if (!TD.conferma("Eliminare il video «" + (v.titolo || "Video in LIS") + "»? L'operazione non si può annullare.")) return;
        cancellaVoce(v.id).then(function () { S.voci = S.voci.filter(function (x) { return x.id !== v.id; }); mostraVideo(); TD.toast("Video eliminato."); })
          .catch(function () { TD.toast("Non riesco a eliminare il video."); });
      };
    });
  }
  function condividi(v) {
    if (!v || !v.blob) return;
    const nome = TD.segni.nomeVideo(v.titolo, v.tipo);
    const file = new File([v.blob], nome, { type: v.tipo || "video/webm" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: v.titolo || "Video in LIS" }).catch(function () {});
    } else {
      TD.scarica(v.blob, nome);
      TD.toast("Video scaricato: allegalo a WhatsApp o a una email.");
    }
  }

  async function salvaVideo(blob, titolo, durata) {
    const lez = S.lezione ? lezioneNome(S.lezione) : "";
    const voce = {
      id: TD.uid("lis"), titolo: titolo || "Video LIS del " + TD.dataIt(TD.oggi()),
      lezione: S.lezione, lezioneNome: lez, creato: Date.now(), data: TD.oggi(),
      durata: Math.max(1, Math.round(Number(durata) || 0)), tipo: blob.type || "video/webm", dimensione: blob.size, blob: blob
    };
    try {
      await scriviVoce(voce);
      S.voci = await leggiTutti();
      mostraVideo();
      TD.toast('Video salvato: "' + voce.titolo + '".');
    } catch (e) {
      TD.scarica(blob, TD.segni.nomeVideo(voce.titolo, voce.tipo));
      TD.toast("La memoria dei video è piena o non disponibile: ho scaricato il file.");
    }
  }

  /* ------------------------------------------------------------ webcam */
  function tipoVideo() {
    const MR = window.MediaRecorder;
    if (!MR || !MR.isTypeSupported) return "";
    const tipi = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4;codecs=h264,aac", "video/mp4"];
    for (let i = 0; i < tipi.length; i++) if (MR.isTypeSupported(tipi[i])) return tipi[i];
    return "";
  }
  async function accendi() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      stato("Questo browser non permette la webcam. Apri il programma con Chrome, Edge, Firefox o Safari, da un indirizzo https o dall'app installata.");
      return;
    }
    const video = { facingMode: "user", width: { ideal: 1280 } };
    try {
      try { S.flusso = await navigator.mediaDevices.getUserMedia({ video: video, audio: true }); }
      catch (e1) { S.flusso = await navigator.mediaDevices.getUserMedia({ video: video, audio: false }); }
      const live = document.getElementById("sLive");
      if (live) { live.srcObject = S.flusso; live.play().catch(function () {}); }
      const ant = document.getElementById("sAnteprima"); if (ant) ant.hidden = false;
      const acc = document.getElementById("sAccendi"); if (acc) acc.hidden = true;
      const spe = document.getElementById("sSpegni"); if (spe) spe.hidden = false;
      const reg = document.getElementById("sRegistra"); if (reg) reg.disabled = false;
      stato("Webcam accesa. Premi «Registra» per cominciare: puoi fermarti quando vuoi, massimo 90 secondi.");
    } catch (e) {
      const permesso = e && /NotAllowed|Permission/i.test(String(e.name || ""));
      stato(permesso ? "Hai negato l'accesso alla webcam: riprova e scegli «Consenti»." : "Webcam non disponibile: " + (e && e.message ? e.message : "controlla che non sia usata da un altro programma."));
    }
  }
  function spegni() {
    S.scarta = true;
    try { if (S.rec && S.rec.state === "recording") S.rec.stop(); } catch (e) {}
    clearInterval(S.timer); S.timer = null;
    if (S.flusso) S.flusso.getTracks().forEach(function (t) { t.stop(); });
    S.flusso = null;
    const live = document.getElementById("sLive"); if (live) live.srcObject = null;
    const ant = document.getElementById("sAnteprima"); if (ant) ant.hidden = true;
    const acc = document.getElementById("sAccendi"); if (acc) acc.hidden = false;
    const spe = document.getElementById("sSpegni"); if (spe) spe.hidden = true;
    const reg = document.getElementById("sRegistra"); if (reg) { reg.disabled = true; reg.innerHTML = I("play") + "Registra"; }
    stato("Webcam spenta. Durata massima 90 secondi.");
  }
  function registra() {
    if (S.rec && S.rec.state === "recording") { S.rec.stop(); return; }
    if (!S.flusso) { stato("Accendi prima la webcam."); return; }
    if (!window.MediaRecorder) { stato("Questo browser non sa registrare video: usa Chrome, Edge, Firefox o Safari aggiornati."); return; }
    const tipo = tipoVideo();
    let rec;
    try { rec = tipo ? new MediaRecorder(S.flusso, { mimeType: tipo }) : new MediaRecorder(S.flusso); }
    catch (e) { stato("Non riesco a iniziare la registrazione con questo browser."); return; }
    const campo = document.getElementById("sTitolo");
    S.titoloRec = campo ? String(campo.value || "").trim().slice(0, 80) : "";
    S.parti = []; S.rec = rec; S.inizio = Date.now(); S.scarta = false;
    rec.ondataavailable = function (e) { if (e.data && e.data.size) S.parti.push(e.data); };
    rec.onstop = async function () {
      clearInterval(S.timer); S.timer = null; S.rec = null;
      const durata = (Date.now() - S.inizio) / 1000;
      const blocco = new Blob(S.parti, { type: rec.mimeType || "video/webm" });
      S.parti = [];
      const bottone = document.getElementById("sRegistra");
      if (bottone) { bottone.disabled = false; bottone.innerHTML = I("play") + "Registra di nuovo"; }
      if (S.scarta) { S.scarta = false; stato("Registrazione annullata."); return; }
      if (!blocco.size) { stato("Non è stato registrato nulla: riprova."); return; }
      if (blocco.size > MAX_BYTE) { stato("Video troppo pesante: registra meno di 90 secondi."); return; }
      stato("Registrazione pronta (" + TD.segni.durata(durata) + "). La salvo…");
      await salvaVideo(blocco, S.titoloRec, durata);
      stato("Video salvato. Puoi registrarne un altro o spegnere la webcam.");
    };
    rec.start();
    const bottone = document.getElementById("sRegistra");
    if (bottone) bottone.innerHTML = I("pause") + "Ferma e salva";
    stato("Registrazione in corso…");
    S.timer = setInterval(function () {
      const sec = Math.floor((Date.now() - S.inizio) / 1000);
      const b = document.getElementById("sRegistra");
      if (b) b.innerHTML = I("pause") + "Ferma e salva (" + TD.segni.durata(sec) + ")";
      stato("Registrazione in corso… " + TD.segni.durata(sec) + " di " + TD.segni.durata(MAX_SEC));
      if (sec >= MAX_SEC) { stato("Limite di 90 secondi raggiunto: salvo il video."); try { rec.stop(); } catch (e) {} }
    }, 500);
  }

  /* ------------------------------------------------------------ vista */
  TD.rotta("/segni", function (app, par, q) {
    const l = q.lezione && TD.lezione ? TD.lezione(q.lezione) : null;
    S.lezione = l ? l.id : "";
    const titoloLezione = l ? "LIS · " + l.titolo : "";
    S.frase = [];

    app.innerHTML = TD.intest("Segni e voce", "Chi non sente può guardare un video in lingua dei segni; chi non parla può comporre una frase e farla leggere al programma. Tutto sul dispositivo, anche senza Internet.") +
      '<div class="wrap segni-wrap">' +
        (l ? '<div class="note-box">' + I("hand") + "<div><strong>Lezione: " + E(l.titolo) + "</strong><br>Registra la spiegazione in LIS o i segni delle parole chiave: il video resta qui e l'allievo può rivederlo quando vuole.</div></div>" : "") +
        '<section class="card"><h2>' + I("speaker") + 'Componi una frase</h2>' +
          '<p class="muted">Tocca una o più frasi: si mettono in fila e il programma le legge ad alta voce. Serve a chi non parla per farsi capire al telefono, allo sportello o a lezione.</p>' +
          '<div class="segni-cat" id="sCat" role="tablist" aria-label="Categorie di frasi"></div>' +
          '<div class="segni-griglia" id="sGriglia"></div>' +
          '<div class="segni-frase" id="sFrase" aria-live="polite"><span class="muted">Qui compare la frase: tocca una o più frasi qui sopra.</span></div>' +
          '<div class="actions"><button class="btn btn-primary btn-lg" id="sLeggi">' + I("speaker") + 'Leggi ad alta voce</button><button class="btn" id="sTogli">Cancella l\'ultima</button><button class="btn btn-ghost" id="sPulisci">Ricomincia</button></div>' +
          '<p class="muted text-small">Risposte rapide</p><div class="segni-rapide" id="sRapide"></div>' +
        "</section>" +
        '<section class="card"><h2>' + I("screen") + 'Video in lingua dei segni (LIS)</h2>' +
          '<p class="muted">Registra con la webcam un saluto, una spiegazione o il segno di una parola. I video restano in questo browser, non entrano nel backup del programma e non vengono inviati da nessuna parte: per conservarli o mandarli a qualcuno usa «Scarica» o «Condividi». La webcam si accende solo quando premi il pulsante.</p>' +
          '<label class="field"><span>Titolo del video</span><input id="sTitolo" maxlength="80" placeholder="Es. Come accendere il computer" value="' + E(titoloLezione) + '"></label>' +
          '<div id="sAnteprima" hidden><video id="sLive" class="segni-live" autoplay playsinline muted aria-label="Anteprima della webcam"></video></div>' +
          '<div class="actions"><button class="btn btn-primary" id="sAccendi">' + I("screen") + 'Accendi la webcam</button><button class="btn" id="sRegistra" disabled>' + I("play") + 'Registra</button><button class="btn btn-ghost" id="sSpegni" hidden>' + I("x") + 'Spegni la webcam</button></div>' +
          '<p class="muted text-small" id="sStato" aria-live="polite">Webcam spenta. Durata massima 90 secondi.</p>' +
          '<div class="segni-ricerca"><label class="field"><span>Cerca tra i video</span><input id="sCerca" type="search" placeholder="Titolo o lezione"></label></div>' +
          '<div class="segni-video-lista" id="sVideo"><p class="muted">Carico i video…</p></div>' +
        "</section>" +
      "</div>";

    disegnaCategorie(); disegnaGriglia(); disegnaRapide(); aggiornaFrase();

    document.getElementById("sLeggi").onclick = function () {
      const testo = TD.segni.frase(S.frase);
      if (!testo) { TD.toast("Aggiungi almeno una frase."); return; }
      TD.leggi(testo);
    };
    document.getElementById("sTogli").onclick = function () { S.frase.pop(); aggiornaFrase(); };
    document.getElementById("sPulisci").onclick = function () { S.frase = []; aggiornaFrase(); TD.zitto(); };
    document.getElementById("sAccendi").onclick = accendi;
    document.getElementById("sSpegni").onclick = spegni;
    document.getElementById("sRegistra").onclick = registra;
    document.getElementById("sCerca").oninput = mostraVideo;

    leggiTutti().then(function (lista) { S.voci = lista; mostraVideo(); })
      .catch(function () { S.voci = []; mostraVideo(); stato("La memoria dei video non è disponibile in questa finestra."); });

    app._cleanup = function () {
      spegni();
      S.urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} });
      S.urls = []; S.voci = []; S.frase = [];
    };
  });
})();
