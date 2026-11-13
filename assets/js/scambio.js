/* ==========================================================================
   Tutor Digitale · scambio tra tutor e allievo
   Pacchetti JSON compressi e firmati (HMAC-SHA-256 con un segreto per
   cliente), da passare come file, link, codice da incollare o condivisione.
   Nessun server: tutto avviene sui due dispositivi.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

window.TD = window.TD || {};

(function () {
  "use strict";

  const FORMATO = "tutor-digitale";
  const enc = new TextEncoder(), dec = new TextDecoder();
  const subtle = (typeof crypto !== "undefined" && crypto.subtle) ? crypto.subtle : null;

  function b64u(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function deb64u(str) {
    const s = atob(String(str).replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, ""));
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  }
  async function flusso(bytes, Classe) {
    const s = new Blob([bytes]).stream().pipeThrough(new Classe("deflate-raw"));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }
  const haCompressione = typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

  /* testo compatto: «TD1.» + JSON compresso in base64url (o «TD0.» senza compressione) */
  async function comprimi(obj) {
    const json = enc.encode(JSON.stringify(obj));
    if (haCompressione) { try { return "TD1." + b64u(await flusso(json, CompressionStream)); } catch (e) {} }
    return "TD0." + b64u(json);
  }
  async function decomprimi(codice) {
    const c = String(codice).trim();
    if (c.indexOf("TD1.") === 0) return JSON.parse(dec.decode(await flusso(deb64u(c.slice(4)), DecompressionStream)));
    if (c.indexOf("TD0.") === 0) return JSON.parse(dec.decode(deb64u(c.slice(4))));
    throw new Error("Codice non riconosciuto");
  }

  function hex(buf) { return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join(""); }
  async function hmac(segreto, testo) {
    if (!subtle || !segreto) return "";
    const k = await subtle.importKey("raw", enc.encode(segreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return hex(await subtle.sign("HMAC", k, enc.encode(testo)));
  }
  function corpo(p) { return JSON.stringify({ tipo: p.tipo, creato: p.creato, cliente: p.cliente, dati: p.dati }); }

  async function impacchetta(tipo, cliente, dati, segreto) {
    const p = { formato: FORMATO, versione: 1, tipo: tipo, creato: new Date().toISOString(), cliente: cliente, dati: dati };
    p.firma = await hmac(segreto, corpo(p));
    return p;
  }
  /* true = firma giusta · false = firma sbagliata (alterato) · null = non verificabile */
  async function verifica(p, segreto) {
    if (!p || !p.firma || !segreto || !subtle) return null;
    return (await hmac(segreto, corpo(p))) === p.firma;
  }

  /* accetta: testo JSON, codice TD0./TD1., link con «k=…» */
  async function leggi(testo) {
    let t = String(testo || "").trim();
    const m = t.match(/(?:^|[?&#])k=([A-Za-z0-9._-]+)/);
    if (m) t = m[1];
    let p;
    if (t.charAt(0) === "{") p = JSON.parse(t);
    else if (/^TD[01]\./.test(t)) p = await decomprimi(t);
    else throw new Error("Non riconosco questo contenuto: incolla il codice o scegli il file .json ricevuto.");
    if (!p || p.formato !== FORMATO || !p.tipo) throw new Error("Il file non è un pacchetto di Tutor Digitale.");
    return p;
  }
  function leggiFile(file) {
    return new Promise(function (ok, ko) {
      const r = new FileReader();
      r.onload = function () { leggi(r.result).then(ok, ko); };
      r.onerror = function () { ko(new Error("Non riesco a leggere il file.")); };
      r.readAsText(file);
    });
  }

  function file(p, nome) {
    const blob = new Blob([JSON.stringify(p, null, 1)], { type: "application/json" });
    try { return new File([blob], nome, { type: "application/json" }); } catch (e) { blob.name = nome; return blob; }
  }
  /* condivisione nativa (email, WhatsApp, Telegram…) dove c'è; altrimenti scarica */
  async function condividi(f, titolo, testo) {
    if (navigator.canShare && navigator.share) {
      try {
        if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: titolo, text: testo }); return "condiviso"; }
      } catch (e) { if (e && e.name === "AbortError") return "annullato"; }
    }
    TD.scarica(f, f.name || "pacchetto.json");
    return "scaricato";
  }
  async function copia(testo) {
    try { await navigator.clipboard.writeText(testo); return true; }
    catch (e) {
      const t = document.createElement("textarea"); t.value = testo; document.body.appendChild(t); t.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (x) {}
      t.remove(); return ok;
    }
  }
  function mailto(destinatario, oggetto, corpo) {
    return "mailto:" + encodeURIComponent(destinatario || "") + "?subject=" + encodeURIComponent(oggetto) + "&body=" + encodeURIComponent(corpo);
  }

  function segreto() { const a = new Uint8Array(18); crypto.getRandomValues(a); return b64u(a); }

  /* cifratura con PIN per l'assistenza a distanza (PBKDF2 + AES-GCM) */
  async function chiavePin(pin, sale) {
    const base = await subtle.importKey("raw", enc.encode(String(pin)), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey({ name: "PBKDF2", salt: sale, iterations: 150000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function cifraPin(pin, obj) {
    if (!subtle) throw new Error("Serve una connessione sicura (https) per la cifratura.");
    const sale = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    let dati = enc.encode(JSON.stringify(obj));
    if (haCompressione) dati = await flusso(dati, CompressionStream);
    const c = await subtle.encrypt({ name: "AES-GCM", iv: iv }, await chiavePin(pin, sale), dati);
    return "TDR." + b64u(sale) + "." + b64u(iv) + "." + b64u(new Uint8Array(c));
  }
  async function decifraPin(pin, codice) {
    const p = String(codice).trim().split(".");
    if (p[0] !== "TDR" || p.length !== 4) throw new Error("Codice di sessione non valido.");
    let chiaro;
    try { chiaro = new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: deb64u(p[2]) }, await chiavePin(pin, deb64u(p[1])), deb64u(p[3]))); }
    catch (e) { throw new Error("Password sbagliata o codice incompleto."); }
    if (haCompressione) chiaro = await flusso(chiaro, DecompressionStream);
    return JSON.parse(dec.decode(chiaro));
  }

  /* correzione automatica: domande con soluzione (lato tutor) + risposte dell'allievo */
  function correggi(domande, risposte) {
    const dettagli = domande.map(function (q, i) {
      const r = (risposte || {})[i];
      let ok = false, giusta = "", data = "";
      if (q.tipo === "seq") {
        giusta = q.giusto.map(function (s, k) { return (k + 1) + ". " + s; }).join(" · ");
        ok = Array.isArray(r) && r.join("|") === q.giusto.join("|");
        data = Array.isArray(r) ? r.map(function (s, k) { return (k + 1) + ". " + s; }).join(" · ") : "";
      } else if (q.tipo === "abbina") {
        giusta = q.termini.map(function (t, k) { return t + " = " + q.corrette[k]; }).join(" · ");
        ok = Array.isArray(r) && q.termini.every(function (_, k) { return r[k] === q.corrette[k]; });
        data = Array.isArray(r) ? q.termini.map(function (t, k) { return t + " = " + (r[k] || "—"); }).join(" · ") : "";
      } else {
        const g = q.opzioni.find(function (o) { return o.ok; });
        giusta = g ? g.t : ""; data = r == null ? "" : String(r);
        ok = r != null && r === giusta;
      }
      return { n: i + 1, testo: q.testo, proposta: q.proposta || "", tipo: q.tipo, ok: ok, data: data, giusta: giusta, spiegazione: q.spiegazione || "" };
    });
    const giuste = dettagli.filter(function (d) { return d.ok; }).length;
    return { giuste: giuste, totale: dettagli.length, perc: dettagli.length ? Math.round(100 * giuste / dettagli.length) : 0, dettagli: dettagli };
  }
  /* versione delle domande senza soluzioni, da mandare all'allievo */
  function senzaSoluzioni(domande) {
    return domande.map(function (q) {
      const o = { tipo: q.tipo, testo: q.testo, liv: q.liv, dev: q.dev };
      if (q.proposta) o.proposta = q.proposta;
      if (q.opzioni) { o.opzioni = q.opzioni.map(function (x) { return x.t; }); o.etichette = q.etichette; }
      if (q.tipo === "seq") o.passi = q.mescolato;
      if (q.tipo === "abbina") { o.termini = q.termini; o.definizioni = q.definizioni; o.etichette = q.etichette; }
      return o;
    });
  }

  TD.scambio = { comprimi: comprimi, decomprimi: decomprimi, impacchetta: impacchetta, verifica: verifica, leggi: leggi, leggiFile: leggiFile,
    file: file, condividi: condividi, copia: copia, mailto: mailto, segreto: segreto, cifraPin: cifraPin, decifraPin: decifraPin,
    correggi: correggi, senzaSoluzioni: senzaSoluzioni, sicuro: !!subtle };
})();
