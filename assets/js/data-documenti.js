/* ==========================================================================
   Tutor Digitale · testi di liberatoria, listino, test d'ingresso, kit
   Contenuti: © 2026 Danilo D'Auria · CC BY-NC-SA 4.0 (vedi LICENSE-CONTENT.md)
   I modelli di documento sono una base di lavoro: vanno verificati con un
   consulente legale/privacy prima dell'uso professionale.
   ========================================================================== */

window.TD = window.TD || {};

TD.LIBERATORIA = {
  titolo: "Modulo di iscrizione, informativa privacy e liberatoria",
  sezioni: [
    { t: "1. Oggetto", p: [
      "Il/la sottoscritto/a (di seguito «Cliente») richiede a {docente} (di seguito «Docente») lezioni di alfabetizzazione e competenze digitali su computer, tablet, smartphone, smart TV e servizi Internet, in forma {forma}, presso: {luogo}.",
      "Le lezioni hanno finalità formativa. Il Docente non è un centro di assistenza tecnica autorizzato dei produttori: gli interventi sui dispositivi sono dimostrativi e svolti insieme al Cliente."
    ]},
    { t: "2. Informativa sul trattamento dei dati (art. 13 Reg. UE 2016/679)", p: [
      "Titolare del trattamento: {docente}{contattiDocente}.",
      "Dati trattati: dati anagrafici e di contatto, calendario e presenze delle lezioni, argomenti svolti, risultati di quiz ed esercizi, documenti emessi (preventivi, ricevute, attestati).",
      "Finalità e basi giuridiche: organizzare ed erogare le lezioni e rilasciare l'attestato (esecuzione del contratto, art. 6.1.b); adempiere a obblighi fiscali e contabili (obbligo di legge, art. 6.1.c); finalità facoltative indicate al punto 4 solo con consenso (art. 6.1.a e, per eventuali dati relativi alla salute, art. 9.2.a).",
      "Modalità: i dati sono registrati nell'applicazione «Tutor Digitale» sul dispositivo del Docente, senza invio a server esterni, e su eventuale copia cartacea custodita con cura. Non sono diffusi né ceduti a terzi, salvo il commercialista o le autorità quando la legge lo impone.",
      "Conservazione: per la durata del rapporto; i documenti fiscali per il tempo previsto dalla legge (di norma 10 anni); i dati facoltativi fino alla revoca del consenso.",
      "Diritti: il Cliente può chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporsi al trattamento (artt. 15-22), revocare in ogni momento i consensi facoltativi e presentare reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).",
      "Il conferimento dei dati anagrafici e di contatto è necessario per svolgere il servizio; il rifiuto dei consensi facoltativi non impedisce di seguire le lezioni."
    ]},
    { t: "3. Liberatoria per l'uso dei dispositivi personali", p: [
      "Il Cliente dichiara di essere proprietario dei dispositivi usati durante le lezioni o autorizzato a usarli, e consente al Docente di operarvi solo in sua presenza e su sua richiesta, a scopo didattico.",
      "Il Cliente digita personalmente password, PIN, codici OTP e credenziali (SPID, CIE, banca, email). Il Docente non li chiede, non li annota e non li conserva; non legge conversazioni, foto o documenti privati se non su espressa richiesta del Cliente e solo per l'attività in corso.",
      "Prima di interventi di configurazione, aggiornamento o pulizia si raccomanda una copia di sicurezza dei dati; il Docente la propone e, se richiesto, la svolge insieme al Cliente.",
      "Il Docente opera con la diligenza professionale richiesta e risponde dei danni nei limiti previsti dalla legge. Non risponde di malfunzionamenti preesistenti, di difetti dei dispositivi o dei servizi di terzi, né di operazioni svolte dal Cliente in autonomia fuori dalle lezioni."
    ]},
    { t: "4. Consensi facoltativi", p: [
      "Il Cliente può scegliere liberamente, barrando le caselle qui sotto. Ogni consenso è revocabile in qualsiasi momento."
    ]},
    { t: "5. Persona minorenne o assistita", p: [
      "Se il Cliente è minorenne o assistito, il modulo è firmato anche dal genitore, tutore o amministratore di sostegno indicato, che dichiara di averne i poteri."
    ]}
  ],
  consensi: [
    { id: "obbligatorio", testo: "Ho letto l'informativa e accetto le condizioni del servizio e la liberatoria (necessario per iniziare le lezioni).", obbl: true },
    { id: "accessibilita", testo: "Acconsento al trattamento delle informazioni sulle mie esigenze di accessibilità (vista, udito, mobilità) che deciderò di comunicare, al solo fine di adattare le lezioni." },
    { id: "foto", testo: "Acconsento a foto o brevi video durante le lezioni, senza volto riconoscibile, per documentare l'attività e presentarla in forma anonima." },
    { id: "fotovolto", testo: "Acconsento anche a immagini con volto riconoscibile, per la stessa finalità." },
    { id: "comunicazioni", testo: "Desidero ricevere informazioni su nuovi corsi e incontri (al massimo una comunicazione al mese)." }
  ],
  avvertenza: "Modello predisposto con «Tutor Digitale». Prima dell'uso professionale si consiglia una verifica con un consulente legale o privacy."
};

