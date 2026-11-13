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
const SOLO_TUTOR = ["views-clienti.js", "views-documenti.js", "views-altro.js", "views-allievi.js"];
js.forEach((f) => {
  if (SOLO_ALLIEVO.includes(f)) return;
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
ok(htmlA.indexOf('MODO: "allievo"') > 0 && htmlA.indexOf('MODO: "allievo"') < htmlA.indexOf("core.js"), "l'app Allievo deve dichiarare la modalità prima di core.js");
const asset = [...sw.matchAll(/^\s+"([^"]+)",?$/gm)].map((m) => m[1].split("?")[0]).filter((a) => a !== "./");
asset.forEach((a) => ok(fs.existsSync(path.join(R, a)), "sw.js cita un file che non esiste: " + a));
const pkg = JSON.parse(leggi("package.json"));
ok(sw.includes('VERSION = "td-v' + pkg.version + '"'), "la versione di sw.js non coincide con package.json (" + pkg.version + ")");
ok(leggi("assets/js/core.js").includes('TD.VERSIONE = "' + pkg.version + '"'), "TD.VERSIONE diversa da package.json");
JSON.parse(leggi("manifest.webmanifest"));

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
["data-lezioni.js", "data-quiz.js", "data-documenti.js", "core.js", "pdf.js", "scambio.js", "views-lezioni.js", "views-quiz.js", "views-palestra.js", "views-clienti.js", "views-documenti.js", "views-altro.js", "views-allievi.js", "remoto.js", "qr.js"]
  .forEach((f) => vm.runInContext(leggi("assets/js/" + f), ctx, { filename: f }));
const TD = ctx.TD;

/* 4. programma delle lezioni */
ok(TD.LEZIONI.length === 40, "attese 40 lezioni, trovate " + TD.LEZIONI.length);
const ids = new Set();
TD.LEZIONI.forEach((l) => {
  ok(!ids.has(l.id), "id lezione doppio: " + l.id); ids.add(l.id);
  ok(l.obiettivi.length >= 3, l.id + ": servono 3 obiettivi");
  ok(l.passi.length >= 4, l.id + ": servono almeno 4 passi");
  ok(l.esercizi.facile && l.esercizi.medio && l.esercizi.esperto, l.id + ": mancano esercizi");
  ok(l.compito && l.compito.length > 10, l.id + ": manca il compito");
  ok(l.digcomp.every((a) => TD.DIGCOMP[a]), l.id + ": area DigComp sconosciuta");
});
TD.PERCORSI.forEach((p) => TD.LIVELLI.forEach((lv) => ok(TD.lezioniDi(p.id, lv.id).length === 2, p.id + " livello " + lv.id + ": attese 2 lezioni")));

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
Object.keys(TD.TEST_INGRESSO).forEach((k) => ok(TD.TEST_INGRESSO[k].length === 4, "test d'ingresso " + k + ": servono 4 frasi"));

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
})().then(fine, (e) => { ok(false, "scambio: " + e.stack); fine(); });

function fine() {
console.log((errori ? "✗ " : "✓ ") + (prove - errori) + "/" + prove + " verifiche superate");
process.exit(errori ? 1 : 0);
}
