/* ==========================================================================
   Tutor Digitale · fattura elettronica FatturaPA 1.2 (miglioria 11)
   Produce il file XML (formato FPR12, verso privati e aziende) da caricare
   nel portale «Fatture e Corrispettivi» dell'Agenzia delle Entrate o nel
   programma del commercialista. Il programma NON firma e NON invia allo SDI:
   prepara il file e controlla che i dati obbligatori ci siano.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

window.TD = window.TD || {};

(function () {
  "use strict";

  const NORMA_FORFETTARIO = "Operazione in franchigia da IVA ai sensi dell'art. 1, commi 54-89, L. 190/2014";
  const NORMA_MINIMI = "Operazione senza IVA ai sensi dell'art. 27, commi 1 e 2, D.L. 98/2011 (regime dei minimi)";

  function x(s) {
    return String(s == null ? "" : s).normalize("NFC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  function el(nome, valore) { return valore === "" || valore == null ? "" : "<" + nome + ">" + x(valore) + "</" + nome + ">"; }
  function gruppo(nome, dentro) { return dentro ? "<" + nome + ">" + dentro + "</" + nome + ">" : ""; }
  function n2(v) { return (Math.round((Number(v) || 0) * 100) / 100).toFixed(2); }
  function taglia(s, max) { return String(s || "").trim().slice(0, max); }
  function soloCifre(s) { return String(s || "").replace(/\s+/g, "").toUpperCase(); }
  function eCf(s) { return /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/.test(soloCifre(s)); }
  function ePiva(s) {
    const v = soloCifre(s).replace(/^IT/, "");
    if (!/^\d{11}$/.test(v)) return false;
    let somma = 0;
    for (let i = 0; i < 11; i++) { let c = +v[i]; if (i % 2) { c *= 2; if (c > 9) c -= 9; } somma += c; }
    return somma % 10 === 0;
  }
  function divisoNome(nome) { const p = String(nome || "").trim().split(/\s+/); return { nome: p.slice(0, -1).join(" ") || p[0] || "", cognome: p.length > 1 ? p[p.length - 1] : "" }; }

  /* righe: [{voce, qta, prezzo}] · prof: profilo del tutor · cli: cliente · doc: {numero, data, bolloAlCliente, causale, pagamento} */
  function calcola(righe, prof, doc) {
    const regime = prof.regimeFiscale || "RF19";
    const senzaIva = regime === "RF19" || regime === "RF02";
    const aliquota = senzaIva ? 0 : 22;
    const linee = righe.filter(function (r) { return r.voce && Number(r.qta); }).map(function (r, i) {
      const tot = Math.round(Number(r.qta) * Number(r.prezzo) * 100) / 100;
      return { n: i + 1, descr: taglia(r.voce, 1000), qta: Number(r.qta), prezzo: Number(r.prezzo), totale: tot, aliquota: aliquota, natura: senzaIva ? "N2.2" : "" };
    });
    const imponibile = Math.round(linee.reduce(function (s, l) { return s + l.totale; }, 0) * 100) / 100;
    const bollo = senzaIva && imponibile > 77.47;
    if (bollo && doc.bolloAlCliente) linee.push({ n: linee.length + 1, descr: "Rimborso imposta di bollo assolta in modo virtuale", qta: 1, prezzo: 2, totale: 2, aliquota: 0, natura: "N1", bollo: true });
    const imposta = Math.round(imponibile * aliquota) / 100;
    const totale = Math.round((imponibile + imposta + (bollo && doc.bolloAlCliente ? 2 : 0)) * 100) / 100;
    return { regime: regime, senzaIva: senzaIva, aliquota: aliquota, linee: linee, imponibile: imponibile, imposta: imposta, bollo: bollo, totale: totale };
  }

  function controlla(prof, cli, doc, conti) {
    const e = [];
    if (!ePiva(prof.piva)) e.push("la tua partita IVA (11 cifre valide) in Impostazioni");
    if (!eCf(prof.cf) && !ePiva(prof.cf)) e.push("il tuo codice fiscale in Impostazioni");
    if (!prof.indirizzo || !/^\d{5}$/.test(prof.cap || "") || !prof.citta) e.push("il tuo indirizzo completo (via, CAP di 5 cifre, città) in Impostazioni");
    if (!cli) e.push("il cliente");
    else {
      if (!eCf(cli.cf) && !ePiva(cli.piva) && !eCf(cli.piva)) e.push("il codice fiscale o la partita IVA del cliente");
      if (!cli.indirizzo || !/^\d{5}$/.test(cli.cap || "") || !cli.citta) e.push("l'indirizzo completo del cliente (via, CAP, città)");
      if (cli.sdi && !/^[A-Z0-9]{7}$/.test(soloCifre(cli.sdi))) e.push("il codice destinatario del cliente (7 caratteri)");
    }
    if (!doc.numero) e.push("il numero della fattura");
    if (!conti.linee.length) e.push("almeno una riga");
    return e;
  }

  function xml(prof, cli, doc, righe) {
    const conti = calcola(righe, prof, doc);
    const errori = controlla(prof, cli, doc, conti);
    if (errori.length) { const err = new Error("Per la fattura elettronica manca: " + errori.join("; ") + "."); err.mancanti = errori; throw err; }
    const pivaT = soloCifre(prof.piva).replace(/^IT/, ""), cfT = soloCifre(prof.cf);
    /* ProgressivoInvio unico: anno e numero in base 36 (12/2026 → 05K8C) */
    const mn = String(doc.numero).match(/(\d+)\D+(\d{4})/);
    const progressivo = doc.progressivo || (mn ? (((+mn[2] - 2000) * 10000 + (+mn[1])).toString(36).toUpperCase().padStart(5, "0")) : String(doc.numero).replace(/[^0-9A-Za-z]/g, "").slice(-10).padStart(5, "0"));
    const sdi = cli.sdi ? soloCifre(cli.sdi) : "0000000";
    const nomeT = divisoNome(prof.nome);
    const anagCli = cli.tipo === "ente"
      ? el("Denominazione", taglia(cli.ragione || TD.nomeCliente(cli), 80))
      : el("Nome", taglia(cli.nome, 60)) + el("Cognome", taglia(cli.cognome, 60));
    const pivaCli = ePiva(cli.piva) ? soloCifre(cli.piva).replace(/^IT/, "") : "";
    const cfCli = eCf(cli.cf) ? soloCifre(cli.cf) : eCf(cli.piva) ? soloCifre(cli.piva) : (/^\d{11}$/.test(soloCifre(cli.cf)) ? soloCifre(cli.cf) : "");
    const sede = function (o) { return gruppo("Sede", el("Indirizzo", taglia(o.indirizzo, 60)) + el("CAP", o.cap) + el("Comune", taglia(o.citta, 60)) + el("Provincia", /^[A-Za-z]{2}$/.test(o.provincia || "") ? o.provincia.toUpperCase() : "") + el("Nazione", "IT")); };
    const norma = conti.regime === "RF02" ? NORMA_MINIMI : NORMA_FORFETTARIO;
    /* riepilogo: una riga per aliquota/natura */
    const gruppi = {};
    conti.linee.forEach(function (l) { const k = l.aliquota + "|" + l.natura; gruppi[k] = gruppi[k] || { aliquota: l.aliquota, natura: l.natura, imp: 0 }; gruppi[k].imp += l.totale; });
    const riepilogo = Object.keys(gruppi).map(function (k) {
      const g = gruppi[k];
      return gruppo("DatiRiepilogo", el("AliquotaIVA", n2(g.aliquota)) + el("Natura", g.natura) + el("ImponibileImporto", n2(g.imp)) + el("Imposta", n2(g.imp * g.aliquota / 100)) +
        (g.natura ? "" : el("EsigibilitaIVA", "I")) + (g.natura === "N2.2" ? el("RiferimentoNormativo", taglia(norma, 100)) : g.natura === "N1" ? el("RiferimentoNormativo", "Escluso art. 15 DPR 633/1972") : ""));
    }).join("");
    const iban = soloCifre(prof.iban);
    const modalita = doc.pagamento || (/^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$/.test(iban) ? "MP05" : "MP01");

    const corpo =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd">' +
      gruppo("FatturaElettronicaHeader",
        gruppo("DatiTrasmissione", gruppo("IdTrasmittente", el("IdPaese", "IT") + el("IdCodice", cfT || pivaT)) + el("ProgressivoInvio", progressivo) + el("FormatoTrasmissione", "FPR12") + el("CodiceDestinatario", sdi) +
          (sdi === "0000000" && cli.pec ? el("PECDestinatario", cli.pec) : "")) +
        gruppo("CedentePrestatore", gruppo("DatiAnagrafici", gruppo("IdFiscaleIVA", el("IdPaese", "IT") + el("IdCodice", pivaT)) + el("CodiceFiscale", cfT) +
            gruppo("Anagrafica", el("Nome", taglia(nomeT.nome, 60)) + el("Cognome", taglia(nomeT.cognome, 60))) + el("RegimeFiscale", conti.regime)) +
          sede(prof) + (prof.email || prof.telefono ? gruppo("Contatti", el("Telefono", taglia(String(prof.telefono || "").replace(/[^0-9+]/g, ""), 12)) + (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(prof.email || "") && prof.email.length >= 7 ? el("Email", taglia(prof.email, 256)) : "")) : "")) +
        gruppo("CessionarioCommittente", gruppo("DatiAnagrafici", (pivaCli ? gruppo("IdFiscaleIVA", el("IdPaese", "IT") + el("IdCodice", pivaCli)) : "") + el("CodiceFiscale", cfCli) + gruppo("Anagrafica", anagCli)) + sede(cli))) +
      gruppo("FatturaElettronicaBody",
        gruppo("DatiGenerali", gruppo("DatiGeneraliDocumento", el("TipoDocumento", "TD01") + el("Divisa", "EUR") + el("Data", doc.data) + el("Numero", doc.numero) +
          (conti.bollo ? gruppo("DatiBollo", el("BolloVirtuale", "SI") + el("ImportoBollo", "2.00")) : "") +
          el("ImportoTotaleDocumento", n2(conti.totale)) + el("Causale", taglia(doc.causale || "Lezioni di competenze digitali", 200)))) +
        gruppo("DatiBeniServizi", conti.linee.map(function (l) {
          return gruppo("DettaglioLinee", el("NumeroLinea", l.n) + el("Descrizione", l.descr) + el("Quantita", (Math.round(l.qta * 100) / 100).toFixed(2)) + el("PrezzoUnitario", n2(l.prezzo)) + el("PrezzoTotale", n2(l.totale)) + el("AliquotaIVA", n2(l.aliquota)) + el("Natura", l.natura));
        }).join("") + riepilogo) +
        gruppo("DatiPagamento", el("CondizioniPagamento", "TP02") + gruppo("DettaglioPagamento", el("ModalitaPagamento", modalita) + (doc.scadenza ? el("DataScadenzaPagamento", doc.scadenza) : "") + el("ImportoPagamento", n2(conti.totale)) + (modalita === "MP05" && iban ? el("IBAN", iban) : "")))) +
      "</p:FatturaElettronica>";
    const nomeFile = "IT" + (cfT || pivaT) + "_" + progressivo + ".xml";
    return { xml: corpo, nomeFile: nomeFile, conti: conti };
  }

  TD.fattura = { xml: xml, calcola: calcola, ePiva: ePiva, eCf: eCf };
})();
