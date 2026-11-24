/* Tutor Digitale · verifiche automatiche (node tests/verify.cjs)
   Codice: © 2026 Danilo D'Auria · licenza MIT */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const R = path.join(__dirname, "..");
let errori = 0, prove = 0;
function ok(cond, msg) { prove++; if (!cond) { errori++; console.error("✗ " + msg); } }
function leggi(f) { return fs.readFileSync(path.join(R, f), "utf8"); }

/* 1. sintassi di tutti i file JavaScript */
const js = fs.readdirSync(path.join(R, "assets/js")).filter((f) => f.endsWith(".js"));
js.forEach((f) => { try { new vm.Script(leggi("assets/js/" + f), { filename: f }); ok(true); } catch (e) { ok(false, "sintassi " + f + ": " + e.message); } });

/* 2. index.html e service worker citano tutti i file, e i file esistono */
const html = leggi("index.html"), sw = leggi("sw.js");
const VER = JSON.parse(leggi("package.json")).version;
const SOLO_ALLIEVO = ["app-allievo.js"];
const SOLO_VERIFICA = ["verifica.js"];
const SOLO_TUTOR = ["views-clienti.js", "views-documenti.js", "views-altro.js", "views-allievi.js", "views-lavoro.js", "views-percorsi.js", "views-editor.js", "fattura.js", "sync.js", "schermo.js"];
js.forEach((f) => {
  if (SOLO_ALLIEVO.includes(f) || SOLO_VERIFICA.includes(f)) return;
  ok(html.includes('src="assets/js/' + f + '?v=' + VER + '"'), "index.html non carica " + f + " con ?v=" + VER);
  ok(sw.includes('"assets/js/' + f + '?v=' + VER + '"'), "sw.js non mette in cache " + f + " con ?v=" + VER);
});
/* app Allievo */
const htmlA = leggi("allievo/index.html"), swA = leggi("allievo/sw.js");
const jsA = [...htmlA.matchAll(/src="\.\.\/assets\/js\/([^"?]+)\?v=([^"]+)"/g)].map((m) => { ok(m[2] === VER, "allievo: " + m[1] + " ha ?v=" + m[2]); return m[1]; });
ok(jsA.includes("app-allievo.js") && jsA.includes("scambio.js") && jsA.includes("remoto.js"), "l'app Allievo non carica i suoi moduli");
ok(jsA.indexOf("app-allievo.js") < jsA.indexOf("views-lezioni.js"), "app-allievo.js deve venire prima di views-lezioni.js (pagina iniziale)");
SOLO_TUTOR.forEach((f) => ok(!jsA.includes(f), "l'app Allievo non deve contenere " + f));
jsA.forEach((f) => { ok(fs.existsSync(path.join(R, "assets/js", f)), "allievo: manca " + f); ok(swA.includes('"../assets/js/' + f + '?v=' + VER + '"'), "allievo/sw.js non mette in cache " + f); });
[...swA.matchAll(/^\s+"([^"]+)",?$/gm)].map((m) => m[1].split("?")[0]).filter((a) => a !== "./").forEach((a) => ok(fs.existsSync(path.join(R, "allievo", a)), "allievo/sw.js cita un file che non esiste: " + a));
ok(swA.includes('VERSION = "tda-v' + JSON.parse(leggi("package.json")).version + '"'), "versione di allievo/sw.js diversa da package.json");
JSON.parse(leggi("allievo/manifest.webmanifest"));
ok(jsA.includes("cerca.js"), "allievo: carica il modulo della ricerca rapida");
ok(htmlA.includes('id="cercaBtn"') && htmlA.includes('id="cercaModal"') && htmlA.includes('id="cercaNav"'), "allievo: ricerca rapida nell'intestazione e nel menu a cassetto");
ok(html.includes('id="cercaNav"'), "tutor: «Cerca nel programma» è anche nel menu a cassetto");
ok(leggi("assets/js/cerca.js").includes('getElementById("cercaNav")'), "ricerca: la voce del menu apre la finestra");
{
  const cssCerca = leggi("assets/css/styles.css");
  ok(cssCerca.includes("@media (max-width: 1180px) { .cerca-btn kbd { display: none; } }") && !/\.cerca-etichetta[^{]*\{[^}]*display:\s*none/.test(cssCerca), "ricerca: la parola Cerca resta visibile a ogni larghezza");
  ok(cssCerca.includes(".nav-cerca { display: none;") && cssCerca.includes(".nav-cerca { display: flex; }"), "ricerca: la voce del menu compare in quello a cassetto");
}
ok(htmlA.indexOf('MODO: "allievo"') > 0 && htmlA.indexOf('MODO: "allievo"') < htmlA.indexOf("core.js"), "l'app Allievo deve dichiarare la modalità prima di core.js");
const asset = [...sw.matchAll(/^\s+"([^"]+)",?$/gm)].map((m) => m[1].split("?")[0]).filter((a) => a !== "./");
asset.forEach((a) => ok(fs.existsSync(path.join(R, a)), "sw.js cita un file che non esiste: " + a));
const pkg = JSON.parse(leggi("package.json"));
ok(sw.includes('VERSION = "td-v' + pkg.version + '"'), "la versione di sw.js non coincide con package.json (" + pkg.version + ")");
ok(leggi("assets/js/core.js").includes('TD.VERSIONE = "' + pkg.version + '"'), "TD.VERSIONE diversa da package.json");
JSON.parse(leggi("manifest.webmanifest"));
/* pagina di verifica degli attestati */
const htmlV = leggi("verifica/index.html");
["scambio.js", "verifica.js"].forEach((f) => ok(htmlV.includes('src="../assets/js/' + f + '?v=' + VER + '"'), "verifica/index.html non carica " + f + " con ?v=" + VER));
ok(htmlV.includes('<span data-versione>' + VER + "</span>"), "verifica/index.html: versione diversa da package.json");
JSON.parse(leggi("verifica/chiavi.json")); JSON.parse(leggi("verifica/registro.json"));
ok(fs.existsSync(path.join(R, "scripts/build_vademecum.py")), "manca lo script del vademecum");
["", "-a4", "-libricino-a4", "-libricino-a4-solo-fronti", "-libricino-a4-solo-retri"].forEach((x) => ok(fs.existsSync(path.join(R, "assets/pdf/vademecum-tutor-digitale" + x + ".pdf")), "manca il vademecum" + x + ".pdf"));

/* 3. ambiente simulato per caricare i dati e il motore dei quiz */
const store = {};
const ctx = {
  console, Date, Math, JSON, Promise, setTimeout, clearTimeout, setInterval: () => 0, Blob: class {}, TextEncoder,
  crypto: globalThis.crypto, URL, navigator: { onLine: true }, Response, CompressionStream, DecompressionStream, TextDecoder, btoa, atob, Uint8Array, Uint32Array, ArrayBuffer, File,
  localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = String(v); } },
  location: { hash: "#/" }, history: { replaceState() {} },
  matchMedia: () => ({ matches: false }), addEventListener() {},
  document: { querySelectorAll: () => [], getElementById: () => null, addEventListener() {}, documentElement: { classList: { toggle() {}, add() {}, remove() {} }, setAttribute() {} }, createElement: () => ({ getContext: () => ({}) }) }
};
ctx.window = ctx; ctx.self = ctx; ctx.Blob = Blob;
vm.createContext(ctx);
["data-lezioni.js", "data-quiz.js", "data-documenti.js", "data-segni.js", "core.js", "pdf.js", "scambio.js", "views-lezioni.js", "views-quiz.js", "views-palestra.js", "views-clienti.js", "views-documenti.js", "views-altro.js", "views-allievi.js", "views-lavoro.js", "remoto.js", "qr.js", "relay.js", "fattura.js", "guide.js", "views-percorsi.js", "views-editor.js", "aula.js", "segni.js", "accessibilita.js", "sync.js", "casella.js", "assistente.js", "marchio.js"]
  .forEach((f) => vm.runInContext(leggi("assets/js/" + f), ctx, { filename: f }));
