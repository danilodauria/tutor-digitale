/* ==========================================================================
   Tutor Digitale · banca delle domande
   Contenuti: © 2026 Danilo D'Auria · CC BY-NC-SA 4.0 (vedi LICENSE-CONTENT.md)
   Formato scelta multipla: [livello, percorso, domanda, giusta, [sbagliate], spiegazione]
   ========================================================================== */

window.TD = window.TD || {};

TD.DOMANDE = [
  /* ---------------------------------------------------- COMPUTER */
  [0, "pc", "Qual è il modo corretto per spegnere il computer?", "Dal menu del sistema, scegliendo «Arresta» o «Spegni»", ["Staccando la spina", "Tenendo premuto il pulsante finché si spegne", "Chiudendo lo schermo del portatile"], "Il menu del sistema chiude i programmi e salva lo stato: è lo spegnimento sicuro."],
  [0, "pc", "Con il doppio clic su un'icona…", "si apre il programma o il file", ["si cancella il file", "si sposta l'icona", "si spegne il computer"], "Il doppio clic apre; il clic singolo seleziona."],
  [0, "pc", "A che cosa serve il clic destro del mouse?", "A mostrare un menu di scelte", ["A chiudere tutte le finestre", "A cancellare", "A spegnere lo schermo"], "Il clic destro apre il menu contestuale, con le azioni possibili su quell'oggetto."],
  [0, "pc", "Quale tasto si usa per andare a capo mentre si scrive?", "Invio", ["Esc", "Barra spaziatrice", "Tab"], "Invio va a capo o conferma; la barra spaziatrice mette uno spazio."],
  [0, "pc", "Quale tasto cancella la lettera a sinistra del cursore?", "Backspace (freccia indietro)", ["Canc (Delete)", "Maiusc", "Alt"], "Backspace cancella a sinistra; Canc cancella a destra."],
  [0, "pc", "Se premi un tasto per sbaglio, il computer…", "di solito apre qualcosa che si può chiudere", ["si rompe", "perde tutti i dati", "deve essere portato in assistenza"], "Un tasto non rompe il computer: al massimo apre una finestra o un menu."],
  [1, "pc", "Che cos'è una cartella?", "Un contenitore di file", ["Un tipo di virus", "Un programma per scrivere", "Una stampante"], "Come un raccoglitore, una cartella contiene file e altre cartelle."],
  [1, "pc", "Quale combinazione salva un documento su Windows e Linux?", "Ctrl + S", ["Ctrl + P", "Ctrl + Z", "Alt + F4"], "Ctrl+S salva; Ctrl+P stampa; Ctrl+Z annulla."],
  [1, "pc", "Quale combinazione annulla l'ultima azione?", "Ctrl + Z", ["Ctrl + C", "Ctrl + V", "Ctrl + A"], "Ctrl+Z annulla: è il tasto «salvavita» di chi impara."],
  [1, "pc", "Per copiare e incollare un testo si usano…", "Ctrl + C e poi Ctrl + V", ["Ctrl + X e poi Ctrl + S", "Ctrl + V e poi Ctrl + C", "Alt + C e poi Alt + V"], "C come copia, V come… il gesto di inserire."],
  [1, "pc", "Dove finiscono di solito i file scaricati da Internet?", "Nella cartella Download", ["Sulla scrivania sempre", "Nel Cestino", "Nella cartella Musica"], "Il browser salva i file nella cartella Download, se non indicato diversamente."],
  [1, "pc", "Se chiudi la finestra di un documento già salvato…", "il documento resta salvato nella sua cartella", ["il documento viene cancellato", "il computer si spegne", "il documento va nel Cestino"], "Chiudere una finestra non elimina i file salvati."],
  [2, "pc", "Da dove è più sicuro installare un programma?", "Dallo store ufficiale o dal sito del produttore", ["Da un sito di download gratuito qualsiasi", "Da un link ricevuto per SMS", "Da una chiavetta trovata"], "Le fonti ufficiali controllano i programmi ed evitano aggiunte indesiderate."],
  [2, "pc", "Perché è importante installare gli aggiornamenti?", "Correggono difetti e falle di sicurezza", ["Rendono il computer più pesante", "Servono solo a cambiare i colori", "Cancellano i file vecchi"], "Gli aggiornamenti chiudono le falle sfruttate dai malintenzionati."],
  [2, "pc", "In un foglio di calcolo, che cosa indica «B3»?", "La cella della colonna B, riga 3", ["La terza pagina del foglio", "Un tipo di grafico", "Il terzo file salvato"], "Le colonne hanno lettere, le righe numeri: B3 è il loro incrocio."],
  [2, "pc", "Quale formula somma le celle da B2 a B6?", "=SOMMA(B2:B6)", ["=B2+B6", "SOMMA B2-B6", "=TOTALE(B2;B6)"], "I due punti indicano un intervallo: da B2 fino a B6."],
  [2, "pc", "Un file con estensione .pdf è…", "un documento pronto da leggere o stampare", ["un programma da installare", "un virus", "una canzone"], "Il PDF mantiene lo stesso aspetto su ogni dispositivo."],
  [3, "pc", "Che cosa dice la regola del backup 3-2-1?", "3 copie, su 2 supporti diversi, 1 fuori casa", ["3 backup al giorno, 2 a settimana, 1 al mese", "3 password, 2 account, 1 email", "3 dischi, 2 computer, 1 stampante"], "È la regola base per non perdere mai i dati importanti."],
  [3, "pc", "Il computer è lento all'avvio: la prima cosa da controllare è…", "quali programmi partono all'avvio", ["comprare più RAM subito", "formattare il disco", "cambiare il mouse"], "Molti programmi all'avvio rallentano: si disattivano da Gestione attività › Avvio."],
  [3, "pc", "Un messaggio d'errore conviene…", "copiarlo esatto e cercarlo", ["chiuderlo senza leggerlo", "ignorarlo per sempre", "spegnere subito la corrente"], "Il testo esatto dell'errore è l'indizio più utile per trovare la soluzione."],
  [3, "pc", "Per usare due monitor con immagini diverse si sceglie…", "Estendi", ["Duplica", "Solo schermo 1", "Disattiva"], "«Estendi» allarga la scrivania sul secondo schermo; «Duplica» mostra la stessa immagine."],
  [3, "pc", "Che cos'è un punto di ripristino?", "Una fotografia del sistema a cui tornare se qualcosa va storto", ["Un file musicale", "Una password di emergenza", "Un antivirus"], "Permette di riportare il sistema a uno stato precedente senza toccare i documenti."],

  /* ---------------------------------------------------- TABLET */
  [0, "tablet", "Il pulsante laterale premuto una volta…", "blocca lo schermo", ["cancella le app", "spegne per sempre il tablet", "chiama il 112"], "Blocca e mette in attesa: per spegnere si tiene premuto qualche secondo."],
  [0, "tablet", "Per ingrandire una foto sul tablet…", "si allargano due dita sullo schermo", ["si preme il volume", "si scuote il tablet", "si tocca tre volte il bordo"], "Il gesto con due dita (pinch) ingrandisce e rimpicciolisce."],
  [0, "tablet", "Come si torna alla schermata Home?", "Con il tasto Home o scorrendo dal basso verso l'alto", ["Spegnendo il tablet", "Premendo il volume", "Toccando l'ora"], "Su molti tablet si scorre dal bordo inferiore, su altri c'è il tasto Home."],
  [0, "tablet", "Dove si ingrandiscono i caratteri?", "Impostazioni › Schermo (Display)", ["Nell'app Foto", "Nel Play Store", "Nella Fotocamera"], "Dimensione testo e zoom dello schermo si trovano nelle impostazioni dello schermo."],
  [1, "tablet", "Prima di installare un'app conviene controllare…", "sviluppatore, recensioni e permessi", ["solo il colore dell'icona", "se ha un nome lungo", "niente: tutte sono uguali"], "Lo sviluppatore e le recensioni aiutano a evitare app false o invadenti."],
  [1, "tablet", "La prima volta che fai una videochiamata il tablet chiede…", "il permesso per fotocamera e microfono", ["il numero della carta", "di spegnersi", "la password del Wi-Fi del vicino"], "Le app chiedono il permesso di usare fotocamera e microfono: si concede solo se serve."],
  [1, "tablet", "Il pulsante «Condividi» serve a…", "inviare un contenuto ad altre app o persone", ["cancellare un contenuto", "stampare sempre", "bloccare lo schermo"], "Condividi apre l'elenco delle app con cui inviare foto, link e documenti."],
  [2, "tablet", "Che cosa offre il servizio MLOL delle biblioteche?", "Giornali e libri digitali in prestito", ["Ricariche telefoniche", "Corsi di cucina a pagamento", "Riparazioni dei tablet"], "Con l'iscrizione in biblioteca si leggono gratis quotidiani e e-book."],
  [2, "tablet", "Perché è utile l'account Google o Apple sul tablet?", "Lega e recupera contatti, foto e app", ["Serve solo per pagare", "Rende il tablet più veloce", "Non serve a nulla"], "Con l'account si ritrovano i dati su un altro dispositivo."],
  [2, "tablet", "Il cloud è…", "uno spazio di archiviazione su server raggiungibili via Internet", ["una parte dello schermo", "un tipo di cavo", "un'app di meteo"], "I file nel cloud sono sincronizzati e disponibili da più dispositivi."],
  [3, "tablet", "Una firma disegnata su un PDF…", "non equivale a una firma digitale qualificata", ["vale sempre come firma digitale", "è illegale", "cancella il documento"], "Per gli atti ufficiali servono firma digitale qualificata o SPID quando previsto."],
  [3, "tablet", "Family Link e Tempo di utilizzo servono a…", "impostare limiti e controlli per i bambini", ["aumentare la batteria", "scaricare film gratis", "cambiare operatore"], "Permettono limiti di orario, filtri dei contenuti e approvazione degli acquisti."],
  [3, "tablet", "Con la scansione dei documenti il tablet…", "crea un PDF raddrizzato dalla fotocamera", ["stampa il foglio", "invia un fax", "cancella il foglio originale"], "La fotocamera riconosce il foglio, lo raddrizza e salva un PDF leggibile."],

  /* ---------------------------------------------------- SMARTPHONE */
  [0, "smartphone", "Per rispondere a una chiamata si usa…", "il pulsante o lo scorrimento verde", ["il pulsante rosso", "il tasto del volume", "la fotocamera"], "Verde risponde, rosso rifiuta o chiude."],
  [0, "smartphone", "Dove si salvano nomi e numeri di telefono?", "Nella rubrica (Contatti)", ["Nella Galleria", "Nella Calcolatrice", "Nelle Impostazioni"], "La rubrica evita di ricordare i numeri a memoria."],
  [0, "smartphone", "Il microfono sulla tastiera serve a…", "dettare il testo a voce", ["fare una chiamata", "registrare una canzone", "spegnere il telefono"], "Toccandolo si parla e il telefono scrive le parole."],
  [0, "smartphone", "Per aggiungere un nuovo contatto si tocca…", "il simbolo «+» in Contatti", ["il cestino", "la cornetta rossa", "l'icona della fotocamera"], "Il «+» apre una scheda vuota dove scrivere nome e numero."],
  [1, "smartphone", "Per inviare un messaggio vocale su WhatsApp…", "si tiene premuto il microfono, si parla e si rilascia", ["si scuote il telefono", "si preme il tasto di accensione", "si apre la fotocamera"], "Il vocale si registra finché il dito resta sul microfono."],
  [1, "smartphone", "La doppia freccia «Inoltrato molte volte» su WhatsApp indica…", "un messaggio da leggere con prudenza", ["un messaggio ufficiale", "un messaggio della banca", "un messaggio cancellato"], "Le catene inoltrate spesso diffondono notizie false."],
  [1, "smartphone", "Le foto eliminate di solito…", "restano circa 30 giorni nel Cestino", ["spariscono per sempre subito", "vanno al cloud degli amici", "si stampano da sole"], "Si recuperano da Cestino o «Eliminati di recente»."],
  [1, "smartphone", "Un video si gira meglio tenendo il telefono…", "in orizzontale", ["in verticale sempre", "capovolto", "in tasca"], "In orizzontale il video riempie lo schermo della TV e del computer."],
  [2, "smartphone", "Che cos'è lo SPID?", "Un'identità digitale per accedere ai servizi pubblici", ["Un'app di giochi", "Un tipo di SIM", "Un antivirus"], "Con SPID o CIE si accede a INPS, Agenzia delle Entrate, Fascicolo sanitario."],
  [2, "smartphone", "A che cosa serve l'app IO?", "A ricevere avvisi e pagare servizi della Pubblica Amministrazione", ["A fare selfie", "A guardare la TV", "A chattare con sconosciuti"], "IO raccoglie messaggi, pagamenti PagoPA e documenti."],
  [2, "smartphone", "Chi aiuta un cliente con lo SPID…", "mostra i passaggi ma non conosce le sue credenziali", ["si fa dire la password", "salva le credenziali sul proprio telefono", "accede al suo posto"], "Le credenziali sono personali: le digita solo il titolare."],
  [2, "smartphone", "Un negozio online affidabile mostra…", "indirizzo https, dati dell'azienda e pagamenti tutelati", ["solo prezzi bassissimi", "pagamento solo con bonifico a privati", "nessun contatto"], "Partita IVA, contatti e recensioni esterne sono segnali di serietà."],
  [3, "smartphone", "Il codice *#06# mostra…", "l'IMEI del telefono", ["il credito residuo", "la password del Wi-Fi", "il numero di telefono"], "L'IMEI serve per denunciare furto o smarrimento e bloccare il telefono."],
  [3, "smartphone", "Trova il mio dispositivo / Dov'è permette di…", "localizzare, far suonare e bloccare il telefono", ["leggere i messaggi altrui", "ricaricare la batteria", "ottenere un telefono nuovo"], "Funziona se attivato prima e se il telefono è collegato."],
  [3, "smartphone", "Una routine sullo smartphone…", "esegue più azioni con un solo comando", ["cancella le app inutilizzate", "è un tipo di virus", "serve a cambiare suoneria"], "Ad esempio «Buonanotte» può silenziare e impostare la sveglia."],
  [3, "smartphone", "Per risparmiare batteria conviene…", "ridurre notifiche e app in background", ["tenere sempre la luminosità al massimo", "lasciare GPS e Bluetooth accesi sempre", "riavviare ogni ora"], "Meno notifiche e attività in background significano più autonomia."],

  /* ---------------------------------------------------- SMART TV */
  [0, "tv", "Il tasto «Sorgente» (Input) del telecomando serve a…", "scegliere da dove arriva l'immagine", ["alzare il volume", "spegnere la TV", "cambiare lingua"], "Antenna TV, HDMI del decoder o della console, app."],
  [0, "tv", "Se ti perdi in un menu della TV…", "premi Indietro o Home", ["stacchi la spina", "togli le pile", "chiami l'assistenza"], "Indietro e Home riportano sempre in un punto noto."],
  [0, "tv", "La «Guida» o EPG mostra…", "i programmi in onda e quelli successivi", ["le istruzioni della TV", "il meteo", "le app installate"], "È il palinsesto elettronico dei canali."],
  [0, "tv", "I sottotitoli aiutano soprattutto…", "chi sente poco o guarda a volume basso", ["chi vuole vedere meglio i colori", "chi vuole spegnere prima", "chi usa il Wi-Fi"], "Si attivano dal menu Opzioni o dal televideo."],
  [1, "tv", "Una TV diventa «smart» quando…", "è collegata a Internet", ["ha uno schermo grande", "ha il telecomando nuovo", "è accesa da molto tempo"], "Con Internet si aprono le app come RaiPlay e YouTube."],
  [1, "tv", "RaiPlay è…", "un servizio gratuito per rivedere programmi Rai", ["un abbonamento obbligatorio", "un tipo di cavo", "un decoder"], "Si accede gratis; con l'account si salvano i preferiti."],
  [1, "tv", "Un abbonamento in streaming…", "si rinnova finché non lo disdici", ["scade da solo dopo un mese", "è sempre gratis", "si paga solo una volta"], "Conviene segnare la data di rinnovo."],
  [1, "tv", "Il profilo bambini serve a…", "mostrare solo contenuti adatti ai più piccoli", ["far guardare tutto", "abbassare il volume", "cancellare l'account"], "Separa la cronologia e filtra i contenuti."],
  [2, "tv", "Per trasmettere dal telefono alla TV serve che…", "siano sulla stessa rete Wi-Fi", ["la TV sia spenta", "il telefono sia in modalità aereo", "si usi il cavo dell'antenna"], "Cast, AirPlay e Smart View funzionano sulla stessa rete."],
  [2, "tv", "La modalità immagine più riposante e fedele è di solito…", "Film o Naturale", ["Negozio", "Vivida al massimo", "Dinamica"], "Le modalità «Negozio» o «Vivida» esagerano colori e consumi."],
  [2, "tv", "Il cavo HDMI collega la TV a…", "computer, decoder o console", ["la presa del telefono fisso", "l'antenna", "il Wi-Fi"], "Porta immagine e audio digitali."],
  [3, "tv", "Quando spariscono i canali, la prima cosa da fare è…", "la ricerca automatica dei canali", ["il ripristino di fabbrica", "comprare una nuova TV", "cambiare la presa elettrica"], "Spesso sono cambiate le frequenze."],
  [3, "tv", "DVB-T2 è…", "lo standard attuale della TV digitale terrestre", ["un'app di streaming", "un tipo di telecomando", "un assistente vocale"], "Serve una TV o un decoder compatibili."],
  [3, "tv", "Prima di un ripristino di fabbrica conviene…", "annotare Wi-Fi e account delle app", ["staccare l'antenna", "togliere le pile", "nulla"], "Il ripristino cancella reti, app e accessi."],
  [3, "tv", "Gli oggetti connessi della casa vanno…", "aggiornati e protetti con password", ["lasciati con le impostazioni di fabbrica", "collegati a reti aperte", "mai aggiornati"], "Ogni oggetto connesso è un piccolo computer."],

  /* ---------------------------------------------------- INTERNET E SICUREZZA */
  [0, "rete", "Il browser è…", "il programma per navigare in Internet", ["un tipo di virus", "la stampante", "il router"], "Chrome, Firefox, Safari, Edge sono browser."],
  [0, "rete", "Un indirizzo email contiene sempre…", "la chiocciola @", ["il simbolo #", "il simbolo €", "uno spazio"], "Formato: nome@servizio.it."],
  [0, "rete", "Il Wi-Fi è…", "il collegamento senza fili alla rete di casa", ["la batteria del telefono", "un'app di messaggi", "un tipo di email"], "I dati mobili sono invece quelli della SIM."],
  [0, "rete", "Un allegato email si apre solo se…", "conosci il mittente e lo aspettavi", ["ha un nome divertente", "arriva di notte", "è molto grande"], "Gli allegati inattesi possono contenere programmi dannosi."],
  [1, "rete", "Quale password è più sicura?", "lampada-fiume-ottobre-73", ["Mario1950", "123456", "password"], "Lunghezza e parole casuali battono i nomi e le date."],
  [1, "rete", "La verifica in due passaggi…", "chiede un codice in più oltre alla password", ["cambia la password ogni giorno", "rallenta Internet", "è solo per le aziende"], "Anche con la password rubata, senza il codice non si entra."],
  [1, "rete", "La banca ti chiede via SMS il codice ricevuto: cosa fai?", "Non lo do e chiamo la banca dal numero ufficiale", ["Lo invio subito", "Lo do se il messaggio sembra urgente", "Lo pubblico su Facebook"], "Banche e Poste non chiedono mai codici per messaggio o telefono."],
  [1, "rete", "«Mamma, ho cambiato numero, mandami soldi»: è…", "una truffa frequente da verificare chiamando il vecchio numero", ["sempre vero", "un messaggio della banca", "un aggiornamento del telefono"], "Si verifica sempre con una telefonata al numero conosciuto."],
  [1, "rete", "Se hai cliccato su un link truffa e inserito i dati…", "cambi subito le password e avvisi la banca", ["aspetti e speri", "spegni il telefono per una settimana", "rispondi al truffatore"], "Tempestività: password, banca, denuncia alla Polizia Postale."],
  [2, "rete", "I cookie «non necessari»…", "si possono rifiutare senza problemi", ["sono obbligatori per legge", "fanno funzionare il Wi-Fi", "proteggono dai virus"], "Servono a profilazione e pubblicità; si rifiutano con «Rifiuta»."],
  [2, "rete", "Un'app torcia chiede accesso ai contatti: è…", "un permesso eccessivo da negare", ["normale", "obbligatorio", "utile per la luce"], "I permessi vanno concessi solo se servono alla funzione."],
  [2, "rete", "Condividere un file «con chiunque abbia il link» vuol dire che…", "chi riceve il link può aprirlo, anche se inoltrato", ["solo tu puoi aprirlo", "il file si cancella", "serve la password del Wi-Fi"], "Per dati personali conviene condividere solo con indirizzi precisi."],
  [2, "rete", "https all'inizio di un indirizzo indica…", "che la connessione è cifrata", ["che il sito è sicuramente onesto", "che il sito è gratuito", "che il sito è italiano"], "Cifrata non vuol dire affidabile: anche i truffatori usano https."],
  [3, "rete", "La protezione Wi-Fi da usare oggi è…", "WPA2 o WPA3", ["WEP", "nessuna", "solo il nome nascosto"], "WEP e reti aperte si violano facilmente."],
  [3, "rete", "La rete ospiti del router serve a…", "dare Internet agli ospiti senza accesso ai dispositivi di casa", ["raddoppiare la velocità", "spegnere il router", "bloccare i siti"], "Separa i dispositivi di chi visita da quelli di casa."],
  [3, "rete", "Un assistente di intelligenza artificiale…", "può sbagliare con sicurezza: le informazioni importanti si verificano", ["dice sempre il vero", "conosce i tuoi dati bancari", "sostituisce il medico"], "Le risposte vanno controllate su fonti ufficiali."],
  [3, "rete", "In un assistente di IA non bisogna inserire…", "password, documenti d'identità e dati sensibili", ["domande sulla cucina", "richieste di traduzione", "un testo da riassumere"], "I dati inseriti possono essere conservati dal servizio."],
  [3, "rete", "La prima credenziale da cambiare su un router nuovo è…", "la password di amministrazione", ["il colore delle luci", "il nome del produttore", "la presa elettrica"], "Le password predefinite sono note a tutti."],

  /* ---------------------------------------------------- ACCESSORI */
  [0, "accessori", "Dove si collega il cavo USB di una stampante?", "A una porta USB del computer, senza sdoppiatori", ["Alla presa dell'antenna", "Alla porta HDMI", "Alla presa elettrica"], "La stampante ha un cavo per la corrente e uno USB per i dati: il USB va al computer."],
  [0, "accessori", "Prima di collegare una stampante nuova conviene…", "togliere i nastri e mettere cartucce e carta", ["installare il CD in dotazione", "spegnere il router", "staccare il mouse"], "Le protezioni arancioni bloccano i movimenti: vanno tolte prima dell'accensione."],
  [0, "accessori", "Per provare una webcam appena collegata, su Windows si usa…", "l'app Camera", ["il Blocco note", "la Calcolatrice", "il cestino"], "L'app Camera mostra subito se l'immagine arriva."],
  [0, "accessori", "La webcam va messa…", "all'altezza degli occhi, con la luce davanti", ["dietro il monitor", "incontro alla finestra, con la luce alle spalle", "sotto la scrivania"], "Luce sul viso e obiettivo all'altezza degli occhi danno l'immagine migliore."],
  [1, "accessori", "Un disco nuovo da usare sia su Windows sia su Mac conviene formattarlo in…", "exFAT", ["NTFS", "APFS", "FAT32 con file da 10 GB"], "exFAT si legge e si scrive da entrambi i sistemi."],
  [1, "accessori", "Prima di staccare una chiavetta USB si usa…", "«Rimozione sicura» o «Espelli»", ["il tasto di accensione del computer", "la modalità aereo", "il cestino"], "Durante la copia i dati non sono ancora tutti scritti: la rimozione sicura li completa."],
  [1, "accessori", "La stampante Wi-Fi di solito si configura…", "dallo schermo della stampante o dall'app del produttore", ["dal telecomando della TV", "dal pannello della caldaia", "solo con il CD"], "Serve la password del Wi-Fi di casa e spesso la rete a 2,4 GHz."],
  [1, "accessori", "Su iPhone e iPad si stampa senza installare nulla con…", "AirPrint", ["Mopria", "un cavo HDMI", "il Bluetooth"], "AirPrint è integrato: la stampante compare nell'elenco di stampa."],
  [2, "accessori", "In una videochiamata si sente eco: la causa più comune è…", "il microfono del computer con le casse accese", ["la webcam troppo nuova", "lo schermo troppo grande", "il cavo HDMI staccato"], "Il microfono riprende l'audio delle casse: si usano cuffie o il microfono della webcam."],
  [2, "accessori", "Per avere due scrivanie separate sul secondo monitor, Windows offre…", "Win + P › Estendi", ["Ctrl + Alt + Canc", "Alt + F4", "Win + L"], "«Estendi» allarga la scrivania; «Duplica» mostra la stessa immagine."],
  [2, "accessori", "Un portatile ha solo USB-C e il monitor è HDMI: serve…", "un adattatore che supporti il video", ["un cavo della stampante", "un hub non alimentato qualsiasi", "un cavo dell'antenna"], "Non tutti gli adattatori USB-C portano il segnale video: va scelto quello giusto."],
  [2, "accessori", "Il mouse wireless «salta»: la prima cosa da provare è…", "allontanare il ricevitore dalle porte USB 3", ["formattare il computer", "cambiare il monitor", "reinstallare il sistema"], "Le porte USB 3 e i dischi esterni possono disturbare il ricevitore: una prolunga risolve."],
  [2, "accessori", "Per archiviare una bolletta occupando poco spazio, il profilo migliore è…", "PDF in bianco e nero a 300 dpi", ["foto a colori da 10 megapixel", "PDF a 1200 dpi a colori", "un file di testo"], "Bianco e nero a 300 dpi basta per leggere e archiviare: colori e alte risoluzioni servono solo alle foto."],
  [2, "accessori", "Il foglio va appoggiato sul vetro…", "con il testo rivolto verso il vetro", ["con il testo verso l'alto", "piegato in due per farlo stare", "sopra il coperchio chiuso"], "Il sensore legge ciò che tocca il vetro: se il testo guarda in su, la scansione esce bianca."],
  [2, "accessori", "Una riga nera attraversa tutte le scansioni: la causa più probabile è…", "un granello o un segno sul vetro", ["la carta troppo bianca", "il cavo USB troppo corto", "la stampante senza inchiostro"], "Il granello resta fermo mentre il carrello scorre: diventa una riga su ogni pagina e si toglie pulendo il vetro."],
  [3, "accessori", "Un accessorio non è visto da nessun computer: il controllo più utile è…", "provarlo su un altro computer", ["formattare subito il disco", "comprare un accessorio nuovo", "cancellare i driver di sistema"], "Se non funziona da nessuna parte, il guasto è nell'accessorio; se funziona altrove, è nel computer."],
  [3, "accessori", "Un disco con dentro i vostri dati non si apre: cosa NON fare?", "Formattarlo", ["Fermarsi e farlo vedere a un tecnico", "Annotare rumori e messaggi", "Collegarlo a un altro computer con cautela"], "La formattazione cancella tutto: senza backup i dati sarebbero persi."],
  [3, "accessori", "In ufficio, una stampante usata da più computer conviene…", "con un indirizzo IP fisso sulla rete", ["con un cavo USB che gira di scrivania in scrivania", "senza driver", "accesa solo quando serve"], "Con un indirizzo stabile ogni computer la ritrova dopo i riavvii."],
  [3, "accessori", "Una chiavetta molto economica…", "può dichiarare una capacità che non ha davvero", ["è sempre più veloce delle altre", "non ha bisogno di rimozione sicura", "funziona solo su Linux"], "Si compra da un negozio con garanzia e si prova subito con un file grande."]
];

