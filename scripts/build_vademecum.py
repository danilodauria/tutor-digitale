#!/usr/bin/env python3
# =============================================================================
#  Tutor Digitale · genera il Vademecum in PDF
#  Licenza del codice: MIT · Danilo D'Auria
#  ---------------------------------------------------------------------------
#  Produce tre file in assets/pdf/:
#    vademecum-tutor-digitale.pdf              A5, lettura su schermo e telefono
#    vademecum-tutor-digitale-a4.pdf           A4, stampa domestica
#    vademecum-tutor-digitale-libricino-a4.pdf A4 orizzontale, già imposto:
#                                              fronte-retro, piega a metà, graffetta
#
#  I numeri (versione, lezioni, domande, novità) vengono dal programma stesso:
#  scripts/export-data.cjs legge package.json, CHANGELOG.md e i dati delle
#  lezioni. Per questo il vademecum si rigenera da solo a ogni nuova versione
#  (.github/workflows/vademecum.yml).
#
#  Uso:
#    pip install reportlab==5.0.1 pymupdf==2.1
#    python3 scripts/build_vademecum.py
# =============================================================================

import json
import os
import re
import subprocess
import sys

from reportlab import rl_config

rl_config.invariant = 1  # stesso contenuto = stesso file: niente commit inutili

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4, A5, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    CondPageBreak,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USCITA = os.path.join(BASE, "assets", "pdf")
NOME = "vademecum-tutor-digitale"

NOTTE = colors.HexColor("#1d3557")
ORO = colors.HexColor("#b8923a")
GRIGIO = colors.HexColor("#5b6472")
CARTA = colors.HexColor("#fbf8f1")
LINEA = colors.HexColor("#e4dccb")
INCHIOSTRO = colors.HexColor("#1b2333")
LIVELLI = [colors.HexColor(c) for c in ("#3f9a63", "#2f7fc0", "#c98a24", "#7d55c0")]


def carica():
    out = subprocess.run(["node", os.path.join(BASE, "scripts", "export-data.cjs")], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def md(testo):
    """Il poco Markdown del CHANGELOG in marcatura di ReportLab."""
    t = testo.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"`(.+?)`", r"<font face='Courier'>\1</font>", t)
    t = re.sub(r"\*(.+?)\*", r"<i>\1</i>", t)
    return t


