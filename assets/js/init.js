/* ==========================================================================
   Tutor Digitale · avvio
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";

  /* il programma non si lascia incorniciare da altri siti (difesa dal «clickjacking») */
  if (window.top !== window.self) {
    try { window.top.location.replace(window.self.location.href); } catch (e) { document.documentElement.innerHTML = ""; return; }
  }

  TD.logoImg = new Image();
  TD.logoImg.src = (TD.MODO === "allievo" ? "../" : "") + "assets/img/icon-512.png";

  TD.applicaAspetto = function () {
    const imp = TD.db.impostazioni || {};
    let t = imp.tema;
    if (t !== "dark" && t !== "light") t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-font", imp.caratteri || "normale");
    if (TD.applicaAccessibilita) TD.applicaAccessibilita();
    try { localStorage.setItem(TD.MODO === "allievo" ? "tutor-digitale-allievo:v1:theme" : "tutor-digitale:v1:theme", t); } catch (e) {}
  };

  function menu() {
    const btn = document.getElementById("menuBtn"), nav = document.getElementById("mainNav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
    /* «Altro»: menu a tendina scorrevole, con frecce, Inizio/Fine ed Esc come nei programmi */
    const more = nav.querySelector(".nav-more");
    const moreMenu = more && more.querySelector(".nav-more-menu");
    const moreSummary = more && more.querySelector("summary");
    const moreLinks = moreMenu ? Array.from(moreMenu.querySelectorAll("a")) : [];
    function chiudiAltro(torna) {
      if (!more || !more.open) return;
      more.open = false;
      if (torna && moreSummary) moreSummary.focus();
    }
    function evidenzia(el) {
      if (!el) return;
      el.focus();
      try { el.scrollIntoView({ block: "nearest" }); } catch (e) {}
    }
    if (more && moreSummary && moreMenu && moreLinks.length) {
      more.addEventListener("toggle", function () { if (more.open) moreMenu.scrollTop = 0; });
      moreSummary.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        more.open = true;
        moreMenu.scrollTop = 0;
        evidenzia(e.key === "ArrowDown" ? moreLinks[0] : moreLinks[moreLinks.length - 1]);
      });
      moreMenu.addEventListener("keydown", function (e) {
        const i = moreLinks.indexOf(document.activeElement);
        if (i < 0) return;
        const n = moreLinks.length;
        if (e.key === "ArrowDown") { e.preventDefault(); evidenzia(moreLinks[(i + 1) % n]); }
        else if (e.key === "ArrowUp") { e.preventDefault(); evidenzia(moreLinks[(i - 1 + n) % n]); }
        else if (e.key === "Home") { e.preventDefault(); evidenzia(moreLinks[0]); }
        else if (e.key === "End") { e.preventDefault(); evidenzia(moreLinks[n - 1]); }
      });
      more.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && more.open) { e.preventDefault(); e.stopPropagation(); chiudiAltro(true); }
      });
      more.addEventListener("focusout", function (e) { if (!more.contains(e.relatedTarget)) chiudiAltro(false); });
      document.addEventListener("pointerdown", function (e) { if (more.open && !more.contains(e.target)) chiudiAltro(false); });
      moreMenu.addEventListener("click", function (e) {
        if (!e.target.closest("a")) return;
        chiudiAltro(false);
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !nav.classList.contains("open")) return;
      if (more && more.open) return;
      nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.focus();
    });
    document.addEventListener("pointerdown", function (e) {
      if (!nav.classList.contains("open") || nav.contains(e.target) || btn.contains(e.target)) return;
      nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false");
    });
    const th = document.getElementById("themeBtn"), fb = document.getElementById("fontBtn");
    if (th) th.addEventListener("click", function () {
      const ora = document.documentElement.getAttribute("data-theme");
      TD.db.impostazioni.tema = ora === "dark" ? "light" : "dark"; TD.salva(); TD.applicaAspetto();
    });
    if (fb) fb.addEventListener("click", function () {
      const giro = { normale: "grande", grande: "enorme", enorme: "normale" };
      TD.db.impostazioni.caratteri = giro[TD.db.impostazioni.caratteri || "normale"]; TD.salva(); TD.applicaAspetto();
      TD.toast({ normale: "Caratteri normali", grande: "Caratteri grandi", enorme: "Caratteri molto grandi" }[TD.db.impostazioni.caratteri]);
    });
    const tp = document.getElementById("timerPill");
    if (tp) tp.addEventListener("click", function () { TD.vai("#/strumenti"); });
    document.querySelectorAll("[data-versione]").forEach(function (el) { el.textContent = TD.VERSIONE; });
  }

  TD.applicaAspetto();
  menu();
  TD.aggiornaChip();
  window.addEventListener("hashchange", TD.render);
  TD.render();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        reg.addEventListener("updatefound", function () {
          const nw = reg.installing;
          if (nw) nw.addEventListener("statechange", function () {
            if (nw.state === "installed" && navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL === nw.scriptURL) TD.toast("È pronta una nuova versione: ricarica la pagina per usarla.");
          });
        });
      }).catch(function () {});
    });
  }
})();