/* Completa la frase: [livello, percorso, frase con ___, giusta, [sbagliate]] */
TD.COMPLETA = [
  [0, "pc", "Per aprire un'icona si fa il ___ clic.", "doppio", ["destro", "triplo", "lungo"]],
  [0, "smartphone", "Per chiudere una chiamata si tocca il pulsante ___.", "rosso", ["verde", "blu", "giallo"]],
  [0, "tv", "Per tornare indietro nei menu si preme il tasto ___.", "Indietro", ["Volume", "Muto", "Rosso"]],
  [1, "pc", "La combinazione Ctrl + ___ salva il documento.", "S", ["P", "Z", "Q"]],
  [1, "rete", "Una password robusta è soprattutto ___.", "lunga", ["corta", "uguale per tutti i siti", "il proprio nome"]],
  [1, "tablet", "Le app si installano solo dallo store ___.", "ufficiale", ["più economico", "del vicino", "che arriva per SMS"]],
  [2, "pc", "In un foglio di calcolo le colonne sono indicate da ___.", "lettere", ["numeri", "colori", "simboli"]],
  [2, "smartphone", "Per accedere ai servizi pubblici online si usa lo SPID o la ___.", "CIE", ["tessera del supermercato", "patente nautica", "SIM"]],
  [2, "tv", "Per trasmettere dal telefono, TV e telefono devono stare sulla stessa rete ___.", "Wi-Fi", ["elettrica", "dell'antenna", "telefonica fissa"]],
  [3, "pc", "La regola del backup è 3-2-___.", "1", ["0", "5", "3"]],
  [3, "rete", "La rete per i visitatori si chiama rete ___.", "ospiti", ["pubblica", "nascosta", "aperta"]],
  [3, "smartphone", "Il codice *#06# mostra il codice ___ del telefono.", "IMEI", ["PIN", "PUK", "IBAN"]],
  [0, "accessori", "Prima di spegnere una stampante si controlla che non stia ___.", "stampando", ["scansionando", "lampeggiando", "suonando"]],
  [1, "accessori", "Prima di staccare la chiavetta si usa la ___ sicura.", "rimozione", ["formattazione", "duplicazione", "compressione"]],
  [1, "accessori", "Per stampare da iPhone e iPad basta ___.", "AirPrint", ["Mopria", "Bluetooth", "HDMI"]],
  [2, "accessori", "Le righe nere sulle scansioni si evitano pulendo il ___.", "vetro", ["vassoio", "monitor", "cavo"]]
];

