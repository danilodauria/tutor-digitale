# Versioni

## 1.12.4 · 25 novembre 2026

- **Stessa stanza, stesso broker**: il monitor sceglie il broker pubblico quando apre l'aula e lo scrive nel nome della stanza (`b1-…`), che viaggia nel QR, nel link e nella pagina dello schermo. Telefoni e schermo provano per primo quel broker, così non capita più che due dispositivi della stessa stanza finiscano su canali diversi e non si vedano. Se il broker scelto non risponde, tutti ripiegano sugli altri nello stesso ordine, restando insieme. Test automatici su stanza, lettura dell'indice, ordine di ripiego e scelta fatta dal monitor. Cache aggiornata alla 1.12.4.

## 1.12.3 · 24 novembre 2026

- **Avviso prima di esportare i dati di un cliente**: «Esporta dati» ora chiede conferma ricordando che il file contiene **in chiaro** anagrafica, registro delle lezioni, compiti, quiz, documenti e firme, e che per una copia protetta c'è il backup cifrato con password — lo stesso avviso del backup non cifrato. Se si annulla, non si scarica nulla. Cache aggiornata alla 1.12.3.

## 1.12.2 · 24 novembre 2026

- **«Chi ha risposto» prima di salvare**: nella schermata finale del quiz di gruppo la scheda con l'abbinamento dei telefoni ai partecipanti ora sta **sopra** i pulsanti, così si vede prima di premere «Salva i risultati» e non si può salvare senza averla incontrata. Cache aggiornata alla 1.12.2.

## 1.12.1 · 24 novembre 2026

- **«Cerca» si vede anche sul telefono e sul tablet**: la parola «Cerca» resta accanto alla lente a ogni larghezza (si nasconde solo la scorciatoia Ctrl K), e nel menu a cassetto c'è la voce **«Cerca nel programma»** con la lente e il testo, così non serve riconoscere l'icona. Il pulsante diventa visibile anche sui portatili con lo schermo stretto o lo zoom alto, dove prima restava solo la lente.
- **Ricerca rapida anche nell'app Allievo**: stessa lente nell'intestazione e stessa voce nel menu, con l'indice di pagine, lezioni e percorsi dell'allievo. Funziona offline, non manda nulla in rete e si apre anche con Ctrl/Cmd+K.
- Cache aggiornata alla 1.12.1.

## 1.12.0 · 24 novembre 2026

- **Abbina i nomi nel quiz di gruppo**: alla fine di una partita a più persone, se il cliente è un ente con l'elenco dei partecipanti, la schermata finale mostra «Chi ha risposto» con un elenco per ogni telefono. Il partecipante giusto è già proposto (nome e cognome, oppure solo il nome se è l'unico) e si può correggere prima di salvare; chi non è in elenco si salva comunque col nome scritto sul telefono. Così il risultato entra nella scheda della persona giusta, i filtri per partecipante e il cruscotto lo vedono.
- **Leggi ad alta voce in aula e sul telefono**: nella modalità aula e nel quiz dal telefono c'è «Leggi» sul monitor del tutor e su ogni telefono. Pronuncia la domanda, la proposta e le risposte con la lettera (A, B, C, D); dopo la correzione legge anche la spiegazione. È pensato per chi legge con fatica e per i gruppi, dove il pulsante sul monitor non basta.
- **Esporta i dati di un cliente**: nella scheda del cliente il pulsante «Esporta dati» scarica un file JSON leggibile con anagrafica, registro delle lezioni, compiti, quiz, documenti e attestati di quella sola persona, più un riepilogo di lezioni svolte, ore, numero di quiz e media. Serve per una richiesta di accesso o di portabilità senza esportare l'archivio intero.
- **Promemoria delle proposte**: le idee non ancora realizzate sono elencate in `MIGLIORIE.md` con stima e stato, da rileggere e verificare a ogni giro per non perderne nessuna.
- Cache aggiornata alla 1.12.0.

## 1.11.2 · 24 novembre 2026

- **Quinto telefono in sala d'attesa**: se uno dei quattro partecipanti chiude la pagina (o perde la connessione), dopo circa 20 secondi il suo posto si libera e il quinto telefono entra automaticamente, senza ricaricare. Se invece il quiz è già iniziato, il quinto riceve un messaggio chiaro: non si può entrare a partita in corso e va chiesto al tutor di riaprire l'aula. Cache aggiornata alla 1.11.2.