class Guida(BaseDocTemplate):
    """Documento con indice automatico, segnalibri e piè di pagina numerato."""

    def __init__(self, path, formato, versione):
        if formato == "a5":
            self.pagesize = A5
            self.margine = 13 * mm
            self.corpo, self.h1, self.h2 = 8.8, 15, 10.6
        else:
            self.pagesize = A4
            self.margine = 20 * mm
            self.corpo, self.h1, self.h2 = 10.4, 19, 12.8
        self.formato = formato
        self.versione = versione
        BaseDocTemplate.__init__(
            self, path, pagesize=self.pagesize,
            leftMargin=self.margine, rightMargin=self.margine,
            topMargin=self.margine + 6 * mm, bottomMargin=self.margine + 7 * mm,
            title="Vademecum · Tutor Digitale " + versione, author="Danilo D'Auria",
            subject="Guida pratica al programma Tutor Digitale e all'app Allievo",
            keywords="tutor digitale, lezioni, informatica, vademecum, versione=" + versione,
            creator="scripts/build_vademecum.py",
        )
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="corpo",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="copertina", frames=[frame], onPage=self.decoro_copertina),
            PageTemplate(id="pagina", frames=[frame], onPage=self.decoro),
        ])

    def decoro_copertina(self, canvas, doc):
        w, h = self.pagesize
        canvas.saveState()
        canvas.setFillColor(CARTA)
        canvas.rect(0, 0, w, h, stroke=0, fill=1)
        canvas.setFillColor(NOTTE)
        canvas.rect(0, h - 26 * mm, w, 26 * mm, stroke=0, fill=1)
        # i quattro gradini del logo, in basso a destra
        base = self.margine
        passo = (w * 0.38) / 4
        for i, col in enumerate(LIVELLI):
            canvas.setFillColor(col)
            alt = (18 + i * 14) * mm * (0.75 if self.formato == "a5" else 1)
            canvas.roundRect(w - self.margine - (4 - i) * passo, base + 6 * mm, passo - 2.5 * mm, alt, 2.2 * mm, stroke=0, fill=1)
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(self.margine, h - 15 * mm, "TUTOR DIGITALE  ·  LEZIONI DI TECNOLOGIA SU MISURA")
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(w - self.margine, h - 15 * mm, "versione " + self.versione)
        canvas.restoreState()

    def decoro(self, canvas, doc):
        w, h = self.pagesize
        canvas.saveState()
        canvas.setFillColor(CARTA)
        canvas.rect(0, 0, w, h, stroke=0, fill=1)
        for i, col in enumerate(LIVELLI):
            canvas.setFillColor(col)
            canvas.rect(i * w / 4, h - 2.2 * mm, w / 4, 2.2 * mm, stroke=0, fill=1)
        canvas.setStrokeColor(LINEA)
        canvas.setLineWidth(0.6)
        y = h - self.margine + 1.5 * mm
        canvas.line(self.margine, y, w - self.margine, y)
        canvas.setFont("Helvetica", 6.8)
        canvas.setFillColor(GRIGIO)
        canvas.drawString(self.margine, y + 2 * mm, "VADEMECUM · TUTOR DIGITALE")
        canvas.drawRightString(w - self.margine, y + 2 * mm, "versione " + self.versione)
        canvas.drawCentredString(w / 2, self.margine - 2 * mm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "Capitolo":
            testo = flowable.getPlainText()
            self.notify("TOCEntry", (0, testo, self.page))
            chiave = "cap-" + re.sub(r"\W+", "-", testo)
            self.canv.bookmarkPage(chiave)
            self.canv.addOutlineEntry(testo, chiave, 0, 0)


def stili(doc):
    a5 = doc.formato == "a5"
    c = doc.corpo
    return {
        "occhiello": ParagraphStyle("Occhiello", fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=ORO, spaceAfter=2 * mm),
        "copertina": ParagraphStyle("Copertina", fontName="Times-Bold", fontSize=34 if a5 else 48, leading=36 if a5 else 50, textColor=NOTTE, spaceAfter=3 * mm),
        "sottotitolo": ParagraphStyle("Sottotitolo", fontName="Times-Italic", fontSize=13 if a5 else 18, leading=17 if a5 else 23, textColor=GRIGIO, spaceAfter=6 * mm),
        "Capitolo": ParagraphStyle("Capitolo", fontName="Times-Bold", fontSize=doc.h1, leading=doc.h1 * 1.15, textColor=NOTTE, spaceBefore=2 * mm, spaceAfter=2.6 * mm),
        "Sezione": ParagraphStyle("Sezione", fontName="Helvetica-Bold", fontSize=doc.h2, leading=doc.h2 * 1.25, textColor=NOTTE, spaceBefore=3.4 * mm, spaceAfter=1.2 * mm),
        "Corpo": ParagraphStyle("Corpo", fontName="Helvetica", fontSize=c, leading=c * 1.5, textColor=INCHIOSTRO, alignment=TA_JUSTIFY, spaceAfter=2 * mm),
        "Elenco": ParagraphStyle("Elenco", fontName="Helvetica", fontSize=c, leading=c * 1.45, textColor=INCHIOSTRO, leftIndent=5 * mm, bulletIndent=0.8 * mm, spaceAfter=1.2 * mm),
        "Passo": ParagraphStyle("Passo", fontName="Helvetica", fontSize=c, leading=c * 1.45, textColor=INCHIOSTRO, leftIndent=6 * mm, bulletIndent=0, spaceAfter=1.2 * mm),
        "Piccolo": ParagraphStyle("Piccolo", fontName="Helvetica", fontSize=c - 1.3, leading=(c - 1.3) * 1.45, textColor=GRIGIO, spaceAfter=1.4 * mm),
        "Cella": ParagraphStyle("Cella", fontName="Helvetica", fontSize=c - 1.1, leading=(c - 1.1) * 1.32, textColor=INCHIOSTRO),
        "CellaTesta": ParagraphStyle("CellaTesta", fontName="Helvetica-Bold", fontSize=c - 1.1, leading=(c - 1.1) * 1.32, textColor=colors.white),
        "Box": ParagraphStyle("Box", fontName="Helvetica", fontSize=c, leading=c * 1.45, textColor=INCHIOSTRO),
        "Indice0": ParagraphStyle("Indice0", fontName="Helvetica", fontSize=c, leading=c * 1.7, textColor=INCHIOSTRO),
    }


def tabella(righe, colonne, st, doc, frazioni):
    testa = [Paragraph(h, st["CellaTesta"]) for h in colonne]
    corpo = [[Paragraph(str(x), st["Cella"]) for x in r] for r in righe]
    t = Table([testa] + corpo, colWidths=[f * doc.width for f in frazioni], repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NOTTE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f2e8")]),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINEA),
    ]))
    return t


