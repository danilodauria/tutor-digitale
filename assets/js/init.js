/* ==========================================================================
   Tutor Digitale · avvio
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";

  TD.logoImg = new Image();
  TD.logoImg.src = "assets/img/icon-512.png";

  TD.applicaAspetto = function () {
    const imp = TD.db.impostazioni || {};
    let t = imp.tema;
    if (t !== "dark" && t !== "light") t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-font", imp.caratteri || "normale");
    try { localStorage.setItem("tutor-digitale:v1:theme", t); } catch (e) {}
  };

  function menu() {
    const btn = document.getElementById("menuBtn"), nav = document.getElementById("mainNav");
    btn.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
    document.getElementById("themeBtn").addEventListener("click", function () {
      const ora = document.documentElement.getAttribute("data-theme");
      TD.db.impostazioni.tema = ora === "dark" ? "light" : "dark"; TD.salva(); TD.applicaAspetto();
    });
    document.getElementById("fontBtn").addEventListener("click", function () {
      const giro = { normale: "grande", grande: "enorme", enorme: "normale" };
      TD.db.impostazioni.caratteri = giro[TD.db.impostazioni.caratteri || "normale"]; TD.salva(); TD.applicaAspetto();
      TD.toast({ normale: "Caratteri normali", grande: "Caratteri grandi", enorme: "Caratteri molto grandi" }[TD.db.impostazioni.caratteri]);
    });
    document.getElementById("timerPill").addEventListener("click", function () { TD.vai("#/strumenti"); });
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
            if (nw.state === "installed" && navigator.serviceWorker.controller) TD.toast("È pronta una nuova versione: ricarica la pagina per usarla.");
          });
        });
      }).catch(function () {});
    });
  }
})();
