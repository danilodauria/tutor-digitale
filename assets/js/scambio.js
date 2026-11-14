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
  /* compressione e decompressione; in uscita al massimo 40 MB: un pacchetto «a bomba» non blocca il dispositivo */
  const LIMITE = 40 * 1024 * 1024;
  async function flusso(bytes, Classe) {
    const lettore = new Blob([bytes]).stream().pipeThrough(new Classe("deflate-raw")).getReader();
    const parti = []; let tot = 0;
    for (;;) {
      const r = await lettore.read();
      if (r.done) break;
      tot += r.value.length;
      if (tot > LIMITE) { try { lettore.cancel(); } catch (e) {} throw new Error("Pacchetto troppo grande o danneggiato."); }
      parti.push(r.value);
    }
    const out = new Uint8Array(tot); let o = 0;
    parti.forEach(function (x) { out.set(x, o); o += x.length; });
    return out;
  }
  function analizza(testo) { return TD.jsonSicuro ? TD.jsonSicuro(testo) : JSON.parse(testo); }
  const haCompressione = typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

  /* testo compatto: «TD1.» + JSON compresso in base64url (o «TD0.» senza compressione) */
  async function comprimi(obj) {
    const json = enc.encode(JSON.stringify(obj));
    if (haCompressione) { try { return "TD1." + b64u(await flusso(json, CompressionStream)); } catch (e) {} }
    return "TD0." + b64u(json);
  }
  async function decomprimi(codice) {
    const c = String(codice).trim();
    if (c.length > LIMITE) throw new Error("Codice troppo lungo.");
    if (c.indexOf("TD1.") === 0) return analizza(dec.decode(await flusso(deb64u(c.slice(4)), DecompressionStream)));
    if (c.indexOf("TD0.") === 0) return analizza(dec.decode(deb64u(c.slice(4))));
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
    if (t.charAt(0) === "{") p = analizza(t);
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
    return analizza(dec.decode(chiaro));
  }

  /* ---------------------------------------------------------- backup cifrato (5)
     PBKDF2-SHA-256 (600.000 giri, come raccomanda OWASP) + AES-GCM 256: senza password il file è illeggibile. */
  const FORMATO_BACKUP = "tutor-digitale-backup-cifrato";
  async function chiaveBackup(password, sale, giri) {
    const base = await subtle.importKey("raw", enc.encode(String(password)), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey({ name: "PBKDF2", salt: sale, iterations: giri, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function cifraBackup(password, obj) {
    if (!subtle) throw new Error("Serve una connessione sicura (https) o l'app installata per cifrare.");
    if (String(password || "").length < 8) throw new Error("La password deve avere almeno 8 caratteri.");
    const giri = 600000, sale = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    let dati = enc.encode(JSON.stringify(obj)), compresso = false;
    if (haCompressione) { try { dati = await flusso(dati, CompressionStream); compresso = true; } catch (e) {} }
    const c = await subtle.encrypt({ name: "AES-GCM", iv: iv }, await chiaveBackup(password, sale, giri), dati);
    return { formato: FORMATO_BACKUP, versione: 1, creato: new Date().toISOString(), programma: TD.VERSIONE || "",
      kdf: { nome: "PBKDF2-SHA-256", giri: giri, sale: b64u(sale) }, cifra: { nome: "AES-GCM-256", iv: b64u(iv) }, compresso: compresso, dati: b64u(new Uint8Array(c)) };
  }
  function eBackupCifrato(obj) { return !!obj && obj.formato === FORMATO_BACKUP && !!obj.dati; }
  async function decifraBackup(password, obj) {
    if (!eBackupCifrato(obj)) throw new Error("Non è un backup cifrato di Tutor Digitale.");
    if (!subtle) throw new Error("Serve una connessione sicura (https) o l'app installata per aprire il backup.");
    let chiaro;
    try {
      const giri = Math.min(5000000, Math.max(100000, Number(obj.kdf.giri) || 310000));
      const k = await chiaveBackup(password, deb64u(obj.kdf.sale), giri);
      chiaro = new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: deb64u(obj.cifra.iv) }, k, deb64u(obj.dati)));
    } catch (e) { throw new Error("Password sbagliata o file danneggiato."); }
    if (obj.compresso) chiaro = await flusso(chiaro, DecompressionStream);
    return analizza(dec.decode(chiaro));
  }

  /* ---------------------------------------------------------- firma del tutor (4)
     ECDSA P-256: la chiave privata resta nel programma del tutor, quella
     pubblica viaggia nel kit. L'app Allievo ricorda la prima chiave ricevuta
     e avvisa se un kit successivo arriva da una chiave diversa. */
  const ECDSA = { name: "ECDSA", namedCurve: "P-256" };
  const FIRMA = { name: "ECDSA", hash: "SHA-256" };
  async function nuoveChiavi() {
    if (!subtle) throw new Error("Serve una connessione sicura (https) o l'app installata.");
    const kp = await subtle.generateKey(ECDSA, true, ["sign", "verify"]);
    const pub = new Uint8Array(await subtle.exportKey("raw", kp.publicKey));
    return { pubblica: b64u(pub), privata: await subtle.exportKey("jwk", kp.privateKey), creata: new Date().toISOString() };
  }
  async function firmaTesto(chiavi, testo) {
    const k = await subtle.importKey("jwk", chiavi.privata, ECDSA, false, ["sign"]);
    return b64u(new Uint8Array(await subtle.sign(FIRMA, k, enc.encode(testo))));
  }
  async function verificaTesto(pubblica, testo, firma) {
    if (!subtle || !pubblica || !firma) return null;
    try {
      const k = await subtle.importKey("raw", deb64u(pubblica), ECDSA, false, ["verify"]);
      return await subtle.verify(FIRMA, k, deb64u(firma), enc.encode(testo));
    } catch (e) { return false; }
  }
  /* impronta leggibile della chiave pubblica: 4 gruppi da 4, es. 7F3A-91C2-0B4E-D85A */
  async function impronta(pubblica) {
    if (!subtle || !pubblica) return "";
    const h = hex(await subtle.digest("SHA-256", deb64u(pubblica))).toUpperCase();
    return h.slice(0, 4) + "-" + h.slice(4, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16);
  }
  async function firmaPacchetto(p, chiavi) {
    if (!chiavi || !chiavi.privata) return p;
    p.firmaTutor = { chiave: chiavi.pubblica, firma: await firmaTesto(chiavi, corpo(p)) };
    return p;
  }
  /* { stato: "valida" | "alterata" | "assente", chiave, impronta } */
  async function verificaPacchetto(p) {
    if (!p || !p.firmaTutor) return { stato: "assente", chiave: "", impronta: "" };
    const ok = await verificaTesto(p.firmaTutor.chiave, corpo(p), p.firmaTutor.firma);
    return { stato: ok === true ? "valida" : ok === false ? "alterata" : "assente", chiave: p.firmaTutor.chiave, impronta: await impronta(p.firmaTutor.chiave) };
  }

  /* ---------------------------------------------------------- attestato verificabile (18)
     Il QR contiene i dati essenziali dell'attestato, firmati con la chiave del
     tutor: la pagina verifica/ controlla la firma senza server né archivio. */
  const URL_VERIFICA = "https://danilodauria.github.io/tutor-digitale/verifica/";
  async function firmaAttestato(a, chiavi) {
    /* forma compatta, per un QR piccolo: [versione, codice, intestatario, data, livello, ore, percorsi, docente] */
    const dati = [1, a.codice, a.intestatario, String(a.data || "").replace(/-/g, ""), a.livello || "", String(a.ore || ""), (a.percorsi || []).join(","), a.tutor || ""];
    const corpoA = b64u(enc.encode(JSON.stringify(dati)));
    return URL_VERIFICA + "#a=" + corpoA + "." + await firmaTesto(chiavi, corpoA) + "." + chiavi.pubblica;
  }
  /* { stato: "valida" | "alterata" | "illeggibile", dati, chiave, impronta } */
  async function verificaAttestato(testo) {
    const m = String(testo || "").match(/a=([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)/);
    if (!m) return { stato: "illeggibile" };
    let dati;
    try { dati = analizza(dec.decode(deb64u(m[1]))); } catch (e) { return { stato: "illeggibile" }; }
    if (!dati || typeof dati !== "object") return { stato: "illeggibile" };
    if (Array.isArray(dati)) dati = { v: dati[0], c: dati[1], n: dati[2], d: dati[3], l: dati[4], o: dati[5], p: dati[6], t: dati[7] };
    const ok = await verificaTesto(m[3], m[1], m[2]);
    const d = String(dati.d || "");
    dati.data = d.length === 8 ? d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8) : d;
    return { stato: ok === true ? "valida" : ok === false ? "alterata" : "illeggibile", dati: dati, chiave: m[3], impronta: await impronta(m[3]) };
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
    correggi: correggi, senzaSoluzioni: senzaSoluzioni, sicuro: !!subtle,
    cifraBackup: cifraBackup, decifraBackup: decifraBackup, eBackupCifrato: eBackupCifrato,
    nuoveChiavi: nuoveChiavi, firmaTesto: firmaTesto, verificaTesto: verificaTesto, impronta: impronta,
    firmaPacchetto: firmaPacchetto, verificaPacchetto: verificaPacchetto, firmaAttestato: firmaAttestato, verificaAttestato: verificaAttestato, URL_VERIFICA: URL_VERIFICA, b64u: b64u, deb64u: deb64u };
})();