## 1.11.1 · 24 novembre 2026

- **Statistiche dei quiz di gruppo corrette**: i risultati di un quiz a più persone ora contano come **una sola sessione** nella media quiz e nel conteggio della scheda cliente, non come quattro quiz separati. Nella scheda restano visibili i risultati dei partecipanti (nome e percentuale) e la media del gruppo; cruscotto, andamento delle statistiche e attestato usano la media della sessione. Cache aggiornata alla 1.11.1.

## 1.11.0 · 24 novembre 2026

- **Ricerca rapida**: nuovo pulsante «Cerca» nell'header (si apre anche con Ctrl/Cmd+K) per trovare in un attimo funzioni, percorsi, lezioni e clienti. Ogni risultato mostra il percorso nel programma (per esempio «Lezioni › Tablet» o «Menu › Altro») e la rotta da aprire; frecce e Invio per scegliere, Esc per chiudere. La ricerca è locale, funziona anche offline e non manda nulla in rete. Cache aggiornata alla 1.11.0.

## 1.10.2 · 24 novembre 2026

- **Menu «Altro» completo e scorrevole**: il tendina ora sta dentro lo schermo e scorre fino all'ultima voce, che prima restava tagliata; le frecce su/giù, Inizio e Fine spostano l'evidenziazione e il menu scorre con lei, Esc chiude e riporta il cursore su «Altro», un clic fuori chiude. Anche il menu a cassetto degli schermi piccoli scorre tutto. Cache aggiornata alla 1.10.2.

## 1.10.1 · 24 novembre 2026

- **Risultati di gruppo leggibili nella scheda**: nella scheda del cliente la tabella dei quiz ha la colonna «Chi» con il nome del partecipante, così i risultati di un quiz dal telefono a più persone non sono più righe identiche senza nome. Cache aggiornata alla 1.10.1.

## 1.10.0 · 24 novembre 2026

- **Quiz dal telefono anche in piccolo gruppo**: nella modalità `#/quiz-telefono` si sceglie «1 persona» o «Fino a 4 persone». Le domande restano sul monitor, ognuno risponde dal proprio telefono col QR; con più di una persona la correzione mostra le risposte e una classifica essenziale, il telefono dice la propria posizione e alla fine i risultati si salvano nella scheda del gruppo (con una persona resta il riepilogo individuale nella scheda del cliente). Un quinto telefono riceve un avviso di quiz completo; l'aula di gruppo resta com'era.
- **Trasmetti allo schermo più affidabile**: la finestra si apre subito dentro il clic (niente popup bloccati), il selettore Chromecast è un'azione separata, lo schermo si riaggancia da solo se la connessione cade e si ferma quando l'aula chiude.
- **Schermo e telefono sempre allineati**: la pagina dello schermo richiede lo stato se non arriva, il conto alla rovescia non torna più al valore pieno a ogni aggiornamento e nelle stanze piccole il telefono recupera da solo un messaggio perso.
- **Meno rami duplicati**: form e schermata d'attesa del tutor condivisi tra singolo e piccolo gruppo, tolti campi di stato che nessuno leggeva.
- **Aggiornamento garantito**: nuova versione della cache del service worker (sito e app Allievo), così chi aveva già la 1.9.0 riceve i file nuovi al primo ricaricamento, senza perdere dati e impostazioni.

## 1.9.0 · 24 novembre 2026

- **Segni e voce**: una pagina nuova per rendere il programma utilizzabile anche da chi non sente e da chi non parla, senza servizi esterni. Il **comunicatore a frasi** mette in fila frasi intere scelte con due tocchi (presentarsi, bisogni, lezione, emergenza, cortesia, emozioni, più le risposte rapide sì/no) e le legge ad alta voce con la voce del dispositivo.
- **Video in lingua dei segni (LIS)**: la webcam registra un saluto, una spiegazione o il segno di una parola, con titolo e collegamento alla lezione; il video resta nel browser (IndexedDB), si rivede nella pagina, si scarica, si condivide con WhatsApp o email e si elimina. Massimo 90 secondi per video; la webcam si accende solo premendo il pulsante e si spegne da sola uscendo dalla pagina.
- **Collegamento alle lezioni**: nella testata di ogni lezione c'è «Video in LIS», che apre la registrazione già intitolata con il nome della lezione; la pagina compare anche nella home e nel menu delle due app.
- **Aggiornamento garantito**: nuova versione della cache del service worker (sito e app Allievo), così chi aveva già la 1.8.0 riceve i file nuovi al primo ricaricamento, senza perdere dati e impostazioni.