/* Ordina i passaggi: [livello, percorso, titolo, [passi nell'ordine giusto]] */
TD.SEQUENZE = [
  [0, "pc", "Spegnere il computer", ["Salvare il lavoro", "Aprire il menu Start", "Scegliere Arresta", "Attendere lo schermo nero"]],
  [0, "smartphone", "Salvare un nuovo contatto", ["Aprire Contatti", "Toccare «+»", "Scrivere nome e numero", "Toccare Salva"]],
  [0, "tv", "Attivare i sottotitoli", ["Accendere la TV", "Premere Opzioni o Menu", "Scegliere Sottotitoli", "Attivarli"]],
  [1, "smartphone", "Inviare una foto su WhatsApp", ["Aprire la chat", "Toccare la graffetta", "Scegliere la foto", "Toccare Invia"]],
  [1, "pc", "Salvare una lettera", ["Scrivere il testo", "Premere Ctrl + S", "Scegliere la cartella", "Dare un nome e confermare"]],
  [1, "rete", "Inviare un'email", ["Toccare Scrivi", "Inserire il destinatario", "Scrivere oggetto e testo", "Toccare Invia"]],
  [1, "tablet", "Installare un'app", ["Aprire lo store", "Cercare l'app", "Controllare lo sviluppatore", "Toccare Installa"]],
  [2, "tv", "Collegare la TV al Wi-Fi", ["Aprire Impostazioni", "Scegliere Rete", "Selezionare il Wi-Fi di casa", "Inserire la password"]],
  [2, "smartphone", "Accedere all'app IO", ["Installare IO dallo store", "Aprire l'app", "Scegliere SPID o CIE", "Confermare l'accesso"]],
  [2, "pc", "Fare la somma in un foglio", ["Inserire i numeri in colonna", "Selezionare la cella vuota sotto", "Scrivere =SOMMA(…)", "Premere Invio"]],
  [3, "rete", "Mettere in sicurezza il router", ["Accedere al router", "Cambiare la password di amministrazione", "Impostare WPA2/WPA3", "Aggiornare il firmware"]],
  [3, "pc", "Recuperare un file dal backup", ["Collegare il disco del backup", "Aprire lo strumento di ripristino", "Scegliere data e file", "Ripristinare e verificare"]],
  [3, "smartphone", "Reagire al furto del telefono", ["Localizzare il telefono da un altro dispositivo", "Bloccarlo a distanza", "Bloccare la SIM con l'operatore", "Sporgere denuncia con l'IMEI"]],
  [0, "accessori", "Collegare e provare una stampante USB", ["Togliere i nastri e mettere cartucce e carta", "Accendere la stampante", "Collegare il cavo USB al computer", "Aggiungere la stampante e stampare la pagina di prova"]],
  [1, "accessori", "Mettere al sicuro un disco esterno", ["Collegarlo alla porta USB 3", "Aspettare che compaia l'unità", "Copiare i file", "Usare «Rimozione sicura» e staccarlo"]],
  [2, "accessori", "Scansionare una bolletta", ["Appoggiare il foglio sul vetro, testo verso il vetro", "Scegliere il profilo PDF in bianco e nero", "Premere «Acquisisci» e controllare l'anteprima", "Salvare in Documenti con un nome chiaro"]]
];

