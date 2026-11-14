#!/usr/bin/env node
/* Tutor Digitale · prepara il contenuto della versione desktop:
   copia il sito pubblicato in desktop/app, senza test e script di sviluppo.
   Uso: node scripts/prepare-desktop.cjs
   Codice: © 2026 Danilo D'Auria · licenza MIT */
"use strict";
const fs = require("fs");
const path = require("path");
const R = path.join(__dirname, "..");
const DEST = path.join(R, "desktop", "app");
const FILE = ["index.html", "manifest.webmanifest", "sw.js", "LICENSE", "LICENSE-CONTENT.md", "MARCHIO.md", "README.md", "CHANGELOG.md"];
const CARTELLE = ["assets", "allievo", "verifica"];
fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });
FILE.forEach((f) => fs.copyFileSync(path.join(R, f), path.join(DEST, f)));
CARTELLE.forEach((d) => fs.cpSync(path.join(R, d), path.join(DEST, d), { recursive: true }));
/* la versione del pacchetto segue quella del programma */
const v = JSON.parse(fs.readFileSync(path.join(R, "package.json"), "utf8")).version;
const pj = path.join(R, "desktop", "package.json");
const d = JSON.parse(fs.readFileSync(pj, "utf8"));
if (d.version !== v) { d.version = v; fs.writeFileSync(pj, JSON.stringify(d, null, 2) + "\n"); }
const conta = (p) => fs.statSync(p).isDirectory() ? fs.readdirSync(p).reduce((n, f) => n + conta(path.join(p, f)), 0) : 1;
console.log("desktop/app pronta: " + conta(DEST) + " file, versione " + v + ".");