def riquadro(testo, st, doc, sfondo="#e1eef9", bordo="#2f7fc0"):
    t = Table([[Paragraph(testo, st["Box"])]], colWidths=[doc.width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(sfondo)),
        ("LINEBEFORE", (0, 0), (0, -1), 2.4, colors.HexColor(bordo)),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def costruisci(percorso, formato, d):
    doc = Guida(percorso, formato, d["versione"])
    st = stili(doc)
    k = d["conteggi"]
    ultima = d["versioni"][0] if d["versioni"] else {"versione": d["versione"], "data": "", "voci": []}
    storia = []

    numero = [0]

    def cap(t):
        numero[0] += 1
        storia.append(CondPageBreak(doc.height * 0.25))
        storia.append(Paragraph("%d. %s" % (numero[0], re.sub(r"^\d+\.\s*", "", t)), st["Capitolo"]))

    def sez(t):
        storia.append(CondPageBreak(doc.height * 0.12))
        storia.append(Paragraph(t, st["Sezione"]))

    def p(t):
        storia.append(Paragraph(t, st["Corpo"]))

    def elenco(voci):
        for v in voci:
            storia.append(Paragraph(v, st["Elenco"], bulletText="•"))

    def passi(voci):
        for i, v in enumerate(voci, 1):
            storia.append(Paragraph(v, st["Passo"], bulletText="%d." % i))

    def box(t, tipo="info"):
        colori = {"info": ("#e1eef9", "#2f7fc0"), "ok": ("#def0e4", "#2b7a4b"), "attenzione": ("#fbedd5", "#a8660b")}[tipo]
        storia.append(Spacer(1, 1 * mm))
        storia.append(riquadro(t, st, doc, *colori))
        storia.append(Spacer(1, 2.5 * mm))

    # ------------------------------------------------------------ copertina
    storia += [
        Spacer(1, 16 * mm if formato == "a5" else 28 * mm),
        Paragraph("VADEMECUM", st["occhiello"]),
        Paragraph("Tutor<br/>Digitale", st["copertina"]),
        Paragraph("Guida pratica al programma del tutor e all'app per gli allievi", st["sottotitolo"]),
        Paragraph(
            "%d lezioni dai primi passi a esperto su computer, tablet, smartphone, Smart TV e Internet; "
            "quiz sempre diversi, esercizi, compiti a distanza con correzione automatica, clienti, "
            "documenti firmati e attestati verificabili con il QR. Online e offline, senza account."
            % k["lezioni"], st["Corpo"]),
        Spacer(1, 6 * mm),
        Paragraph("Versione <b>%s</b>%s" % (d["versione"], (" · " + ultima["data"]) if ultima.get("data") else ""), st["Corpo"]),
        Paragraph("Ideato, scritto e sviluppato da <b>Danilo D'Auria</b><br/>%s" % d["sito"], st["Piccolo"]),
    ]
    from reportlab.platypus.doctemplate import NextPageTemplate
    storia += [NextPageTemplate("pagina"), PageBreak()]

    # ------------------------------------------------------------ indice
    storia.append(Paragraph("Indice", st["Capitolo"].clone("IndiceTitolo")))
    toc = TableOfContents()
    toc.levelStyles = [st["Indice0"]]
    toc.dotsMinLevel = 0
    storia += [toc, PageBreak()]

    # ------------------------------------------------------------ 1
    cap("1. Che cos'è")
    p("Tutor Digitale è il programma di lavoro per chi insegna tecnologia a domicilio, in ufficio, "
      "nei centri anziani, nelle biblioteche e nelle associazioni. Mette insieme in un'unica app il "
      "<b>programma delle lezioni</b>, gli <b>strumenti per esercitarsi e verificare</b> e i "
      "<b>documenti</b> da far firmare e consegnare.")
    sez("Due app che lavorano insieme")
    storia.append(tabella([
        ["Indirizzo", d["sito"], d["sito"] + "/allievo"],
        ["Per chi", "il tutor (tu)", "il cliente o i partecipanti di un gruppo"],
        ["Contiene", "tutto: clienti, registro, documenti, attestati, statistiche, correzione", "lezioni, compiti, quiz da consegnare, allenamento, palestra, aiuto a distanza"],
        ["Dati", "l'archivio completo dei clienti", "solo il profilo e i compiti di quell'allievo"],
    ], ["", "Tutor Digitale", "Tutor Digitale · Allievo"], st, doc, [0.2, 0.4, 0.4]))
    storia.append(Spacer(1, 3 * mm))
    p("Entrambe sono <b>PWA</b>: si aprono dal browser, si installano come un'app e funzionano "
      "<b>identiche anche senza Internet</b>. La spia in alto è verde quando c'è connessione: "
      "nient'altro cambia. I dati restano sul dispositivo; nessun server, account o pubblicità.")

    # ------------------------------------------------------------ 2
    cap("2. Installare e aggiornare")
    storia.append(tabella([
        ["Windows, Linux, ChromeOS", "Apri il sito con Chrome o Edge, premi l'icona «Installa» nella barra dell'indirizzo, conferma."],
        ["Mac", "Safari: menu File › Aggiungi al Dock. Chrome: icona «Installa»."],
        ["Android", "Chrome › menu con i tre puntini › «Installa app» o «Aggiungi a schermata Home»."],
        ["iPhone e iPad", "Safari › Condividi (quadrato con freccia) › «Aggiungi alla schermata Home»."],
    ], ["Dispositivo", "Come si installa"], st, doc, [0.3, 0.7]))
    storia.append(Spacer(1, 3 * mm))
    p("<b>Aggiornamenti.</b> Quando esce una nuova versione il programma la scarica da solo e mostra "
      "«È pronta una nuova versione: ricarica la pagina». Basta ricaricare: dati e impostazioni restano. "
      "La versione in uso è scritta in fondo a ogni pagina e in Altro › Licenze.")
    box("Questo vademecum si aggiorna da solo: a ogni nuova versione GitHub lo rigenera con i numeri e le "
        "novità del programma. L'ultima edizione è sempre in Altro › Vademecum (PDF) e allegata alla "
        "versione su GitHub, in tre formati: A5 da leggere, A4 da stampare, libricino da piegare.")

    # ------------------------------------------------------------ 3
    cap("3. Il primo avvio, in dieci minuti")
    passi([
        "<b>Profilo</b> (Altro › Impostazioni): nome, qualifica, email, città, codice fiscale, eventuale partita IVA, modalità di pagamento. Compare su liberatorie, ricevute e attestati.",
        "<b>Firma</b>: disegnala con il dito o il mouse nel riquadro e salva. Va sugli attestati e sui registri.",
        "<b>Listino</b>: correggi i prezzi proposti per la tua zona e scarica il listino in PDF da mostrare.",
        "<b>Firma digitale</b>: annota l'<b>impronta della chiave</b> (quattro gruppi come 7F3A-91C2-0B4E-D85A). È la tua firma elettronica su kit e attestati.",
        "<b>Primo backup cifrato</b>: «Backup cifrato con password», scegli una frase-password e scrivila su carta.",
        "<b>Installa l'app</b> sul tablet o sul portatile che porti alle lezioni.",
    ])

    # ------------------------------------------------------------ 4
    cap("4. Clienti e prima lezione")
    p("<b>Clienti › Nuovo cliente</b>: una persona, oppure un ente, un'azienda o un gruppo con l'elenco dei "
      "partecipanti. Indica dove si fanno le lezioni, i dispositivi e il livello di partenza.")
    sez("La prima lezione")
    passi([
        "<b>Liberatoria</b> dalla scheda cliente: si legge insieme, si spuntano i consensi, si firma sullo schermo e si scarica il PDF. Per i gruppi c'è il foglio firme; per chi preferisce la penna, il modulo vuoto da stampare.",
        "<b>Test d'ingresso</b> (Altro › Test d'ingresso): venti frasi «lo so fare da solo?» che calcolano il livello per ogni dispositivo e lo salvano nella scheda.",
        "<b>Inizia la lezione</b> nella scheda: da quel momento quiz, esercizi e timer si registrano per quel cliente.",
        "A fine incontro il <b>registro</b>: data, durata, argomenti, presenti, importo e se è stato pagato.",
    ])
    sez("Il metodo in cinque tempi")
    storia.append(tabella([
        ["Accogliere", "Dieci minuti per obiettivi, paure e dispositivi."],
        ["Mostrare", "Il tutor fa vedere una volta, lentamente, anche con la modalità lavagna."],
        ["Fare insieme", "Il cliente ripete con le sue mani; il tutor guida a voce senza toccare."],
        ["Fare da solo", "Esercizio medio senza aiuto: gli errori si annotano."],
        ["Fissare", "Quiz breve, compito a casa, prossimo appuntamento in agenda."],
    ], ["Tempo", "Che cosa si fa"], st, doc, [0.26, 0.74]))

    # ------------------------------------------------------------ 5
    cap("5. Lezioni, quiz, esercizi e palestra")
    p("Le <b>%d lezioni</b> sono ordinate in %d livelli e %d percorsi (l'elenco completo è nel capitolo «Le lezioni», in fondo). "
      "Ognuna ha obiettivi, spiegazione, passi numerati, tre esercizi (facile, medio, esperto), compito "
      "a casa, aree DigComp 2.2, lettura ad alta voce e scheda PDF."
      % (k["lezioni"], len(d["livelli"]), len(d["percorsi"])))
    storia.append(tabella([[l["nome"], l["descr"], l["ore"]] for l in d["livelli"]], ["Livello", "Per chi", "Durata"], st, doc, [0.2, 0.62, 0.18]))
    storia.append(Spacer(1, 3 * mm))
    elenco([
        "<b>Modalità lavagna</b>: la lezione a tutto schermo, un passo alla volta, per la Smart TV o il proiettore.",
        "<b>Quiz</b>: %d domande in cinque tipi; la risposta giusta cambia posto e lettera a ogni partita. Verifiche stampabili sempre diverse con chiave separata." % k["domande"],
        "<b>Esercizi</b>: tre per lezione, filtrabili e assegnabili come compito.",
        "<b>Palestra</b>: mouse, trascinamento, tastiera, «Truffa o no?» con %d messaggi, laboratorio password." % k["truffe"],
    ])

    # ------------------------------------------------------------ 6
    cap("6. Compiti a distanza e app Allievo")
    passi([
        "Scheda cliente › <b>App allievo</b>: scegli i compiti e, se vuoi, un quiz. Il programma crea il <b>kit</b>.",
        "A lezione fai inquadrare il <b>QR</b> con la fotocamera; a distanza manda il link (WhatsApp, email) o il file del kit.",
        "L'allievo apre il link: l'app si personalizza con nome, compiti e quiz <b>senza soluzioni</b>, e mostra «<b>Kit verificato</b>».",
        "L'allievo fa i compiti, risponde al quiz, aggiunge foto o un messaggio e preme <b>Invia al tutor</b>.",
        "Tu apri il file in <b>Scambio con gli allievi</b>: il quiz si corregge da solo, i compiti si segnano nella scheda.",
        "Metti «Approvato» o «Da rifare» a compiti e foto, aggiungi un commento e <b>rimanda la correzione</b>.",
    ])
    sez("La firma digitale dei kit")
    p("Ogni kit e ogni correzione escono firmati con la tua chiave personale (ECDSA P-256), oltre al codice "
      "segreto di ogni cliente. L'app Allievo ricorda la tua chiave al primo kit: se un kit successivo è stato "
      "modificato lo rifiuta, se arriva da un'altra chiave avvisa prima di aprirlo.")
    box("La prima volta, leggi all'allievo l'<b>impronta</b> della tua chiave (Impostazioni › Firma digitale): "
        "deve essere uguale a quella nel suo profilo. Così sa che i compiti vengono proprio da te.", "ok")
    p("<b>Scadenze.</b> Le scadenze compaiono nella home dell'allievo, vanno nel calendario del telefono con "
      "un avviso il giorno prima e, dove il sistema lo permette, arrivano come notifica.")

    # ------------------------------------------------------------ 7
    cap("7. Assistenza a distanza")
    p("Come un TeamViewer semplice e senza installazioni: chi apre la sessione manda un <b>codice</b> e detta "
      "una <b>password di 6 cifre</b> che cambia a ogni sessione; l'altro rimanda un codice di risposta e i due "
      "dispositivi si collegano direttamente, in modo cifrato. Si vede lo schermo, si scrive in chat, si "
      "scambiano file e compiti; anche qui c'è il QR da inquadrare.")
    box("Il browser permette di <b>vedere</b> lo schermo dell'altro ma non di muoverne il mouse. Per il "
        "controllo completo si affianca un programma dedicato come RustDesk.", "attenzione")

    # ------------------------------------------------------------ 8
    cap("8. Documenti")
    storia.append(tabella([
        ["Liberatoria", "Informativa privacy, uso dei dispositivi, consensi facoltativi; firma sullo schermo, PDF o stampa. Modulo vuoto e foglio firme per i gruppi."],
        ["Preventivi e ricevute", "Dal listino, numerati per anno. Ricevuta per prestazione occasionale (con nota sulla marca da bollo e ritenuta facoltativa) o riepilogo per la partita IVA."],
        ["Registro lezioni", "Scheda cliente › Registro: elenco degli incontri con firme, in PDF."],
        ["Registro presenze", "Documenti › Registro presenze: il foglio mensile per Comuni, associazioni e scuole."],
        ["Attestato", "Scheda cliente › Attestato: ore, periodo, livello, competenze DigComp, firma, codice e QR di verifica."],
    ], ["Documento", "Che cosa contiene"], st, doc, [0.26, 0.74]))
    sez("Il registro presenze per gli enti")
    passi([
        "Documenti › <b>Registro presenze</b> (o scheda cliente › Registro lezioni › Registro presenze del mese).",
        "Scegli l'ente e il mese: l'anteprima mostra incontri, orari, ore, argomenti e la griglia <b>P</b>resente / <b>A</b>ssente di ogni partecipante.",
        "Se l'ente lo chiede, aggiungi un <b>foglio firme a mano</b> per ogni incontro (ingresso, uscita, firma).",
        "Scarica il PDF o stampalo; la «Tabella per Excel» serve per i rendiconti dell'ente.",
    ])
    p("Le presenze vengono da quelle spuntate nel registro a fine incontro: conviene segnarle sempre.")
    sez("L'attestato con il QR di verifica")
    p("Al rilascio l'attestato riceve un codice con cifra di controllo e un <b>QR</b> in alto a destra, firmato "
      "con la tua chiave. Chi lo inquadra (un datore di lavoro, un ente) apre la pagina "
      "<b>%s/verifica</b>, che controlla la firma e mostra codice, intestatario, data, livello, ore e percorsi. "
      "Se qualcuno cambia anche una lettera, la pagina lo segnala. Non serve nessun archivio online." % d["sito"])
    elenco([
        "<b>Chiave riconosciuta.</b> In Impostazioni › «Copia la chiave pubblica» ottieni una riga da pubblicare in <font face='Courier'>verifica/chiavi.json</font>: la pagina mostrerà «Chiave riconosciuta: il tuo nome».",
        "<b>Registro pubblico facoltativo.</b> Solo se l'intestatario acconsente (casella nel modulo): Documenti › «Registro pubblico» crea il file <font face='Courier'>verifica/registro.json</font> con codice, nome, data e livello.",
    ])

    # ------------------------------------------------------------ 9
    cap("9. Statistiche del lavoro")
    p("Altro › <b>Statistiche del lavoro</b> legge il registro delle lezioni e mostra, anno per anno:")
    elenco([
        "ore di lezione, incontri, <b>incassato</b> e <b>da incassare</b>;",
        "ore e incassi <b>mese per mese</b>, in grafico e in tabella;",
        "gli <b>argomenti più richiesti</b>: aiutano a scegliere i pacchetti da proporre;",
        "i clienti per <b>luogo</b> e per <b>città</b>;",
        "i <b>progressi di ogni allievo</b>: lezioni completate e andamento dei quiz rispetto alla soglia del 60%.",
    ])
    p("La tabella si esporta per Excel e il riepilogo in PDF, utile per il commercialista o per presentare "
      "l'attività a un ente. I numeri sono giusti se il registro è compilato con durata, importo e «pagato».")

    # ------------------------------------------------------------ percorsi su misura
    cap("Percorsi su misura")
    p("Altro › <b>Percorsi su misura</b>: componi un percorso incontro per incontro scegliendo le lezioni, "
      "oppure parti da un modello pronto (%s) e adattalo." % ", ".join("«" + m + "»" for m in d.get("modelli", [])[:4]))
    passi([
        "Apri un modello o «Nuovo percorso»; dai un nome, scegli le lezioni per ogni incontro e i minuti.",
        "<b>Programma PDF</b>: il programma da allegare al preventivo o da presentare all'ente.",
        "<b>Assegna</b> a un cliente: con la data del primo incontro gli appuntamenti finiscono in agenda e i compiti a casa ricevono la scadenza.",
        "Manda il kit: nell'app Allievo compare «Il mio percorso», con le lezioni da ripassare e i progressi.",
    ])

    # ------------------------------------------------------------ editor e guide
    cap("Lezioni, domande e schermate tue")
    p("Altro › <b>Editor delle lezioni</b>: aggiungi lezioni con obiettivi, passi, esercizi, compito e immagini, e "
      "domande a scelta multipla. Compaiono nei percorsi (con il segno «tua»), nei quiz, nelle verifiche e nella "
      "modalità aula, e viaggiano nel kit quando le assegni. «Esporta i contenuti» crea un file da portare su un "
      "altro dispositivo o da dare a un collega.")
    sez("Schermate guida")
    p("Altro › <b>Schermate guida</b>: %d guide disegnate passo per passo per Android, iPhone, Windows e Smart TV, "
      "con il cerchio arancione dove toccare (caratteri grandi, Wi-Fi, installare l'app Allievo, spegnere il "
      "computer, telecomando, SMS truffa…). Compaiono anche dentro le lezioni collegate e si stampano in PDF." % d.get("guide", 10))
    p("Con <b>Nuova schermata</b> fotografi o catturi lo schermo del cliente e aggiungi frecce, cerchi, riquadri, "
      "numeri e scritte: la schermata annotata si può inserire nelle tue lezioni.")

    # ------------------------------------------------------------ aula
    cap("Modalità gruppo in aula")
    passi([
        "Collega il computer alla Smart TV e apri Altro › <b>Modalità gruppo in aula</b>; scegli livello, percorso, numero di domande e secondi.",
        "«Apri l'aula»: sulla TV compare un QR. I partecipanti lo inquadrano con il telefono, scrivono il nome ed entrano (si apre l'app Allievo, senza installare nulla).",
        "«Prima domanda»: tutti rispondono dal telefono; la TV conta le risposte e, alla fine del tempo o quando hanno risposto tutti, mostra quella giusta, il grafico e la classifica.",
        "Alla fine puoi salvare i risultati nella scheda del gruppo.",
    ])
    box("La modalità con i telefoni passa da un canale pubblico gratuito (MQTT) con i messaggi cifrati: serve "
        "Internet su TV e telefoni. Senza Internet scegli «Alzata di mano»: ognuno alza il cartellino A, B, C o D e "
        "tu tocchi i numeri sullo schermo.", "attenzione")

    # ------------------------------------------------------------ fattura
    cap("Fattura elettronica")
    p("Con la partita IVA (Impostazioni › Regime per i documenti) il documento «<b>Fattura elettronica</b>» crea il "
      "file <b>XML FatturaPA</b> e un PDF di cortesia per il cliente. Servono: partita IVA, codice fiscale, indirizzo "
      "con CAP e regime fiscale (forfettario, ordinario o minimi) in Impostazioni; codice fiscale o partita IVA, "
      "indirizzo e CAP del cliente, e per le aziende il codice destinatario SDI o la PEC.")
    elenco([
        "Forfettario: nessuna IVA (natura N2.2) e bollo virtuale da 2 € sopra 77,47 €, che puoi addebitare al cliente.",
        "Il file si carica nel portale «Fatture e Corrispettivi» dell'Agenzia delle Entrate o si manda al commercialista: il programma non lo trasmette allo SDI.",
    ])
    box("Il file segue le specifiche FatturaPA 1.2.2 ed è controllato sullo schema ufficiale, ma la responsabilità "
        "fiscale resta tua: fai verificare le prime fatture dal commercialista.", "attenzione")

    # ------------------------------------------------------------ accessibilità
    cap("Accessibilità")
    p("In Impostazioni (e nel profilo dell'app Allievo) c'è la scheda <b>Accessibilità</b>:")
    elenco([
        "<b>Contrasto elevato</b>: nero, bianco e giallo, per chi vede poco.",
        "<b>Pulsanti più grandi</b> e <b>niente animazioni</b>.",
        "<b>Un pulsante alla volta</b>: i comandi si illuminano a turno e si sceglie toccando lo schermo in un punto qualsiasi o premendo un tasto (anche un sensore esterno). Esc mette in pausa.",
        "Funziona con i lettori di schermo NVDA, TalkBack e VoiceOver e con il solo tasto Tab; le pagine sono controllate con lo strumento automatico axe sulle regole WCAG 2 AA.",
    ])

    # ------------------------------------------------------------ 10
    cap("10. Agenda e strumenti")
    elenco([
        "<b>Agenda</b>: appuntamenti futuri, lezioni svolte, esportazione nel calendario del telefono (.ics).",
        "<b>Timer della lezione</b>: resta attivo cambiando pagina, ricorda la pausa ogni 45 minuti e registra i minuti per il cliente attivo.",
        "<b>Kit del tutor</b>: la lista di cosa mettere in borsa prima di uscire.",
        "<b>Idee per il lavoro</b>: dove proporre le lezioni, pacchetti, collaborazioni.",
    ])

    # ------------------------------------------------------------ 11
    cap("11. Dati, privacy e backup")
    p("I dati dei clienti stanno <b>solo</b> nel browser del tuo dispositivo. Se il dispositivo si rompe o "
      "il browser viene ripulito, senza una copia si perdono. Chi usa il programma per lavoro è titolare "
      "del trattamento: proteggi il dispositivo con una password e fai un backup ogni settimana.")
    sez("Il backup cifrato")
    passi([
        "Impostazioni › <b>Backup cifrato con password</b>.",
        "Scegli una password di almeno 8 caratteri; meglio una frase di tre o quattro parole.",
        "Salva il file <font face='Courier'>.tdcifrato</font> su una chiavetta e, se vuoi, su Google Drive o OneDrive: senza password è illeggibile (AES-256).",
        "Per ripristinare: Impostazioni › Importa backup, scegli il file e scrivi la password.",
    ])
    box("Se perdi la password, il backup cifrato <b>non si recupera</b>, nemmeno dall'autore del programma. "
        "Scrivila su carta e conservala lontano dalla chiavetta.", "attenzione")
    p("Quando l'ultima copia ha più di una settimana, la home mostra un promemoria. Il backup contiene anche "
      "la tua chiave di firma: per questo è meglio sempre quello cifrato.")

    # ------------------------------------------------------------ 12
    cap("12. Problemi e soluzioni")
    storia.append(tabella([
        ["L'app mostra una versione vecchia", "Ricarica la pagina; se non basta, chiudi tutte le schede del programma e riaprilo."],
        ["Il link del kit non si apre o è «incompleto»", "Il programma di messaggi l'ha tagliato: manda il file del kit, che l'allievo apre da «Ricevi dal tutor»."],
        ["L'allievo vede «firmato da una chiave diversa»", "Hai cambiato dispositivo o creato una chiave nuova: confermagli l'impronta; se non sei stato tu, non deve aprirlo."],
        ["«Password sbagliata o file danneggiato»", "Controlla maiuscole e trattini della password del backup; prova una copia precedente."],
        ["Il QR dell'attestato non si legge", "Stampa a qualità normale o alta, non in bozza; inquadra con più luce. In alternativa si incolla il link nella pagina verifica."],
        ["Il registro presenze è vuoto", "Gli incontri del mese devono essere «svolti» e i presenti spuntati nel registro."],
        ["Le notifiche dei compiti non arrivano", "Su alcuni telefoni arrivano solo ad app aperta: usa «Promemoria nel calendario»."],
        ["«Spazio del browser pieno»", "Esporta un backup cifrato, poi elimina allegati e foto vecchie dalle consegne corrette."],
    ], ["Che cosa succede", "Che cosa fare"], st, doc, [0.4, 0.6]))

    # ------------------------------------------------------------ 13
    cap("13. Le %d lezioni" % k["lezioni"])
    nomi_liv = {l["id"]: l["nome"] for l in d["livelli"]}
    for pc in d["percorsi"]:
        sez(pc["nome"])
        storia.append(Paragraph(pc["descr"], st["Piccolo"]))
        righe = [[nomi_liv[l["liv"]], l["titolo"]] for l in sorted([x for x in d["lezioni"] if x["dev"] == pc["id"]], key=lambda x: (x["liv"], x["id"]))]
        storia.append(tabella(righe, ["Livello", "Lezione"], st, doc, [0.24, 0.76]))
        storia.append(Spacer(1, 2 * mm))

    # ------------------------------------------------------------ 14
    cap("14. Novità della versione %s" % ultima["versione"])
    if ultima.get("data"):
        storia.append(Paragraph("Pubblicata il " + ultima["data"] + ".", st["Piccolo"]))
    elenco([md(v) for v in ultima["voci"]])
    if len(d["versioni"]) > 1:
        sez("Versioni precedenti")
        storia.append(tabella([[v["versione"], v["data"], md(v["voci"][0]) if v["voci"] else ""] for v in d["versioni"][1:]],
                              ["Versione", "Data", "In breve"], st, doc, [0.14, 0.22, 0.64]))

    # ------------------------------------------------------------ 15
    cap("15. Licenze e contatti")
    elenco([
        "<b>Codice</b>: licenza MIT © 2026 Danilo D'Auria.",
        "<b>Contenuti</b> (lezioni, domande, esercizi, testi dei documenti, grafiche): CC BY-NC-SA 4.0; l'uso commerciale da parte di terzi richiede il permesso dell'autore.",
        "<b>Nome e logo</b> «Tutor Digitale»: riservati.",
        "I modelli di liberatoria e ricevuta sono una base di lavoro: vanno verificati con un consulente legale, fiscale o privacy prima dell'uso professionale.",
        "L'attestato fa riferimento al quadro europeo DigComp 2.2: non è un titolo di studio né una certificazione ufficiale.",
    ])
    storia.append(Spacer(1, 4 * mm))
    storia.append(Paragraph(
        "Vademecum di Tutor Digitale · versione %s · %s · %s<br/>Ideato, scritto e sviluppato da Danilo D'Auria."
        % (d["versione"], d["sito"], d["repo"]), st["Piccolo"]))

    doc.multiBuild(storia)
    return doc.page


def imponi_libricino(origine, destinazione, versione):
    """Dispone le pagine A5 su fogli A4 orizzontali, pronte per la stampa fronte-retro."""
    import pymupdf

    src = pymupdf.open(origine)
    vere = src.page_count            # le facciate in più restano bianche
    pagine = vere + (-vere) % 4
    out = pymupdf.open()
    larghezza, altezza = landscape(A4)
    for foglio in range(pagine // 4):
        fronte = [pagine - 2 * foglio, 1 + 2 * foglio]
        retro = [2 + 2 * foglio, pagine - 1 - 2 * foglio]
        for coppia in (fronte, retro):
            pagina = out.new_page(width=larghezza, height=altezza)
            for indice, numero in enumerate(coppia):
                if 1 <= numero <= vere:
                    r = pymupdf.Rect(indice * larghezza / 2, 0, (indice + 1) * larghezza / 2, altezza)
                    pagina.show_pdf_page(r, src, numero - 1)
            cx = larghezza / 2
            pagina.draw_line((cx, 8), (cx, altezza - 8), color=(0.8, 0.77, 0.7), width=0.3, dashes="[2 3] 0")
    out.set_metadata({
        "title": "Vademecum · Tutor Digitale " + versione + " (libricino)",
        "author": "Danilo D'Auria",
        "subject": "Libricino da stampare fronte-retro sul lato corto e piegare a metà",
        "keywords": "tutor digitale, vademecum, libricino, versione=" + versione,
        "creator": "scripts/build_vademecum.py", "producer": "PyMuPDF",
        "creationDate": "", "modDate": "",
    })
    out.save(destinazione, deflate=True, garbage=3, no_new_id=True)
    out.close()
    src.close()
    return pagine


def main():
    d = carica()
    os.makedirs(USCITA, exist_ok=True)
    a5 = os.path.join(USCITA, NOME + ".pdf")
    a4 = os.path.join(USCITA, NOME + "-a4.pdf")
    lib = os.path.join(USCITA, NOME + "-libricino-a4.pdf")
    n5 = costruisci(a5, "a5", d)
    n4 = costruisci(a4, "a4", d)
    tot = imponi_libricino(a5, lib, d["versione"])
    for f, n in ((a5, n5), (a4, n4)):
        print("%-46s %3d pagine  %6.1f KB" % (os.path.basename(f), n, os.path.getsize(f) / 1024))
    print("%-46s %3d fogli   %6.1f KB" % (os.path.basename(lib), tot // 4, os.path.getsize(lib) / 1024))
    print("versione", d["versione"])


if __name__ == "__main__":
    sys.exit(main())