const TD = ctx.TD;

/* 4. programma delle lezioni */
ok(TD.LEZIONI.length === 49, "attese 49 lezioni, trovate " + TD.LEZIONI.length);
const ids = new Set();
TD.LEZIONI.forEach((l) => {
  ok(!ids.has(l.id), "id lezione doppio: " + l.id); ids.add(l.id);
  ok(l.obiettivi.length >= 3, l.id + ": servono 3 obiettivi");
  ok(l.passi.length >= 4, l.id + ": servono almeno 4 passi");
  ok(l.esercizi.facile && l.esercizi.medio && l.esercizi.esperto, l.id + ": mancano esercizi");
  ok(l.compito && l.compito.length > 10, l.id + ": manca il compito");
  ok(l.digcomp.every((a) => TD.DIGCOMP[a]), l.id + ": area DigComp sconosciuta");
});
/* almeno due lezioni per livello: un livello può averne una in più (Accessori,
   con lo scanner accanto a videochiamate e postazione) */
TD.PERCORSI.forEach((p) => TD.LIVELLI.forEach((lv) => ok(TD.lezioniDi(p.id, lv.id).length >= 2, p.id + " livello " + lv.id + ": servono almeno 2 lezioni")));

/* 5. banca delle domande */
const devs = TD.PERCORSI.map((p) => p.id);
const testi = new Set();
TD.DOMANDE.forEach((q) => {
  ok(q[0] >= 0 && q[0] <= 3, "livello non valido: " + q[2]);
  ok(devs.includes(q[1]), "percorso non valido: " + q[2]);
  ok(Array.isArray(q[4]) && q[4].length === 3, "servono 3 risposte sbagliate: " + q[2]);
  ok(!q[4].includes(q[3]), "la giusta è anche tra le sbagliate: " + q[2]);
  ok(new Set(q[4]).size === 3, "risposte sbagliate ripetute: " + q[2]);
  ok(!testi.has(q[2]), "domanda doppia: " + q[2]); testi.add(q[2]);
  ok(q[5] && q[5].length > 10, "manca la spiegazione: " + q[2]);
});
ok(TD.DOMANDE.length >= 80, "poche domande: " + TD.DOMANDE.length);
TD.COMPLETA.forEach((q) => ok(q[2].includes("___") && !q[4].includes(q[3]), "frase da completare non valida: " + q[2]));
TD.SEQUENZE.forEach((s) => ok(s[3].length >= 3 && new Set(s[3]).size === s[3].length, "sequenza non valida: " + s[2]));
TD.TRUFFE.forEach((t) => ok(typeof t[2] === "boolean" && t[3], "messaggio truffa non valido"));
TD.PERCORSI.forEach((p) => ok((TD.TEST_INGRESSO[p.id] || []).length === 4, "test d'ingresso " + p.id + ": servono 4 frasi"));
TD.PERCORSI.forEach((p) => TD.LIVELLI.forEach((lv) => ok(TD.DOMANDE.some((q) => q[1] === p.id && q[0] === lv.id), p.id + " livello " + lv.id + ": almeno una domanda")));

/* 6. quiz: domande casuali, risposta giusta che cambia posto e lettera ogni volta */
const tutteChiavi = {};
let cambiPos = 0, confronti = 0, stessaEtichetta = 0;
for (let partita = 0; partita < 40; partita++) {
  const qz = TD.generaQuiz({ liv: "", dev: "tutti", n: 15, tipi: ["mc", "vf", "completa", "seq", "abbina"], cumulativo: true });
  ok(qz.length === 15, "il quiz deve avere 15 domande, ne ha " + qz.length);
  const tipi = new Set(qz.map((q) => q.tipo));
  ok(tipi.size >= 4, "il quiz deve mescolare i tipi di domanda");
  qz.forEach((q) => {
    if (!q.opzioni) return;
    ok(q.opzioni.filter((o) => o.ok).length === 1, "una sola risposta giusta: " + q.testo);
    const pos = q.opzioni.findIndex((o) => o.ok);
    const et = q.etichette[0];
    const prima = tutteChiavi[q.key];
    if (prima && q.opzioni.length > 2) {
      confronti++;
      if (prima.pos !== pos) cambiPos++;
      if (prima.et === et) stessaEtichetta++;
    }
    tutteChiavi[q.key] = { pos, et };
  });
}
ok(confronti > 20, "troppe poche domande ripetute per misurare la rotazione (" + confronti + ")");
ok(cambiPos === confronti, "la risposta giusta deve cambiare posizione ogni volta: " + cambiPos + "/" + confronti);
ok(stessaEtichetta === 0, "lo stile delle lettere deve cambiare ogni volta: ripetuto " + stessaEtichetta + " volte");

const f = TD.generaQuiz({ liv: 0, dev: "tv", n: 5, tipi: ["mc"], cumulativo: false });
ok(f.length === 5 && f.every((q) => q.liv === 0), "filtro livello 0 non rispettato");

/* 7. codici attestato e forza password */
ok(TD.codiceValido("TD-2026-0001-" + (() => { let s = 0; const b = "TD-2026-0001"; for (let i = 0; i < b.length; i++) s += b.charCodeAt(i) * (i + 1); return s % 10; })()), "codice attestato valido rifiutato");
ok(!TD.codiceValido("TD-2026-0001-X"), "codice attestato non valido accettato");
ok(TD.forzaPassword("123456").punti < 30, "123456 deve risultare debole");
ok(TD.forzaPassword("lampada-Fiume-ottobre-gatto-73!").punti >= 70, "una frase-password lunga deve risultare molto forte");