## 1.8.0 · 24 novembre 2026

- **Quiz dal telefono per una persona sola**: una modalità separata dall'aula di gruppo (`#/quiz-telefono`) pensata per chi è da solo davanti al computer. Le domande restano sul monitor, senza bisogno di un televisore: la persona inquadra il QR col telefono, scrive il nome e risponde; la correzione e il punteggio compaiono subito sullo schermo e alla fine il risultato si salva nella scheda del cliente. Un solo telefono per volta; l'aula di gruppo resta com'era.
- **Trasmetti allo schermo**: un pulsante sempre in vista sopra il quiz manda le domande a un Chromecast in Wi-Fi (con il selettore dei dispositivi del browser) o apre una finestra da portare sul televisore con il cavo HDMI; per il Fire TV si usa il rispecchiamento dello schermo del sistema. La nuova pagina `schermo/` riceve le domande dallo stesso canale cifrato, le mostra in grande con i colori delle risposte, il tempo, le barre dei risultati e la classifica, e ha il pulsante «Schermo intero».
- **Aggiornamento garantito**: nuova versione della cache del service worker (sito e app Allievo), così chi aveva già la 1.7.0 riceve i file nuovi al primo ricaricamento, senza perdere dati e impostazioni.

## 1.7.0 · 23 novembre 2026

- **Percorso di partenza dal test d'ingresso**: dopo il test il tutor vede subito il percorso consigliato (un incontro per percorso, con le prime lezioni dal livello emerso) e con un pulsante lo crea e apre nell'editor, pronto da controllare e assegnare.
- **Riepilogo della lezione per l'allievo**: dalla scheda cliente, una lezione svolta diventa un PDF da lasciare e un messaggio da copiare in WhatsApp con argomenti, passi da ricordare, compiti e prossimo incontro.
- **Guide centrate sul singolo passo**: `#/guida/<id>/<passo>` apre solo il passo richiesto, con disegno, lettura ad alta voce e link da copiare; ogni passo della guida completa ha il suo collegamento. Nella pagina guide si cerca per parola e il filtro per lezione resta insieme alla ricerca.
- **Modalità essenziale dell'app Allievo**: una home con quattro azioni grandi (compiti, lezioni, aiuto, profilo) e i contatti del tutor; si attiva dalla home o dal profilo e si disattiva con un pulsante.
- **Cruscotto del tutor**: una pagina che mette in fila chi ha bisogno di cosa oggi — compiti scaduti, quiz sotto soglia, allievi fermi da tre settimane, incassi arretrati e attestati da valutare — con totali e collegamenti alla scheda e all'agenda.
- **Aggiornamento garantito**: nuova versione della cache del service worker (sito e app Allievo), così chi aveva già la 1.6.1 riceve i file nuovi al primo ricaricamento, senza perdere dati e impostazioni.

## 1.6.1 · 23 novembre 2026

- **Schermate guida ripulite**: la cornice di Windows, lo sfondo e la barra delle applicazioni ora si disegnano una volta sola e le condividono tutte le scene; tolti i dettagli decorativi che non servono al passo (orologio, campo «Cerca», icone sulla scrivania, tasti colorati del telecomando, barra della TV). Nessun passo è cambiato.
- **Barra di Windows completa**: l'icona «Esplora file» c'è in tutte le schermate, anche in quella iniziale che la indica come primo passo (prima il cerchio evidenziava un punto vuoto). Il menu di spegnimento non è più coperto dal numero arancione.
- **Disegni controllati a 360 px**: in tutte le 16 guide nessuna didascalia esce dalla cornice della scena (61 scene, 750 testi misurati).
- **Guide in PDF impaginate meglio**: i passi ora riempiono il foglio (disegni grandi e leggibili, testo sotto o accanto secondo lo spazio) e nessuna guida lascia una pagina mezza vuota: «Acquisire con uno scanner da tavolo» passa da due pagine sbilanciate a due pagine piene; controllate tutte le 17 guide.
- **Una guida per iPhone**: «Scansionare un documento con iPhone» (Note, fotocamera, PDF allegato e condivisione), collegata alla lezione sullo scanner accanto alle due guide per computer.
- **Aggiornamento garantito**: nuova versione della cache del service worker (sito e app Allievo), così chi aveva già la 1.6.0 riceve i file nuovi al primo ricaricamento, senza perdere dati e impostazioni.

