/* ==========================================================================
   Tutor Digitale · canale cifrato tra più dispositivi
   Un piccolo client MQTT 3.1.1 su WebSocket, senza librerie, che passa da un
   broker pubblico gratuito (HiveMQ, EMQX o Mosquitto: il primo che risponde).
   Ogni messaggio è cifrato con AES-GCM 256 con una chiave che viaggia solo nel
   QR o nel link: il broker vede soltanto testo illeggibile e il nome casuale
   della stanza. Serve alla modalità gruppo in aula e alla sincronizzazione.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

window.TD = window.TD || {};

(function () {
  "use strict";

  const BROKER = [
    "wss://broker.hivemq.com:8884/mqtt",
    "wss://broker.emqx.io:8084/mqtt",
    "wss://test.mosquitto.org:8081/mqtt"
  ];
  const RADICE = "tutordigitale/v1/";
  const enc = new TextEncoder(), dec = new TextDecoder();

  /* ------------------------------------------------------------ pacchetti MQTT */
  function lung(n) { const o = []; do { let b = n % 128; n = Math.floor(n / 128); if (n > 0) b |= 128; o.push(b); } while (n > 0); return o; }
  function str(s) { const b = enc.encode(s); return [b.length >> 8, b.length & 255].concat(Array.from(b)); }
  function pacchetto(tipo, corpo) { return new Uint8Array([tipo].concat(lung(corpo.length)).concat(corpo)); }
  function connect(idCliente, keepAlive) {
    const corpo = str("MQTT").concat([4, 2, keepAlive >> 8, keepAlive & 255]).concat(str(idCliente)); // clean session
    return pacchetto(0x10, corpo);
  }
  function subscribe(id, topic) { return pacchetto(0x82, [id >> 8, id & 255].concat(str(topic)).concat([0])); }
  function publish(topic, dati, trattieni) { return pacchetto(trattieni ? 0x31 : 0x30, str(topic).concat(Array.from(dati))); }
  /* estrae i pacchetti completi da un buffer: [{tipo, corpo}], resto */
  function leggiPacchetti(buf) {
    const out = []; let i = 0;
    while (i < buf.length) {
      let molt = 1, n = 0, j = i + 1, b;
      do { if (j >= buf.length) return { pacchetti: out, resto: buf.slice(i) }; b = buf[j++]; n += (b & 127) * molt; molt *= 128; } while (b & 128);
      if (j + n > buf.length) return { pacchetti: out, resto: buf.slice(i) };
      out.push({ tipo: buf[i] >> 4, corpo: buf.slice(j, j + n) });
      i = j + n;
    }
    return { pacchetti: out, resto: new Uint8Array(0) };
  }

  /* ------------------------------------------------------------ cifratura */
  function b64u(u) { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function deb64u(t) { const s = atob(String(t).replace(/-/g, "+").replace(/_/g, "/")); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  function nuovaChiave() { return b64u(crypto.getRandomValues(new Uint8Array(32))); }
  /* la stanza può portare il broker scelto dal monitor (b0-, b1-, b2-):
     chi apre il QR finisce sullo stesso broker, non su uno a caso */
  function nuovaStanza(indice) { const a = "abcdefghjkmnpqrstuvwxyz23456789"; const r = crypto.getRandomValues(new Uint8Array(12)); const s = Array.from(r).map(function (x) { return a[x % a.length]; }).join(""); const i = Number(indice); return i >= 0 && i < BROKER.length ? "b" + i + "-" + s : s; }
  function indiceStanza(stanza) { const m = /^b([0-9])-/.exec(String(stanza || "")); const i = m ? Number(m[1]) : -1; return i >= 0 && i < BROKER.length ? i : -1; }
  /* il broker scritto nella stanza viene provato per primo, poi gli altri a
     giro: se è giù, tutti ripiegano nello stesso ordine e restano insieme */
  function ordineBroker(stanza) {
    const i = indiceStanza(stanza);
    if (i < 0) return BROKER.slice();
    return BROKER.map(function (_, k) { return BROKER[(i + k) % BROKER.length]; });
  }
  async function chiaveAes(k) { return crypto.subtle.importKey("raw", deb64u(k), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]); }
  async function cifra(chiave, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, chiave, enc.encode(JSON.stringify(obj))));
    const out = new Uint8Array(12 + c.length); out.set(iv); out.set(c, 12); return out;
  }
  async function decifra(chiave, dati) {
    const p = await crypto.subtle.decrypt({ name: "AES-GCM", iv: dati.slice(0, 12) }, chiave, dati.slice(12));
    const testo = dec.decode(new Uint8Array(p));
    return TD.jsonSicuro ? TD.jsonSicuro(testo) : JSON.parse(testo);
  }

  /* ------------------------------------------------------------ collegamento */
  function provaBroker(url, idCliente) {
    return new Promise(function (ok, ko) {
      let ws; try { ws = new WebSocket(url, "mqtt"); } catch (e) { ko(e); return; }
      ws.binaryType = "arraybuffer";
      const t = setTimeout(function () { try { ws.close(); } catch (e) {} ko(new Error("timeout " + url)); }, 7000);
      ws.onopen = function () { ws.send(connect(idCliente, 45)); };
      ws.onerror = function () { clearTimeout(t); ko(new Error("errore " + url)); };
      let buf = new Uint8Array(0);
      ws.onmessage = function (e) {
        const n = new Uint8Array(e.data), u = new Uint8Array(buf.length + n.length); u.set(buf); u.set(n, buf.length);
        const r = leggiPacchetti(u); buf = r.resto;
        if (!r.pacchetti.length) return;               // CONNACK non ancora completo
        const p = r.pacchetti[0];
        clearTimeout(t); ws.onmessage = null; ws.onerror = null;
        if (p.tipo === 2 && p.corpo[1] === 0) { ws._resto = buf; ok(ws); }
        else { ws.close(); ko(new Error("rifiutato " + url)); }
      };
    });
  }

  /* opz: { stanza, chiave, broker?: [url], suMessaggio(obj), suStato(testo) } */
  async function collega(opz) {
    if (!window.crypto || !crypto.subtle) throw new Error("Serve una connessione sicura (https) o l'app installata.");
    const io = "td" + nuovaStanza();
    const chiave = await chiaveAes(opz.chiave);
    const elenco = opz.broker || ordineBroker(opz.stanza);
    let ws = null, usato = "";
    if (opz.connessione && opz.connessione.ws) { ws = opz.connessione.ws; usato = opz.connessione.broker || ""; }
    else for (const url of elenco) {
      try { ws = await provaBroker(url, io); usato = url; break; } catch (e) { /* prova il successivo */ }
    }
    if (!ws) throw new Error("Nessun canale raggiungibile: serve Internet su entrambi i dispositivi.");
    const topic = RADICE + opz.stanza;
    let buffer = ws._resto || new Uint8Array(0), aperto = true, idSub = 1, visti = {};
    ws.send(subscribe(idSub++, topic));
    const ping = setInterval(function () { if (ws.readyState === 1) ws.send(new Uint8Array([0xC0, 0])); }, 25000);
    ws.onmessage = async function (e) {
      const nuovo = new Uint8Array(e.data);
      if (buffer.length + nuovo.length > 2 * 1024 * 1024) { buffer = new Uint8Array(0); return; }   // pacchetto anomalo: si scarta
      const tutto = new Uint8Array(buffer.length + nuovo.length);
      tutto.set(buffer); tutto.set(nuovo, buffer.length);
      const r = leggiPacchetti(tutto); buffer = r.resto;
      for (const p of r.pacchetti) {
        if (p.tipo !== 3) continue;
        const lt = (p.corpo[0] << 8) | p.corpo[1];
        const dati = p.corpo.slice(2 + lt);
        try {
          const m = await decifra(chiave, dati);
          if (!m || m.__da === io || !opz.suMessaggio) continue;
          /* contro la ripetizione: messaggi vecchi o già visti si scartano (la casella accetta la copia conservata) */
          const eta = Math.abs(Date.now() - Number(m.__t || 0));
          if (!opz.accettaVecchi && eta > 15 * 60 * 1000) continue;
          const firma = m.__da + "|" + m.__n;
          if (visti[firma]) continue;
          visti[firma] = 1; visti._n = (visti._n || 0) + 1;
          if (visti._n > 5000) { visti = {}; }
          opz.suMessaggio(m);
        } catch (err) { /* messaggio non nostro o alterato: ignorato */ }
      }
    };
    ws.onclose = function () { clearInterval(ping); if (aperto && opz.suStato) opz.suStato("chiuso"); aperto = false; };
    if (opz.suStato) opz.suStato("collegato", usato);
    return {
      broker: usato,
      /* trattieni = il broker conserva l'ultimo messaggio e lo consegna a chi si collega dopo (casella) */
      invia: async function (obj, o) {
        if (ws.readyState !== 1) return false;
        ws.send(publish(topic, await cifra(chiave, Object.assign({}, obj, { __da: io, __t: Date.now(), __n: nuovaStanza() })), !!(o && o.trattieni)));
        return true;
      },
      chiudi: function () { aperto = false; clearInterval(ping); try { ws.send(new Uint8Array([0xE0, 0])); ws.close(); } catch (e) {} },
      aperto: function () { return ws.readyState === 1; }
    };
  }

  /* scelta del broker fatta dal monitor: la stanza nasce con l'indice scelto */
  async function scegli() {
    const io = "td" + nuovaStanza();
    for (let i = 0; i < BROKER.length; i++) {
      try { const ws = await provaBroker(BROKER[i], io); return { indice: i, broker: BROKER[i], ws: ws }; } catch (e) { /* prova il successivo */ }
    }
    return null;
  }

  TD.relay = { collega: collega, nuovaChiave: nuovaChiave, nuovaStanza: nuovaStanza, scegli: scegli, indiceStanza: indiceStanza, ordineBroker: ordineBroker, BROKER: BROKER,
    _test: { connect: connect, subscribe: subscribe, publish: publish, leggiPacchetti: leggiPacchetti, cifra: cifra, decifra: decifra, chiaveAes: chiaveAes } };
})();