/* 8. testi: nessun riferimento a risorse esterne caricate a runtime */
js.concat(["index.html", "assets/css/styles.css"]).forEach((f) => {
  const t = f.endsWith(".js") ? leggi("assets/js/" + f) : leggi(f);
  ok(!/<script[^>]+src="https?:/i.test(t) && !/@import\s+url\(["']?https?:/i.test(t) && !/fonts\.googleapis/i.test(t), f + " carica risorse esterne");
});

/* 8b. QR: dimensioni e versioni attese, testi lunghi e accentati */
{
  const a = TD.qr.codifica("HELLO", "M");
  ok(a.versione === 1 && a.dimensione === 21, "QR di HELLO: attesa versione 1 (21×21)");
  ok(a.moduli[0][0] === true && a.moduli[6][6] === true && a.moduli[1][1] === false, "QR: segni di posizionamento non corretti");
  const b = TD.qr.codifica("https://danilodauria.github.io/tutor-digitale/allievo/#/attiva?k=TD1." + "x".repeat(1680));
  ok(b.versione >= 30 && b.versione <= 40, "QR lungo: versione " + b.versione);
  ok(TD.qr.adatto("x".repeat(1800)) && !TD.qr.adatto("x".repeat(1801)), "soglia di leggibilità del QR");
  let troppo = false; try { TD.qr.codifica("x".repeat(3500)); } catch (e) { troppo = true; }
  ok(troppo, "un testo oltre la capacità deve essere rifiutato");
  ok(TD.qr.codifica("Città àèìòù €").dimensione > 0, "QR con caratteri accentati");
}

/* 9. scambio tutor ↔ allievo: kit senza soluzioni, firma, compressione, correzione automatica */
(async () => {
  const S = TD.scambio;
  const segreto = S.segreto();
  const domande = TD.generaQuiz({ liv: 2, dev: "tutti", n: 10, cumulativo: true });
  const pub = S.senzaSoluzioni(domande);
  const chiavi = new Set(); JSON.stringify(pub, (k, v) => { chiavi.add(k); return v; });
  ok(!["ok", "giusto", "corrette", "spiegazione", "mescolato"].some((k) => chiavi.has(k)), "il kit per l'allievo non deve contenere le soluzioni");
  ok(pub.every((q) => !q.opzioni || q.opzioni.every((o) => typeof o === "string")), "le opzioni pubbliche devono essere solo testo");
  const kit = await S.impacchetta("kit", { id: "c1" }, { consegna: { quiz: pub } }, segreto);
  const codice = await S.comprimi(kit);
  ok(codice.startsWith("TD1."), "il kit deve essere compresso");
  const letto = await S.leggi("https://x/allievo/#/attiva?k=" + codice);
  ok(JSON.stringify(letto) === JSON.stringify(kit), "il kit letto dal link deve essere identico");
  ok(await S.verifica(letto, segreto) === true, "la firma del kit deve risultare valida");
  // l'allievo risponde tutto giusto usando solo i dati pubblici
  const giuste = {};
  domande.forEach((q, i) => {
    if (q.tipo === "seq") giuste[i] = q.giusto.slice();
    else if (q.tipo === "abbina") giuste[i] = q.corrette.slice();
    else giuste[i] = q.opzioni.find((o) => o.ok).t;
    if (q.opzioni) ok(pub[i].opzioni.includes(giuste[i]), "la risposta giusta deve essere tra le opzioni pubbliche");
  });
  const risp = await S.impacchetta("risposte", { id: "c1" }, { risposte: JSON.parse(JSON.stringify(giuste)) }, segreto);
  const viaggio = await S.leggi(JSON.stringify(risp));
  ok(await S.verifica(viaggio, segreto) === true, "firma delle risposte non valida");
  const es = S.correggi(domande, viaggio.dati.risposte);
  ok(es.perc === 100 && es.totale === 10, "risposte tutte giuste devono valere 100%, risulta " + es.perc + "%");
  const sbagliate = JSON.parse(JSON.stringify(giuste)); const primo = domande.findIndex((q) => q.opzioni);
  sbagliate[primo] = domande[primo].opzioni.find((o) => !o.ok).t;
  ok(S.correggi(domande, sbagliate).giuste === 9, "una risposta sbagliata deve togliere un punto");
  ok(S.correggi(domande, {}).giuste === 0, "nessuna risposta deve valere 0");
  viaggio.dati.risposte[0] = "manomessa";
  ok(await S.verifica(viaggio, segreto) === false, "un pacchetto modificato deve essere rifiutato");
  ok(await S.verifica(risp, "altro-segreto") === false, "il segreto sbagliato deve essere rifiutato");
  const cif = await S.cifraPin("123456", { sdp: { type: "offer", sdp: "v=0" } });
  ok((await S.decifraPin("123456", cif)).sdp.sdp === "v=0", "decifratura con la password giusta");
  let rif = false; try { await S.decifraPin("654321", cif); } catch (e) { rif = true; }
  ok(rif, "la password sbagliata deve essere rifiutata");

  /* 10. backup cifrato (miglioria 5) */
  const finto = { clienti: [{ id: "c1", nome: "Maria", cognome: "Rossi", note: "dati riservati àèì" }], profilo: { nome: "Tutor" } };
  const cifB = await S.cifraBackup("lampada-fiume-ottobre", finto);
  ok(S.eBackupCifrato(cifB) && !JSON.stringify(cifB).includes("Maria") && !JSON.stringify(cifB).includes("riservati"), "il backup cifrato non deve contenere dati in chiaro");
  ok(JSON.stringify(await S.decifraBackup("lampada-fiume-ottobre", cifB)) === JSON.stringify(finto), "il backup cifrato deve tornare identico con la password giusta");
  let rifB = false; try { await S.decifraBackup("password-sbagliata", cifB); } catch (e) { rifB = true; }
  ok(rifB, "il backup cifrato deve rifiutare la password sbagliata");
  let corta = false; try { await S.cifraBackup("1234", finto); } catch (e) { corta = true; }
  ok(corta, "password troppo corta accettata");

  /* 11. firma ECDSA del tutor sui kit (miglioria 4) */
  const ch = await S.nuoveChiavi(), altre = await S.nuoveChiavi();
  ok(/^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/.test(await S.impronta(ch.pubblica)), "impronta della chiave nel formato XXXX-XXXX-XXXX-XXXX");
  const kitF = await S.firmaPacchetto(await S.impacchetta("kit", { id: "c1" }, { consegna: { quiz: pub } }, segreto), ch);
  ok((await S.verificaPacchetto(kitF)).stato === "valida", "kit firmato dal tutor: firma valida");
  const viaggioF = await S.leggi("https://x/allievo/#/attiva?k=" + await S.comprimi(kitF));
  ok((await S.verificaPacchetto(viaggioF)).stato === "valida", "la firma del tutor deve sopravvivere a compressione e link");
  viaggioF.dati.consegna.quiz = [];
  ok((await S.verificaPacchetto(viaggioF)).stato === "alterata", "kit modificato: la firma del tutor deve risultare alterata");
  const kitAltro = await S.firmaPacchetto(await S.impacchetta("kit", { id: "c1" }, { x: 1 }, segreto), altre);
  ok((await S.verificaPacchetto(kitAltro)).chiave !== ch.pubblica, "chiavi diverse devono essere riconoscibili");
  ok((await S.verificaPacchetto(kit)).stato === "assente", "kit senza firma del tutor: stato «assente»");

  /* 12. attestato con QR di verifica (miglioria 18) */
  const url = await S.firmaAttestato({ codice: "TD-2026-0001-7", intestatario: "Maria Rossi", data: "2026-11-14", livello: "Intermedio", ore: "12", percorsi: ["smartphone", "rete"], tutor: "Danilo D'Auria" }, ch);
  ok(url.indexOf(S.URL_VERIFICA + "#a=") === 0, "il link di verifica deve puntare alla pagina verifica/");
  ok(TD.qr.adatto(url) && url.length < 520, "il link di verifica deve stare in un QR piccolo e leggibile (" + url.length + " caratteri)");
  ok(TD.qr.codifica(url, "M").versione <= 15, "QR dell'attestato troppo fitto: versione " + TD.qr.codifica(url, "M").versione);
  const va = await S.verificaAttestato(url);
  ok(va.stato === "valida" && va.dati.n === "Maria Rossi" && va.dati.data === "2026-11-14" && va.dati.c === "TD-2026-0001-7", "attestato: verifica dei dati firmati");
  const parti = url.split("#a=")[1].split(".");
  const falso = S.b64u(new TextEncoder().encode(JSON.stringify([1, "TD-2026-0001-7", "Mario Bianchi", "20261114", "Intermedio", "12", "smartphone,rete", "Danilo D'Auria"])));
  ok((await S.verificaAttestato(S.URL_VERIFICA + "#a=" + falso + "." + parti[1] + "." + parti[2])).stato === "alterata", "attestato con nome cambiato: deve risultare alterato");
  ok((await S.verificaAttestato("https://x/verifica/")).stato === "illeggibile", "link senza dati: illeggibile");

  /* 13. statistiche (miglioria 10) e registro presenze (miglioria 6) */
  const dbS = { clienti: [
    { id: "a", nome: "Anna", cognome: "Bianchi", luogo: "A domicilio", citta: "Roma", completate: ["x"], quiz: [{ data: "2026-01-02", perc: 50 }, { data: "2026-02-01", perc: 80 }],
      registro: [{ data: "2026-01-10", durata: 60, importo: 30, pagato: true, stato: "svolta", argomenti: [TD.LEZIONI[0].id] }, { data: "2026-02-10", durata: 90, importo: 45, pagato: false, stato: "svolta", argomenti: [TD.LEZIONI[0].id, TD.LEZIONI[1].id] }, { data: "2026-03-01", durata: 60, stato: "pianificata" }, { data: "2025-12-01", durata: 60, importo: 30, pagato: true, stato: "svolta" }] },
    { id: "b", tipo: "ente", ragione: "Centro anziani", luogo: "Centro anziani", citta: "Roma", partecipanti: [{ id: "p1", nome: "Ugo" }, { id: "p2", nome: "Lia" }],
      registro: [{ data: "2026-01-20", ora: "10:00", durata: 120, importo: 100, pagato: true, stato: "svolta", presenti: ["p1"], argomenti: [TD.LEZIONI[0].id] }] }] };
  const st = TD.calcolaStatistiche(dbS, "2026");
  ok(st.minuti === 270 && st.incontri === 3, "statistiche: ore e incontri dell'anno (" + st.minuti + " min, " + st.incontri + ")");
  ok(st.incassato === 130 && st.daIncassare === 45, "statistiche: incassato e da incassare");
  ok(st.mesi[0].minuti === 180 && st.mesi[1].minuti === 90 && st.mesi[2].minuti === 0, "statistiche: ore per mese (pianificate escluse)");
  ok(st.argomenti[0][0] === TD.LEZIONI[0].id && st.argomenti[0][1] === 3, "statistiche: argomento più richiesto");
  ok(st.clientiAttivi === 2 && st.luoghi.length === 2 && st.citta[0][0] === "Roma" && st.citta[0][1] === 2, "statistiche: clienti per luogo e città");
  ok(JSON.stringify(st.clienti.find((c) => c.id === "a").quiz) === "[50,80]", "statistiche: andamento dei quiz in ordine di data");

  /* quiz di gruppo: i risultati dei partecipanti sono una sola sessione */
  const gc = { quiz: [
    { data: "2026-03-01", perc: 100, aula: true, sessione: "s1", nome: "Anna" },
    { data: "2026-03-01", perc: 100, aula: true, sessione: "s1", nome: "Bruno" },
    { data: "2026-03-01", perc: 100, aula: true, sessione: "s1", nome: "Carla" },
    { data: "2026-03-01", perc: 100, aula: true, sessione: "s1", nome: "Dino" },
    { data: "2026-03-02", perc: 0, individuale: true },
    { data: "2026-03-03", perc: 0, individuale: true }
  ] };
  ok(TD.quizSessioni(gc).length === 3, "quiz di gruppo: i quattro risultati sono una sola sessione");
  ok(TD.contaQuiz(gc) === 3, "quiz di gruppo: il conteggio è per sessione, non per risultato");
  ok(TD.mediaQuiz(gc) === 33, "media quiz: un quiz di gruppo pesa una volta sola (33%)");
  const gl = { quiz: [
    { data: "2026-04-01", perc: 50, aula: true },
    { data: "2026-04-01", perc: 70, aula: true },
    { data: "2026-04-02", perc: 100 }
  ] };
  ok(TD.quizSessioni(gl).length === 2 && TD.mediaQuiz(gl) === 80, "quiz di gruppo già salvati: raggruppati per data (media 80%)");
  ok(leggi("assets/js/aula.js").includes("voce.sessione = sessione"), "aula: il salvataggio lega i risultati alla stessa sessione");

  /* 13b. abbinamento dei nomi nel quiz di gruppo (1.12.0) */
  {
    ok(TD.aula.nomeChiave("  Nicolò   ROSSI ") === "nicolo rossi", "aula: nomi confrontati senza accenti, maiuscole e spazi doppi");
    const elenco = [{ id: "p1", nome: "Maria Rossi" }, { id: "p2", nome: "Nicola Bianchi" }, { id: "p3", nome: "Nicola Verdi" }];
    ok(TD.aula.trovaPartecipante("maria rossi", elenco) === "p1", "aula: nome e cognome trovano il partecipante");
    ok(TD.aula.trovaPartecipante("Maria", elenco) === "p1", "aula: il solo nome basta se è l'unico");
    ok(TD.aula.trovaPartecipante("Nicola", elenco) === "", "aula: con due omonimi non si indovina");
    ok(TD.aula.trovaPartecipante("Sconosciuto", elenco) === "" && TD.aula.trovaPartecipante("", elenco) === "", "aula: chi non è in elenco resta senza abbinamento");
    const letta = TD.aula.testoDaLeggere({ testo: "Quale tasto?", proposta: "Invio", opzioni: ["Esc", "Invio"] });
    ok(letta.indexOf("Quale tasto?") === 0 && letta.indexOf("Proposta: Invio.") > 0 && letta.indexOf("A, Esc") > 0 && letta.indexOf("B, Invio") > 0, "aula: la lettura dice domanda, proposta e risposte con la lettera");
    ok(TD.aula.testoDaLeggere(null) === "", "aula: senza domanda la lettura è vuota");
    ok(leggi("assets/js/aula.js").includes("data-part") && leggi("assets/js/aula.js").includes("TD.aula.trovaPartecipante"), "aula: la schermata finale abbina i telefoni all'elenco del gruppo");
    const aula = leggi("assets/js/aula.js");
    ok(aula.includes("corpo = abbinamentoHtml() + '<section class=\"aula-tv\"><h2>'"), "aula: l'abbinamento dei nomi viene prima del pulsante Salva");
    ok(!/\+\s*abbinamentoHtml\(\);/.test(aula), "aula: la scheda non resta dopo le azioni");
    ok(leggi("assets/js/aula.js").includes("id=\"gLeggi\"") && leggi("assets/js/aula.js").includes("id=\"aLeggi\""), "aula: la lettura ad alta voce c'è sul telefono e sul monitor");
  }

  /* 13c. esportazione dei dati di un solo cliente (1.12.0) */
  {
    const cli = { id: "exp", tipo: "persona", nome: "Elena", cognome: "Prova", registro: [{ data: "2026-05-01", durata: 60, stato: "svolta" }, { data: "2026-05-08", durata: 30, stato: "pianificata" }], compiti: [], quiz: [{ data: "2026-05-02", perc: 80 }] };
    const vecchiD = TD.db.documenti, vecchiA = TD.db.attestati;
    TD.db.documenti = [{ id: "d1", cliente: "exp" }, { id: "d2", cliente: "altro" }];
    TD.db.attestati = [{ id: "a1", cliente: "exp" }, { id: "a2", cliente: "altro" }];
    const ex = TD.datiCliente(cli);
    TD.db.documenti = vecchiD; TD.db.attestati = vecchiA;
    ok(ex.riepilogo.nome === "Elena Prova" && ex.riepilogo.lezioniSvolte === 1 && ex.riepilogo.ore === 1 && ex.riepilogo.quiz === 1 && ex.riepilogo.mediaQuiz === 80, "esporta: riepilogo del cliente (nome, lezioni svolte, ore, quiz)");
    ok(ex.documenti.length === 1 && ex.documenti[0].id === "d1" && ex.attestati.length === 1 && ex.attestati[0].id === "a1", "esporta: solo documenti e attestati di quel cliente");
    ok(ex.cliente.id === "exp" && ex.programma === "Tutor Digitale" && ex.versione === VER, "esporta: file leggibile con la versione del programma");
    ok(leggi("assets/js/views-clienti.js").includes("id=\"esportaDati\""), "esporta: il pulsante è nella scheda del cliente");
    const avviso = TD.avvisoEsportazione(cli);
    ok(avviso.indexOf("Elena Prova") >= 0 && /in chiaro/.test(avviso) && /firme/.test(avviso) && /backup cifrato/.test(avviso), "esporta: avviso chiaro su dati in chiaro e firme, con l'alternativa del backup cifrato");
    ok(leggi("assets/js/views-clienti.js").includes("if (!TD.conferma(TD.avvisoEsportazione(c))) return;"), "esporta: senza conferma il file non viene scaricato");
  }
  ok(TD.incontriDelMese(dbS.clienti[0], "2026-03", false).length === 0 && TD.incontriDelMese(dbS.clienti[0], "2026-03", true).length === 1, "presenze: incontri pianificati solo se richiesti");
  ok(TD.incontriDelMese(dbS.clienti[1], "2026-01").length === 1, "presenze: incontri del mese dell'ente");

  /* 14. percorsi su misura (7) */
  TD.PERCORSI_MODELLO.forEach((m) => {
    ok(m.incontri.length >= 2, "modello " + m.id + ": troppo pochi incontri");
    m.incontri.forEach((inc) => inc.lezioni.forEach((id) => ok(!!TD.lezione(id), "modello " + m.id + ": lezione inesistente " + id)));
  });
  {
    const cl = { id: "x", luogo: "A domicilio", partecipanti: [] };
    const r = TD.assegnaPercorso(cl, TD.PERCORSI_MODELLO[0], { dal: "2026-12-01", ogni: 7, ora: "15:00" });
    ok(r.appuntamenti === 4 && cl.registro.length === 4 && cl.registro[3].data === "2026-12-22" && cl.registro.every((x) => x.stato === "pianificata"), "percorso: 4 appuntamenti settimanali in agenda");
    ok(r.compiti === TD.lezioniPercorso(TD.PERCORSI_MODELLO[0]).length, "percorso: un compito per ogni lezione diversa (" + r.compiti + ")");
    ok(cl.compiti[0].scadenza === "2026-12-07", "percorso: scadenza del compito prima dell'incontro successivo");
    TD.assegnaPercorso(cl, TD.PERCORSI_MODELLO[0], {});
    ok(cl.compiti.length === r.compiti, "percorso: assegnare due volte non duplica i compiti aperti");
  }

  /* 14b. percorso di partenza dal test d'ingresso e riepilogo lezione (1.7.0) */
  {
    const pm = TD.percorsoDalTest({ pc: 0, smartphone: 2 }, { id: "x", nome: "Anna", cognome: "Rossi" });
    ok(pm && pm.incontri.length === 2 && pm.origine === "test" && pm.clienteId === "x", "percorso dal test: due percorsi e origine test");
    const ids = pm.incontri.reduce((a, inc) => a.concat(inc.lezioni), []);
    ok(new Set(ids).size === ids.length, "percorso dal test: nessuna lezione ripetuta");
    ok(pm.incontri.every((inc) => inc.lezioni.length >= 2 && inc.lezioni.every((id) => !!TD.lezione(id))), "percorso dal test: lezioni esistenti");
    ok(pm.incontri[0].lezioni.every((id) => TD.lezione(id).dev === "pc"), "percorso dal test: le lezioni restano nel percorso giusto");
    ok(TD.percorsoDalTest({}, null) === null, "percorso dal test: senza livelli non si crea nulla");
    ok(TD.db.impostazioni.essenziale === false, "modalità essenziale: spenta di default");

    const l0 = TD.LEZIONI[0];
    const cR = { id: "r", nome: "Anna", cognome: "Rossi", compiti: [{ id: "k1", testo: "Esercizio", lezione: l0.id, fatto: false }], registro: [
      { id: "r1", data: "2026-11-20", ora: "10:00", stato: "svolta", argomenti: [l0.id], note: "Bene" },
      { id: "r2", data: "2026-11-27", ora: "10:00", stato: "pianificata", argomenti: [] }
    ] };
    const rp = TD.riepilogoLezione(cR, cR.registro[0]);
    ok(rp.lezioni.length === 1 && rp.passi.length >= 2 && rp.compiti.length >= 1 && rp.prossimo.id === "r2", "riepilogo: lezioni, passi, compiti e prossimo incontro");
    const txt = TD.testoRiepilogo(cR, cR.registro[0]);
    ok(txt.includes("Prossimo incontro") && txt.includes("Esercizio") && txt.includes(l0.titolo), "riepilogo: testo pronto per WhatsApp");
  }

  /* 15. editor: lezioni e domande proprie (8) */
  {
    const prima = TD.LEZIONI.length, primaD = TD.DOMANDE.length;
    const lez = { id: "my-prova", dev: "pc", liv: 1, n: 9, titolo: "Lezione di prova", durata: 60, obiettivi: ["Uno"], spiegazione: ["Testo"], passi: ["A", "B"], esercizi: { facile: "f", medio: "m", esperto: "e" }, compito: "Fai la prova", digcomp: [1], immagini: [], personale: true };
    ok(TD.validaLezione(lez).length === 0 && TD.validaLezione({ titolo: "" }).length >= 3, "editor: validazione delle lezioni");
    ok(TD.validaDomanda([0, "pc", "D?", "Sì", ["No", "Forse", "Mai"], ""]).length === 0 && TD.validaDomanda([0, "pc", "D?", "Sì", ["Sì", "No", "Forse"], ""]).length === 1, "editor: validazione delle domande");
    const n = TD.importaContenuti({ formato: "tutor-digitale-contenuti", lezioni: [lez, { id: "rotta" }], domande: [[0, "pc", "Domanda nuova di prova?", "Sì", ["No", "Forse", "Mai"], "Perché sì."], [0, "pc", TD.DOMANDE[0][2], "x", ["a", "b", "c"], ""]] });
    ok(n.lezioni === 1 && n.domande === 1, "editor: importazione filtra i contenuti non validi o doppi");
    ok(TD.LEZIONI.length === prima + 1 && TD.lezioniDi("pc", 1).some((l) => l.id === "my-prova") && TD.DOMANDE.length === primaD + 1, "editor: lezioni e domande proprie entrano nel programma");
    const exp = TD.esportaContenuti();
    ok(exp.lezioni.length === 1 && exp.domande.length === 1, "editor: esportazione");
    let rif = false; try { TD.importaContenuti({ formato: "altro" }); } catch (e) { rif = true; }
    ok(rif, "editor: un file estraneo deve essere rifiutato");
    TD.db.personali = { lezioni: [], domande: [] }; TD.applicaPersonali();
    ok(TD.LEZIONI.length === prima && TD.DOMANDE.length === primaD, "editor: togliendo i contenuti propri il programma torna come prima");
  }

  /* 16. schermate guida */
  TD.GUIDE.forEach((g) => {
    ok(g.passi.length >= 2, "guida " + g.id + ": servono almeno due passi");
    g.lezioni.forEach((id) => ok(!!TD.lezione(id), "guida " + g.id + ": lezione inesistente " + id));
    g.passi.forEach((x, i) => { const svg = TD.svgPasso(x[0], x[1], i + 1); ok(svg.includes("stroke-dasharray") && svg.startsWith("<svg"), "guida " + g.id + " passo " + (i + 1) + ": manca il segno su «" + x[1] + "» in " + x[0]); });
  });
  ok(TD.GUIDE.length > 0 && new Set(TD.GUIDE.map((g) => g.id)).size === TD.GUIDE.length, "guide: id unici");
  ok(TD.GUIDE.every((g) => TD.GUIDE_DISPOSITIVI.indexOf(g.dispositivo) >= 0), "guide: ogni dispositivo ha il suo filtro");
  TD.GUIDE_DISPOSITIVI.forEach((d) => ok(TD.GUIDE.some((g) => g.dispositivo === d), "guide: almeno una per «" + d + "»"));
  /* filtro per lezione: l'elenco si ricava dalle guide, non da un numero fisso */
  const lezioniConGuide = TD.LEZIONI.filter((l) => TD.guidePer(l).length > 0);
  ok(lezioniConGuide.length >= 5, "guide: poche lezioni con guide collegate: " + lezioniConGuide.length);
  ok(lezioniConGuide.every((l) => TD.guidePer(l).every((g) => g.lezioni.indexOf(l.id) >= 0)), "guide: il filtro per lezione pesca guide non collegate");
  ok(lezioniConGuide.every((l) => TD.guidePer(l).length < TD.GUIDE.length), "guide: una lezione le mostra tutte");
  {
    const g = TD.GUIDE[0];
    ok(TD.linkPasso(g.id, 2) === "#/guida/" + g.id + "/2", "guide: link al singolo passo");
    ok(TD.linkGuida("Smart TV", g.lezioni[0], "stampa").includes("cerca=stampa"), "guide: la ricerca resta nel link");
    const solo = TD.guidaHtml(g, false, { passo: 2 });
    ok(solo.includes("guida-solo") && solo.includes(g.passi[1][2].slice(0, 12)) && !solo.includes(TD.linkPasso(g.id, 1)), "guide: pagina del singolo passo");
    ok(TD.guidaHtml(g, false).includes(TD.linkPasso(g.id, 1)), "guide: ogni passo ha il suo link");
  }

  /* 13b. cruscotto del tutor (1.7.0) */
  {
    const dbP = { attestati: [], clienti: [
      { id: "p1", nome: "Anna", cognome: "Bianchi", stato: "attivo", completate: ["x"], compiti: [{ testo: "Foto", fatto: false, scadenza: "2026-11-01" }], quiz: [{ data: "2026-11-10", perc: 40 }],
        registro: [{ data: "2026-10-01", stato: "svolta", importo: 30, pagato: false, durata: 60 }, { data: "2026-12-01", stato: "pianificata", durata: 60 }] },
      { id: "p2", nome: "Bruno", cognome: "Neri", stato: "concluso", compiti: [{ testo: "Vecchio", fatto: false, scadenza: "2026-01-01" }] }
    ] };
    const pp = TD.prioritaTutor(dbP, "2026-11-23");
    ok(pp.length === 1 && pp[0].cliente.id === "p1" && pp[0].scaduti === 1 && pp[0].daIncassare === 30, "cruscotto: solo clienti attivi con priorità");
    ok(pp[0].flags.some((f) => f.tipo === "compiti") && pp[0].flags.some((f) => f.tipo === "fermo") && pp[0].flags.some((f) => f.tipo === "quiz") && pp[0].flags.some((f) => f.tipo === "incasso"), "cruscotto: compiti, fermo, quiz e incasso");
    ok(pp[0].prossimo && pp[0].prossimo.data === "2026-12-01", "cruscotto: prossimo incontro");
    ok(pp[0].peso >= 10, "cruscotto: priorità pesata");
  }

  /* 17. fattura elettronica (11) */
  {
    const F = TD.fattura;
    ok(F.ePiva("12345678903") && !F.ePiva("12345678901") && F.eCf("RSSMRA70A41H501X") && !F.eCf("RSSMRA70A41H501"), "fattura: controllo di partita IVA e codice fiscale");
    const prof = { nome: "Danilo D'Auria", cf: "DRADNL80A01H501U", piva: "12345678903", indirizzo: "Via Roma 1", cap: "00100", citta: "Roma", provincia: "RM", regimeFiscale: "RF19" };
    const cli = { tipo: "persona", nome: "Maria", cognome: "Rossi", cf: "RSSMRA70A41H501X", indirizzo: "Via Po 2", cap: "00198", citta: "Roma" };
    const f = F.xml(prof, cli, { numero: "12/2026", data: "2026-11-14", bolloAlCliente: true }, [{ voce: "Pacchetto 5 lezioni", qta: 1, prezzo: 135 }]);
    ok(f.nomeFile === "ITDRADNL80A01H501U_05KMK.xml", "fattura: nome del file e progressivo (" + f.nomeFile + ")");
    ok(f.xml.includes("<Natura>N2.2</Natura>") && f.xml.includes("<BolloVirtuale>SI</BolloVirtuale>") && f.xml.includes("<ImportoTotaleDocumento>137.00</ImportoTotaleDocumento>") && f.xml.includes("<CodiceDestinatario>0000000</CodiceDestinatario>") && f.xml.includes("<RegimeFiscale>RF19</RegimeFiscale>"), "fattura forfettaria: natura N2.2, bollo, totale");
    const fo = F.xml(Object.assign({}, prof, { regimeFiscale: "RF01" }), cli, { numero: "1/2026", data: "2026-11-14" }, [{ voce: "Lezione", qta: 2, prezzo: 50 }]);
    ok(fo.xml.includes("<AliquotaIVA>22.00</AliquotaIVA>") && fo.xml.includes("<Imposta>22.00</Imposta>") && fo.xml.includes("<ImportoTotaleDocumento>122.00</ImportoTotaleDocumento>") && !fo.xml.includes("DatiBollo"), "fattura ordinaria: IVA 22%");
    let manca = null; try { F.xml({ nome: "X" }, cli, { numero: "1/2026", data: "2026-11-14" }, [{ voce: "a", qta: 1, prezzo: 1 }]); } catch (e) { manca = e.mancanti; }
    ok(manca && manca.length >= 3, "fattura: senza partita IVA, codice fiscale e indirizzo non si genera");
    { const sx = F.xml(prof, Object.assign({}, cli, { cognome: "Rossi & <C>" }), { numero: "2/2026", data: "2026-11-14" }, [{ voce: "Voce & <prova>", qta: 1, prezzo: 1 }]).xml; ok(sx.includes("<Cognome>Rossi &amp; &lt;C&gt;</Cognome>") && sx.includes("Voce &amp; &lt;prova&gt;"), "fattura: caratteri speciali protetti"); }
  }

  /* 18. modalità aula (12) e canale cifrato */
  {
    const qz = TD.aula.domandePubbliche(TD.generaQuiz({ liv: "", dev: "tutti", n: 8, tipi: ["mc", "vf", "completa"], cumulativo: true }));
    ok(qz.length === 8 && qz.every((q) => q.giusta >= 0 && q.giusta < q.opzioni.length && q.opzioni.every((o) => typeof o === "string")), "aula: domande pronte per la TV");
    ok(TD.aula.punti(true, 0, 30000) === 1000 && TD.aula.punti(true, 30000, 30000) === 500 && TD.aula.punti(false, 1, 30000) === 0, "aula: punteggio veloce/lento");
    const cl = TD.aula.classifica({ a: { nome: "Ugo", punti: 900, giuste: 1 }, b: { nome: "Lia", punti: 1500, giuste: 2 } });
    ok(cl[0].nome === "Lia" && cl[1].nome === "Ugo", "aula: classifica");
    ok(JSON.stringify(TD.aula.distribuzione({ a: { scelta: 1 }, b: { scelta: 1 }, c: { scelta: 3 } }, 4)) === "[0,2,0,1]", "aula: distribuzione delle risposte");
    const R = TD.relay._test;
    const pk = R.publish("tutordigitale/v1/abc", new Uint8Array(300));
    const lett = R.leggiPacchetti(new Uint8Array([...pk, ...pk.slice(0, 10)]));
    ok(lett.pacchetti.length === 1 && lett.pacchetti[0].tipo === 3 && lett.resto.length === 10, "canale: pacchetti MQTT spezzati ricomposti");
    const k1 = await R.chiaveAes(TD.relay.nuovaChiave()), k2 = await R.chiaveAes(TD.relay.nuovaChiave());
    const cif = await R.cifra(k1, { t: "ciao", x: "àè" });
    ok((await R.decifra(k1, cif)).x === "àè", "canale: cifratura e decifratura");
    let altra = false; try { await R.decifra(k2, cif); } catch (e) { altra = true; }
    ok(altra, "canale: con un'altra chiave il messaggio è illeggibile");
    /* quiz dal telefono: una sola persona, riepilogo e trasmissione sullo schermo */
    const rs = TD.aula.riepilogoSolo({ g1: { nome: "Piero", punti: 780, giuste: 6 } }, 8);
    ok(rs && rs.perc === 75 && rs.totale === 8 && rs.nome === "Piero", "aula: riepilogo del quiz individuale");
    /* chi chiude il telefono non deve tenere occupato il posto per sempre */
    ok(JSON.stringify(TD.aula.scaduti({ a: { visto: 1000 }, b: { visto: 9000 } }, 10000, 5000)) === '["a"]', "aula: chi non si annuncia più libera il posto");
    ok(TD.aula.scaduti({ a: { visto: 9500 } }, 10000, 5000).length === 0, "aula: chi si è appena annunciato resta collegato");
    ok(TD.aula.riepilogoSolo({}, 8) === null, "aula: senza partecipanti non c'è riepilogo");
    ok(TD.aula.maxPartecipanti(true, "1") === 1 && TD.aula.maxPartecipanti(true, 1) === 1 && TD.aula.maxPartecipanti(true, "4") === 4 && TD.aula.maxPartecipanti(true, "99") === 4 && TD.aula.maxPartecipanti(false, "4") === 200, "aula: limite di partecipanti (quiz dal telefono 1 o 4, aula senza limite)");
    const ind = TD.trasmissione.indirizzo("https://esempio.test/tutor-digitale/", "stanza1", "chiave1");
    ok(ind === "https://esempio.test/tutor-digitale/schermo/index.html#/schermo?s=stanza1&k=chiave1", "trasmissione: indirizzo dello schermo (" + ind + ")");
    const indA = TD.trasmissione.indirizzo("https://esempio.test/tutor-digitale/allievo/", "s2", "k2");
    ok(indA.indexOf("/tutor-digitale/schermo/index.html#/schermo?s=s2&k=k2") > 0, "trasmissione: dall'app Allievo si usa la cartella giusta (" + indA + ")");
    ok(TD.trasmissione.finestra.constructor.name === "Function", "trasmissione: la finestra si apre in modo sincrono, dentro il clic");
    ok(TD.trasmissione.dispositivo.constructor.name === "AsyncFunction", "trasmissione: il selettore dei dispositivi è un'azione separata che può attendere");
    ok(/<meta http-equiv="Content-Security-Policy"/.test(leggi("schermo/index.html")), "schermo: la pagina grande ha la Content-Security-Policy");
  }

  /* 18b. Segni e voce: comunicatore a frasi e video in lingua dei segni */
  {
    ok(TD.segni.frase(["Sì", " Grazie "]) === "Sì Grazie.", "segni: la frase mette in fila le scelte");
    ok(TD.segni.frase([]) === "" && TD.segni.frase(["Non ho capito?"]) === "Non ho capito?", "segni: frase vuota e punteggiatura");
    ok(TD.segni.durata(65) === "1:05" && TD.segni.durata(5) === "0:05" && TD.segni.durata(-3) === "0:00", "segni: durata dei video");
    ok(TD.segni.nomeVideo("LIS · Come accendere il PC", "video/webm") === "lis-come-accendere-il-pc.webm", "segni: nome del file video (" + TD.segni.nomeVideo("LIS · Come accendere il PC", "video/webm") + ")");
    ok(TD.segni.nomeVideo("", "video/mp4") === "video-lis.mp4", "segni: nome del file di riserva");
    const vv = [{ titolo: "Accendere il computer", lezioneNome: "Primi passi" }, { titolo: "Spegnere", lezioneNome: "Sicurezza" }];
    ok(TD.segni.cerca(vv, "computer").length === 1 && TD.segni.cerca(vv, "SICUREZZA").length === 1 && TD.segni.cerca(vv, "").length === 2, "segni: ricerca tra i video");
    ok(TD.SEGNI.categorie.length >= 5 && TD.SEGNI.categorie.every((c) => c.voci.length >= 5 && c.voci.every((v) => v.t && v.t.length > 3 && v.e)), "segni: frasi pronte per il comunicatore");
    ok(TD.SEGNI.rapide.some((v) => v.t === "Sì") && TD.SEGNI.rapide.some((v) => v.t === "No"), "segni: risposte rapide sì e no");
  }

  /* 19. sincronizzazione: unione di due archivi (13) */
  {
    const base = () => ({ clienti: [], documenti: [], attestati: [], percorsiMisura: [], schermate: [], personali: { lezioni: [], domande: [] }, profilo: { nome: "D" }, listino: [], eliminati: [], _oggetti: {} });
    const A = base(), B = base();
    A.clienti = [{ id: "c1", nome: "Anna", _m: 100 }, { id: "c2", nome: "Bruno", _m: 100 }, { id: "c4", nome: "Dario", _m: 100 }];
    B.clienti = [{ id: "c1", nome: "Anna Rossi", _m: 200 }, { id: "c2", nome: "Bruno vecchio", _m: 50 }, { id: "c3", nome: "Carla", _m: 150 }];
    B.eliminati = [{ k: "clienti", id: "c4", t: 300 }];
    A.eliminati = [{ k: "clienti", id: "c9", t: 500 }]; B.clienti.push({ id: "c9", nome: "Tolto da A", _m: 400 });
    B.profilo = { nome: "Danilo nuovo" }; B._oggetti.profilo = { m: 999 }; A._oggetti.profilo = { m: 10 }; A.profilo.chiavi = { privata: "x" };
    B.personali.domande = [[0, "pc", "Nuova?", "s", ["a", "b", "c"], ""]];
    const r = TD.unisciDati(A, B);
    const nomi = A.clienti.map((c) => c.nome).sort().join(",");
    ok(nomi === "Anna Rossi,Bruno,Carla", "sync: vince la modifica più recente, si aggiunge il nuovo, si toglie l'eliminato (" + nomi + ")");
    ok(r.aggiunti >= 2 && r.tolti === 1, "sync: conteggi dell'unione");
    ok(A.profilo.nome === "Danilo nuovo" && A.profilo.chiavi && A.profilo.chiavi.privata === "x", "sync: profilo più recente, chiave di firma conservata");
    ok(A.personali.domande.length === 1, "sync: domande proprie unite");
    const A2 = JSON.parse(JSON.stringify(A)); TD.unisciDati(A2, JSON.parse(JSON.stringify(A)));
    ok(JSON.stringify(A2.clienti) === JSON.stringify(A.clienti), "sync: unire due volte non cambia nulla");
    const db = base(); db.clienti = [{ id: "x1", nome: "Uno" }, { id: "x2", nome: "Due" }];
    TD.timbra(db, true); const m0 = db.clienti[0]._m;
    ok(m0 > 0 && db.clienti[0]._h, "sync: timbro di modifica");
    db.clienti.pop(); TD.timbra(db, false);
    ok(db.eliminati.some((e) => e.id === "x2"), "sync: un cliente tolto viene annotato tra gli eliminati");
  }

  /* 20. casella condivisa (14) */
  {
    const ora = 1000000000;
    const u = TD.casellaUnisci([{ id: "a", t: 1, creato: 1, titolo: "Wi-Fi" }, { id: "b", t: 1, creato: 2, scade: ora - 1, titolo: "Scaduta" }], [{ id: "a", t: 5, creato: 1, titolo: "Wi-Fi nuova" }, { id: "c", eliminata: true, t: ora }], ora);
    ok(u.find((v) => v.id === "a").titolo === "Wi-Fi nuova", "casella: vince la versione più recente");
    ok(u.find((v) => v.id === "b").eliminata === true && !u.find((v) => v.id === "b").titolo, "casella: le voci scadute si cancellano davvero");
    ok(TD.casellaUnisci([{ id: "d", t: 9, creato: 9, titolo: "x" }], [{ id: "d", eliminata: true, t: 10 }], ora).find((v) => v.id === "d").eliminata, "casella: la cancellazione arriva all'altro dispositivo");
  }

  /* 21. assistente vocale: trova la lezione giusta (15) */
  [["come mando una foto su whatsapp", "smartphone-1-1"], ["come si accende e si spegne il computer", "pc-0-1"], ["mi è arrivato un sms strano con un link", "g-sms-truffa|rete-1-2"], ["voglio attivare lo spid", "smartphone-2-1"], ["ingrandire i caratteri del tablet", "tablet-0-2|g-caratteri"], ["sottotitoli sulla tv", "tv-0-2|g-telecomando"]].forEach(([d, attesi]) => {
    const r = TD.assistenteCerca(d, 3).map((x) => x.id || x.link || x.titolo);
    ok(attesi.split("|").some((a) => r.some((x) => String(x).includes(a))), "assistente: «" + d + "» → " + attesi + " (trovato " + r.join(", ") + ")");
  });
  ok(TD.assistenteRisposta("xyzqwerty").risultati.length === 0, "assistente: domanda senza senso, nessun risultato inventato");

  /* 22. licenze per formatori (20) */
  {
    const chL = await S.nuoveChiavi();
    const lic = await TD.emettiLicenza({ numero: "TDL-2026-001", licenziatario: "Associazione Prova", email: "a@b.it", piano: "associazione", dal: "2026-11-14", al: "2027-11-14" }, chL);
    const fid = [chL.pubblica];
    ok((await TD.verificaLicenza(lic, "2026-12-01", fid)).stato === "valida", "licenza: firma valida dell'autore");
    ok((await TD.verificaLicenza(lic, "2028-01-01", fid)).stato === "scaduta", "licenza: scadenza");
    ok((await TD.verificaLicenza(lic, "2026-12-01", ["altra-chiave"])).stato === "sconosciuta", "licenza: firmata da chi non è l'autore → non riconosciuta");
    const falsa = JSON.parse(JSON.stringify(lic)); falsa.al = "2099-12-31";
    ok((await TD.verificaLicenza(falsa, "2026-12-01", fid)).stato === "alterata", "licenza: una data cambiata a mano viene scoperta");
  }
  /* 23. sicurezza dei dati che arrivano da fuori */
  {
    const p = TD.jsonSicuro('{"__proto__":{"inquinato":1},"constructor":{"x":1},"a":{"id":"x\\"><img src=x onerror=alert(1)>","lezione":"pc-0-1"},"b":[{"__proto__":{"y":1},"id":"ok_1"}]}');
    ok(({}).inquinato === undefined && !Object.prototype.hasOwnProperty.call(p, "__proto__") && !Object.prototype.hasOwnProperty.call(p, "constructor"), "sicurezza: niente inquinamento dei prototipi da JSON esterno");
    ok(TD.idOk(p.a.id) && !/[<>"]/.test(p.a.id) && p.a.lezione === "pc-0-1" && p.b[0].id === "ok_1", "sicurezza: identificativi ripuliti");
    ok(!TD.idOk("__proto__") && !TD.idOk("a b") && TD.idOk("my-abc_1"), "sicurezza: controllo degli identificativi");
    ok(TD.urlDati("javascript:alert(1)") === "" && TD.urlDati("data:text/html;base64,PHNjcmlwdD4=") === "" && TD.urlDati("data:image/svg+xml;base64,PHN2Zz4=") === "", "sicurezza: niente javascript:, HTML o SVG negli allegati");
    ok(TD.urlDati("data:image/png;base64,iVBORw0KGgo=", true) !== "" && TD.urlDati("data:application/pdf;base64,JVBERi0=", true) === "" && TD.urlDati("data:application/pdf;base64,JVBERi0=") !== "", "sicurezza: immagini e PDF ammessi dove servono");
    ok(TD.csv("=SOMMA(A1)") === "\"'=SOMMA(A1)\"" && TD.csv("+39 333") === "\"'+39 333\"" && TD.csv('Rossi "Mario"') === '"Rossi ""Mario"""', "sicurezza: niente formule eseguite nei CSV");
    ok(TD.lezioneSicura({ id: "my-x", dev: "pc", liv: 1, titolo: "T", obiettivi: ["o"], passi: ["a", "b"], immagini: [{ src: "javascript:alert(1)" }, { src: "data:image/png;base64,AAAA" }] }).immagini.length === 1, "sicurezza: immagini delle lezioni solo come data:image");
    ok(TD.lezioneSicura({ id: "pc-0-1", dev: "pc", liv: 1, titolo: "T", obiettivi: ["o"], passi: ["a", "b"] }) === null && TD.lezioneSicura({ id: "my-x", dev: "<b>", liv: 1, titolo: "T", obiettivi: ["o"], passi: ["a", "b"] }) === null, "sicurezza: lezioni con id o percorso non validi rifiutate");
    const cas = TD.casellaUnisci([], [{ id: "a1", tipo: "file", titolo: "x", file: { nome: "../../evil.exe", dati: "javascript:alert(1)" } }, { id: "a2", tipo: "file", titolo: "y", file: { nome: "a/b.pdf", dati: "data:application/pdf;base64,JVBERi0=" } }, { id: "__proto__", tipo: "nota", titolo: "z" }], 1);
    ok(cas.length === 1 && cas[0].id === "a2" && cas[0].file.nome === "a_b.pdf", "sicurezza: casella scarta file pericolosi e id strani");
    // pacchetto «a bomba»: 60 MB di zeri compressi non devono essere scompattati
    const bomba = await new Response(new Blob([new Uint8Array(60 * 1024 * 1024)]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer();
    let fermato = false; try { await S.decomprimi("TD1." + Buffer.from(bomba).toString("base64url")); } catch (e) { fermato = /grande/.test(e.message); }
    ok(fermato, "sicurezza: un pacchetto compresso enorme viene fermato");
    ok(TD.aula && typeof TD.aula.classifica === "function", "sicurezza: modulo aula presente");
  }
  /* 25. promemoria: le proposte restano elencate, numerate e con la stima */
  {
    const idee = leggi("MIGLIORIE.md");
    const voci = [...idee.matchAll(/^(\d+)\.\s+/gm)].map((m) => Number(m[1]));
    ok(voci.length >= 46 && new Set(voci).size === voci.length, "promemoria: proposte numerate tutte presenti e senza doppioni (" + voci.length + ")");
    ok(Array.from({ length: 12 }, (_, i) => 35 + i).every((n) => voci.includes(n)), "promemoria: le dodici proposte dopo la 1.11.1 sono tutte in MIGLIORIE.md");
    ok([35, 36, 37].every((n) => new RegExp("^" + n + "\\.\\s+✅", "m").test(idee)), "promemoria: le proposte realizzate nella 1.12.0 sono segnate con ✅");
    const righe = idee.split(/\r?\n/).filter((r) => /^\d+\.\s+/.test(r));
    ok(righe.filter((r) => !/^\d+\.\s+✅/.test(r)).every((r) => /★/.test(r)), "promemoria: ogni proposta aperta ha la stima ★/⏱");
    ok(fs.existsSync(path.join(R, "scripts/idee.cjs")) && leggi("scripts/idee.cjs").includes("--controlla"), "promemoria: lo script delle idee sa controllare l'elenco");
  }

  /* 24. chiave pubblica dell'autore: stessa nel programma e nel registro, impronta corretta */
  {
    const reg = JSON.parse(leggi("verifica/chiavi.json")).chiavi;
    ok(reg.length >= 1 && reg.every((k) => TD.CHIAVI_AUTORE.includes(k.chiave) || !k.editore), "chiavi: ogni chiave editore del registro è anche nel programma");
    for (const k of reg) ok(await S.impronta(k.chiave) === k.impronta, "chiavi: impronta di " + k.nome + " corretta");
    for (const k of TD.CHIAVI_AUTORE) { let buona = true; try { await crypto.subtle.importKey("raw", S.deb64u(k), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]); } catch (e) { buona = false; } ok(buona, "chiavi: chiave dell'autore valida (P-256)"); }
  }
  ok(JSON.parse(leggi("desktop/package.json")).version === VER, "desktop/package.json deve avere la versione " + VER);
})().then(fine, (e) => { ok(false, "scambio: " + e.stack); fine(); });

function fine() {
console.log((errori ? "✗ " : "✓ ") + (prove - errori) + "/" + prove + " verifiche superate");
process.exit(errori ? 1 : 0);
}