/* Glossario per gli abbinamenti: [livello, termine, definizione] */
TD.GLOSSARIO = [
  [0, "Mouse", "Dispositivo che muove la freccia sullo schermo"],
  [0, "Icona", "Piccola immagine che rappresenta un programma o un file"],
  [0, "Schermata Home", "La pagina principale del tablet o del telefono"],
  [0, "Wi-Fi", "Collegamento a Internet senza fili"],
  [0, "Browser", "Programma per navigare sui siti"],
  [0, "Telecomando", "Comanda la TV a distanza"],
  [0, "Rubrica", "Elenco dei contatti con nomi e numeri"],
  [1, "File", "Documento, foto o altro contenuto salvato"],
  [1, "Cartella", "Contenitore di file"],
  [1, "Allegato", "File inviato insieme a un'email"],
  [1, "App", "Programma per telefono o tablet"],
  [1, "Download", "Scaricare un file da Internet"],
  [1, "Phishing", "Truffa che imita banche o enti per rubare dati"],
  [1, "Password", "Parola segreta per accedere a un servizio"],
  [2, "Cloud", "Archivio di file su server raggiungibili via Internet"],
  [2, "SPID", "Identità digitale per i servizi pubblici"],
  [2, "Cookie", "Piccolo file che un sito salva nel browser"],
  [2, "PDF", "Formato di documento che resta uguale ovunque"],
  [2, "HDMI", "Cavo per immagine e audio digitali"],
  [2, "Streaming", "Guardare o ascoltare senza scaricare il file"],
  [2, "Aggiornamento", "Nuova versione che corregge difetti e falle"],
  [3, "Backup", "Copia di sicurezza dei dati"],
  [3, "Router", "Apparecchio che collega la casa a Internet"],
  [3, "Firmware", "Software interno di un apparecchio"],
  [3, "IMEI", "Codice unico che identifica il telefono"],
  [3, "Verifica in due passaggi", "Codice aggiuntivo oltre alla password"],
  [3, "Punto di ripristino", "Stato salvato del sistema a cui tornare"],
  [3, "Rete ospiti", "Wi-Fi separato per i visitatori"],
  [0, "Driver", "Programma che fa funzionare un accessorio"],
  [1, "exFAT", "Formato di disco leggibile da Windows e Mac"],
  [1, "AirPrint", "Stampa da iPhone e iPad senza installare nulla"],
  [2, "Hub USB", "Accessorio che moltiplica le porte USB"],
  [2, "Scanner", "Apparecchio che trasforma un foglio di carta in un file, per esempio PDF"],
  [3, "Indirizzo IP", "Numero che identifica un apparecchio nella rete"]
];

