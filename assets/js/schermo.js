/* ==========================================================================
   Tutor Digitale · schermo grande dell'aula
   La pagina che il pulsante «Trasmetti allo schermo» apre sul Chromecast, sul
   Fire TV (finestra portata sul televisore) o sul secondo monitor: riceve le
   domande dallo stesso canale cifrato della stanza e le mostra in grande.
   Non contiene comandi: si limita a mostrare.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

(function () {
  "use strict";

  const radice = document.getElementById("schermoApp");
  if (!radice) return;   // pagina normale del programma: qui non serve fare nulla

  const COLORI = ["#2f7fc0", "#c98a24", "#3f9a63", "#7d55c0"];
  const FORME = ["▲", "◆", "●", "■"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* i parametri arrivano dopo il cancelletto: #/schermo?s=…&k=… */
  function parametro(nome) {
    const testo = String(location.hash || "") + "&" + String(location.search || "").replace(/^\?/, "");
    const trovato = testo.match(new RegExp("[?&#]" + nome + "=([^&]*)"));
    if (!trovato) return "";
    try { return decodeURIComponent(trovato[1]); } catch (e) { return ""; }
  }

  const stanza = parametro("s"), chiave = parametro("k");
  const idSchermo = "schermo" + Math.random().toString(36).slice(2, 10);
  let canale = null, stato = null, orologio = null, ultimo = 0, battito = null;
  let tentativo = null, inCorso = false, finita = false;

  function statoSicuro(m) {
    const n = function (x, d) { x = Number(x); return isFinite(x) ? x : (d || 0); };
    const t = function (x, max) { return String(x == null ? "" : x).slice(0, max || 400); };
    const q = m.domanda && typeof m.domanda === "object" ? {
      n: n(m.domanda.n), testo: t(m.domanda.testo), proposta: t(m.domanda.proposta, 300),
      opzioni: (Array.isArray(m.domanda.opzioni) ? m.domanda.opzioni : []).slice(0, 4).map(function (o) { return t(o, 300); })
    } : null;
    const gi = n(m.giusta, -1);
    return {
      fase: ["attesa", "domanda", "fine", "chiusa"].indexOf(m.fase) >= 0 ? m.fase : "attesa",
      totale: n(m.totale), tempo: Math.max(0, n(m.tempo)), inizio: n(m.inizio), solo: m.solo === true, max: n(m.max, 1),
      domanda: q, giusta: gi >= 0 ? Math.floor(gi) : -1, spiegazione: t(m.spiegazione, 800),
      risposte: n(m.risposte),
      distribuzione: Array.isArray(m.distribuzione) ? m.distribuzione.slice(0, 4).map(function (x) { return n(x); }) : null,
      nomi: (Array.isArray(m.nomi) ? m.nomi : []).slice(0, 12).map(function (x) { return t(x, 24); }),
      giocatori: n(m.giocatori),
      classifica: (Array.isArray(m.classifica) ? m.classifica : []).slice(0, 10).map(function (g) { return { nome: t(g && g.nome, 24), punti: n(g && g.punti), giuste: n(g && g.giuste) }; })
    };
  }

  function fermaBattito() { clearInterval(battito); battito = null; }
  function riprova(ms) { clearTimeout(tentativo); tentativo = setTimeout(collega, ms); }

  function collega() {
    if (inCorso || finita) return;   // una sola connessione per volta
    inCorso = true;
    TD.relay.collega({
      stanza: stanza, chiave: chiave,
      suMessaggio: function (m) {
        if (!m || m.t !== "stato") return;
        stato = statoSicuro(m);
        ultimo = Date.now();
        if (stato.fase === "chiusa") { finita = true; fermaBattito(); }   // l'aula è finita: non serve riconnettersi
        disegna();
      },
      suStato: function (s) {
        if (s !== "chiuso") return;
        canale = null; fermaBattito(); disegna();
        if (!finita) riprova(2500);
      }
    }).then(function (c) {
      inCorso = false; clearTimeout(tentativo);
      if (finita) { c.chiudi(); return; }
      canale = c;
      c.invia({ t: "schermo", id: idSchermo });
      /* se lo stato non arriva (scheda del tutor in secondo piano o messaggio perso),
         lo schermo lo richiede da solo: resta sempre allineato */
      fermaBattito();
      battito = setInterval(function () {
        if (canale && (!stato || Date.now() - ultimo > 10000)) canale.invia({ t: "schermo", id: idSchermo });
      }, 5000);
      disegna();
    }).catch(function (e) {
      inCorso = false; canale = null; fermaBattito();
      if (finita) return;
      radice.innerHTML = '<div class="sch-center"><h1>Schermo non collegato</h1><p class="sch-nota">' + esc(e.message) + "</p><p class=\"sch-nota\">Riprovo tra qualche secondo…</p></div>";
      riprova(5000);
    });
  }

  function barre(d, giusta) {
    const max = Math.max.apply(null, (d || []).concat([1]));
    return '<div class="sch-distr">' + (d || []).map(function (n, i) {
      return '<div class="sch-col' + (i === giusta ? " giusta" : "") + '"><b>' + n + '</b><i style="height:' + Math.round(100 * (Number(n) || 0) / max) + "%;background:" + COLORI[i % 4] + '"></i><span>' + FORME[i % 4] + " " + "ABCD"[i] + "</span></div>";
    }).join("") + "</div>";
  }
  function classificaHtml() {
    const cl = stato.classifica || [];
    if (!cl.length) return "";
    return '<ol class="sch-classifica">' + cl.slice(0, 5).map(function (g, i) {
      return "<li><span>" + (i + 1) + ".</span><strong>" + esc(g.nome) + "</strong><em>" + g.punti + " punti</em></li>";
    }).join("") + "</ol>";
  }
  function opzioni(q, mostra) {
    return '<div class="sch-opzioni">' + q.opzioni.map(function (o, i) {
      const cls = mostra ? (i === stato.giusta ? " giusta" : " spenta") : "";
      return '<div class="sch-opz' + cls + '" style="--c:' + COLORI[i % 4] + '"><span class="sch-forma">' + FORME[i % 4] + " " + "ABCD"[i] + '</span><span>' + esc(o) + "</span></div>";
    }).join("") + "</div>";
  }
  function punteggio() {
    const g = (stato.classifica || [])[0];
    if (!g) return "";
    return '<p class="sch-punteggio">' + esc(g.nome) + ": <strong>" + g.punti + "</strong> punti · " + g.giuste + " giuste</p>";
  }

  function disegna() {
    clearInterval(orologio);
    if (!stato) {
      radice.innerHTML = '<div class="sch-center"><h1>Tutor Digitale · Aula</h1><p class="sch-nota">Collegamento allo schermo…</p></div>';
      return;
    }
    const s = stato, q = s.domanda;
    let interno = "";
    if (s.fase === "attesa") {
      interno = '<div class="sch-center"><h1>' + (s.solo ? "Quiz dal telefono" : "Aula") + "</h1>" +
        '<p class="sch-big">In attesa della prima domanda</p>' +
        (s.giocatori ? '<p class="sch-nota">Collegati: ' + s.giocatori + (s.nomi.length ? " — " + esc(s.nomi.join(" · ")) : "") + "</p>" : '<p class="sch-nota">Inquadra il QR mostrato dal tutor e scrivi il tuo nome.</p>') + "</div>";
    } else if (s.fase === "chiusa") {
      interno = '<div class="sch-center"><h1>Aula chiusa</h1><p class="sch-big">Grazie per aver partecipato!</p></div>';
    } else if (s.fase === "fine") {
      interno = '<div class="sch-center"><h1>Fine!</h1>' + (s.max === 1 ? punteggio() : classificaHtml()) + "</div>";
    } else if (s.fase === "domanda" && q) {
      const mostra = s.giusta >= 0;
      const resto = s.tempo ? Math.max(0, s.tempo - Math.floor((Date.now() - s.inizio) / 1000)) : 0;
      interno = '<div class="sch-top"><span>Domanda ' + q.n + " di " + s.totale + "</span>" + (mostra ? "" : '<span id="schTempo" class="sch-tempo">' + resto + "</span>") + "<span>" + (s.max === 1 ? (s.risposte ? "Risposta ricevuta" : "In attesa") : s.risposte + " risposte") + "</span></div>" +
        '<h1 class="sch-domanda">' + esc(q.testo) + (q.proposta ? '<br><em>«' + esc(q.proposta) + "»</em>" : "") + "</h1>" +
        opzioni(q, mostra) +
        (mostra ? barre(s.distribuzione, s.giusta) + '<p class="sch-spiega">' + esc(s.spiegazione) + "</p>" + (s.max === 1 ? punteggio() : classificaHtml()) : "");
    } else {
      interno = '<div class="sch-center"><h1>Tutor Digitale · Aula</h1><p class="sch-nota">In attesa del tutor…</p></div>';
    }
    radice.innerHTML = '<div class="sch-live">● ' + (s.fase === "chiusa" ? "Aula chiusa" : canale ? "Collegato" : "Riconnessione") + "</div>" + interno;
    if (s.fase === "domanda" && s.giusta < 0 && s.tempo) {
      orologio = setInterval(function () {
        const el = document.getElementById("schTempo");
        if (!el) { clearInterval(orologio); return; }
        el.textContent = Math.max(0, s.tempo - Math.floor((Date.now() - s.inizio) / 1000));
      }, 500);
    }
  }

  if (!stanza || !chiave) {
    radice.innerHTML = '<div class="sch-center"><h1>Schermo dell\'aula</h1><p class="sch-big">Apri questa pagina con il pulsante «Trasmetti allo schermo».</p><p class="sch-nota">Se l\'hai aperta a mano, manca il collegamento alla stanza: torna nel programma e premi il pulsante.</p></div>';
    return;
  }

  /* pulsante per il tutto schermo, sempre in vista */
  if (!document.getElementById("schPieno")) {
    const b = document.createElement("button");
    b.id = "schPieno"; b.type = "button"; b.className = "sch-pieno";
    b.textContent = "⛶ Schermo intero";
    b.addEventListener("click", function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    });
    document.body.appendChild(b);
  }

  disegna();
  collega();
})();
