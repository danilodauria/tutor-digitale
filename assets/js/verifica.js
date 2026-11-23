/* ==========================================================================
   Tutor Digitale · pagina pubblica di verifica degli attestati
   Controlla la firma ECDSA del QR e, se ci sono, il registro delle chiavi
   dei tutor riconosciuti e il registro pubblico (facoltativo) degli attestati.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  if (window.top !== window.self) { try { window.top.location.replace(window.self.location.href); } catch (e) { document.documentElement.innerHTML = ""; return; } }
  function E(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function dataIt(iso) { const p = String(iso || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso; }
  const PERCORSI = { pc: "Computer", tablet: "Tablet", smartphone: "Smartphone", tv: "Smart TV", rete: "Internet e sicurezza", accessori: "Accessori" };
  function json(url) { return fetch(url, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }

  async function controlla(testo) {
    const box = document.getElementById("esito");
    if (!/a=/.test(testo || "")) {
      box.innerHTML = '<div class="card"><h2>Inquadra il QR dell\'attestato</h2><p>Apri questa pagina inquadrando con la fotocamera del telefono il QR in alto a destra dell\'attestato, oppure incolla qui sotto il link letto dal QR.</p></div>';
      return;
    }
    if (!TD.scambio || !TD.scambio.sicuro) {
      box.innerHTML = '<div class="card"><h2>Browser non adatto</h2><p>Questo browser non sa controllare le firme digitali. Apri la pagina con Chrome, Edge, Firefox o Safari aggiornati.</p></div>';
      return;
    }
    const v = await TD.scambio.verificaAttestato(testo);
    if (v.stato !== "valida") {
      box.innerHTML = '<div class="card verifica ko"><h2>✗ Attestato non verificato</h2><p>' + (v.stato === "alterata"
        ? "La firma digitale <strong>non corrisponde</strong> ai dati: l'attestato o il QR sono stati modificati."
        : "Il QR non contiene un attestato leggibile. Prova a inquadrarlo di nuovo, con più luce.") + "</p></div>";
      return;
    }
    const d = v.dati;
    const [chiavi, registro] = await Promise.all([json("chiavi.json"), json("registro.json")]);
    const nota = ((chiavi && chiavi.chiavi) || []).find(function (k) { return k.chiave === v.chiave; });
    const inRegistro = ((registro && registro.attestati) || []).find(function (a) { return a.codice === d.c; });
    box.innerHTML = '<div class="card verifica ok"><h2>✓ Firma digitale valida</h2>' +
      "<p>I dati qui sotto sono esattamente quelli firmati dal docente al rilascio: non sono stati modificati.</p>" +
      '<dl class="dl"><dt>Codice</dt><dd><strong>' + E(d.c) + "</strong></dd><dt>Intestatario</dt><dd>" + E(d.n) + "</dd><dt>Rilasciato il</dt><dd>" + E(dataIt(d.data)) + "</dd>" +
      (d.l ? "<dt>Livello</dt><dd>" + E(d.l) + "</dd>" : "") + (d.o ? "<dt>Ore di formazione</dt><dd>" + E(String(d.o).replace(".", ",")) + "</dd>" : "") +
      (d.p ? "<dt>Percorsi</dt><dd>" + E(String(d.p).split(",").map(function (id) { return PERCORSI[id] || id; }).join(", ")) + "</dd>" : "") +
      "<dt>Docente</dt><dd>" + E(d.t || "—") + "</dd><dt>Impronta della chiave</dt><dd><code>" + E(v.impronta) + "</code></dd></dl>" +
      (nota ? '<p class="pill ok">✓ Chiave riconosciuta: ' + E(nota.nome) + "</p>"
        : '<p class="pill warn">La chiave non è (ancora) nel registro pubblico dei docenti: per sicurezza chiedi conferma al docente, che può leggerti la stessa impronta dal suo programma.</p>') +
      (inRegistro ? '<p class="pill ok">✓ Presente nel registro pubblico degli attestati</p>' : "") +
      "</div>";
  }
  controlla(location.hash);
  window.addEventListener("hashchange", function () { controlla(location.hash); });
  document.getElementById("manuale").onsubmit = function (e) { e.preventDefault(); controlla(this.link.value); };
})();
