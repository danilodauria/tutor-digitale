/* Tutor Digitale · esporta i dati del programma per il Vademecum (JSON su stdout)
   Uso: node scripts/export-data.cjs > /tmp/vademecum.json
   Codice: © 2026 Danilo D'Auria · licenza MIT */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const R = path.join(__dirname, "..");
const leggi = (f) => fs.readFileSync(path.join(R, f), "utf8");

const ctx = { console, Date, Math, JSON, window: {}, TD: {} };
ctx.window.TD = ctx.TD; ctx.self = ctx.window;
vm.createContext(ctx);
["data-lezioni.js", "data-quiz.js", "data-documenti.js"].forEach((f) => vm.runInContext(leggi("assets/js/" + f), ctx, { filename: f }));
const TD = ctx.TD;

/* CHANGELOG: sezioni «## x.y.z · data» con le loro voci */
const versioni = [];
let cur = null;
leggi("CHANGELOG.md").split(/\r?\n/).forEach((riga) => {
  const m = riga.match(/^##\s+(\d+\.\d+\.\d+)\s*·\s*(.+)$/);
  if (m) { cur = { versione: m[1], data: m[2].trim(), voci: [] }; versioni.push(cur); return; }
  if (cur && /^\s*-\s+/.test(riga)) cur.voci.push(riga.replace(/^\s*-\s+/, "").trim());
  else if (cur && /^\s{2,}\S/.test(riga) && cur.voci.length) cur.voci[cur.voci.length - 1] += " " + riga.trim();
});

const pkg = JSON.parse(leggi("package.json"));
const out = {
  versione: pkg.version,
  repo: "github.com/danilodauria/tutor-digitale",
  sito: "danilodauria.github.io/tutor-digitale",
  livelli: TD.LIVELLI.map((l) => ({ id: l.id, nome: l.nome, descr: l.descr, ore: l.ore, colore: l.colore })),
  percorsi: TD.PERCORSI.map((p) => ({ id: p.id, nome: p.nome, descr: p.descr })),
  lezioni: TD.LEZIONI.map((l) => ({ id: l.id, titolo: l.titolo, dev: l.dev, liv: l.liv, digcomp: l.digcomp })),
  listino: TD.LISTINO_BASE,
  luoghi: TD.LUOGHI,
  glossario: TD.GLOSSARIO.map((g) => ({ liv: g[0], termine: g[1], definizione: g[2] })),
  conteggi: { lezioni: TD.LEZIONI.length, domande: TD.DOMANDE.length + TD.COMPLETA.length + TD.SEQUENZE.length, truffe: TD.TRUFFE.length, glossario: TD.GLOSSARIO.length },
  versioni: versioni,
  modelli: [],
  guide: 0
};
/* percorsi modello e schermate guida: si leggono dai loro moduli senza eseguire l'interfaccia */
{
  const testoP = leggi("assets/js/views-percorsi.js");
  out.modelli = [...testoP.matchAll(/\{ id: "m-[^"]+", nome: "([^"]+)"/g)].map((m) => m[1]);
  out.guide = (leggi("assets/js/guide.js").match(/\{ id: "g-/g) || []).length;
}
process.stdout.write(JSON.stringify(out, null, 1));
