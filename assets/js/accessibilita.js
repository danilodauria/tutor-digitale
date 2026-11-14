/* ==========================================================================
   Tutor Digitale · accessibilità (miglioria 19)
   Contrasto elevato, pulsanti grandi, meno movimento e la modalità «un
   pulsante alla volta» (scansione): il programma illumina a turno ogni
   comando della pagina e basta toccare un punto qualsiasi dello schermo, o
   premere un tasto qualunque, per scegliere quello illuminato. Pensata per
   chi ha difficoltà motorie e usa un solo sensore, un pulsante o la barra.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";
  const E = TD.esc, I = TD.icona;
  const BASE = { contrasto: false, grandi: false, movimento: false, scansione: false, velocita: 2500 };
  function imp() { TD.db.impostazioni = TD.db.impostazioni || {}; TD.db.impostazioni.access = Object.assign({}, BASE, TD.db.impostazioni.access || {}); return TD.db.impostazioni.access; }

  /* ------------------------------------------------------------ scansione */
  const SC = { timer: null, i: -1, el: null, barra: null, pausa: false };
  function comandi() {
    const radice = document.querySelector(".modal") || document;
    const sel = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]';
    return Array.from(radice.querySelectorAll(sel)).filter(function (x) {
      if (x.closest(".scansione-barra") || x.closest("[hidden]")) return false;
      const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== "hidden";
    });
  }
  function evidenzia(el) {
    if (SC.el) SC.el.classList.remove("scansione-qui");
    SC.el = el;
    if (!el) return;
    el.classList.add("scansione-qui");
    try { el.focus({ preventScroll: true }); } catch (e) {}
    el.scrollIntoView({ block: "center", behavior: imp().movimento ? "auto" : "smooth" });
    const t = SC.barra && SC.barra.querySelector(".scansione-cosa");
    if (t) t.textContent = (el.getAttribute("aria-label") || el.textContent || el.value || el.placeholder || el.name || "comando").replace(/\s+/g, " ").trim().slice(0, 60);
  }
  function passo() {
    if (SC.pausa) return;
    const lista = comandi();
    if (!lista.length) return;
    let k = SC.el ? lista.indexOf(SC.el) : -1;
    k = (k + 1) % lista.length;
    evidenzia(lista[k]);
  }
  function scegli() {
    const el = SC.el;
    if (!el || !document.contains(el)) { passo(); return; }
    if (el.matches("input[type=checkbox], input[type=radio]")) { el.click(); }
    else if (el.matches("input, textarea")) { SC.pausa = true; aggiornaBarra(); el.focus(); return; }
    else if (el.matches("select")) { el.selectedIndex = (el.selectedIndex + 1) % el.options.length; el.dispatchEvent(new Event("change", { bubbles: true })); return; }
    else el.click();
    SC.el = null;
    setTimeout(passo, 400);
  }
  function aggiornaBarra() {
    if (!SC.barra) return;
    SC.barra.querySelector(".scansione-stato").textContent = SC.pausa ? "In pausa: tocca per riprendere" : "Tocca un punto qualsiasi o premi un tasto per scegliere";
  }
  function avviaScansione() {
    fermaScansione();
    SC.barra = document.createElement("div");
    SC.barra.className = "scansione-barra";
    SC.barra.setAttribute("role", "region"); SC.barra.setAttribute("aria-label", "Un pulsante alla volta");
    SC.barra.innerHTML = '<span class="scansione-stato"></span><strong class="scansione-cosa"></strong><button type="button" class="btn btn-sm" data-esci>Esci dalla modalità</button>';
    document.body.appendChild(SC.barra);
    aggiornaBarra();
    SC.timer = setInterval(passo, imp().velocita || 2500);
    passo();
  }
  function fermaScansione() {
    clearInterval(SC.timer); SC.timer = null;
    if (SC.el) SC.el.classList.remove("scansione-qui");
    SC.el = null; SC.pausa = false;
    if (SC.barra) SC.barra.remove(); SC.barra = null;
  }
  /* un tocco ovunque o un tasto qualsiasi = scegli (Esc mette in pausa) */
  document.addEventListener("pointerdown", function (e) {
    if (!SC.timer) return;
    if (e.target.closest("[data-esci]")) { e.preventDefault(); imp().scansione = false; TD.salva(); fermaScansione(); TD.toast("Modalità «un pulsante alla volta» spenta."); return; }
    if (SC.pausa && (e.target.matches("input, textarea") || e.target.closest(".modal input, .modal textarea"))) return;
    e.preventDefault(); e.stopPropagation();
    if (SC.pausa) { SC.pausa = false; aggiornaBarra(); return; }
    scegli();
  }, true);
  document.addEventListener("click", function (e) { if (SC.timer && !SC.pausa && e.isTrusted && !e.target.closest("[data-esci]")) { e.preventDefault(); e.stopPropagation(); } }, true);
  document.addEventListener("keydown", function (e) {
    if (!SC.timer) return;
    if (SC.pausa) { if (e.key === "Escape" || (e.key === "Enter" && !e.target.matches("textarea"))) { SC.pausa = false; aggiornaBarra(); e.preventDefault(); } return; }
    if (e.key === "Escape") { SC.pausa = true; aggiornaBarra(); return; }
    if (e.key === "Tab") return;
    e.preventDefault(); scegli();
  }, true);
  window.addEventListener("hashchange", function () { if (SC.timer) { SC.el = null; setTimeout(passo, 300); } });

  /* ------------------------------------------------------------ applica */
  TD.applicaAccessibilita = function () {
    const a = imp(), h = document.documentElement;
    h.toggleAttribute("data-contrasto", !!a.contrasto);
    h.toggleAttribute("data-grandi", !!a.grandi);
    h.toggleAttribute("data-fermo", !!a.movimento);
    if (a.scansione && !SC.timer) avviaScansione();
    if (!a.scansione && SC.timer) fermaScansione();
    if (a.scansione && SC.timer) { clearInterval(SC.timer); SC.timer = setInterval(passo, a.velocita || 2500); }
  };

  TD.cardAccessibilita = function () {
    const a = imp();
    return '<section class="card" id="cardAccess"><h2>' + I("hand") + 'Accessibilità</h2>' +
      '<label class="check"><input type="checkbox" data-acc="contrasto"' + (a.contrasto ? " checked" : "") + "> Contrasto elevato (nero, bianco e giallo)</label>" +
      '<label class="check"><input type="checkbox" data-acc="grandi"' + (a.grandi ? " checked" : "") + "> Pulsanti e caselle più grandi</label>" +
      '<label class="check"><input type="checkbox" data-acc="movimento"' + (a.movimento ? " checked" : "") + "> Niente animazioni</label>" +
      '<label class="check"><input type="checkbox" data-acc="scansione"' + (a.scansione ? " checked" : "") + "> Un pulsante alla volta (per chi ha difficoltà a usare mouse o dita)</label>" +
      '<label class="field"><span>Velocità del pulsante alla volta</span><select data-acc-vel aria-label="Velocità della scansione">' + [[1500, "Veloce (1,5 s)"], [2500, "Normale (2,5 s)"], [4000, "Lenta (4 s)"], [6000, "Molto lenta (6 s)"]].map(function (v) { return '<option value="' + v[0] + '"' + (Number(a.velocita) === v[0] ? " selected" : "") + ">" + v[1] + "</option>"; }).join("") + "</select></label>" +
      '<p class="muted text-small">Con «un pulsante alla volta» ogni comando si illumina a turno: per sceglierlo basta toccare lo schermo in un punto qualsiasi o premere un tasto (anche un pulsante esterno o un sensore collegato come tastiera). Esc mette in pausa. Il programma funziona anche con NVDA, TalkBack e VoiceOver e con il tasto Tab.</p></section>';
  };
  TD.collegaAccessibilita = function () {
    const box = document.getElementById("cardAccess"); if (!box) return;
    box.querySelectorAll("[data-acc]").forEach(function (cb) { cb.onchange = function () { imp()[cb.dataset.acc] = cb.checked; TD.salva(); TD.applicaAccessibilita(); }; });
    const v = box.querySelector("[data-acc-vel]"); if (v) v.onchange = function () { imp().velocita = Number(v.value) || 2500; TD.salva(); TD.applicaAccessibilita(); };
  };
  TD.accessibilitaInterna = { comandi: comandi, avvia: avviaScansione, ferma: fermaScansione, stato: SC };
})();
