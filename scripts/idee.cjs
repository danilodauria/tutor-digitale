/* Tutor Digitale · promemoria delle idee
   Legge MIGLIORIE.md e stampa le proposte ancora aperte: a ogni giro si
   riparte dalla prima, così nessuna resta indietro.
   Uso: node scripts/idee.cjs           elenco
        node scripts/idee.cjs --controlla  esce con errore se l'elenco è rotto
   Codice: © 2026 Danilo D'Auria · licenza MIT */
"use strict";
const fs = require("fs");
const path = require("path");

let testo;
try {
  testo = fs.readFileSync(path.join(__dirname, "..", "MIGLIORIE.md"), "utf8");
} catch (e) {
  console.error("✗ manca MIGLIORIE.md: " + e.message);
  process.exit(1);
}

const voci = [];
testo.split(/\r?\n/).forEach(function (riga) {
  const m = riga.match(/^(\d+)\.\s+(.*)$/);
  if (!m) return;
  const resto = m[2];
  voci.push({
    n: Number(m[1]),
    fatto: /^✅/.test(resto),
    stima: /★/.test(resto),
    titolo: (resto.match(/\*\*(.+?)\*\*/) || [])[1] || resto.slice(0, 80)
  });
});

const numeri = voci.map(function (v) { return v.n; });
const doppi = numeri.filter(function (n, i) { return numeri.indexOf(n) !== i; });
const aperte = voci.filter(function (v) { return !v.fatto; });
const controlla = process.argv.indexOf("--controlla") >= 0;

console.log("Tutor Digitale · promemoria delle idee");
console.log("Proposte elencate: " + voci.length + " · fatte: " + (voci.length - aperte.length) + " · ancora aperte: " + aperte.length);
aperte.forEach(function (v) { console.log("  " + v.n + ". " + v.titolo); });

let errori = 0;
if (doppi.length) { console.error("✗ numeri ripetuti in MIGLIORIE.md: " + doppi.join(", ")); errori++; }
if (controlla) {
  const mancanti = Array.from({ length: 12 }, function (_, i) { return 35 + i; }).filter(function (n) { return numeri.indexOf(n) < 0; });
  if (mancanti.length) { console.error("✗ mancano le proposte del giro 1.12.0: " + mancanti.join(", ")); errori++; }
  if (testo.indexOf("## Dopo la 1.11.1 (1.12.0)") < 0) { console.error("✗ manca la sezione delle proposte dopo la 1.11.1"); errori++; }
  if (!aperte.every(function (v) { return v.stima; })) { console.error("✗ una proposta aperta non ha la stima ★/⏱"); errori++; }
  console.log(errori ? "✗ promemoria incompleto" : "✓ promemoria completo: ogni proposta ha numero e stato");
}
if (errori) process.exit(1);
if (!controlla) console.log("La prossima versione riparte dalla prima proposta aperta.");
