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
js.forEach((f) => {
  ok(html.includes('src="assets/js/' + f + '"'), "index.html non carica " + f);
  ok(sw.includes('"assets/js/' + f + '"'), "sw.js non mette in cache " + f);
});
const asset = [...sw.matchAll(/^\s+"([^"]+)",?$/gm)].map((m) => m[1]).filter((a) => a !== "./");
asset.forEach((a) => ok(fs.existsSync(path.join(R, a)), "sw.js cita un file che non esiste: " + a));
const pkg = JSON.parse(leggi("package.json"));
ok(sw.includes('VERSION = "td-v' + pkg.version + '"'), "la versione di sw.js non coincide con package.json (" + pkg.version + ")");
ok(leggi("assets/js/core.js").includes('TD.VERSIONE = "' + pkg.version + '"'), "TD.VERSIONE diversa da package.json");
JSON.parse(leggi("manifest.webmanifest"));

/* 3. ambiente simulato per caricare i dati e il motore dei quiz */
const store = {};
const ctx = {
  console, Date, Math, JSON, Promise, setTimeout, clearTimeout, setInterval: () => 0, Blob: class {}, TextEncoder,
  crypto: globalThis.crypto, URL, navigator: { onLine: true },
  localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = String(v); } },
  location: { hash: "#/" }, history: { replaceState() {} },
  matchMedia: () => ({ matches: false }), addEventListener() {},
  document: { querySelectorAll: () => [], getElementById: () => null, addEventListener() {}, documentElement: { classList: { toggle() {}, add() {}, remove() {} }, setAttribute() {} }, createElement: () => ({ getContext: () => ({}) }) }
};
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
["data-lezioni.js", "data-quiz.js", "data-documenti.js", "core.js", "pdf.js", "views-lezioni.js", "views-quiz.js", "views-palestra.js", "views-clienti.js", "views-documenti.js", "views-altro.js"]
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

console.log((errori ? "✗ " : "✓ ") + (prove - errori) + "/" + prove + " verifiche superate");
process.exit(errori ? 1 : 0);