## 1.6.0 · 20 novembre 2026

- **Nuovo percorso «Accessori»**: 9 lezioni, almeno due per livello (tre all'Intermedio, dove allo scanner si affiancano videochiamate e postazione), per collegare e far funzionare stampante, webcam, disco esterno, chiavetta USB, scanner, mouse, tastiera, cuffie e secondo schermo. Prima installazione della stampante passo per passo, stampa in Wi-Fi da computer e telefono, formati del disco (exFAT, NTFS, APFS), videochiamate senza eco, acquisire un documento con lo scanner fino al PDF in Documenti, diagnosi in cinque controlli e postazione condivisa con indirizzo IP fisso.
- **Quiz e test d'ingresso**: 19 nuove domande a scelta multipla, 4 frasi da completare, 3 sequenze da ordinare e 6 voci di glossario per il percorso Accessori; il test d'ingresso ha le sue quattro capacità.
- Il programma passa a **49 lezioni in 6 percorsi** e **147 esercizi**.
- Accessori è selezionabile tra i **dispositivi del cliente** (con il suo livello), compare nell'app Allievo anche senza percorsi scelti e la pagina di verifica degli attestati ne mostra il nome; aggiunto il collegamento nel piede di pagina.
- **Testata più stretta**: su telefoni da 320–360 px il pulsante «Menu» non esce più dallo schermo.
- **Schermate guida**: ora sono **sedici**, sempre con il cerchio arancione sul punto da toccare: installare la stampante la prima volta, su Windows e su Mac (Impostazioni di Sistema, «Aggiungi stampante», pagina di prova); acquisire un documento con lo scanner della multifunzione e con uno scanner da tavolo; copiare i file su una chiavetta o un disco esterno (unità, barra di copia, rimozione sicura); abbinare le cuffie Bluetooth al telefono. Si filtrano per dispositivo e per lezione: dentro ogni lezione il pulsante «Tutte le guide di questa lezione» apre l'elenco già filtrato.

## 1.5.2 · 14 novembre 2026

- **Libricino da pinzare**: i fogli si mettono in pila (foglio 1 sotto), si piegano insieme e si pinzano sulla piega; ogni foglio porta «Foglio n di N · fronte/retro» vicino alla piega, il foglio 1 ha le tacche per le graffette, le facciate in più diventano «Appunti» e c'è una vera quarta di copertina. Nuovi file «solo fronti» e «solo retri» per le stampanti senza fronte-retro. Il programma che crea il PDF simula la piegatura e si ferma se l'ordine delle pagine non torna.

- **Chiave dell'autore pubblicata** (impronta `D875-1419-D6E1-1819`): la pagina di verifica mostra «Chiave riconosciuta: Danilo D'Auria» sugli attestati firmati da Danilo, e le licenze per formatori emesse da lui risultano valide nel programma di chi le importa.

## 1.5.1 · 14 novembre 2026

Revisione di sicurezza completa, con controlli automatici per le versioni future.

- **Allegati delle risposte**: un allegato preparato ad arte poteva eseguire codice nel programma del tutor; ora gli allegati sono accettati solo come immagini o file `data:` di tipi ammessi e sempre protetti.
- **Dati in arrivo ripuliti** da kit, risposte, casella, aula, sincronizzazione e file importati: niente inquinamento dei prototipi, identificativi controllati, lezioni e domande ricostruite campo per campo, pacchetti compressi limitati a 40 MB, messaggi ripetuti o vecchi scartati.
- **Firme più severe**: risposte e correzioni senza firma vengono rifiutate; l'app Allievo avvisa se un kit arriva senza la firma del tutor; le licenze sono valide solo se firmate da una chiave dell'autore pubblicata.
- **Content-Security-Policy** in tutte le pagine e protezione contro l'inserimento in cornici di altri siti.
- **CSV senza formule eseguibili** (clienti, presenze, statistiche) e calendario .ics più robusto.
- **Backup cifrato** con 600.000 giri di PBKDF2; i backup precedenti si aprono come prima.
- **Assistenza a distanza**: i file ricevuti si scaricano sempre (mai aperti nel programma), nomi e dimensioni controllati.
- **Casella**: corretta una condizione di gara che poteva svuotare la copia condivisa quando l'altro dispositivo si collegava.
- **Versione desktop**: Electron 45 (la 38 non riceveva più correzioni), collegamenti esterni filtrati, permessi solo per le pagine del programma, controllo dei percorsi rafforzato, dipendenze bloccate con `package-lock.json`.
- **Automazioni**: `scripts/sicurezza.cjs` nei test di ogni pubblicazione; workflow «Controllo di sicurezza» settimanale con `npm audit`, verifica del supporto di Electron e CodeQL; Dependabot; azioni dei workflow fissate all'impronta del commit; [SECURITY.md](SECURITY.md).

## 1.5.0 · 14 novembre 2026

- **Sincronizzazione tra i tuoi dispositivi** (miglioria 13): abbinamento con un QR, poi PC, tablet e telefono si scambiano l'archivio cifrato end-to-end e lo uniscono (vince la modifica più recente, le cancellazioni si propagano). Senza Internet: Importa backup › «Unisci».
- **Casella condivisa cifrata** (miglioria 14): per ogni cliente note, password con scadenza e piccoli file tra tutor e allievo, senza email; l'allievo la riceve con il kit, le voci scadute si cancellano da sole.
- **Assistente vocale** (miglioria 15): domande a voce o scritte, risposta cercata sul dispositivo nelle lezioni, nelle schermate guida, nel glossario e nelle domande frequenti, letta ad alta voce.
- **Controllo completo con RustDesk** (miglioria 16): guida per tutor e allievo, ID RustDesk nella scheda cliente e pulsante che apre il collegamento.
- **Versione desktop** (miglioria 17): programmi per Windows (.exe e portatile), Linux (.deb, .AppImage) e Mac (.dmg) costruiti da GitHub e allegati alla Release, con aggiornamento automatico.
- **Kit per altri tutor** (miglioria 20): marchio personale su documenti, attestati e app Allievo; listino delle licenze e scheda prodotto; licenze per formatori firmate e verificabili.

## 1.4.0 · 14 novembre 2026

- **Percorsi su misura** (miglioria 7): componi un percorso incontro per incontro o parti da sei modelli pronti (SPID in 4 incontri, Smartphone da zero, Truffe? No grazie, Nonni e nipoti, Ufficio in ordine, Smart TV senza stress). Programma in PDF, assegnazione con appuntamenti in agenda e compiti con scadenza, «Il mio percorso» nell'app Allievo tramite il kit.
- **Editor delle lezioni e delle domande** (miglioria 8): lezioni proprie con immagini, domande a scelta multipla, annotatore di schermate con frecce, cerchi, riquadri, numeri e scritte; esportazione e importazione dei contenuti.
- **Schermate guida illustrate** (miglioria 9): dieci guide disegnate da zero per Android, iPhone, Windows e Smart TV con il punto da toccare, dentro le lezioni collegate e stampabili in PDF.
- **Fattura elettronica** (miglioria 11): file XML FatturaPA (FPR12) per forfettari, minimi e regime ordinario, con bollo virtuale, controllo di partita IVA, codice fiscale e indirizzi, e PDF di cortesia. Il file si carica nel portale dell'Agenzia delle Entrate o si dà al commercialista.
- **Modalità gruppo in aula** (miglioria 12): domanda sulla Smart TV, risposte dai telefoni inquadrando un QR, punteggio per velocità, grafico delle risposte e classifica, risultati salvati nella scheda del gruppo. Canale cifrato end-to-end; senza Internet, conta per alzata di mano.
- **Accessibilità** (miglioria 19): contrasto elevato, pulsanti grandi, niente animazioni e la modalità «un pulsante alla volta» per chi ha difficoltà motorie. Contrasti corretti e pagine controllate con axe sulle regole WCAG 2 AA in tema chiaro, scuro e ad alto contrasto.

## 1.3.0 · 14 novembre 2026

- **Backup cifrato con password** (miglioria 5): Impostazioni › «Backup cifrato con password» salva un file `.tdcifrato` protetto con AES-256 e PBKDF2, da tenere su chiavetta o cloud senza rischi per la privacy dei clienti; «Importa backup» riconosce da solo il file cifrato e chiede la password. In home compare un promemoria se l'ultima copia ha più di una settimana.
- **Registro presenze per gli enti** (miglioria 6): Documenti › «Registro presenze», o dalla scheda cliente › Registro lezioni. Foglio mensile in PDF con incontri, orari, ore, argomenti, griglia presente/assente per ogni partecipante, firme del docente e del referente; a scelta un foglio firme a mano per ogni incontro e la tabella per Excel.
- **Statistiche del lavoro** (miglioria 10): ore e incassi per mese, da incassare, clienti per luogo e città, argomenti più richiesti, progressi e andamento dei quiz di ogni allievo; tabella per Excel e riepilogo in PDF.
- **Firma digitale dei kit** (miglioria 4): kit e correzioni escono firmati con una chiave ECDSA del tutor. L'app Allievo mostra «Kit verificato», ricorda l'impronta della chiave e rifiuta i kit modificati o firmati da un'altra chiave.
- **Attestato con QR di verifica** (miglioria 18): il QR in alto a destra apre la pagina pubblica `verifica/`, che controlla la firma e mostra codice, intestatario, data e livello senza server né archivio online. Registro pubblico facoltativo, solo con il consenso dell'intestatario.
- **Vademecum in PDF** (A5 da schermo, A4 da stampare e libricino da piegare), collegato nel menu e rigenerato in automatico da GitHub a ogni nuova versione.

## 1.2.0 · 13 novembre 2026

- **QR code** scritto nel progetto (nessuna libreria): kit dell'allievo, sessione di assistenza a distanza e correzione si aprono inquadrando il QR con la fotocamera del telefono o del tablet.
- **Promemoria delle scadenze** nell'app Allievo: riquadro «Scadenze» in home, file per il calendario con avviso il giorno prima e la mattina, notifiche all'apertura e, dove il browser lo consente, anche ad app chiusa.
- **Approvazione dei compiti pratici e delle foto**: per ogni compito e allegato «Approvato» o «Da rifare» con nota; l'esito arriva all'allievo con la correzione e i compiti da rifare restano aperti per il prossimo kit.

## 1.1.1 · 13 novembre 2026

- I file di programma hanno il numero di versione nell'indirizzo: dopo un aggiornamento il browser non può più mescolare file vecchi e nuovi (succedeva aprendo l'app Allievo dove era già installata quella del tutor).
- Avvio più robusto se manca un pulsante dell'intestazione.

