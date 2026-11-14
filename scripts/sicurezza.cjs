#!/usr/bin/env node
/* ==========================================================================
   Tutor Digitale · controllo di sicurezza
   Uso:  node scripts/sicurezza.cjs            controlla e, se trova problemi, esce con errore
         node scripts/sicurezza.cjs --aggiorna  riscrive la Content-Security-Policy delle pagine
                                                 (impronte degli script in linea) e poi controlla
   Gira nei test di ogni pubblicazione e nel workflow «Controllo di sicurezza».
   Controlla:
   1. Content-Security-Policy presente in ogni pagina, con le impronte giuste degli script in linea
   2. niente eval, new Function, gestori «on…=» in linea, script o fogli di stile da altri siti
   3. collegamenti target="_blank" sempre con rel="noopener"
   4. pozzi pericolosi: href/src costruiti con dati non passati da E() o TD.urlDati()
   5. JSON.parse solo dove è ammesso (il resto passa da TD.jsonSicuro, che toglie __proto__)
   6. segreti finiti per sbaglio nel repository (token, chiavi private)
   7. workflow GitHub: azioni fissate all'impronta del commit, permessi dichiarati,
      niente testo di issue e pull request dentro i comandi
   8. versione desktop: isolamento attivo, Node disattivato, collegamenti esterni filtrati
   Codice: © 2026 Danilo D'Auria · licenza MIT
   ========================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const R = path.join(__dirname, "..");
const leggi = (f) => fs.readFileSync(path.join(R, f), "utf8");
const problemi = [];
const segnala = (f, msg) => problemi.push(f + ": " + msg);

/* ---------------------------------------------------------------- 1. CSP */
const PAGINE = ["index.html", "allievo/index.html", "verifica/index.html"];
const CANALI = ["wss://broker.hivemq.com:8884", "wss://broker.emqx.io:8084", "wss://test.mosquitto.org:8081"];
function politica(html) {
  const hash = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => "'sha256-" + crypto.createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
  return [
    "default-src 'self'",
    "script-src 'self' " + hash.join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' " + CANALI.join(" "),
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
}
const META = /<meta http-equiv="Content-Security-Policy" content="[^"]*">\n?\s*/;
PAGINE.forEach((f) => {
  let html = leggi(f);
  const attesa = politica(html.replace(META, ""));
  const tag = '<meta http-equiv="Content-Security-Policy" content="' + attesa + '">';
  if (process.argv.includes("--aggiorna")) {
    html = META.test(html) ? html.replace(META, tag + "\n  ") : html.replace(/(<meta charset="utf-8">\n)(\s*)/, "$1$2" + tag + "\n$2");
    fs.writeFileSync(path.join(R, f), html);
  }
  html = leggi(f);
  const m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/);
  if (!m) segnala(f, "manca la Content-Security-Policy (node scripts/sicurezza.cjs --aggiorna)");
  else if (m[1] !== attesa) segnala(f, "la Content-Security-Policy non corrisponde agli script in linea: rigenerala con node scripts/sicurezza.cjs --aggiorna");
  if (/<script[^>]+src="(https?:)?\/\//i.test(html)) segnala(f, "script caricato da un altro sito");
  if (/<link[^>]+rel="stylesheet"[^>]+href="(https?:)?\/\//i.test(html)) segnala(f, "foglio di stile da un altro sito");
});

/* ---------------------------------------------------------------- 2-5. codice */
const JS = fs.readdirSync(path.join(R, "assets/js")).filter((f) => f.endsWith(".js")).map((f) => "assets/js/" + f);
const PARSE_AMMESSI = { "assets/js/core.js": 2, "assets/js/relay.js": 1, "assets/js/scambio.js": 1 };
JS.concat(PAGINE).forEach((f) => {
  const t = leggi(f);
  const righe = t.split("\n");
  if (/\beval\s*\(|new\s+Function\s*\(|set(Timeout|Interval)\s*\(\s*["'`]/.test(t)) segnala(f, "eval, new Function o timer con testo: vietati");
  righe.forEach((r, i) => {
    const dove = f + ":" + (i + 1);
    if (/<[a-z][^>]*\son[a-z]+\s*=\s*\\?["']/i.test(r) && !/^\s*(\/\/|\*)/.test(r)) segnala(dove, "gestore di evento in linea (on…=): usa addEventListener o .onclick");
    if (/target=\\?["']_blank\\?["']/.test(r) && !/noopener/.test(r)) segnala(dove, 'target="_blank" senza rel="noopener"');
    /* href/src costruiti da variabili: ammessi solo E(...), TD.urlDati(...), costanti note e percorsi interni con E */
    const re = /(href|src)=\\?["']\s*'\s*\+\s*([^+]+?)\s*\+/g; let m;
    while ((m = re.exec(r))) {
      const ex = m[2].trim();
      if (/^(E|TD\.esc)\(/.test(ex) || /^TD\.URL_[A-Z]+$/.test(ex) || /^(link|URL_[A-Z]+|d\.link|f\.url|h|href|base)$/.test(ex)) continue;
      segnala(dove, m[1] + " costruito con «" + ex.slice(0, 50) + "» senza E(): rischio di iniezione");
    }
  });
  if (f.endsWith(".js")) {
    const n = (t.match(/JSON\.parse\((?!JSON\.stringify)/g) || []).length;
    if (n > (PARSE_AMMESSI[f] || 0)) segnala(f, "JSON.parse diretto (" + n + "): per i dati che arrivano da fuori usa TD.jsonSicuro");
  }
});
/* i percorsi interni «#/…' + x» devono passare da E() quando x non è un id del programma */
JS.forEach((f) => {
  leggi(f).split("\n").forEach((r, i) => {
    const re = /href=\\?["']#\/[a-z-]+\/'\s*\+\s*([^+]+?)\s*\+/g; let m;
    while ((m = re.exec(r))) {
      const ex = m[1].trim();
      if (/^E\(/.test(ex) || /^(c|x\.c|l|p|pc|g|k|d|s|x|prec|succ|cl|a)\.id$/.test(ex) || /^(id|c\.id)$/.test(ex)) continue;
      segnala(f + ":" + (i + 1), "percorso interno con «" + ex + "» non protetto");
    }
  });
});

/* ---------------------------------------------------------------- 6. segreti */
const SEGRETI = [/gh[pousr]_[A-Za-z0-9]{36}/, /github_pat_[A-Za-z0-9_]{50,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bsk-[A-Za-z0-9]{32,}/, /AIza[0-9A-Za-z_-]{35}/, /xox[baprs]-[A-Za-z0-9-]{10,}/, /"d"\s*:\s*"[A-Za-z0-9_-]{43}"/];
(function giro(dir) {
  fs.readdirSync(path.join(R, dir), { withFileTypes: true }).forEach((e) => {
    const rel = path.join(dir, e.name);
    if (/^(\.git|node_modules|dist|app)$/.test(e.name)) return;
    if (e.isDirectory()) return giro(rel);
    if (!/\.(js|cjs|json|html|md|yml|yaml|py|txt|css|webmanifest)$/.test(e.name) || rel === "scripts/sicurezza.cjs") return;
    const t = fs.readFileSync(path.join(R, rel), "utf8");
    SEGRETI.forEach((re) => { if (re.test(t)) segnala(rel, "possibile segreto o chiave privata nel repository (" + re.source.slice(0, 20) + "…)"); });
  });
})(".");

/* ---------------------------------------------------------------- 7. workflow */
const WF = ".github/workflows";
fs.readdirSync(path.join(R, WF)).filter((f) => /\.ya?ml$/.test(f)).forEach((f) => {
  const t = leggi(WF + "/" + f);
  if (!/^permissions:/m.test(t)) segnala(WF + "/" + f, "permessi del token non dichiarati");
  [...t.matchAll(/uses:\s*([^\s#]+)/g)].forEach((m) => { if (!/@[0-9a-f]{40}$/.test(m[1])) segnala(WF + "/" + f, "azione non fissata all'impronta del commit: " + m[1]); });
  if (/\$\{\{\s*github\.event\.(issue|pull_request|comment|review|head_commit)\.[a-z_.]*(title|body|message|name|label)/.test(t)) segnala(WF + "/" + f, "testo esterno interpolato nei comandi");
  if (/pull_request_target/.test(t)) segnala(WF + "/" + f, "pull_request_target: da evitare");
});
if (!fs.existsSync(path.join(R, ".github/dependabot.yml"))) segnala(".github", "manca dependabot.yml");

/* ---------------------------------------------------------------- 8. desktop */
if (fs.existsSync(path.join(R, "desktop/main.cjs"))) {
  const m = leggi("desktop/main.cjs");
  if (!/contextIsolation:\s*true/.test(m) || !/sandbox:\s*true/.test(m) || !/nodeIntegration:\s*false/.test(m)) segnala("desktop/main.cjs", "isolamento, sandbox o Node non impostati in modo sicuro");
  if (!/function apriFuori\(url\) \{\n\s*if \(ESTERNI\.test/.test(m) || (m.match(/openExternal\(/g) || []).length !== 1) segnala("desktop/main.cjs", "collegamenti esterni non filtrati: tutto deve passare da apriFuori()");
  if (!/CARTELLA \+ path\.sep/.test(m)) segnala("desktop/main.cjs", "controllo dei percorsi del protocollo tutor:// incompleto");
}

if (problemi.length) {
  console.error("✗ Controllo di sicurezza: " + problemi.length + " problemi\n  " + problemi.join("\n  "));
  process.exit(1);
}
console.log("✓ Controllo di sicurezza superato (" + PAGINE.length + " pagine, " + JS.length + " file JavaScript, workflow e desktop)");
