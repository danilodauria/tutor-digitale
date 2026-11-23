/* ==========================================================================
   Tutor Digitale · schermate guida illustrate (miglioria 9)
   Schermi di telefono, iPhone, Windows e telecomando disegnati da zero in SVG
   (nessuno screenshot, nessun logo di terzi) con cerchi, frecce e numeri che
   mostrano dove toccare, passo per passo. In più: le schermate annotate dal
   tutor con l'editor (foto del dispositivo del cliente).
   Codice: © 2026 Danilo D'Auria · licenza MIT · disegni CC BY-NC-SA 4.0
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const SEGNO = "#e4572e";

  /* ------------------------------------------------------------ mattoncini SVG */
  function t(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 9) + '" fill="' + (o.fill || "#1b2333") + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + (o.bold ? ' font-weight="700"' : "") + ' font-family="system-ui,Segoe UI,Roboto,Arial,sans-serif">' + E(s) + "</text>"; }
  function r(x, y, w, h, fill, o) { o = o || {}; return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.rx == null ? 4 : o.rx) + '" fill="' + fill + '"' + (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.sw || 1) + '"' : "") + "/>"; }
  function c(x, y, rr, fill, o) { o = o || {}; return '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + fill + '"' + (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.sw || 1) + '"' : "") + "/>"; }
  function p(d, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || "none") + '" stroke="' + (o.stroke || "#1b2333") + '" stroke-width="' + (o.sw || 1.4) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }

  /* telefono: cornice 180×360, schermo da (10,14) a (170,346) */
  function telefono(contenuto, o) {
    o = o || {};
    return r(0, 0, 180, 360, "#1b2333", { rx: 24 }) + r(8, 12, 164, 336, o.sfondo || "#f4f6fb", { rx: 16 }) +
      (o.iphone ? r(66, 18, 48, 10, "#1b2333", { rx: 5 }) : c(90, 22, 3, "#1b2333")) +
      t(20, 30, "10:24", { size: 8, bold: true }) + t(160, 30, "▮▮▮ ◔", { size: 7, anchor: "end" }) +
      contenuto +
      (o.iphone ? r(60, 336, 60, 4, "#1b2333", { rx: 2 }) :
        r(8, 322, 164, 26, "#e7ebf3", { rx: 0 }) + p("M48 335 l7 -5 v10 z", { fill: "#4a5365", stroke: "#4a5365", sw: 1 }) + c(90, 335, 5, "none", { stroke: "#4a5365", sw: 1.6 }) + r(124, 330, 10, 10, "none", { stroke: "#4a5365", sw: 1.6, rx: 2 }));
  }
  function icona(x, y, col, etichetta, glifo) {
    return r(x, y, 30, 30, col, { rx: 9 }) + (glifo || "") + t(x + 15, y + 42, etichetta, { size: 7, anchor: "middle" });
  }
  function riga(y, testo, o) { o = o || {}; return r(16, y, 148, 26, "#fff", { rx: 6 }) + c(30, y + 13, 6, o.col || "#8fb3e8") + t(44, y + 16, testo, { size: 9 }) + (o.dx ? t(156, y + 16, o.dx, { size: 8, fill: "#6b7385", anchor: "end" }) : t(156, y + 16, "›", { size: 11, fill: "#6b7385", anchor: "end" })); }
  /* cornice di Windows: finestra scura con la pagina chiara dentro */
  const CORNICE = r(0, 0, 320, 210, "#1b2333", { rx: 8 }) + r(6, 6, 308, 180, "#f4f6fb", { rx: 3 });
  /* finestra di Windows: la cornice più il titolo dell'app */
  function finestra(titolo) { return CORNICE + t(18, 30, titolo, { size: 9, bold: true }); }
  /* cornice del Mac: barra dei menu in alto e finestra chiara con i tre pallini */
  const MAC = r(0, 0, 320, 210, "#dfe4ec", { rx: 8 }) +
    r(0, 0, 320, 14, "#eef1f6", { rx: 0 }) + t(12, 10, "Finder", { size: 5.8, bold: true, fill: "#4a5365" }) +
    t(44, 10, "File", { size: 5.8, fill: "#4a5365" }) + t(62, 10, "Modifica", { size: 5.8, fill: "#4a5365" }) + t(94, 10, "Vista", { size: 5.8, fill: "#4a5365" }) +
    t(306, 10, "mar 23 nov  10:24", { size: 5.4, fill: "#4a5365", anchor: "end" }) +
    r(8, 22, 304, 178, "#fff", { rx: 8, stroke: "#cfd6e4" }) +
    c(18, 32, 3.2, "#e4572e") + c(28, 32, 3.2, "#c98a24") + c(38, 32, 3.2, "#3f9a63");

  /* ------------------------------------------------------------ scene */
  const SCENE = {
    "android-home": { tipo: "telefono", disegno: function () {
      return telefono(
        t(90, 70, "10:24", { size: 26, anchor: "middle", bold: true }) + t(90, 86, "sabato 14 novembre", { size: 8, anchor: "middle", fill: "#4a5365" }) +
        icona(22, 120, "#3f9a63", "Telefono", p("M31 128 q2 8 10 12 l3 -3 l-3 -3 l-2 1 q-3 -2 -4 -5 l1 -2 l-3 -3 z", { fill: "#fff", stroke: "#fff", sw: 1 })) +
        icona(75, 120, "#2f7fc0", "Messaggi", r(81, 128, 18, 12, "#fff", { rx: 3 })) +
        icona(128, 120, "#7d55c0", "Fotocamera", c(143, 135, 6, "none", { stroke: "#fff", sw: 2 })) +
        icona(22, 180, "#5b6472", "Impostazioni", c(37, 195, 6, "none", { stroke: "#fff", sw: 3 })) +
        icona(75, 180, "#c98a24", "Negozio app", p("M83 189 h14 l-2 12 h-10 z", { fill: "#fff", stroke: "#fff", sw: 1 })) +
        icona(128, 180, "#2b7a4b", "Chat", c(143, 195, 7, "#fff")) +
        icona(22, 240, "#b23a32", "Browser", c(37, 255, 7, "none", { stroke: "#fff", sw: 2 })) +
        icona(75, 240, "#4f6b8f", "Galleria", p("M81 262 l6 -8 l5 5 l3 -3 l6 6 z", { fill: "#fff", stroke: "#fff", sw: 1 })) +
        icona(128, 240, "#1d3557", "Email", r(134, 249, 18, 12, "none", { stroke: "#fff", sw: 1.5, rx: 2 })));
    }, punti: { impostazioni: [37, 195, 22], negozio: [90, 195, 22], browser: [37, 255, 22], fotocamera: [143, 135, 22], home: [90, 335, 12], indietro: [52, 335, 12] } },

    "android-impostazioni": { tipo: "telefono", disegno: function () {
      return telefono(t(18, 58, "Impostazioni", { size: 14, bold: true }) + r(16, 66, 148, 20, "#e7ebf3", { rx: 10 }) + t(28, 79, "Cerca nelle impostazioni", { size: 8, fill: "#6b7385" }) +
        riga(96, "Wi-Fi", { col: "#2f7fc0", dx: "Casa" }) + riga(126, "Bluetooth", { col: "#2f7fc0" }) + riga(156, "Schermo", { col: "#c98a24" }) + riga(186, "Suoni", { col: "#7d55c0" }) +
        riga(216, "Accessibilità", { col: "#3f9a63" }) + riga(246, "Sicurezza", { col: "#b23a32" }) + riga(276, "Aggiornamenti", { col: "#5b6472" }));
    }, punti: { wifi: [90, 109, 0, 152, 30], schermo: [90, 169, 0, 152, 30], accessibilita: [90, 229, 0, 152, 30], sicurezza: [90, 259, 0, 152, 30], aggiornamenti: [90, 289, 0, 152, 30], cerca: [90, 76, 0, 152, 24] } },

    "android-schermo": { tipo: "telefono", disegno: function () {
      return telefono(t(18, 58, "‹  Schermo", { size: 13, bold: true }) +
        riga(72, "Luminosità", { col: "#c98a24", dx: "auto" }) + riga(102, "Tema scuro", { col: "#1d3557", dx: "spento" }) +
        r(16, 136, 148, 70, "#fff", { rx: 6 }) + t(26, 154, "Dimensione del carattere", { size: 9, bold: true }) + t(26, 176, "A", { size: 8 }) + t(150, 180, "A", { size: 15, anchor: "end" }) +
        r(38, 170, 100, 4, "#cfd6e4", { rx: 2 }) + r(38, 170, 62, 4, "#2f7fc0", { rx: 2 }) + c(100, 172, 7, "#2f7fc0") + t(90, 198, "Testo di esempio da leggere", { size: 10, anchor: "middle" }) +
        riga(214, "Zoom dello schermo", { col: "#3f9a63" }) + riga(244, "Spegnimento schermo", { col: "#5b6472", dx: "1 min" }));
    }, punti: { carattere: [100, 172, 18], zoom: [90, 227, 0, 152, 30] } },

    "android-wifi": { tipo: "telefono", disegno: function () {
      return telefono(t(18, 58, "‹  Wi-Fi", { size: 13, bold: true }) + r(16, 68, 148, 26, "#fff", { rx: 6 }) + t(26, 85, "Usa Wi-Fi", { size: 9, bold: true }) + r(134, 74, 22, 14, "#2f7fc0", { rx: 7 }) + c(149, 81, 5, "#fff") +
        t(20, 112, "RETI DISPONIBILI", { size: 7, fill: "#6b7385", bold: true }) +
        riga(120, "Casa-Rossi", { col: "#2f7fc0", dx: "🔒" }) + riga(150, "Vicino_5G", { col: "#8fb3e8", dx: "🔒" }) + riga(180, "Bar Centrale", { col: "#8fb3e8", dx: "aperta" }) +
        r(20, 222, 140, 88, "#fff", { rx: 10, stroke: "#cfd6e4" }) + t(30, 240, "Casa-Rossi", { size: 10, bold: true }) + t(30, 256, "Password", { size: 8, fill: "#6b7385" }) + r(30, 260, 120, 18, "#f4f6fb", { rx: 4, stroke: "#2f7fc0" }) + t(36, 273, "••••••••", { size: 10 }) +
        t(146, 300, "CONNETTI", { size: 8, bold: true, fill: "#2f7fc0", anchor: "end" }));
    }, punti: { interruttore: [145, 81, 14], rete: [90, 133, 0, 152, 30], password: [90, 269, 0, 128, 24], connetti: [128, 297, 0, 44, 18], aperta: [90, 193, 0, 152, 30] } },

    "android-chrome": { tipo: "telefono", disegno: function () {
      return telefono(r(14, 38, 152, 22, "#fff", { rx: 11, stroke: "#cfd6e4" }) + t(24, 52, "danilodauria.github.io/tutor…", { size: 7.5 }) + t(158, 53, "⋮", { size: 13, anchor: "end", bold: true }) +
        r(16, 70, 148, 60, "#1d3557", { rx: 8 }) + t(26, 96, "Tutor Digitale", { size: 12, fill: "#fff", bold: true }) + t(26, 112, "Lezioni di tecnologia su misura", { size: 7, fill: "#cfd6e4" }) +
        r(78, 60, 92, 150, "#fff", { rx: 6, stroke: "#cfd6e4" }) + t(88, 80, "Nuova scheda", { size: 8 }) + t(88, 102, "Cronologia", { size: 8 }) + t(88, 124, "Condividi…", { size: 8 }) +
        r(80, 134, 88, 22, "#e1eef9", { rx: 4 }) + t(88, 149, "Installa app", { size: 8.5, bold: true }) + t(88, 176, "Impostazioni", { size: 8 }) + t(88, 198, "Guida", { size: 8 }));
    }, punti: { menu: [156, 49, 12], installa: [124, 145, 0, 92, 26] } },

    "iphone-safari": { tipo: "telefono", iphone: true, disegno: function () {
      return telefono(r(16, 40, 148, 210, "#1d3557", { rx: 8 }) + t(28, 70, "Tutor Digitale", { size: 13, fill: "#fff", bold: true }) + t(28, 86, "Allievo", { size: 9, fill: "#cfd6e4" }) +
        r(28, 110, 124, 30, "#fff", { rx: 8 }) + t(90, 129, "I miei compiti", { size: 9, anchor: "middle", bold: true }) +
        r(14, 262, 152, 22, "#e7ebf3", { rx: 11 }) + t(90, 277, "danilodauria.github.io", { size: 8, anchor: "middle" }) +
        r(8, 292, 164, 40, "#f4f6fb", { rx: 0 }) + t(28, 318, "‹", { size: 16, fill: "#2f7fc0", anchor: "middle" }) + t(56, 318, "›", { size: 16, fill: "#c6cdda", anchor: "middle" }) +
        r(82, 302, 16, 16, "none", { stroke: "#2f7fc0", sw: 1.6, rx: 3 }) + p("M90 312 V296 M85 300 l5 -5 l5 5", { stroke: "#2f7fc0", sw: 1.6 }) +
        p("M120 302 h10 a3 3 0 0 1 3 3 v10 h-13 z", { stroke: "#2f7fc0", sw: 1.4 }) + r(144, 302, 14, 14, "none", { stroke: "#2f7fc0", sw: 1.4, rx: 3 }), { iphone: true });
    }, punti: { condividi: [90, 308, 16] } },

    "iphone-condividi": { tipo: "telefono", iphone: true, disegno: function () {
      return telefono(r(8, 40, 164, 290, "#c6cdda", { rx: 0 }) + r(8, 120, 164, 214, "#f4f6fb", { rx: 14 }) + t(90, 140, "Tutor Digitale · Allievo", { size: 9, anchor: "middle", bold: true }) +
        [["Copia", 162], ["Aggiungi a Elenco lettura", 192], ["Aggiungi ai Preferiti", 222], ["Aggiungi alla schermata Home", 252], ["Trova nella pagina", 282]].map(function (x) { return r(16, x[1] - 14, 148, 26, "#fff", { rx: 6 }) + t(26, x[1] + 2, x[0], { size: 8.5 }); }).join("") +
        r(140, 242, 14, 14, "none", { stroke: "#4a5365", sw: 1.4, rx: 3 }) + p("M147 245 v8 M143 249 h8", { stroke: "#4a5365", sw: 1.4 }), { iphone: true });
    }, punti: { home: [90, 251, 0, 152, 30] } },

    "windows-desktop": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#1b2333", { rx: 8 }) + r(6, 6, 308, 180, "#2f6f9e", { rx: 3 }) +
        icona(16, 16, "#c98a24", "Documenti", r(22, 25, 18, 13, "#fff", { rx: 2 })).replace(/fill="#1b2333"/g, 'fill="#fff"') +
        icona(16, 66, "#8fb3e8", "Cestino", p("M25 74 h12 l-2 16 h-8 z", { fill: "#fff", stroke: "#fff", sw: 1 })).replace(/fill="#1b2333"/g, 'fill="#fff"') +
        r(6, 166, 308, 20, "#e7ebf3", { rx: 0 }) + r(110, 169, 14, 14, "#2f7fc0", { rx: 2 }) + p("M113 172 h3 v3 h-3z M118 172 h3 v3 h-3z M113 177 h3 v3 h-3z M118 177 h3 v3 h-3z", { fill: "#fff", stroke: "#fff", sw: 0.5 }) +
        r(130, 170, 60, 12, "#fff", { rx: 6 }) + t(138, 179, "Cerca", { size: 7, fill: "#6b7385" }) + r(196, 170, 12, 12, "#c98a24", { rx: 2 }) + r(212, 170, 12, 12, "#3f9a63", { rx: 2 }) +
        t(300, 180, "10:24", { size: 7, anchor: "end" }) + r(130, 190, 60, 12, "#3a4458", { rx: 2 });
    }, punti: { start: [117, 176, 12], cerca: [160, 176, 0, 66, 18], cartella: [204, 176, 11] } },

    "windows-start": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#1b2333", { rx: 8 }) + r(6, 6, 308, 180, "#2f6f9e", { rx: 3 }) +
        r(70, 22, 180, 140, "#f4f6fb", { rx: 8 }) + r(80, 30, 160, 14, "#fff", { rx: 7 }) + t(90, 40, "Cerca app, impostazioni e file", { size: 6.5, fill: "#6b7385" }) +
        t(80, 58, "Aggiunte", { size: 7, bold: true }) +
        [0, 1, 2, 3, 4, 5].map(function (i) { const x = 84 + (i % 3) * 52, y = 66 + Math.floor(i / 3) * 34; return r(x, y, 18, 18, ["#2f7fc0", "#c98a24", "#3f9a63", "#7d55c0", "#b23a32", "#5b6472"][i], { rx: 4 }) + t(x + 9, y + 27, ["Posta", "File", "Foto", "Note", "Browser", "Impost."][i], { size: 5.5, anchor: "middle" }); }).join("") +
        r(70, 138, 180, 24, "#e7ebf3", { rx: 0 }) + c(86, 150, 6, "#8fb3e8") + t(96, 153, "Danilo", { size: 7 }) +
        c(232, 150, 6, "none", { stroke: "#1b2333", sw: 1.4 }) + p("M232 143 v6", { sw: 1.4 }) +
        r(170, 92, 72, 44, "#fff", { rx: 4, stroke: "#cfd6e4" }) + t(178, 104, "Sospendi", { size: 6.5 }) + t(178, 118, "Arresta il sistema", { size: 6.5, bold: true }) + t(178, 131, "Riavvia", { size: 6.5 }) +
        r(6, 166, 308, 20, "#e7ebf3", { rx: 0 }) + r(110, 169, 14, 14, "#2f7fc0", { rx: 2 });
    }, punti: { accensione: [232, 150, 11], arresta: [206, 115, 0, 70, 14], impostazioni: [196, 106, 12] } },

    "windows-esplora": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#1b2333", { rx: 8 }) + r(6, 6, 308, 180, "#2f6f9e", { rx: 3 }) +
        r(26, 16, 270, 146, "#fff", { rx: 6 }) + r(26, 16, 270, 18, "#e7ebf3", { rx: 6 }) + t(36, 28, "Documenti", { size: 7.5, bold: true }) +
        r(34, 40, 42, 14, "#e1eef9", { rx: 3 }) + t(38, 50, "+ Nuovo", { size: 6.5, bold: true }) + t(86, 50, "✂  ⧉  🗑  ↕ Ordina", { size: 6.5, fill: "#4a5365" }) +
        r(34, 58, 60, 98, "#f4f6fb", { rx: 3 }) + t(40, 72, "Desktop", { size: 6.5 }) + t(40, 86, "Download", { size: 6.5 }) + t(40, 100, "Documenti", { size: 6.5, bold: true }) + t(40, 114, "Immagini", { size: 6.5 }) + t(40, 128, "Chiavetta (E:)", { size: 6.5 }) +
        [["Bollette", 70], ["Lettere", 96], ["Foto viaggio", 122]].map(function (x) { return r(104, x[1] - 9, 14, 11, "#c98a24", { rx: 2 }) + t(124, x[1], x[0], { size: 6.5 }); }).join("") +
        r(34, 58, 0, 0, "none") + r(38, 41, 0, 0, "none") +
        r(40, 52, 58, 48, "#fff", { rx: 4, stroke: "#cfd6e4" }) + t(46, 64, "Cartella", { size: 6.5, bold: true }) + t(46, 77, "Documento", { size: 6.5 }) + t(46, 90, "Collegamento", { size: 6.5 }) +
        r(6, 166, 308, 20, "#e7ebf3", { rx: 0 }) + r(110, 169, 14, 14, "#2f7fc0", { rx: 2 });
    }, punti: { nuovo: [55, 47, 0, 46, 16], cartella: [69, 62, 0, 56, 14], chiavetta: [64, 125, 0, 62, 14] } },

    "stampante-pannello": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#f4f6fb", { rx: 8 }) +
        r(72, 44, 176, 14, "#fff", { rx: 2, stroke: "#cfd6e4" }) +
        r(46, 58, 228, 98, "#e7ebf3", { rx: 10, stroke: "#cfd6e4" }) +
        t(56, 74, "Stampante", { size: 8, bold: true, fill: "#6b7385" }) +
        r(56, 82, 128, 52, "#1b2333", { rx: 5 }) +
        ["Wi-Fi  spento", "Carta  OK", "Inchiostro  pieno"].map(function (x, i) { return t(64, 98 + i * 14, x, { size: 7, fill: "#9fb0c9" }); }).join("") +
        c(228, 96, 14, "#3a4458") + p("M221 92 a9 9 0 0 1 14 0 M224 97 a4 4 0 0 1 8 0", { stroke: "#fff", sw: 1.5 }) + c(228, 101, 1.6, "#fff") +
        t(228, 120, "Wi-Fi", { size: 6, anchor: "middle" }) +
        c(258, 96, 14, "#3a4458") + c(258, 96, 6, "none", { stroke: "#fff", sw: 1.6 }) + p("M258 88 v8", { stroke: "#fff", sw: 1.6 }) +
        t(258, 120, "On/Off", { size: 6, anchor: "middle" }) +
        r(72, 158, 176, 16, "#fff", { rx: 3, stroke: "#cfd6e4" }) + t(160, 169, "Vassoio della carta", { size: 6.5, fill: "#6b7385", anchor: "middle" });
    }, punti: { accensione: [258, 96, 17], wifi: [228, 96, 17] } },

    "windows-stampanti": { tipo: "pc", disegno: function () {
      return CORNICE + r(6, 6, 104, 180, "#e7ebf3", { rx: 3 }) +
        t(16, 26, "Impostazioni", { size: 8, bold: true }) +
        ["Sistema", "Bluetooth e dispositivi", "Rete e Internet", "App", "Account", "Windows Update"].map(function (x, i) {
          const on = i === 1, y = 56 + i * 20;
          return (on ? r(10, y - 12, 96, 18, "#d7e4f5", { rx: 4 }) : "") + t(16, y, x, { size: 6.6, bold: on });
        }).join("") +
        t(122, 44, "Stampanti e scanner", { size: 8.5, bold: true }) +
        r(122, 52, 96, 18, "#2f7fc0", { rx: 9 }) + t(170, 64, "+ Aggiungi dispositivo", { size: 6, fill: "#fff", anchor: "middle", bold: true }) +
        [["HP DeskJet 2700", "Wi-Fi · pronta"], ["EPSON ET-2850", "USB · pronta"], ["Microsoft Print to PDF", "stampante virtuale"]].map(function (x, i) {
          const y = 78 + i * 32;
          return r(122, y, 178, 28, "#fff", { rx: 5, stroke: "#cfd6e4" }) + r(130, y + 7, 14, 14, "#8fb3e8", { rx: 3 }) + t(152, y + 12, x[0], { size: 7, bold: true }) + t(152, y + 22, x[1], { size: 6, fill: "#6b7385" });
        }).join("");
    }, punti: { stampanti: [54, 76, 0, 96, 20] } },

    "windows-aggiungi": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#2f6f9e", { rx: 8 }) + r(46, 14, 228, 182, "#fff", { rx: 8, stroke: "#cfd6e4" }) +
        t(58, 34, "Aggiungi stampante", { size: 9, bold: true }) + t(58, 48, "Ricerca delle stampanti disponibili…", { size: 6.5, fill: "#6b7385" }) +
        [["HP DeskJet 2700", "Wi-Fi"], ["EPSON ET-2850", "Wi-Fi"], ["Microsoft Print to PDF", "virtuale"]].map(function (x, i) {
          const y = 58 + i * 32, on = i === 0;
          return r(58, y, 204, 26, on ? "#e1eef9" : "#fff", { rx: 5, stroke: on ? "#2f7fc0" : "#cfd6e4" }) +
            r(66, y + 6, 14, 14, on ? "#2f7fc0" : "#8fb3e8", { rx: 3 }) + t(88, y + 12, x[0], { size: 7.2, bold: true }) + t(88, y + 21, x[1], { size: 6, fill: "#6b7385" });
        }).join("") +
        t(58, 158, "La stampante deve essere accesa e sulla stessa rete.", { size: 6.2, fill: "#6b7385" }) +
        r(140, 166, 52, 20, "#e7ebf3", { rx: 10 }) + t(166, 179, "Annulla", { size: 6.4, anchor: "middle" }) +
        r(198, 166, 64, 20, "#2f7fc0", { rx: 10 }) + t(230, 179, "Aggiungi", { size: 6.6, fill: "#fff", anchor: "middle", bold: true });
    }, punti: { elenco: [117, 71, 0, 110, 26] } },

    "windows-prova-stampa": { tipo: "pc", disegno: function () {
      return CORNICE +
        t(18, 28, "‹  Stampanti e scanner", { size: 7.5, fill: "#2f7fc0" }) +
        r(18, 38, 284, 60, "#fff", { rx: 6, stroke: "#cfd6e4" }) + r(28, 50, 22, 22, "#2f7fc0", { rx: 5 }) +
        t(60, 58, "HP DeskJet 2700", { size: 9, bold: true }) + t(60, 72, "Wi-Fi · pronta · predefinita", { size: 6.5, fill: "#6b7385" }) +
        t(60, 86, "Inchiostro nero 80% · colore 65%", { size: 6.5, fill: "#6b7385" }) +
        ["Preferenze di stampa", "Imposta come predefinita", "Stampa pagina di prova", "Apri la coda di stampa"].map(function (x, i) {
          const y = 106 + i * 20, prova = i === 2;
          return r(18, y, 200, 17, prova ? "#e1eef9" : "#fff", { rx: 4, stroke: prova ? "#2f7fc0" : "#cfd6e4" }) + t(26, y + 12, x, { size: 6.8, bold: prova });
        }).join("");
    }, punti: { prova: [118, 154, 0, 200, 17] } },

    "mac-stampanti": { tipo: "pc", disegno: function () {
      return MAC +
        r(8, 42, 92, 158, "#f2f5fa", { rx: 6 }) +
        ["Wi-Fi", "Bluetooth", "Rete", "Suoni", "Notifiche", "Stampanti e scanner", "Batteria"].map(function (x, i) {
          const on = i === 5, y = 48 + i * 20;
          return (on ? r(12, y, 84, 17, "#2f7fc0", { rx: 5 }) : "") + t(20, y + 12, x, { size: 6, bold: on, fill: on ? "#fff" : "#1b2333" });
        }).join("") +
        t(112, 50, "Stampanti e scanner", { size: 9, bold: true }) +
        t(112, 64, "Le stampanti collegate al Mac compaiono qui.", { size: 6, fill: "#6b7385" }) +
        r(112, 112, 188, 54, "#f4f6fb", { rx: 6, stroke: "#cfd6e4" }) +
        r(122, 122, 22, 22, "#2f7fc0", { rx: 5 }) + r(127, 126, 12, 5, "#fff", { rx: 1 }) + r(125, 134, 16, 4, "#fff", { rx: 1 }) +
        t(152, 129, "HP DeskJet 2700", { size: 7.2, bold: true }) + t(152, 140, "Pronta · Predefinita", { size: 6, fill: "#3f9a63" }) +
        t(152, 151, "Wi-Fi · Ultima stampa: oggi", { size: 6, fill: "#6b7385" }) +
        r(112, 174, 188, 18, "#e1eef9", { rx: 6 }) + t(206, 187, "+ Aggiungi stampante, scanner o fax…", { size: 6.4, fill: "#2f7fc0", anchor: "middle", bold: true });
    }, punti: { stampanti: [54, 156.5, 0, 84, 17] } },

    "mac-aggiungi": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#c9d2e0", { rx: 8 }) +
        r(40, 38, 240, 158, "#fff", { rx: 10 }) +
        t(56, 60, "Aggiungi stampante, scanner o fax", { size: 8.2, bold: true }) +
        t(56, 74, "Ricerca dei dispositivi sulla rete Wi-Fi…", { size: 6, fill: "#6b7385" }) +
        t(56, 104, "Deve essere accesa e sulla stessa rete.", { size: 6, fill: "#6b7385" }) +
        [["HP DeskJet 2700", "Wi-Fi · Bonjour", "#2f7fc0"], ["EPSON ET-2850", "Wi-Fi · Bonjour", "#8fb3e8"], ["HP LaserJet M110", "USB · collegata", "#3f9a63"]].map(function (x, i) {
          const on = i === 0, y = 124 + i * 24;
          return r(56, y, 208, 22, on ? "#e1eef9" : "#fff", { rx: 4, stroke: on ? "#2f7fc0" : "#cfd6e4" }) +
            r(64, y + 5, 12, 12, x[2], { rx: 3 }) + t(82, y + 14, x[0], { size: 7, bold: true }) + t(180, y + 14, x[1], { size: 5.6, fill: "#6b7385", anchor: "end" });
        }).join("");
    }, punti: { elenco: [148, 135, 0, 144, 22] } },

    "mac-prova-stampa": { tipo: "pc", disegno: function () {
      return MAC +
        t(20, 48, "‹  Stampanti e scanner", { size: 6.6, fill: "#2f7fc0" }) +
        r(20, 56, 284, 50, "#f4f6fb", { rx: 6, stroke: "#cfd6e4" }) +
        r(30, 66, 24, 24, "#2f7fc0", { rx: 5 }) + r(35, 71, 14, 5, "#fff", { rx: 1 }) + r(33, 80, 18, 5, "#fff", { rx: 1 }) +
        t(64, 74, "HP DeskJet 2700", { size: 7.6, bold: true }) + t(64, 85, "Wi-Fi · Pronta · Predefinita", { size: 6, fill: "#3f9a63" }) +
        t(64, 96, "Inchiostro nero 80% · colore 65%", { size: 6, fill: "#6b7385" }) +
        r(20, 116, 96, 20, "#fff", { rx: 5, stroke: "#cfd6e4" }) + t(68, 129, "Stampante ▾", { size: 6.4, anchor: "middle" }) +
        r(20, 136, 150, 60, "#fff", { rx: 6, stroke: "#cfd6e4" }) +
        ["Preferenze di stampa…", "Stampa pagina di prova…", "Rimuovi stampante…"].map(function (x, i) {
          const prova = i === 1, y = 140 + i * 18;
          return (prova ? r(24, y - 2, 142, 18, "#e1eef9", { rx: 4 }) : "") + t(32, y + 10, x, { size: 6, bold: prova });
        }).join("");
    }, punti: { prova: [95, 164, 0, 142, 16] } },

    "scanner-vetro": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#f4f6fb", { rx: 8 }) +
        r(48, 40, 224, 20, "#dfe6f1", { rx: 8, stroke: "#cfd6e4" }) +
        r(48, 62, 224, 108, "#e7ebf3", { rx: 12, stroke: "#cfd6e4" }) +
        r(66, 78, 188, 78, "#cdd9e8", { rx: 5 }) +
        r(108, 84, 100, 66, "#fff", { rx: 2, stroke: "#cfd6e4" }) +
        [0, 1, 2, 3].map(function (i) { return r(118, 96 + i * 12, 76 - i * 8, 4, "#cfd6e4", { rx: 2 }); }).join("") +
        t(160, 188, "Foglio sul vetro, testo verso il vetro", { size: 6.4, anchor: "middle", fill: "#6b7385" });
    }, punti: { foglio: [158, 116, 0, 100, 66] } },

    "scanner-tavolo": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#f4f6fb", { rx: 8 }) +
        r(96, 34, 128, 34, "#fff", { rx: 2, stroke: "#cfd6e4" }) +
        r(40, 66, 240, 92, "#dfe6f1", { rx: 10, stroke: "#cfd6e4" }) +
        r(40, 66, 240, 12, "#c6cdda", { rx: 4 }) +
        p("M160 71 v17", { stroke: "#2f7fc0", sw: 2.4 }) + p("M153 80 l7 9 l7 -9", { stroke: "#2f7fc0", sw: 2.4 }) +
        r(56, 96, 208, 6, "#c6cdda", { rx: 3 }) +
        r(56, 132, 34, 14, "#e4572e", { rx: 3 }) + t(96, 143, "blocco del carrello", { size: 6, fill: "#6b7385" }) +
        c(262, 138, 12, "#3a4458") + c(262, 138, 5, "none", { stroke: "#fff", sw: 1.5 }) + p("M262 131 v7", { stroke: "#fff", sw: 1.5 }) +
        t(262, 162, "On/Off", { size: 6, anchor: "middle" }) +
        t(160, 190, "Freccia sul coperchio: foglio col lato stampato in giù", { size: 6.4, anchor: "middle", fill: "#6b7385" });
    }, punti: { foglio: [160, 51, 0, 128, 34], blocco: [73, 139, 0, 34, 14] } },

    "windows-scanner": { tipo: "pc", disegno: function () {
      return finestra("Scanner") +
        r(18, 40, 284, 44, "#fff", { rx: 6, stroke: "#cfd6e4" }) +
        t(28, 56, "HP DeskJet 2700", { size: 7.5, bold: true }) + t(28, 72, "Origine: vetro · Pronta", { size: 6.2, fill: "#6b7385" }) +
        t(18, 100, "Profilo", { size: 6.2, fill: "#6b7385" }) +
        r(18, 104, 180, 20, "#fff", { rx: 4, stroke: "#cfd6e4" }) + t(26, 118, "Documento · PDF · 300 dpi · B/N", { size: 6.2 }) +
        r(18, 146, 120, 26, "#2f7fc0", { rx: 6 }) + t(78, 163, "Acquisisci", { size: 8, fill: "#fff", anchor: "middle", bold: true });
    }, punti: { profilo: [108, 114, 0, 180, 20], acquisisci: [78, 159, 0, 120, 26] } },

    "windows-anteprima": { tipo: "pc", disegno: function () {
      return finestra("Scansione") +
        r(18, 40, 140, 132, "#fff", { rx: 4, stroke: "#cfd6e4" }) +
        [0, 1, 2, 3, 4, 5].map(function (i) { return r(28, 54 + i * 16, i === 5 ? 60 : 118 - i * 6, 4, "#cfd6e4", { rx: 2 }); }).join("") +
        r(170, 40, 130, 60, "#fff", { rx: 6, stroke: "#cfd6e4" }) +
        t(180, 58, "Salva come", { size: 7, bold: true }) + t(180, 74, "PDF", { size: 6.4 }) + t(180, 88, "Documenti", { size: 6.4, fill: "#6b7385" }) +
        r(190, 146, 90, 26, "#2f7fc0", { rx: 6 }) + t(235, 163, "Salva", { size: 8, fill: "#fff", anchor: "middle", bold: true });
    }, punti: { anteprima: [88, 106, 0, 140, 132], salva: [235, 159, 0, 90, 26] } },

    "disco-collegamento": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#f4f6fb", { rx: 8 }) +
        r(16, 36, 130, 80, "#1b2333", { rx: 6 }) + r(24, 44, 114, 64, "#2f6f9e", { rx: 2 }) +
        r(8, 116, 146, 10, "#c6cdda", { rx: 4 }) +
        r(196, 96, 26, 14, "#3a4458", { rx: 3 }) + r(222, 99, 10, 8, "#8fb3e8", { rx: 1 }) +
        t(209, 126, "chiavetta USB", { size: 6.2, anchor: "middle", fill: "#6b7385" }) +
        r(230, 40, 80, 38, "#e7ebf3", { rx: 8, stroke: "#cfd6e4" }) + r(238, 50, 64, 8, "#c6cdda", { rx: 4 }) + r(238, 62, 40, 4, "#c6cdda", { rx: 2 }) +
        p("M230 59 q-40 6 -80 41", { stroke: "#3a4458", sw: 2 }) + t(270, 92, "disco esterno", { size: 6.2, anchor: "middle", fill: "#6b7385" }) +
        t(160, 190, "Chiavetta nella porta USB, disco esterno con il suo cavo", { size: 6, anchor: "middle", fill: "#6b7385" });
    }, punti: { chiavetta: [209, 103, 0, 36, 20] } },

    "windows-disco": { tipo: "pc", disegno: function () {
      return CORNICE +
        r(18, 16, 284, 148, "#fff", { rx: 6 }) + r(18, 16, 284, 18, "#e7ebf3", { rx: 6 }) + t(28, 29, "Questo PC", { size: 7.5, bold: true }) +
        t(28, 48, "Dispositivi e unità", { size: 6.4, fill: "#6b7385" }) +
        [["Disco locale (C:)", "Windows · 240 GB", "#8fb3e8", 56], ["Chiavetta (D:)", "32 GB · rimovibile", "#c98a24", 86], ["Disco esterno (E:)", "1 TB · rimovibile", "#3f9a63", 116]].map(function (x) {
          return r(28, x[3], 264, 26, "#fff", { rx: 4, stroke: "#cfd6e4" }) + r(36, x[3] + 6, 14, 14, x[2], { rx: 3 }) + t(58, x[3] + 12, x[0], { size: 7, bold: true }) + t(58, x[3] + 21, x[1], { size: 6, fill: "#6b7385" });
        }).join("") +
        r(6, 166, 308, 20, "#e7ebf3", { rx: 0 }) + r(110, 169, 14, 14, "#2f7fc0", { rx: 2 });
    }, punti: { unita: [110, 99, 0, 120, 26] } },

    "windows-copia": { tipo: "pc", disegno: function () {
      return CORNICE +
        r(40, 96, 240, 74, "#fff", { rx: 8, stroke: "#cfd6e4" }) +
        t(56, 118, "Copia di 1 elemento", { size: 8, bold: true }) + t(56, 132, "in «Documenti»", { size: 6.4, fill: "#6b7385" }) +
        r(56, 140, 144, 10, "#e7ebf3", { rx: 5 }) + r(56, 140, 90, 10, "#2f7fc0", { rx: 5 }) +
        t(56, 164, "Bollette 2026 · 34 MB di 120 MB", { size: 6.2, fill: "#6b7385" }) +
        r(196, 152, 60, 18, "#e7ebf3", { rx: 9 }) + t(226, 164, "Annulla", { size: 6.4, anchor: "middle" });
    }, punti: { barra: [128, 145, 0, 144, 12] } },

    "windows-rimozione": { tipo: "pc", disegno: function () {
      return CORNICE +
        r(190, 40, 116, 84, "#fff", { rx: 6, stroke: "#cfd6e4" }) +
        t(200, 56, "Rimozione sicura", { size: 6.6, bold: true }) + t(200, 70, "dell'hardware", { size: 6.2, fill: "#6b7385" }) +
        r(196, 86, 104, 24, "#e1eef9", { rx: 4 }) + t(204, 101, "Chiavetta (D:)", { size: 6.4 }) +
        t(204, 121, "Disco esterno (E:)", { size: 6.2, fill: "#6b7385" }) +
        r(6, 166, 308, 20, "#e7ebf3", { rx: 0 }) + r(110, 169, 14, 14, "#2f7fc0", { rx: 2 }) +
        r(268, 169, 12, 12, "#c6cdda", { rx: 2 }) + r(286, 169, 12, 12, "#c98a24", { rx: 2 }) + p("M289 173 h6 M292 171 v8", { stroke: "#fff", sw: 1.4 });
    }, punti: { icona: [292, 175, 11] } },

    "cuffie-abbinamento": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 210, "#f4f6fb", { rx: 8 }) +
        p("M96 118 a64 64 0 0 1 128 0", { stroke: "#1b2333", sw: 12 }) +
        r(76, 108, 40, 62, "#1b2333", { rx: 14 }) + r(86, 124, 20, 30, "#3a4458", { rx: 8 }) +
        r(204, 108, 40, 62, "#1b2333", { rx: 14 }) + r(214, 124, 20, 30, "#3a4458", { rx: 8 }) +
        c(160, 152, 12, "#3a4458") + c(160, 152, 5, "none", { stroke: "#fff", sw: 1.5 }) + p("M160 145 v7", { stroke: "#fff", sw: 1.5 }) +
        c(198, 152, 4, "#e4572e") +
        t(160, 192, "Tasto premuto: la spia arancione lampeggia", { size: 6.2, anchor: "middle", fill: "#6b7385" });
    }, punti: { pulsante: [160, 152, 16], spia: [198, 152, 8] } },

    "android-bluetooth": { tipo: "telefono", disegno: function () {
      return telefono(t(18, 58, "‹  Bluetooth", { size: 13, bold: true }) +
        r(16, 68, 148, 26, "#fff", { rx: 6 }) + t(26, 85, "Bluetooth", { size: 9, bold: true }) + r(134, 74, 22, 14, "#2f7fc0", { rx: 7 }) + c(149, 81, 5, "#fff") +
        t(20, 112, "DISPOSITIVI DISPONIBILI", { size: 7, fill: "#6b7385", bold: true }) +
        riga(120, "WH-1000XM4", { col: "#7d55c0" }) + riga(150, "TV sala", { col: "#2f7fc0" }) + riga(180, "Auto Rossi", { col: "#5b6472" }) +
        r(16, 216, 148, 22, "#e1eef9", { rx: 11 }) + t(90, 231, "+ Abbina nuovo dispositivo", { size: 6.6, fill: "#2f7fc0", anchor: "middle", bold: true }));
    }, punti: { interruttore: [145, 81, 14], cuffie: [156, 133, 18] } },

    "android-bluetooth-fatto": { tipo: "telefono", disegno: function () {
      return telefono(t(18, 58, "‹  Bluetooth", { size: 13, bold: true }) +
        r(16, 78, 148, 84, "#fff", { rx: 8 }) +
        c(46, 112, 18, "#7d55c0") + c(46, 112, 9, "none", { stroke: "#fff", sw: 2 }) +
        t(74, 106, "WH-1000XM4", { size: 8.5, bold: true }) + t(74, 120, "Connesso", { size: 7.5, fill: "#3f9a63", bold: true }) +
        t(74, 134, "Audio del telefono", { size: 6.4, fill: "#6b7385" }) +
        r(16, 176, 148, 26, "#fff", { rx: 6 }) + t(26, 193, "Batteria delle cuffie  80%", { size: 7 }) +
        t(90, 230, "Alza il volume e prova la musica", { size: 6.6, anchor: "middle", fill: "#6b7385" }));
    }, punti: { connesso: [88, 122, 0, 90, 18] } },

    "tv-telecomando": { tipo: "telecomando", disegno: function () {
      const tasti = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];
      return r(30, 0, 100, 360, "#1b2333", { rx: 40 }) + c(56, 26, 9, "#b23a32") + p("M56 20 v6", { stroke: "#fff", sw: 1.6 }) + c(56, 27, 4.5, "none", { stroke: "#fff", sw: 1.4 }) +
        r(86, 18, 30, 16, "#3a4458", { rx: 4 }) + t(101, 29, "SOURCE", { size: 5.5, fill: "#fff", anchor: "middle" }) +
        tasti.map(function (k, i) { const x = 50 + (i % 3) * 30, y = 50 + Math.floor(i / 3) * 22; return k ? c(x, y, 9, "#3a4458") + t(x, y + 3, k, { size: 8, fill: "#fff", anchor: "middle" }) : ""; }).join("") +
        c(80, 170, 30, "#3a4458") + c(80, 170, 12, "#5b6472") + t(80, 173, "OK", { size: 7, fill: "#fff", anchor: "middle", bold: true }) +
        t(80, 150, "▲", { size: 8, fill: "#fff", anchor: "middle" }) + t(80, 196, "▼", { size: 8, fill: "#fff", anchor: "middle" }) + t(60, 173, "◀", { size: 8, fill: "#fff", anchor: "middle" }) + t(100, 173, "▶", { size: 8, fill: "#fff", anchor: "middle" }) +
        r(42, 210, 26, 14, "#3a4458", { rx: 4 }) + t(55, 220, "↩ Indietro", { size: 4.6, fill: "#fff", anchor: "middle" }) + r(92, 210, 26, 14, "#3a4458", { rx: 4 }) + t(105, 220, "⌂ Home", { size: 5, fill: "#fff", anchor: "middle" }) +
        r(42, 236, 18, 50, "#3a4458", { rx: 9 }) + t(51, 250, "+", { size: 10, fill: "#fff", anchor: "middle" }) + t(51, 266, "VOL", { size: 4.5, fill: "#fff", anchor: "middle" }) + t(51, 281, "−", { size: 10, fill: "#fff", anchor: "middle" }) +
        r(100, 236, 18, 50, "#3a4458", { rx: 9 }) + t(109, 250, "▲", { size: 6, fill: "#fff", anchor: "middle" }) + t(109, 266, "CH", { size: 4.5, fill: "#fff", anchor: "middle" }) + t(109, 281, "▼", { size: 6, fill: "#fff", anchor: "middle" }) +
        r(66, 242, 28, 14, "#3a4458", { rx: 4 }) + t(80, 252, "GUIDA", { size: 5, fill: "#fff", anchor: "middle" }) + r(66, 264, 28, 14, "#3a4458", { rx: 4 }) + t(80, 274, "SUB", { size: 5.5, fill: "#fff", anchor: "middle" }) +
        r(42, 300, 76, 12, "#3a4458", { rx: 4 }) + [0, 1, 2, 3].map(function (i) { return r(46 + i * 18, 303, 14, 6, ["#b23a32", "#3f9a63", "#c98a24", "#2f7fc0"][i], { rx: 2 }); }).join("") +
        r(42, 320, 76, 14, "#3a4458", { rx: 4 }) + t(80, 330, "SETTINGS ⚙", { size: 5.5, fill: "#fff", anchor: "middle" });
    }, punti: { accensione: [56, 26, 13], source: [101, 26, 0, 36, 22], ok: [80, 170, 16], frecce: [80, 170, 34], indietro: [55, 217, 0, 32, 20], home: [105, 217, 0, 32, 20], volume: [51, 261, 0, 26, 56], sub: [80, 271, 0, 34, 20], guida: [80, 249, 0, 34, 20], impostazioni: [80, 327, 0, 82, 20], canali: [109, 261, 0, 26, 56] } },

    "tv-sorgenti": { tipo: "pc", disegno: function () {
      return r(0, 0, 320, 200, "#1b2333", { rx: 6 }) + r(6, 6, 308, 172, "#0f1f36", { rx: 2 }) + t(20, 30, "Sorgente", { size: 11, fill: "#fff", bold: true }) +
        [["TV", "#5b6472"], ["HDMI 1", "#2f7fc0"], ["HDMI 2", "#5b6472"], ["USB", "#5b6472"]].map(function (x, i) { return r(20 + i * 72, 60, 62, 62, x[1], { rx: 8 }) + t(51 + i * 72, 97, x[0], { size: 9, fill: "#fff", anchor: "middle", bold: true }); }).join("") +
        t(20, 150, "HDMI 1: computer collegato con il cavo", { size: 8, fill: "#cfd6e4" }) + r(140, 182, 40, 12, "#3a4458", { rx: 2 });
    }, punti: { hdmi: [123, 91, 0, 70, 70] } },

    "sms-truffa": { tipo: "telefono", disegno: function () {
      return telefono(r(8, 38, 164, 30, "#fff", { rx: 0 }) + t(20, 57, "‹", { size: 14, fill: "#2f7fc0" }) + c(42, 53, 9, "#c6cdda") + t(56, 51, "+44 7700 900123", { size: 8.5, bold: true }) + t(56, 62, "Messaggio di testo", { size: 6.5, fill: "#6b7385" }) +
        t(90, 88, "Oggi 09:12", { size: 6.5, fill: "#6b7385", anchor: "middle" }) +
        r(16, 96, 132, 116, "#e7ebf3", { rx: 12 }) +
        t(24, 114, "POSTE: il tuo pacco è in", { size: 8 }) + t(24, 126, "giacenza. URGENTE: paga", { size: 8 }) + t(24, 138, "1,99 € entro 24 ore o", { size: 8 }) + t(24, 150, "verrà restituito.", { size: 8 }) +
        t(24, 168, "http://poste-it.pacco-", { size: 8, fill: "#2f7fc0" }) + t(24, 180, "consegna.co/pay", { size: 8, fill: "#2f7fc0" }) + t(24, 200, "Inserisci i dati della carta.", { size: 8 }) +
        r(16, 292, 148, 22, "#fff", { rx: 11, stroke: "#cfd6e4" }) + t(28, 307, "Messaggio", { size: 8, fill: "#6b7385" }));
    }, punti: { mittente: [90, 51, 0, 100, 22], urgenza: [72, 132, 0, 116, 18], link: [72, 174, 0, 116, 28], carta: [80, 197, 0, 120, 14] } }
  };

  /* ------------------------------------------------------------ le guide */
  /* i dispositivi delle guide: sono anche i filtri della pagina guide */
  TD.GUIDE_DISPOSITIVI = ["Android", "iPhone", "Windows", "Mac", "Smart TV", "Stampante", "Scanner"];
  TD.GUIDE = [
    { id: "g-caratteri", titolo: "Caratteri più grandi sul telefono Android", dispositivo: "Android", lezioni: ["tablet-0-2", "smartphone-0-1"], passi: [
      ["android-home", "impostazioni", "Tocca l'icona a ingranaggio «Impostazioni»."],
      ["android-impostazioni", "schermo", "Scegli «Schermo» (su alcuni telefoni «Display» o «Schermo e luminosità»)."],
      ["android-schermo", "carattere", "Trascina il pallino di «Dimensione del carattere» verso la A grande e guarda l'esempio."]] },
    { id: "g-wifi", titolo: "Collegarsi al Wi-Fi di casa", dispositivo: "Android", lezioni: ["tv-1-1", "rete-0-1", "smartphone-0-1"], passi: [
      ["android-impostazioni", "wifi", "In Impostazioni tocca «Wi-Fi»."],
      ["android-wifi", "interruttore", "Accendi l'interruttore «Usa Wi-Fi» se è spento."],
      ["android-wifi", "rete", "Tocca il nome della tua rete: è scritto sotto il modem, insieme alla password."],
      ["android-wifi", "password", "Scrivi la password rispettando maiuscole e minuscole e tocca «Connetti»."],
      ["android-wifi", "aperta", "Attenzione: le reti «aperte» dei locali pubblici vanno bene per leggere, non per banca e acquisti."]] },
    { id: "g-installa-android", titolo: "Installare l'app Allievo su Android", dispositivo: "Android", lezioni: ["tablet-1-1", "smartphone-0-2"], passi: [
      ["android-chrome", "menu", "Apri il link del tutor con Chrome e tocca i tre puntini in alto a destra."],
      ["android-chrome", "installa", "Scegli «Installa app» (o «Aggiungi a schermata Home») e conferma."],
      ["android-home", "home", "L'icona compare nella schermata Home: da adesso si apre come le altre app, anche senza Internet."]] },
    { id: "g-installa-iphone", titolo: "Installare l'app Allievo su iPhone e iPad", dispositivo: "iPhone", lezioni: ["tablet-1-1", "smartphone-0-2"], passi: [
      ["iphone-safari", "condividi", "Apri il link con Safari e tocca il tasto Condividi: il quadrato con la freccia in su."],
      ["iphone-condividi", "home", "Scorri e scegli «Aggiungi alla schermata Home», poi «Aggiungi» in alto a destra."]] },
    { id: "g-spegnere-windows", titolo: "Spegnere bene il computer Windows", dispositivo: "Windows", lezioni: ["pc-0-1"], passi: [
      ["windows-desktop", "start", "Fai clic sul pulsante Start, i quattro quadratini nella barra in basso."],
      ["windows-start", "accensione", "Fai clic sul simbolo di accensione in basso a destra del menu."],
      ["windows-start", "arresta", "Scegli «Arresta il sistema» e aspetta che lo schermo diventi nero."]] },
    { id: "g-cartella-windows", titolo: "Creare una cartella in Documenti", dispositivo: "Windows", lezioni: ["pc-1-1"], passi: [
      ["windows-desktop", "cartella", "Apri «Esplora file»: la cartellina gialla nella barra in basso."],
      ["windows-esplora", "nuovo", "In Documenti fai clic su «+ Nuovo»."],
      ["windows-esplora", "cartella", "Scegli «Cartella», scrivi il nome (es. «Bollette 2026») e premi Invio."],
      ["windows-esplora", "chiavetta", "Per una copia di sicurezza trascina la cartella sulla chiavetta, a sinistra."]] },
    { id: "g-stampante", titolo: "Installare la stampante la prima volta", dispositivo: "Stampante", lezioni: ["accessori-0-1", "accessori-1-2"], passi: [
      ["stampante-pannello", "accensione", "Collega la stampante alla corrente, infila il foglio nel vassoio e premi il tasto di accensione: il display si illumina."],
      ["stampante-pannello", "wifi", "In Wi-Fi premi il tasto Wi-Fi finché la spia lampeggia, poi premi WPS sul modem (oppure segui il libretto del modello)."],
      ["windows-stampanti", "stampanti", "Sul computer apri Impostazioni › Bluetooth e dispositivi › Stampanti e scanner."],
      ["windows-aggiungi", "elenco", "Tocca «Aggiungi dispositivo», aspetta l'elenco e scegli il nome della stampante: col cavo è quella «USB»."],
      ["windows-prova-stampa", "prova", "Apri la stampante e scegli «Stampa pagina di prova»: se esce il foglio è installata; se no, riaccendila e ripeti."]] },
    { id: "g-stampante-mac", titolo: "Installare la stampante la prima volta su Mac", dispositivo: "Mac", lezioni: ["accessori-0-1", "accessori-1-2"], passi: [
      ["stampante-pannello", "accensione", "Collega la stampante alla corrente, infila il foglio nel vassoio e premi il tasto di accensione: il display si illumina."],
      ["stampante-pannello", "wifi", "In Wi-Fi premi il tasto Wi-Fi finché la spia lampeggia, poi premi WPS sul modem (oppure segui il libretto del modello)."],
      ["mac-stampanti", "stampanti", "Dal Mac apri il menu mela in alto a sinistra › Impostazioni di Sistema e scegli «Stampanti e scanner»."],
      ["mac-aggiungi", "elenco", "Fai clic su «Aggiungi stampante, scanner o fax…», aspetta l'elenco e scegli il nome della stampante: col cavo è quella «USB»."],
      ["mac-prova-stampa", "prova", "Scegli «Stampa pagina di prova…»: se esce il foglio è installata; se no, riaccendila e ripeti."]] },
    { id: "g-scanner-multifunzione", titolo: "Acquisire un documento con la stampante multifunzione", dispositivo: "Scanner", lezioni: ["accessori-0-1", "accessori-3-1"], passi: [
      ["scanner-vetro", "foglio", "Alza il coperchio e appoggia il foglio sul vetro, con il testo rivolto verso il vetro e l'angolo in alto a sinistra."],
      ["windows-scanner", "profilo", "Sul computer apri «Scanner» (o «Scanner e fotocamera») e scegli il profilo «Documento»: PDF, 300 dpi, bianco e nero."],
      ["windows-scanner", "acquisisci", "Premi «Acquisisci» e aspetta: il carrello scorre sotto il vetro — non guardare la luce."],
      ["windows-anteprima", "anteprima", "Guarda l'anteprima: testo dritto e leggibile, nessuna pagina tagliata. Se è storta, rimetti il foglio e ripeti."],
      ["windows-anteprima", "salva", "Premi «Salva» e scegli Documenti: il PDF si chiama con la data e si può allegare a un'email o stampare."]] },
    { id: "g-scanner-tavolo", titolo: "Acquisire con uno scanner da tavolo", dispositivo: "Scanner", lezioni: ["accessori-3-1"], passi: [
      ["scanner-tavolo", "blocco", "Togli il blocco arancione del carrello (serve solo per il trasporto) e accendi lo scanner."],
      ["scanner-tavolo", "foglio", "Infila il foglio nell'alimentatore con il lato stampato verso il basso, come mostra la freccia sul coperchio."],
      ["windows-scanner", "acquisisci", "Sul computer apri «Scanner», controlla che sia scelto lo scanner giusto e premi «Acquisisci»."],
      ["windows-anteprima", "salva", "Controlla l'anteprima e premi «Salva»: il PDF finisce in Documenti, pronto da inviare."]] },
    { id: "g-disco-esterno", titolo: "Copiare i file su una chiavetta o un disco esterno", dispositivo: "Windows", lezioni: ["accessori-1-1", "accessori-3-1"], passi: [
      ["disco-collegamento", "chiavetta", "Infila la chiavetta in una porta USB (o collega il disco esterno con il suo cavo) e aspetta qualche secondo: la spia si accende."],
      ["windows-disco", "unita", "Apri Esplora file › Questo PC e cerca l'unità nuova: «Chiavetta (D:)» o «Disco esterno (E:)»."],
      ["windows-copia", "barra", "Trascina la cartella da copiare in Documenti (o dall'altra parte) e aspetta che la barra arrivi in fondo."],
      ["windows-rimozione", "icona", "Prima di staccare, clicca l'icona della chiavetta vicino all'orologio e scegli «Rimozione sicura dell'hardware»."]] },
    { id: "g-cuffie-bluetooth", titolo: "Abbinare le cuffie Bluetooth al telefono", dispositivo: "Android", lezioni: ["accessori-2-2", "accessori-3-1"], passi: [
      ["android-bluetooth", "interruttore", "Apri Impostazioni › Bluetooth e accendi l'interruttore se è spento: il telefono cerca i dispositivi vicini."],
      ["cuffie-abbinamento", "pulsante", "Tieni premuto il tasto delle cuffie finché la spia lampeggia: stanno cercando il telefono."],
      ["android-bluetooth", "cuffie", "Tocca il nome delle cuffie nell'elenco, per esempio «WH-1000XM4»."],
      ["android-bluetooth-fatto", "connesso", "Quando leggi «Connesso», alza il volume e prova la musica: il suono esce dalle cuffie."]] },
    { id: "g-telecomando", titolo: "I tasti del telecomando che servono davvero", dispositivo: "Smart TV", lezioni: ["tv-0-1", "tv-0-2"], passi: [
      ["tv-telecomando", "accensione", "Il tasto rosso accende e spegne la TV."],
      ["tv-telecomando", "frecce", "Le frecce spostano la selezione; OK conferma."],
      ["tv-telecomando", "indietro", "«Indietro» torna alla schermata precedente: è il tasto della salvezza."],
      ["tv-telecomando", "home", "«Home» apre le app (RaiPlay, YouTube…)."],
      ["tv-telecomando", "sub", "«SUB» accende i sottotitoli; «GUIDA» mostra i programmi."]] },
    { id: "g-hdmi", titolo: "Vedere il computer o il telefono sulla TV", dispositivo: "Smart TV", lezioni: ["tv-2-1"], passi: [
      ["tv-telecomando", "source", "Con il cavo HDMI collegato, premi «SOURCE» (o «INPUT», o il simbolo con la freccia nel rettangolo)."],
      ["tv-sorgenti", "hdmi", "Scegli la presa dove hai inserito il cavo, per esempio «HDMI 1». Per tornare alla TV scegli «TV»."]] },
    { id: "g-blocco", titolo: "Proteggere il telefono con il blocco schermo", dispositivo: "Android", lezioni: ["smartphone-3-1", "rete-1-1"], passi: [
      ["android-home", "impostazioni", "Apri «Impostazioni»."],
      ["android-impostazioni", "sicurezza", "Tocca «Sicurezza» (o «Sicurezza e privacy», «Schermata di blocco»)."],
      ["android-impostazioni", "aggiornamenti", "Già che ci sei, controlla anche «Aggiornamenti»: un telefono aggiornato è più sicuro."]] },
    { id: "g-sms-truffa", titolo: "Riconoscere un SMS truffa", dispositivo: "Android", lezioni: ["rete-1-2"], passi: [
      ["sms-truffa", "mittente", "Il mittente è un numero estero sconosciuto, non il nome dell'azienda."],
      ["sms-truffa", "urgenza", "Mette fretta e fa paura: «URGENTE», «entro 24 ore». Le aziende serie non scrivono così."],
      ["sms-truffa", "link", "Il link imita il nome vero ma è diverso: «poste-it.pacco-consegna.co» non è il sito di Poste."],
      ["sms-truffa", "carta", "Chiede i dati della carta: non si danno mai via SMS. Cancella il messaggio e, nel dubbio, chiama il numero ufficiale."]] }
  ];

  function scena(nome) { return SCENE[nome] || SCENE["android-home"]; }
  function dimensioni(sc) { return sc.tipo === "pc" ? [320, 210] : sc.tipo === "telecomando" ? [160, 360] : [180, 360]; }
  /* disegno di un passo: la scena più il segno arancione e il numero */
  TD.svgPasso = function (nomeScena, punto, numero, opz) {
    opz = opz || {};
    const sc = scena(nomeScena), wh = dimensioni(sc), h = sc.punti[punto];
    let segno = "";
    if (h) {
      const cx = h[0], cy = h[1];
      const forma = h[2] ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + h[2] + '" fill="none" stroke="' + SEGNO + '" stroke-width="3" stroke-dasharray="5 3"/>'
        : '<rect x="' + (cx - h[3] / 2) + '" y="' + (cy - h[4] / 2) + '" width="' + h[3] + '" height="' + h[4] + '" rx="6" fill="none" stroke="' + SEGNO + '" stroke-width="3" stroke-dasharray="5 3"/>';
      const raggio = h[2] || Math.max(h[3], h[4]) / 2;
      const destra = cx < wh[0] / 2;
      const bx = Math.max(14, Math.min(wh[0] - 14, cx + (destra ? 1 : -1) * (raggio + 26))), by = Math.max(16, cy - raggio - 18);
      /* il cerchio punta al bordo del tondo, il riquadro al bordo della casella:
         altrimenti la linea si ferma nel vuoto sopra il riquadro largo */
      const fx = h[2] ? cx + (destra ? 1 : -1) * raggio * 0.72 : Math.max(cx - h[3] / 2, Math.min(cx + h[3] / 2, bx));
      const fy = h[2] ? cy - raggio * 0.72 : cy - h[4] / 2;
      segno = forma + '<line x1="' + bx + '" y1="' + by + '" x2="' + fx + '" y2="' + fy + '" stroke="' + SEGNO + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="' + bx + '" cy="' + by + '" r="11" fill="' + SEGNO + '" stroke="#fff" stroke-width="2"/><text x="' + bx + '" y="' + (by + 4) + '" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,Arial,sans-serif">' + (numero || "") + "</text>";
    }
    return '<svg class="guida-svg" viewBox="-6 -6 ' + (wh[0] + 12) + " " + (wh[1] + 12) + '" role="img" aria-label="' + E(opz.etichetta || "Schermata guida") + '" xmlns="http://www.w3.org/2000/svg">' + sc.disegno() + segno + "</svg>";
  };
  TD.guida = function (id) { return TD.GUIDE.find(function (g) { return g.id === id; }); };
  TD.guidePer = function (l) { return TD.GUIDE.filter(function (g) { return g.lezioni.indexOf(l.id) >= 0; }); };
  TD.guidaHtml = function (g, compatta) {
    return '<div class="guida' + (compatta ? " compatta" : "") + '"><h3>' + (compatta ? '<a href="#/guida/' + g.id + '">' + E(g.titolo) + "</a>" : E(g.titolo)) + ' <span class="pill">' + E(g.dispositivo) + '</span></h3><ol class="guida-passi">' +
      g.passi.map(function (x, i) { return "<li>" + TD.svgPasso(x[0], x[1], i + 1, { etichetta: "Passo " + (i + 1) + ": " + x[2] }) + "<p><strong>" + (i + 1) + ".</strong> " + E(x[2]) + "</p></li>"; }).join("") + "</ol></div>";
  };

  /* PDF della guida: i disegni SVG diventano immagini sul foglio */
  function immagineSvg(svg) {
    return new Promise(function (ok) {
      const im = new Image();
      im.onload = function () { ok(im); }; im.onerror = function () { ok(null); };
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }
  TD.pdfGuida = async function (g) {
    const d = new TD.Documento({ titolo: g.titolo, piede: "Tutor Digitale · schermate guida" });
    d.intestazione(TD.db.profilo, "Schermate guida");
    d.h1(g.titolo);
    d.piccolo("Dispositivo: " + g.dispositivo + ". I disegni sono indicativi: le scritte possono cambiare un po' da modello a modello.");
    for (let i = 0; i < g.passi.length; i++) {
      const x = g.passi[i];
      const svg = TD.svgPasso(x[0], x[1], i + 1);
      const im = await immagineSvg(svg);
      /* i disegni di computer e stampanti vanno larghi quanto la pagina: a 640
         le scritte interne finivano a 2-3 punti e sul foglio non si leggevano */
      const larg = scena(x[0]).tipo === "pc" ? Math.min(d.W - d.m * 2, 900) : 300, alt = im ? larg * im.height / im.width : 0;
      d.spazio(alt + 40);
      if (im) d.x.drawImage(im, d.m, d.y, larg, alt);
      const salva = d.y;
      d.y = salva + 10;
      d.testo((i + 1) + ". " + x[2], { size: 30, rientro: larg + 40, dopo: 0 });
      d.y = Math.max(d.y, salva + alt) + 30;
    }
    return d.chiudi();
  };

  /* ------------------------------------------------------------ pagine */
  TD.rotta("/guide", function (app, par, q) {
    const disp = q.d || "";
    const elenco = TD.GUIDE.filter(function (g) { return !disp || g.dispositivo === disp; });
    const mie = TD.MODO === "allievo" ? [] : (TD.db.schermate || []);
    app.innerHTML = TD.intest("Schermate guida", "Disegni passo per passo, con il cerchio dove toccare: da mostrare a lezione, proiettare sulla TV o stampare per casa.",
      '<nav class="chips">' + [""].concat(TD.GUIDE_DISPOSITIVI).map(function (x) { return '<a class="chip' + (x === disp ? " on" : "") + '" href="#/guide' + (x ? "?d=" + encodeURIComponent(x) : "") + '">' + (x || "Tutte") + "</a>"; }).join("") + "</nav>") +
      '<div class="wrap"><div class="guide-grid">' + elenco.map(function (g) {
        return '<a class="card guida-card" href="#/guida/' + g.id + '">' + TD.svgPasso(g.passi[0][0], g.passi[0][1], 1) + "<h3>" + E(g.titolo) + '</h3><p class="muted text-small">' + E(g.dispositivo) + " · " + g.passi.length + " passi</p></a>";
      }).join("") + "</div>" +
      (TD.MODO === "allievo" ? "" : '<section class="card"><h2>' + I("pen") + 'Le tue schermate annotate</h2><p>Fotografa o cattura lo schermo del dispositivo del cliente, poi aggiungi frecce, cerchi e numeri. Le schermate si possono inserire nelle lezioni create con l\'editor.</p>' +
        '<div class="actions"><label class="btn btn-primary">' + I("upload") + 'Nuova schermata<input type="file" id="gNuova" accept="image/*" hidden></label><a class="btn" href="#/editor">' + I("book") + "Editor delle lezioni</a></div>" +
        (mie.length ? '<div class="guide-grid">' + mie.map(function (s) { return '<figure class="card schermata"><img src="' + E(s.src) + '" alt="' + E(s.titolo) + '"><figcaption>' + E(s.titolo) + ' <button class="icon-btn" data-via="' + s.id + '" aria-label="Elimina la schermata">' + I("trash") + "</button></figcaption></figure>"; }).join("") + "</div>" : "") + "</section>") +
      "</div>";
    const n = document.getElementById("gNuova");
    if (n) n.onchange = function () {
      const f = this.files[0]; if (!f) return;
      TD.leggiImmagine(f).then(TD.annotaImmagine).then(function (src) {
        if (!src) return;
        const titolo = window.prompt("Titolo della schermata", "Schermata " + ((TD.db.schermate || []).length + 1));
        TD.db.schermate = (TD.db.schermate || []).concat([{ id: TD.uid("s"), titolo: titolo || "Schermata", src: src, data: TD.oggi() }]);
        TD.salva(); TD.render();
      });
    };
    app.querySelectorAll("[data-via]").forEach(function (b) { b.onclick = function () { if (TD.conferma("Eliminare la schermata?")) { TD.db.schermate = TD.db.schermate.filter(function (s) { return s.id !== b.dataset.via; }); TD.salva(); TD.render(); } }; });
  });

  TD.rotta("/guida/:id", function (app, par) {
    const g = TD.guida(par.id); if (!g) { TD.vai("#/guide"); return; }
    app.innerHTML = TD.intest(E(g.titolo), E(g.dispositivo) + " · " + g.passi.length + " passi. Le scritte possono cambiare leggermente da un modello all'altro.",
      '<div class="actions"><a class="btn btn-ghost" href="#/guide">' + I("back") + 'Tutte le guide</a><button class="btn" id="gPdf">' + I("download") + 'PDF da stampare</button><button class="btn" id="gLeggi">' + I("speaker") + "Leggi ad alta voce</button></div>") +
      '<div class="wrap">' + TD.guidaHtml(g, false) +
      (g.lezioni.length ? '<p class="muted">Lezioni collegate: ' + g.lezioni.map(function (id) { const l = TD.lezione(id); return l ? '<a href="#/lezione/' + id + '">' + E(l.titolo) + "</a>" : ""; }).filter(Boolean).join(" · ") + "</p>" : "") + "</div>";
    document.getElementById("gPdf").onclick = function () { TD.pdfGuida(g).then(function (pg) { TD.scaricaPdf(pg, "guida-" + g.id.replace(/^g-/, "") + ".pdf", { titolo: g.titolo }); }); };
    document.getElementById("gLeggi").onclick = function () { TD.leggi(g.titolo + ". " + g.passi.map(function (x, i) { return "Passo " + (i + 1) + ". " + x[2]; }).join(" ")); };
  });
})();