/* Palestra «Truffa o no?»: [testo, mittente, è truffa?, spiegazione] */
TD.TRUFFE = [
  ["Gentile cliente, il suo conto è stato sospeso. Acceda entro 24 ore: bit.ly/sblocco-conto", "+39 351 000 0000", true, "Urgenza, link accorciato, mittente sconosciuto: la banca non scrive così."],
  ["Ciao mamma, il mio telefono si è rotto, questo è il nuovo numero. Mi serve un bonifico urgente.", "Numero sconosciuto", true, "Truffa del «figlio in difficoltà»: chiama il vecchio numero per verificare."],
  ["Il tuo pacco è in giacenza. Paga 1,99 € di spese di sdoganamento: poste-consegna-it.com", "Poste", true, "L'indirizzo non è quello ufficiale (poste.it) e chiede un pagamento piccolo per rubare la carta."],
  ["Promemoria: la visita è confermata per giovedì alle 10:30. Per disdire chiami lo 06 1234567.", "ASL", false, "Nessun link, nessuna richiesta di dati: è un promemoria informativo da verificare se in dubbio."],
  ["Hai vinto un iPhone 17! Clicca per ritirare il premio pagando solo la spedizione.", "Premi Fortunati", true, "Nessuno regala telefoni: chiedono i dati della carta per la «spedizione»."],
  ["Il codice di verifica per il tuo accesso è 482913. Non condividerlo con nessuno.", "Google", false, "È legittimo se hai appena chiesto l'accesso tu. Se non l'hai chiesto, qualcuno ha la tua password: cambiala."],
  ["Sono l'operatore della sua banca: per bloccare una transazione mi legga il codice appena ricevuto.", "Telefonata", true, "Nessun operatore chiede mai i codici: chiudi e chiama il numero sul retro della carta."],
  ["INPS: è disponibile un nuovo messaggio nella sua area riservata. Acceda dal sito ufficiale o dall'app IO.", "INPS", false, "Non c'è link e ti invita a entrare dai canali ufficiali: comportamento corretto."],
  ["La tua bolletta non è stata pagata: la luce verrà staccata oggi. Paga qui: enel-pagamenti.net", "Fornitore energia", true, "Minaccia immediata e dominio non ufficiale: tipica pressione dei truffatori."],
  ["Il tuo abbonamento Netflix è scaduto. Aggiorna i dati di pagamento entro oggi: netfIix-account.com", "Netflix", true, "Guarda bene: «netfIix» con la i maiuscola al posto della l. Dominio falso."]
];

/* Palestra della tastiera: frasi da ricopiare per livello */
TD.FRASI = [
  [0, "ciao a tutti"],
  [0, "oggi ho imparato a usare il mouse"],
  [0, "la casa e il giardino"],
  [1, "Domani alle 10 ho la lezione di informatica."],
  [1, "Ho salvato la lettera nella cartella Documenti."],
  [2, "La password sicura è lunga, unica e facile da ricordare per me."],
  [2, "Ho inviato l'email con l'allegato PDF all'ufficio comunale."],
  [3, "Backup 3-2-1: tre copie, due supporti, una fuori casa (sempre!)."],
  [3, "Router aggiornato, WPA3 attivo e rete ospiti separata: ottimo lavoro."]
];
