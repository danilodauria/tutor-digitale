/* ==========================================================================
   Tutor Digitale · generatore di QR code (ISO/IEC 18004), modalità byte,
   versioni 1–40, correzione L o M, scelta automatica della maschera.
   Scritto per questo progetto, senza librerie: funziona anche offline.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

window.TD = window.TD || {};

(function () {
  "use strict";

  const ECC = {
    L: { bit: 1, cw: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
         bl: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25] },
    M: { bit: 0, cw: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
         bl: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49] }
  };

  function moduliDati(v) {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function codewordDati(v, e) { return Math.floor(moduliDati(v) / 8) - ECC[e].cw[v] * ECC[e].bl[v]; }

  /* aritmetica nel campo GF(256) con polinomio 0x11D */
  function mul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z & 0xFF;
  }
  function divisore(grado) {
    const r = new Array(grado).fill(0); r[grado - 1] = 1;
    let radice = 1;
    for (let i = 0; i < grado; i++) {
      for (let j = 0; j < r.length; j++) { r[j] = mul(r[j], radice); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      radice = mul(radice, 2);
    }
    return r;
  }
  function resto(dati, div) {
    const r = new Array(div.length).fill(0);
    dati.forEach(function (b) {
      const f = b ^ r.shift(); r.push(0);
      div.forEach(function (c, i) { r[i] ^= mul(c, f); });
    });
    return r;
  }

  function posAllineamento(v) {
    if (v === 1) return [];
    const n = Math.floor(v / 7) + 2;
    const passo = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
    const r = [6];
    for (let p = v * 4 + 17 - 7; r.length < n; p -= passo) r.splice(1, 0, p);
    return r;
  }

  function codifica(testo, livello) {
    const byte = Array.from(new TextEncoder().encode(String(testo)));
    let e = livello || "M", v = 1;
    // la versione più piccola che contiene i dati; se serve si scende a L
    function serve(ver) { return 4 + (ver <= 9 ? 8 : 16) + byte.length * 8; }
    for (;;) {
      if (serve(v) <= codewordDati(v, e) * 8) break;
      v++;
      if (v > 40) { if (e === "M") { e = "L"; v = 1; continue; } throw new Error("Contenuto troppo lungo per un QR code"); }
    }
    // flusso di bit
    const bit = [];
    function scrivi(val, n) { for (let i = n - 1; i >= 0; i--) bit.push((val >>> i) & 1); }
    scrivi(4, 4); scrivi(byte.length, v <= 9 ? 8 : 16);
    byte.forEach(function (b) { scrivi(b, 8); });
    const cap = codewordDati(v, e) * 8;
    scrivi(0, Math.min(4, cap - bit.length));
    scrivi(0, (8 - bit.length % 8) % 8);
    for (let p = 0xEC; bit.length < cap; p ^= 0xEC ^ 0x11) scrivi(p, 8);
    const dati = [];
    for (let i = 0; i < bit.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bit[i + j]; dati.push(b); }

    // blocchi con correzione d'errore, poi interlacciati
    const nb = ECC[e].bl[v], lecc = ECC[e].cw[v], grezzi = Math.floor(moduliDati(v) / 8);
    const corti = nb - grezzi % nb, lungCorto = Math.floor(grezzi / nb);
    const div = divisore(lecc), blocchi = [];
    for (let i = 0, k = 0; i < nb; i++) {
      const d = dati.slice(k, k + lungCorto - lecc + (i < corti ? 0 : 1)); k += d.length;
      const ecc = resto(d, div);
      if (i < corti) d.push(0);
      blocchi.push(d.concat(ecc));
    }
    const finale = [];
    for (let i = 0; i < blocchi[0].length; i++) blocchi.forEach(function (b, j) { if (i !== lungCorto - lecc || j >= corti) finale.push(b[i]); });

    // matrice
    const n = v * 4 + 17;
    const m = [], fz = [];
    for (let i = 0; i < n; i++) { m.push(new Array(n).fill(false)); fz.push(new Array(n).fill(false)); }
    function fn(x, y, s) { m[y][x] = s; fz[y][x] = true; }
    for (let i = 0; i < n; i++) { fn(6, i, i % 2 === 0); fn(i, 6, i % 2 === 0); }
    [[3, 3], [n - 4, 3], [3, n - 4]].forEach(function (c) {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy)), x = c[0] + dx, y = c[1] + dy;
        if (x >= 0 && x < n && y >= 0 && y < n) fn(x, y, d !== 2 && d !== 4);
      }
    });
    const al = posAllineamento(v), na = al.length;
    for (let i = 0; i < na; i++) for (let j = 0; j < na; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) fn(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    function formato(maschera) {
      const d = ECC[e].bit << 3 | maschera;
      let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = (d << 10 | r) ^ 0x5412;
      const g = function (i) { return ((b >>> i) & 1) !== 0; };
      for (let i = 0; i <= 5; i++) fn(8, i, g(i));
      fn(8, 7, g(6)); fn(8, 8, g(7)); fn(7, 8, g(8));
      for (let i = 9; i < 15; i++) fn(14 - i, 8, g(i));
      for (let i = 0; i < 8; i++) fn(n - 1 - i, 8, g(i));
      for (let i = 8; i < 15; i++) fn(8, n - 15 + i, g(i));
      fn(8, n - 8, true);
    }
    formato(0);
    if (v >= 7) {
      let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const b = v << 12 | r;
      for (let i = 0; i < 18; i++) { const s = ((b >>> i) & 1) !== 0, a = n - 11 + i % 3, c = Math.floor(i / 3); fn(a, c, s); fn(c, a, s); }
    }
    // dati a zig-zag
    let i = 0;
    for (let destra = n - 1; destra >= 1; destra -= 2) {
      if (destra === 6) destra = 5;
      for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
        const x = destra - j, su = ((destra + 1) & 2) === 0, y = su ? n - 1 - vert : vert;
        if (!fz[y][x] && i < finale.length * 8) { m[y][x] = ((finale[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0; i++; }
      }
    }
    // maschera con la penalità più bassa
    const MASCHERE = [
      function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; },
      function (x) { return x % 3 === 0; }, function (x, y) { return (x + y) % 3 === 0; },
      function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; }, function (x, y) { return x * y % 2 + x * y % 3 === 0; },
      function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; }, function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }
    ];
    function applica(k) { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fz[y][x] && MASCHERE[k](x, y)) m[y][x] = !m[y][x]; }
    function penalita() {
      let p = 0, scuri = 0;
      for (let a = 0; a < 2; a++) for (let y = 0; y < n; y++) {
        let run = 1, riga = "";
        for (let x = 0; x < n; x++) {
          const c = a ? m[x][y] : m[y][x]; riga += c ? "1" : "0";
          if (x && c === (a ? m[x - 1][y] : m[y][x - 1])) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
        }
        const r2 = "0000" + riga + "0000";
        for (let k = r2.indexOf("1011101"); k >= 0; k = r2.indexOf("1011101", k + 1)) {
          if (r2.substr(k - 4, 4) === "0000" || r2.substr(k + 7, 4) === "0000") p += 40;
        }
      }
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        if (m[y][x]) scuri++;
        if (x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
      }
      p += Math.floor(Math.abs(scuri * 20 - n * n * 10) / (n * n)) * 10;
      return p;
    }
    let migliore = 0, minimo = Infinity;
    for (let k = 0; k < 8; k++) { applica(k); formato(k); const p = penalita(); if (p < minimo) { minimo = p; migliore = k; } applica(k); }
    applica(migliore); formato(migliore);
    return { versione: v, livello: e, dimensione: n, moduli: m, maschera: migliore };
  }

  /* SVG nitido a qualsiasi dimensione, con margine bianco di 4 moduli */
  function svg(testo, opz) {
    opz = opz || {};
    const q = codifica(testo, opz.livello), b = 4, s = q.dimensione + b * 2;
    let d = "";
    for (let y = 0; y < q.dimensione; y++) for (let x = 0; x < q.dimensione; x++) if (q.moduli[y][x]) d += "M" + (x + b) + " " + (y + b) + "h1v1h-1z";
    return '<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + " " + s + '" role="img" aria-label="' + (opz.etichetta || "QR code") + '" shape-rendering="crispEdges"><rect width="' + s + '" height="' + s + '" fill="#fff"/><path d="' + d + '" fill="#0f1f36"/></svg>';
  }
  function canvas(testo, lato, opz) {
    const q = codifica(testo, (opz || {}).livello), b = 4, s = q.dimensione + b * 2;
    const c = document.createElement("canvas"); c.width = c.height = lato;
    const x = c.getContext("2d"), u = lato / s;
    x.fillStyle = "#fff"; x.fillRect(0, 0, lato, lato); x.fillStyle = "#0f1f36";
    for (let y = 0; y < q.dimensione; y++) for (let k = 0; k < q.dimensione; k++) if (q.moduli[y][k]) x.fillRect(Math.floor((k + b) * u), Math.floor((y + b) * u), Math.ceil(u), Math.ceil(u));
    return c;
  }
  /* entra in un QR leggibile? (oltre ~1800 caratteri il telefono fatica) */
  function adatto(testo) { return new TextEncoder().encode(String(testo)).length <= 1800; }

  TD.qr = { codifica: codifica, svg: svg, canvas: canvas, adatto: adatto };
})();