/* Listino: proposta iniziale, modificabile in Impostazioni › Listino */
TD.LISTINO_BASE = [
  { id: "l60", voce: "Lezione individuale (60 minuti)", prezzo: 30, unita: "lezione" },
  { id: "l90", voce: "Lezione individuale (90 minuti)", prezzo: 40, unita: "lezione" },
  { id: "p5", voce: "Pacchetto 5 lezioni da 60 minuti", prezzo: 135, unita: "pacchetto" },
  { id: "p10", voce: "Pacchetto 10 lezioni da 60 minuti", prezzo: 250, unita: "pacchetto" },
  { id: "g90", voce: "Lezione di gruppo (90 minuti, a persona)", prezzo: 15, unita: "persona" },
  { id: "ente", voce: "Modulo per enti: 4 incontri da 2 ore, fino a 12 persone", prezzo: 320, unita: "modulo" },
  { id: "att", voce: "Attestato finale con verifica delle competenze", prezzo: 0, unita: "attestato" },
  { id: "km", voce: "Rimborso trasferta oltre 10 km", prezzo: 0.4, unita: "km" }
];

/* Test d'ingresso: per ogni percorso, quattro capacità in ordine di livello */
TD.TEST_INGRESSO = {
  pc: ["Accendo e spengo il computer e uso il mouse", "Creo cartelle, salvo e ritrovo i file", "Installo e aggiorno programmi e uso un foglio di calcolo", "Faccio backup, manutenzione e risolvo i problemi da solo"],
  tablet: ["Sblocco il tablet e apro le app con i gesti", "Installo app e faccio videochiamate", "Uso account, cloud e leggo giornali o libri digitali", "Scansiono e firmo documenti, configuro controlli e accessibilità"],
  smartphone: ["Chiamo, rispondo e salvo un contatto", "Uso WhatsApp, vocali e fotocamera", "Uso SPID/CIE, app IO, mappe e pagamenti", "Gestisco backup, localizzazione, automazioni e notifiche"],
  tv: ["Uso il telecomando, la guida e i sottotitoli", "Collego la TV al Wi-Fi e uso le app", "Trasmetto dal telefono e regolo audio e immagine", "Risintonizzo, aggiorno e gestisco la casa connessa"],
  rete: ["Navigo e invio un'email", "Creo password forti e riconosco le truffe", "Gestisco privacy, cookie, permessi e cloud", "Metto in sicurezza il router e uso l'IA con giudizio"],
  accessori: ["Collego la stampante e stampo un documento", "Uso webcam e disco esterno senza aiuto", "Configuro stampante Wi-Fi e secondo schermo", "Metto in rete una stampante condivisa e diagnostico i guasti"]
};

TD.KIT = [
  "Caricabatterie e cavi USB-C, Lightning, micro-USB",
  "Cavo HDMI e adattatore per portatile",
  "Mouse di scorta e tastiera esterna",
  "Chiavetta USB con programmi utili e copie di sicurezza",
  "Fogli stampati: liberatoria, scheda compiti, scheda «Truffa o no?»",
  "Tablet o portatile del docente con Tutor Digitale aggiornato",
  "Lente d'ingrandimento e penna touch per chi ha difficoltà",
  "Ciabatta elettrica e prolunga",
  "Biglietti da visita e listino",
  "Gel igienizzante e panno per schermi"
];

TD.LUOGHI_ESEMPI = [
  { t: "A domicilio", d: "Lezioni individuali per anziani, persone con mobilità ridotta, famiglie: si lavora sui dispositivi di casa." },
  { t: "Ufficio, negozio, studio professionale", d: "Pacchetti brevi per titolari e dipendenti: email, cloud, sicurezza, PEC, fatturazione e strumenti di lavoro." },
  { t: "Centri anziani e centri sociali", d: "Gruppi piccoli con ritmo lento e ripetizione, usando la Smart TV o un proiettore come lavagna." },
  { t: "Biblioteche e associazioni", d: "Incontri tematici: SPID e servizi pubblici, truffe online, foto e videochiamate con i nipoti." },
  { t: "Scuole e doposcuola", d: "Educazione digitale per ragazzi e genitori: privacy, sicurezza, uso consapevole e IA." },
  { t: "Parrocchie, CAF, patronati", d: "Sportello digitale di accompagnamento ai servizi online, con liberatoria e attestato." },
  { t: "Online a distanza", d: "Videolezioni di ripasso tra un incontro e l'altro, con compiti e quiz da fare in autonomia." }
];
