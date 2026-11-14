/* ==========================================================================
   Tutor Digitale · documenti impaginati sul dispositivo, PDF e firma
   Le pagine sono disegnate su canvas e raccolte in un PDF 1.4 senza
   librerie esterne: funziona identico online e offline.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

window.TD = window.TD || {};

(function () {
  "use strict";

  const A4 = { w: 1654, h: 2339 };         // 200 dpi circa
  const PT = { w: 595.28, h: 841.89 };     // punti PDF
  const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,"Times New Roman",serif';
  const SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  TD.FONT = { serif: SERIF, sans: SANS };

  /* ---------------------------------------------------------- impaginatore */
  function Documento(opz) {
    opz = opz || {};
    this.land = !!opz.orizzontale;
    this.W = this.land ? A4.h : A4.w;
    this.H = this.land ? A4.w : A4.h;
    this.m = opz.margine || 130;
    this.pagine = [];
    this.titolo = opz.titolo || "";
    this.piede = opz.piede || "";
    this.colore = opz.colore || "#1d3557";
    this.nuovaPagina();
  }
  Documento.prototype.nuovaPagina = function () {
    const c = document.createElement("canvas");
    c.width = this.W; c.height = this.H;
    const x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, this.W, this.H);
    x.textBaseline = "alphabetic";
    this.c = c; this.x = x; this.y = this.m;
    this.pagine.push(c);
    if (this.titolo && this.pagine.length > 1) {
      x.font = "500 26px " + SANS; x.fillStyle = "#6b7280";
      x.fillText(this.titolo, this.m, this.m - 50);
      x.strokeStyle = "#e5e7eb"; x.lineWidth = 2; x.beginPath(); x.moveTo(this.m, this.m - 34); x.lineTo(this.W - this.m, this.m - 34); x.stroke();
    }
  };
  Documento.prototype.spazio = function (h) {
    if (this.y + h > this.H - this.m - 40) this.nuovaPagina();
  };
  Documento.prototype.righe = function (testo, font, larg) {
    const x = this.x; x.font = font;
    const out = [];
    String(testo || "").split("\n").forEach(function (par) {
      const parole = par.split(/\s+/);
      let r = "";
      parole.forEach(function (p) {
        const prova = r ? r + " " + p : p;
        if (x.measureText(prova).width > larg && r) { out.push(r); r = p; } else r = prova;
      });
      out.push(r);
    });
    return out;
  };
  Documento.prototype.testo = function (testo, o) {
    o = o || {};
    const size = o.size || 32, peso = o.peso || 400, fam = o.serif ? SERIF : SANS;
    const font = (o.corsivo ? "italic " : "") + peso + " " + size + "px " + fam;
    const lh = Math.round(size * (o.lh || 1.45));
    const sx = this.m + (o.rientro || 0);
    const larg = (o.larg || (this.W - this.m * 2)) - (o.rientro || 0);
    const righe = this.righe(testo, font, larg);
    const self = this;
    if (o.prima) this.y += o.prima;
    righe.forEach(function (r) {
      self.spazio(lh);
      self.x.font = font; self.x.fillStyle = o.colore || "#1f2937";
      self.x.textAlign = o.centro ? "center" : "left";
      self.x.fillText(r, o.centro ? self.W / 2 : sx, self.y + size);
      self.x.textAlign = "left";
      self.y += lh;
    });
    this.y += o.dopo == null ? Math.round(size * 0.5) : o.dopo;
  };
  Documento.prototype.h1 = function (t) { this.testo(t, { size: 56, peso: 700, serif: true, colore: this.colore, dopo: 18 }); };
  Documento.prototype.h2 = function (t) { this.spazio(120); this.testo(t, { size: 36, peso: 700, colore: this.colore, prima: 18, dopo: 10 }); };
  Documento.prototype.p = function (t, o) { this.testo(t, Object.assign({ size: 30 }, o || {})); };
  Documento.prototype.piccolo = function (t, o) { this.testo(t, Object.assign({ size: 24, colore: "#4b5563" }, o || {})); };
  Documento.prototype.linea = function (col) {
    this.spazio(30);
    this.x.strokeStyle = col || "#d1d5db"; this.x.lineWidth = 2;
    this.x.beginPath(); this.x.moveTo(this.m, this.y + 10); this.x.lineTo(this.W - this.m, this.y + 10); this.x.stroke();
    this.y += 34;
  };
  Documento.prototype.casella = function (t, segno, o) {
    o = o || {};
    const size = 28, font = "400 " + size + "px " + SANS;
    const righe = this.righe(t, font, this.W - this.m * 2 - 70);
    this.spazio(righe.length * 40 + 20);
    const x = this.x, by = this.y + 4;
    x.strokeStyle = "#374151"; x.lineWidth = 3; x.strokeRect(this.m, by, 36, 36);
    if (segno) {
      x.strokeStyle = this.colore; x.lineWidth = 6; x.beginPath();
      x.moveTo(this.m + 7, by + 19); x.lineTo(this.m + 15, by + 29); x.lineTo(this.m + 30, by + 7); x.stroke();
    }
    const self = this;
    righe.forEach(function (r, i) { x.font = font; x.fillStyle = "#1f2937"; x.fillText(r, self.m + 60, self.y + size + 2 + i * 40); });
    this.y += righe.length * 40 + (o.dopo || 16);
  };
  Documento.prototype.campi = function (coppie, colonne) {
    colonne = colonne || 2;
    const larg = (this.W - this.m * 2 - (colonne - 1) * 40) / colonne;
    const self = this;
    for (let i = 0; i < coppie.length; i += colonne) {
      this.spazio(96);
      coppie.slice(i, i + colonne).forEach(function (cp, k) {
        const xx = self.m + k * (larg + 40);
        self.x.font = "600 21px " + SANS; self.x.fillStyle = "#6b7280";
        self.x.fillText(String(cp[0]).toUpperCase(), xx, self.y + 22);
        self.x.font = "400 30px " + SANS; self.x.fillStyle = "#111827";
        let v = String(cp[1] || "");
        while (v && self.x.measureText(v).width > larg) v = v.slice(0, -2);
        self.x.fillText(v, xx, self.y + 62);
        self.x.strokeStyle = "#9ca3af"; self.x.lineWidth = 2;
        self.x.beginPath(); self.x.moveTo(xx, self.y + 76); self.x.lineTo(xx + larg, self.y + 76); self.x.stroke();
      });
      this.y += 100;
    }
    this.y += 6;
  };
  Documento.prototype.firme = function (lista) {
    // lista: [{etichetta, img (dataURL o Image), nome}]
    const n = lista.length, gap = 60;
    const larg = (this.W - this.m * 2 - gap * (n - 1)) / n;
    this.spazio(260);
    const self = this, y0 = this.y;
    lista.forEach(function (f, i) {
      const xx = self.m + i * (larg + gap);
      self.x.font = "600 21px " + SANS; self.x.fillStyle = "#6b7280";
      self.x.fillText(String(f.etichetta).toUpperCase(), xx, y0 + 22);
      if (f.immagine) {
        const im = f.immagine, h = 140, w = Math.min(larg, im.width * h / im.height);
        try { self.x.drawImage(im, xx, y0 + 40, w, h); } catch (e) {}
      }
      self.x.strokeStyle = "#374151"; self.x.lineWidth = 2;
      self.x.beginPath(); self.x.moveTo(xx, y0 + 190); self.x.lineTo(xx + larg, y0 + 190); self.x.stroke();
      if (f.nome) { self.x.font = "400 24px " + SANS; self.x.fillStyle = "#374151"; self.x.fillText(f.nome, xx, y0 + 222); }
    });
    this.y = y0 + 250;
  };
  Documento.prototype.tabella = function (intest, righe, larghezze, opz) {
    opz = opz || {};
    const tot = this.W - this.m * 2;
    const L = larghezze.map(function (f) { return f * tot; });
    const self = this;
    function riga(celle, bold, sfondo) {
      const font = (bold ? "700 " : "400 ") + "26px " + SANS;
      const linee = celle.map(function (c, i) { return self.righe(String(c), font, L[i] - 24); });
      const h = Math.max.apply(null, linee.map(function (l) { return l.length; })) * 36 + 22;
      self.spazio(h);
      if (sfondo) { self.x.fillStyle = sfondo; self.x.fillRect(self.m, self.y, tot, h); }
      let xx = self.m;
      linee.forEach(function (l, i) {
        self.x.font = font; self.x.fillStyle = "#111827";
        const destra = opz.destra && opz.destra.indexOf(i) >= 0;
        l.forEach(function (t, k) {
          self.x.textAlign = destra ? "right" : "left";
          self.x.fillText(t, destra ? xx + L[i] - 12 : xx + 12, self.y + 36 + k * 36);
        });
        self.x.textAlign = "left";
        xx += L[i];
      });
      self.x.strokeStyle = "#e5e7eb"; self.x.lineWidth = 2;
      self.x.beginPath(); self.x.moveTo(self.m, self.y + h); self.x.lineTo(self.m + tot, self.y + h); self.x.stroke();
      self.y += h;
    }
    riga(intest, true, "#eef2f7");
    righe.forEach(function (r) { riga(r, false, null); });
    this.y += 20;
  };
  Documento.prototype.intestazione = function (prof, sottotitolo) {
    const x = this.x;
    const mar = TD.marchio ? TD.marchio() : null;
    const colore = mar && mar.colore ? mar.colore : this.colore;
    x.fillStyle = colore; x.fillRect(0, 0, this.W, 18);
    const logo = mar && mar.logo && TD.logoMarchioImg && TD.logoMarchioImg.complete ? TD.logoMarchioImg : TD.logoImg;
    if (logo && logo.complete) { try { const h = 96, w = Math.min(220, logo.width * h / logo.height || 96); x.drawImage(logo, this.m, this.m - 40, w, h); } catch (e) {} }
    x.font = "700 40px " + SERIF; x.fillStyle = colore; x.fillText(mar && mar.nome ? mar.nome : "Tutor Digitale", this.m + 120, this.m + 4);
    x.font = "400 24px " + SANS; x.fillStyle = "#4b5563";
    x.fillText(sottotitolo || "Lezioni di tecnologia su misura", this.m + 120, this.m + 42);
    x.textAlign = "right"; x.font = "600 26px " + SANS; x.fillStyle = "#111827";
    x.fillText(prof.nome || "", this.W - this.m, this.m - 4);
    x.font = "400 22px " + SANS; x.fillStyle = "#4b5563";
    const info = [prof.qualifica, prof.email, prof.telefono, prof.piva ? "P. IVA " + prof.piva : ""].filter(Boolean);
    info.forEach(function (t, i) { x.fillText(t, this.W - this.m, this.m + 28 + i * 28); }, this);
    x.textAlign = "left";
    this.y = this.m + 40 + Math.max(2, info.length) * 28 + 30;
    this.linea("#cbd5e1");
  };
  Documento.prototype.chiudi = function () {
    const n = this.pagine.length, self = this;
    this.pagine.forEach(function (c, i) {
      const x = c.getContext("2d");
      x.font = "400 21px " + SANS; x.fillStyle = "#9ca3af";
      if (self.piede) x.fillText(self.piede + (TD.marchio && TD.marchio() && TD.marchio().nome ? " · realizzato con Tutor Digitale di Danilo D'Auria" : ""), self.m, self.H - 60);
      x.textAlign = "right"; x.fillText("Pagina " + (i + 1) + " di " + n, self.W - self.m, self.H - 60); x.textAlign = "left";
    });
    return this.pagine;
  };
  TD.Documento = Documento;

  /* ---------------------------------------------------------- PDF */
  function b64bytes(dataUrl) {
    const b = atob(dataUrl.split(",")[1]);
    const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
  TD.pdfDaCanvas = function (canvases, info) {
    const enc = new TextEncoder();
    const parti = []; let len = 0; const off = [];
    function add(x) { const u = typeof x === "string" ? enc.encode(x) : x; parti.push(u); len += u.length; }
    function obj(n, body) { off[n] = len; add(n + " 0 obj\n"); body(); add("\nendobj\n"); }
    function pdfStr(s) {
      // titolo in UTF-16BE con BOM
      let h = "FEFF";
      for (const ch of String(s || "")) { const c = ch.codePointAt(0); if (c < 0x10000) h += c.toString(16).padStart(4, "0"); }
      return "<" + h.toUpperCase() + ">";
    }
    const n = canvases.length;
    // 1 catalogo, 2 pagine, 3 info, poi per ogni pagina: page, content, image
    add("%PDF-1.4\n");
    add(new Uint8Array([37, 226, 227, 207, 211, 10]));
    obj(1, function () { add("<< /Type /Catalog /Pages 2 0 R >>"); });
    const kids = []; for (let i = 0; i < n; i++) kids.push((4 + i * 3) + " 0 R");
    obj(2, function () { add("<< /Type /Pages /Count " + n + " /Kids [" + kids.join(" ") + "] >>"); });
    obj(3, function () {
      add("<< /Title " + pdfStr((info && info.titolo) || "Documento") + " /Author " + pdfStr((info && info.autore) || "Tutor Digitale") +
        " /Creator " + pdfStr("Tutor Digitale " + TD.VERSIONE) + " /Producer " + pdfStr("Tutor Digitale") + " >>");
    });
    canvases.forEach(function (c, i) {
      const land = c.width > c.height;
      const W = land ? PT.h : PT.w, H = land ? PT.w : PT.h;
      const jpg = b64bytes(c.toDataURL("image/jpeg", 0.9));
      const p = 4 + i * 3;
      obj(p, function () {
        add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W.toFixed(2) + " " + H.toFixed(2) + "] /Resources << /XObject << /Im" + i + " " + (p + 2) + " 0 R >> >> /Contents " + (p + 1) + " 0 R >>");
      });
      const cs = "q " + W.toFixed(2) + " 0 0 " + H.toFixed(2) + " 0 0 cm /Im" + i + " Do Q";
      obj(p + 1, function () { add("<< /Length " + cs.length + " >>\nstream\n" + cs + "\nendstream"); });
      obj(p + 2, function () {
        add("<< /Type /XObject /Subtype /Image /Width " + c.width + " /Height " + c.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpg.length + " >>\nstream\n");
        add(jpg); add("\nendstream");
      });
    });
    const tot = 4 + n * 3;
    const xref = len;
    let x = "xref\n0 " + tot + "\n0000000000 65535 f \n";
    for (let i = 1; i < tot; i++) x += String(off[i]).padStart(10, "0") + " 00000 n \n";
    add(x + "trailer\n<< /Size " + tot + " /Root 1 0 R /Info 3 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
    return new Blob(parti, { type: "application/pdf" });
  };
  TD.scaricaPdf = function (canvases, nome, info) {
    try { TD.scarica(TD.pdfDaCanvas(canvases, info), nome); TD.toast("PDF creato sul dispositivo."); }
    catch (e) { console.error(e); TD.toast("Non riesco a creare il PDF: usa Stampa › Salva come PDF."); }
  };
  TD.stampa = function (canvases) {
    let area = document.getElementById("printArea");
    if (!area) { area = document.createElement("div"); area.id = "printArea"; document.body.appendChild(area); }
    area.innerHTML = "";
    const land = canvases[0] && canvases[0].width > canvases[0].height;
    document.documentElement.classList.toggle("print-land", !!land);
    canvases.forEach(function (c) { const im = new Image(); im.src = c.toDataURL("image/png"); im.className = "print-page"; area.appendChild(im); });
    document.documentElement.classList.add("printing-doc");
    setTimeout(function () {
      window.print();
      setTimeout(function () { document.documentElement.classList.remove("printing-doc", "print-land"); }, 800);
    }, 300);
  };
  TD.anteprima = function (contenitore, canvases) {
    contenitore.innerHTML = "";
    canvases.forEach(function (c) { const im = new Image(); im.src = c.toDataURL("image/jpeg", 0.8); im.className = "doc-preview-page"; im.alt = "Anteprima pagina"; contenitore.appendChild(im); });
  };
  TD.immagine = function (src) {
    return new Promise(function (ok) {
      if (!src) return ok(null);
      const im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = src;
    });
  };

  /* ---------------------------------------------------------- firma */
  TD.padFirma = function (canvas, iniziale) {
    const x = canvas.getContext("2d");
    let disegna = false, vuota = true, ultimo = null;
    function dim() {
      const r = canvas.getBoundingClientRect();
      const dati = vuota ? null : canvas.toDataURL();
      canvas.width = Math.max(300, r.width * 2); canvas.height = Math.max(150, r.height * 2);
      x.lineCap = "round"; x.lineJoin = "round"; x.lineWidth = 5; x.strokeStyle = "#0f1f36";
      if (dati) TD.immagine(dati).then(function (im) { if (im) x.drawImage(im, 0, 0, canvas.width, canvas.height); });
    }
    function pos(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; }
    canvas.addEventListener("pointerdown", function (e) { disegna = true; vuota = false; ultimo = pos(e); canvas.setPointerCapture(e.pointerId); e.preventDefault(); });
    canvas.addEventListener("pointermove", function (e) {
      if (!disegna) return; const p = pos(e);
      x.beginPath(); x.moveTo(ultimo.x, ultimo.y); x.lineTo(p.x, p.y); x.stroke(); ultimo = p; e.preventDefault();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { canvas.addEventListener(ev, function () { disegna = false; }); });
    dim();
    if (iniziale) { vuota = false; TD.immagine(iniziale).then(function (im) { if (im) x.drawImage(im, 0, 0, canvas.width, canvas.height); }); }
    return {
      pulisci: function () { x.clearRect(0, 0, canvas.width, canvas.height); vuota = true; },
      vuota: function () { return vuota; },
      dati: function () {
        if (vuota) return "";
        // ritaglia lo spazio vuoto attorno alla firma
        const d = x.getImageData(0, 0, canvas.width, canvas.height).data;
        let a = canvas.width, b = canvas.height, c = 0, e = 0;
        for (let yy = 0; yy < canvas.height; yy += 2) for (let xx = 0; xx < canvas.width; xx += 2) {
          if (d[(yy * canvas.width + xx) * 4 + 3] > 10) { if (xx < a) a = xx; if (yy < b) b = yy; if (xx > c) c = xx; if (yy > e) e = yy; }
        }
        if (c <= a || e <= b) return "";
        const t = document.createElement("canvas"); t.width = c - a + 20; t.height = e - b + 20;
        t.getContext("2d").drawImage(canvas, a - 10, b - 10, t.width, t.height, 0, 0, t.width, t.height);
        return t.toDataURL("image/png");
      }
    };
  };
})();