## 1.1.0 · 13 novembre 2026

- Nuova app **Tutor Digitale · Allievo** (`allievo/`), installabile e personalizzata dal kit del tutor: compiti, quiz da consegnare, correzioni, allenamento, lezioni, palestra, profilo e copia di sicurezza.
- **Compiti a distanza**: kit firmato con un segreto per cliente e quiz senza soluzioni; risposte via condivisione, email, codice, file o sessione a distanza; **correzione automatica** nel programma del tutor e correzione rimandata all'allievo.
- **Assistenza a distanza**: codice + password di 6 cifre che si rigenera, collegamento diretto cifrato, schermo condiviso, chat, invio di file.
- Scheda cliente › «App allievo»; pagina «Scambio con gli allievi».
- Correzioni: titolo della pagina doppio, cache del service worker che poteva conservare file vecchi, collegamento al quiz durante il gioco, logo mancante nei PDF dell'app Allievo.

## 1.0.0 · 13 novembre 2026

Prima versione pubblica.

- 40 lezioni in 4 livelli (Primi passi, Principiante, Intermedio, Esperto) e 5 percorsi (Computer, Tablet, Smartphone, Smart TV, Internet e sicurezza), ognuna con obiettivi, spiegazione, passi, tre esercizi e compito.
- Quiz con cinque tipi di domanda; ordine delle domande, posizione e lettera/numero delle risposte cambiano a ogni partita. Verifiche stampabili sempre diverse con chiave separata.
- Palestra interattiva: mouse, trascinamento, tastiera, «Truffa o no?», laboratorio password.
- Clienti persone, enti e gruppi: scheda, test d'ingresso, registro lezioni, percorso, compiti, quiz, documenti.
- Liberatoria con informativa privacy firmabile sullo schermo, modulo vuoto stampabile, foglio firme per i gruppi.
- Attestato finale in PDF con competenze per area DigComp e codice verificabile.
- Preventivi e ricevute dal listino; agenda con esportazione .ics; timer della lezione; modalità lavagna.
- PWA installabile, identica online e offline, spia verde della connessione.
