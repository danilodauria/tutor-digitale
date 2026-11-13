/* ==========================================================================
   Tutor Digitale · assistenza a distanza
   Collegamento diretto tra i due dispositivi (WebRTC): vedere lo schermo
   dell'altro, chat, invio di file e pacchetti dei compiti. Nessun server
   intermedio: i codici di sessione sono cifrati con una password di 6 cifre
   che si rigenera a ogni sessione e ogni 10 minuti.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const ICE = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }, { urls: "stun:stun.cloudflare.com:3478" }];
  const DURATA_PIN = 10 * 60 * 1000;
  const PEZZO = 16 * 1024;

  /* stato della sessione: resta vivo anche se si cambia pagina */
  const S = { fase: "inizio", ruolo: "", pc: null, dc: null, pin: "", codice: "", scade: 0, chat: [], ricevuti: [], invio: null, schermo: null, sender: null, remoto: null, altro: "", ingresso: null };
  TD.sessioneRemota = S;

  function mioNome() {
    if (TD.MODO === "allievo") return (TD.db.allievo && TD.db.allievo.nome) || "Allievo";
    return TD.db.profilo.nome || "Tutor";
  }
  function nuovoPin() { const a = new Uint32Array(1); crypto.getRandomValues(a); return String(a[0] % 1000000).padStart(6, "0"); }
  function attendiIce(pc) {
    return new Promise(function (ok) {
      if (pc.iceGatheringState === "complete") return ok();
      const t = setTimeout(ok, 5000);
      pc.addEventListener("icegatheringstatechange", function () { if (pc.iceGatheringState === "complete") { clearTimeout(t); ok(); } });
    });
  }
  function chiudi(motivo) {
    try { if (S.schermo) S.schermo.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    try { if (S.dc) S.dc.close(); } catch (e) {}
    try { if (S.pc) S.pc.close(); } catch (e) {}
    Object.assign(S, { fase: "inizio", ruolo: "", pc: null, dc: null, pin: "", codice: "", scade: 0, schermo: null, sender: null, remoto: null, altro: "", invio: null, ingresso: null });
    if (motivo) TD.toast(motivo);
    ridisegna();
  }
  function nuovaPc() {
    const pc = new RTCPeerConnection({ iceServers: ICE });
    pc.addEventListener("connectionstatechange", function () {
      if (pc.connectionState === "failed") chiudi("Collegamento non riuscito: le due reti non si raggiungono direttamente. Riprova o usa un'altra rete (es. hotspot del telefono).");
      if (pc.connectionState === "disconnected" || pc.connectionState === "closed") { if (S.fase === "collegato") chiudi("Sessione terminata."); }
    });
    pc.addEventListener("track", function (e) {
      S.remoto = e.streams[0] || new MediaStream([e.track]);
      e.track.addEventListener("ended", function () { S.remoto = null; ridisegna(); });
      ridisegna();
    });
    pc.addEventListener("negotiationneeded", async function () {
      if (!S.dc || S.dc.readyState !== "open") return;
      try { await pc.setLocalDescription(await pc.createOffer()); invia({ t: "sdp", sdp: pc.localDescription }); } catch (e) { console.error(e); }
    });
    return pc;
  }
  function prepara(dc) {
    S.dc = dc;
    dc.binaryType = "arraybuffer";
    dc.bufferedAmountLowThreshold = 1 << 20;
    dc.onopen = function () { S.fase = "collegato"; S.codice = ""; invia({ t: "ciao", nome: mioNome(), modo: TD.MODO || "tutor" }); TD.toast("Collegato!"); ridisegna(); };
    dc.onclose = function () { if (S.fase === "collegato") chiudi("Sessione terminata."); };
    dc.onmessage = function (e) { if (typeof e.data === "string") messaggio(JSON.parse(e.data)); else pezzo(e.data); };
  }
  function invia(o) { if (S.dc && S.dc.readyState === "open") S.dc.send(JSON.stringify(o)); }

  async function messaggio(m) {
    if (m.t === "ciao") { S.altro = m.nome; ridisegna(); }
    else if (m.t === "chat") { S.chat.push({ da: S.altro || "L'altro", testo: m.testo, mio: false, ora: ora() }); ridisegna(); suono(); }
    else if (m.t === "sdp") {
      const pc = S.pc;
      if (m.sdp.type === "offer") {
        if (pc.signalingState !== "stable") { if (S.ruolo === "ospite") await pc.setLocalDescription({ type: "rollback" }); else return; }
        await pc.setRemoteDescription(m.sdp);
        await pc.setLocalDescription(await pc.createAnswer());
        invia({ t: "sdp", sdp: pc.localDescription });
      } else await pc.setRemoteDescription(m.sdp);
    }
    else if (m.t === "schermo-fine") { S.remoto = null; ridisegna(); }
    else if (m.t === "file") { S.ingresso = { meta: m, parti: [], ricevuti: 0 }; ridisegna(); }
    else if (m.t === "file-fine" && S.ingresso) {
      const blob = new Blob(S.ingresso.parti, { type: S.ingresso.meta.tipo || "application/octet-stream" });
      S.ricevuti.unshift({ nome: S.ingresso.meta.nome, blob: blob, url: URL.createObjectURL(blob), ora: ora() });
      S.ingresso = null; TD.toast("File ricevuto: " + S.ricevuti[0].nome); suono(); ridisegna();
    }
  }
  function pezzo(buf) {
    if (!S.ingresso) return;
    S.ingresso.parti.push(buf); S.ingresso.ricevuti += buf.byteLength;
    const p = document.getElementById("rProg"); if (p) p.textContent = "Ricevo «" + S.ingresso.meta.nome + "»: " + Math.round(100 * S.ingresso.ricevuti / (S.ingresso.meta.size || 1)) + "%";
  }
  async function inviaFile(f) {
    if (!S.dc || S.dc.readyState !== "open") return;
    invia({ t: "file", nome: f.name, size: f.size, tipo: f.type });
    const buf = new Uint8Array(await f.arrayBuffer());
    for (let i = 0; i < buf.length; i += PEZZO) {
      if (S.dc.bufferedAmount > 4 * (1 << 20)) await new Promise(function (ok) { S.dc.onbufferedamountlow = function () { S.dc.onbufferedamountlow = null; ok(); }; });
      S.dc.send(buf.slice(i, i + PEZZO));
      const p = document.getElementById("rProg"); if (p) p.textContent = "Invio «" + f.name + "»: " + Math.round(100 * Math.min(buf.length, i + PEZZO) / buf.length) + "%";
    }
    invia({ t: "file-fine" });
    const p = document.getElementById("rProg"); if (p) p.textContent = "Inviato «" + f.name + "».";
  }
  TD.inviaFileRemoto = inviaFile;
  function ora() { return new Date().toTimeString().slice(0, 5); }
  function suono() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(.12, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .25); o.start(); o.stop(a.currentTime + .25); } catch (e) {} }

  /* ---------------------------------------------------------- avvio */
  async function apri() {
    chiudi();
    S.ruolo = "ospitante"; S.fase = "attesa"; S.pin = nuovoPin(); S.scade = Date.now() + DURATA_PIN;
    ridisegna();
    const pc = S.pc = nuovaPc();
    prepara(pc.createDataChannel("td", { ordered: true }));
    await pc.setLocalDescription(await pc.createOffer());
    await attendiIce(pc);
    S.codice = await TD.scambio.cifraPin(S.pin, { sdp: pc.localDescription, nome: mioNome() });
    ridisegna();
  }
  async function entra(codice, pin) {
    const dati = await TD.scambio.decifraPin(pin, codice);
    chiudi();
    S.ruolo = "ospite"; S.fase = "risposta"; S.pin = pin; S.altro = dati.nome || "";
    const pc = S.pc = nuovaPc();
    pc.ondatachannel = function (e) { prepara(e.channel); };
    await pc.setRemoteDescription(dati.sdp);
    await pc.setLocalDescription(await pc.createAnswer());
    await attendiIce(pc);
    S.codice = await TD.scambio.cifraPin(pin, { sdp: pc.localDescription, nome: mioNome() });
    ridisegna();
  }
  async function completa(codice) {
    const dati = await TD.scambio.decifraPin(S.pin, codice);
    S.altro = dati.nome || "";
    await S.pc.setRemoteDescription(dati.sdp);
    S.fase = "collegamento"; ridisegna();
  }
  async function condividiSchermo() {
    try {
      S.schermo = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 12 }, audio: false });
      const t = S.schermo.getVideoTracks()[0];
      S.sender = S.pc.addTrack(t, S.schermo);
      t.addEventListener("ended", fermaSchermo);
      ridisegna();
    } catch (e) { TD.toast("Condivisione dello schermo annullata."); }
  }
  function fermaSchermo() {
    try { if (S.sender) S.pc.removeTrack(S.sender); } catch (e) {}
    if (S.schermo) S.schermo.getTracks().forEach(function (t) { t.stop(); });
    S.schermo = null; S.sender = null; invia({ t: "schermo-fine" }); ridisegna();
  }

  /* rigenerazione automatica della password */
  setInterval(function () {
    if (S.fase === "attesa" && S.ruolo === "ospitante" && S.scade && Date.now() > S.scade) { TD.toast("Password scaduta: ne genero una nuova."); apri(); }
    const c = document.getElementById("rScade");
    if (c && S.scade) { const r = Math.max(0, S.scade - Date.now()); c.textContent = Math.floor(r / 60000) + ":" + String(Math.floor(r / 1000) % 60).padStart(2, "0"); }
  }, 1000);

  /* ---------------------------------------------------------- vista */
  let app = null;
  function ridisegna() { if (app && app.isConnected && location.hash.indexOf("#/remoto") === 0) disegna(); }
  const supportato = typeof RTCPeerConnection !== "undefined";
  const schermoOk = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

  TD.rotta("/remoto", function (a, par, q) {
    app = a; disegna();
    const c = document.getElementById("rCod");
    if (q.s && c) { c.value = q.s; const p = document.getElementById("rPin"); if (p) p.focus(); TD.toast("Codice ricevuto: scrivi la password di 6 cifre."); }
  });
  /* indirizzo dell'altra app (tutor ↔ allievo) per il QR della sessione */
  function linkSessione(codice) {
    const base = TD.MODO === "allievo" ? new URL("../", location.href).href : (TD.URL_ALLIEVO || new URL("allievo/", location.href).href);
    return base + "#/remoto?s=" + codice;
  }

  function disegna() {
    const offline = !navigator.onLine;
    let corpo = "";
    if (!supportato) corpo = '<div class="card"><p>Questo browser non permette il collegamento diretto. Usa Chrome, Edge, Firefox o Safari aggiornati.</p></div>';
    else if (S.fase === "inizio") corpo =
      (offline ? '<div class="note-box">' + I("wifi") + "<div>Per l'assistenza a distanza serve Internet su entrambi i dispositivi. Tutto il resto del programma funziona anche offline.</div></div>" : "") +
      '<div class="grid-2">' +
        '<section class="card"><h2>' + I("screen") + "Apri una sessione</h2><p>Genera un <strong>codice</strong> e una <strong>password di 6 cifre</strong>. Manda il codice (WhatsApp, email, SMS) e detta la password a voce o per telefono: chi la conosce può collegarsi.</p>" +
          '<button class="btn btn-primary btn-lg" id="rApri">' + I("play") + "Apri la sessione</button></section>" +
        '<section class="card"><h2>' + I("users") + 'Collegati a una sessione</h2><label class="field"><span>Codice ricevuto</span><textarea id="rCod" rows="3" placeholder="Incolla qui il codice che inizia con TDR."></textarea></label>' +
          '<label class="field"><span>Password di 6 cifre</span><input id="rPin" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="000000"></label>' +
          '<button class="btn btn-primary btn-lg" id="rEntra">' + I("arrow") + "Collegati</button></section>" +
      "</div>" + guida();
    else if (S.fase === "attesa") corpo =
      '<section class="card remote-card"><h2>Sessione aperta</h2>' +
        '<div class="remote-ids"><div><span>Password</span><strong class="pin">' + (S.pin.slice(0, 3) + " " + S.pin.slice(3)) + '</strong><small>cambia tra <b id="rScade">' + Math.floor(Math.max(0, S.scade - Date.now()) / 60000) + ":" + String(Math.floor(Math.max(0, S.scade - Date.now()) / 1000) % 60).padStart(2, "0") + '</b></small></div>' +
        "<div><span>Codice da inviare</span>" + (S.codice ? '<textarea readonly rows="3" class="code">' + E(S.codice) + '</textarea><div class="actions"><button class="btn btn-primary" id="rCopia">' + I("copy") + 'Copia</button><button class="btn" id="rShare">' + I("upload") + "Condividi</button></div>" +
          (TD.qr && TD.qr.adatto(linkSessione(S.codice)) ? '<div class="qr-box">' + TD.qr.svg(linkSessione(S.codice), { etichetta: "QR della sessione" }) + "<p>Oppure fai inquadrare questo QR con la fotocamera del telefono o del tablet: si apre l'app con il codice già inserito.</p></div>" : "") : '<p class="muted">Preparo il codice…</p>') + "</div></div>" +
        '<label class="field"><span>Incolla qui il codice di risposta che ti rimandano</span><textarea id="rRisp" rows="3" placeholder="TDR.…"></textarea></label>' +
        '<div class="actions"><button class="btn btn-primary" id="rCompleta">' + I("check") + 'Completa il collegamento</button><button class="btn" id="rNuova">Nuova password</button><button class="btn btn-ghost" id="rChiudi">' + I("x") + "Annulla</button></div></section>";
    else if (S.fase === "risposta") corpo =
      '<section class="card remote-card"><h2>Quasi fatto</h2><p>Manda questo <strong>codice di risposta</strong> a ' + E(S.altro || "chi ha aperto la sessione") + ": appena lo incolla, siete collegati.</p>" +
        (S.codice ? '<textarea readonly rows="3" class="code">' + E(S.codice) + '</textarea><div class="actions"><button class="btn btn-primary" id="rCopia">' + I("copy") + 'Copia</button><button class="btn" id="rShare">' + I("upload") + "Condividi</button></div>" : '<p class="muted">Preparo il codice…</p>') +
        '<p class="muted">In attesa del collegamento…</p><div class="actions"><button class="btn btn-ghost" id="rChiudi">' + I("x") + "Annulla</button></div></section>";
    else if (S.fase === "collegamento") corpo = '<section class="card"><p>Collegamento in corso con ' + E(S.altro) + '…</p><button class="btn btn-ghost" id="rChiudi">Annulla</button></section>';
    else corpo =
      '<section class="card remote-live"><div class="remote-head"><span class="pill ok">' + I("check") + "Collegato con " + E(S.altro || "l'altro dispositivo") + "</span>" +
        '<div class="actions">' + (schermoOk ? (S.schermo ? '<button class="btn btn-danger" id="rStopSch">' + I("x") + "Smetti di condividere</button>" : '<button class="btn btn-primary" id="rSch">' + I("screen") + "Mostra il mio schermo</button>") : '<span class="muted text-small">Questo dispositivo non può condividere lo schermo: si può vedere quello dell\'altro.</span>') +
        '<button class="btn btn-ghost" id="rChiudi">' + I("x") + "Chiudi la sessione</button></div></div>" +
        (S.remoto ? '<div class="remote-video"><video id="rVid" autoplay playsinline muted></video><button class="btn btn-sm" id="rFull">' + I("screen") + "Schermo intero</button></div>" : '<p class="muted">Quando l\'altro preme «Mostra il mio schermo», qui vedi il suo schermo.</p>') +
        '<div class="grid-2"><div><h3>Chat</h3><div class="chat" id="rChat">' + S.chat.map(function (c) { return '<p class="' + (c.mio ? "mio" : "") + '"><small>' + E(c.da) + " · " + c.ora + "</small>" + E(c.testo) + "</p>"; }).join("") + "</div>" +
          '<form id="rChatF" class="search"><input id="rMsg" placeholder="Scrivi un messaggio" autocomplete="off"><button class="btn btn-primary">Invia</button></form></div>' +
        '<div><h3>File</h3><label class="btn">' + I("upload") + 'Invia file<input type="file" id="rFile" multiple hidden></label>' + (TD.azioniRemote ? TD.azioniRemote() : "") + '<p id="rProg" class="muted text-small"></p>' +
          (S.ricevuti.length ? '<ul class="list">' + S.ricevuti.map(function (f, i) { return '<li><span>' + E(f.nome) + "<small>" + f.ora + '</small></span><span class="actions"><a class="btn btn-sm" href="' + f.url + '" download="' + E(f.nome) + '">' + I("download") + "Salva</a>" + (/\.json$/i.test(f.nome) && TD.apriPacchetto ? '<button class="btn btn-sm btn-primary" data-apri="' + i + '">Apri nel programma</button>' : "") + "</span></li>"; }).join("") + "</ul>" : '<p class="muted text-small">Nessun file ricevuto.</p>') +
        "</div></div></section>";

    const tieni = {};
    ["rMsg", "rRisp", "rCod", "rPin"].forEach(function (id) { const el = document.getElementById(id); if (el) tieni[id] = el.value; });
    app.innerHTML = TD.intest("Assistenza a distanza", "Come un TeamViewer semplice e senza installazioni: codice + password che si rigenera. Si vede lo schermo dell'altro, si scrive in chat e ci si scambiano file e compiti.") + '<div class="wrap">' + corpo + "</div>";
    Object.keys(tieni).forEach(function (id) { const el = document.getElementById(id); if (el && !el.value) el.value = tieni[id]; });
    collega();
  }
  function guida() {
    return '<section class="card"><h2>' + I("info") + 'Come funziona</h2><ol class="steps"><li><span>Chi apre la sessione manda il <strong>codice</strong> e dice la <strong>password</strong> (cambia a ogni sessione e ogni 10 minuti).</span></li><li><span>L\'altro incolla il codice, scrive la password e rimanda il <strong>codice di risposta</strong>.</span></li><li><span>Incollata la risposta, siete collegati: schermo, chat e file viaggiano direttamente tra i due dispositivi, cifrati.</span></li></ol>' +
      '<p class="muted text-small">Il browser permette di <strong>vedere</strong> lo schermo dell\'altro ma non di muovere il suo mouse: per il controllo completo del computer si usa un programma dedicato come RustDesk (gratuito e libero). Su alcune reti aziendali molto chiuse il collegamento diretto può non riuscire: in quel caso basta usare l\'hotspot del telefono.</p></section>';
  }
  function collega() {
    const $ = function (id) { return document.getElementById(id); };
    if ($("rApri")) $("rApri").onclick = function () { apri().catch(function (e) { TD.toast(e.message); chiudi(); }); };
    if ($("rEntra")) $("rEntra").onclick = function () {
      const c = $("rCod").value.trim(), p = $("rPin").value.replace(/\D/g, "");
      if (!c || p.length !== 6) { TD.toast("Servono il codice e la password di 6 cifre."); return; }
      $("rEntra").disabled = true;
      entra(c, p).catch(function (e) { TD.toast(e.message); $("rEntra").disabled = false; });
    };
    if ($("rCopia")) $("rCopia").onclick = function () { TD.scambio.copia(S.codice).then(function (ok) { TD.toast(ok ? "Codice copiato: incollalo in WhatsApp o in una email." : "Seleziona il codice e copialo a mano."); }); };
    if ($("rShare")) $("rShare").onclick = function () {
      const testo = S.fase === "attesa" ? "Assistenza Tutor Digitale: apri questo link e scrivi la password che ti dico a voce.\n" + linkSessione(S.codice) : S.codice;
      if (navigator.share) navigator.share({ title: "Tutor Digitale", text: testo }).catch(function () {});
      else TD.scambio.copia(S.codice).then(function () { TD.toast("Condivisione non disponibile: codice copiato."); });
    };
    if ($("rCompleta")) $("rCompleta").onclick = function () { const c = $("rRisp").value.trim(); if (!c) { TD.toast("Incolla il codice di risposta."); return; } completa(c).catch(function (e) { TD.toast(e.message); }); };
    if ($("rNuova")) $("rNuova").onclick = function () { apri(); };
    if ($("rChiudi")) $("rChiudi").onclick = function () { chiudi("Sessione chiusa."); };
    if ($("rSch")) $("rSch").onclick = condividiSchermo;
    if ($("rStopSch")) $("rStopSch").onclick = fermaSchermo;
    const v = $("rVid"); if (v && S.remoto) { v.srcObject = S.remoto; v.play().catch(function () {}); }
    if ($("rFull")) $("rFull").onclick = function () { if (v && v.requestFullscreen) v.requestFullscreen(); };
    const ch = $("rChat"); if (ch) ch.scrollTop = ch.scrollHeight;
    if ($("rChatF")) $("rChatF").onsubmit = function (e) {
      e.preventDefault(); const t = $("rMsg").value.trim(); if (!t) return;
      $("rMsg").value = ""; invia({ t: "chat", testo: t }); S.chat.push({ da: "Io", testo: t, mio: true, ora: ora() }); ridisegna();
      setTimeout(function () { const m = document.getElementById("rMsg"); if (m) m.focus(); }, 0);
    };
    if ($("rFile")) $("rFile").onchange = async function () { for (const f of Array.from(this.files)) await inviaFile(f); };
    app.querySelectorAll("[data-apri]").forEach(function (b) {
      b.onclick = async function () {
        const f = S.ricevuti[+b.dataset.apri];
        try { TD.apriPacchetto(await TD.scambio.leggi(await f.blob.text())); } catch (e) { TD.toast(e.message); }
      };
    });
    if (TD.collegaAzioniRemote) TD.collegaAzioniRemote();
  }
})();
