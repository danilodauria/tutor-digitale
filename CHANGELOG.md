# Versioni

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
