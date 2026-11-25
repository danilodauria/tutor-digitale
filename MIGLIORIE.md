# Migliorie e idee per le prossime versioni

Elenco ragionato, dal più utile e semplice al più ambizioso. ★ = impatto, ⏱ = lavoro. Le voci fatte sono segnate con ✅: `node scripts/idee.cjs` legge questo file e stampa le proposte ancora aperte (lo fa anche la pubblicazione), così a ogni giro si riparte dalla prima non fatta.

## Subito (1.2 e 1.3)

1. ✅ *fatto in 1.2.0* — **QR code del kit e della sessione** ★★★ ⏱ — il tutor mostra un QR sullo schermo, l'allievo lo inquadra con il telefono: niente link lunghi da copiare. Generatore QR scritto nel programma, senza librerie esterne.
2. ✅ *fatto in 1.2.0* — **Promemoria dei compiti nell'app Allievo** ★★★ ⏱ — notifica locale il giorno prima della scadenza (dove il sistema lo permette) e un avviso in home.
3. ✅ *fatto in 1.2.0* — **Correzione dei compiti pratici con foto** ★★ ⏱ — il tutor mette «approvato / da rifare» a ogni foto ricevuta, e l'esito torna nella correzione.
4. ✅ *fatto in 1.3.0* — **Firma digitale dei kit con chiave del tutor** ★★ ⏱⏱ — oltre al segreto per cliente, una firma ECDSA del tutor: l'allievo è sicuro che il kit venga proprio da te.
5. ✅ *fatto in 1.3.0* — **Backup cifrato con password** ★★★ ⏱ — l'esportazione dell'archivio clienti si cifra (AES) e si può tenere su chiavetta o cloud senza rischi per la privacy.
6. ✅ *fatto in 1.3.0* — **Registro presenze stampabile per gli enti** ★★ ⏱ — foglio mensile con date, ore e firme, utile per rendicontare a Comuni e associazioni.

## Medio termine (1.4)

7. ✅ *fatto in 1.4.0* — **Percorsi su misura** ★★★ ⏱⏱ — il tutor compone un percorso (es. «SPID in 4 incontri») scegliendo lezioni ed esercizi, e lo assegna con un solo kit.
8. ✅ *fatto in 1.4.0* — **Editor delle lezioni e delle domande** ★★★ ⏱⏱ — aggiungere lezioni, domande e immagini proprie dal programma, con esportazione e importazione.
9. ✅ *fatto in 1.4.0* — **Schermate guida con immagini** ★★★ ⏱⏱ — screenshot annotati (frecce, cerchi) per Android, iPhone, Windows e TV, disegnati in modo originale.
10. ✅ *fatto in 1.3.0* — **Statistiche del lavoro** ★★ ⏱ — ore e incassi per mese, clienti per luogo, argomenti più richiesti, grafico dei progressi di ogni allievo.
11. ✅ *fatto in 1.4.0* — **Fattura elettronica** ★★ ⏱⏱ — esportazione del documento in XML FatturaPA per chi ha la partita IVA, da caricare nel portale dell'Agenzia delle Entrate o nel programma del commercialista.
12. ✅ *fatto in 1.4.0* — **Modalità gruppo in aula** ★★★ ⏱⏱ — quiz «tutti insieme»: il tutor proietta la domanda sulla Smart TV, i partecipanti rispondono dal loro telefono collegandosi alla sessione.

## Ambiziose (1.5)

13. ✅ *fatto in 1.5.0* — **Sincronizzazione tra i tuoi dispositivi** ★★★ ⏱⏱⏱ — archivio clienti allineato tra PC, tablet e telefono via collegamento diretto (come l'assistenza a distanza) o tramite il tuo «GitHub di casa».
14. ✅ *fatto in 1.5.0* — **Casella condivisa online** ★★ ⏱⏱⏱ — una cartella cifrata (per esempio su un repository privato o su un piccolo server di casa) dove allievi e tutor lasciano file con credenziali e password a tempo, senza passare dall'email.
15. ✅ *fatto in 1.5.0* — **Assistente vocale locale** ★★ ⏱⏱⏱ — l'allievo fa domande a voce e l'app risponde dalle lezioni (come Neura dello Psicologo Digitale), senza Internet.
16. ✅ *fatto in 1.5.0* — **Controllo remoto completo** ★★ ⏱⏱⏱ — integrazione guidata con RustDesk (libero, installabile) per muovere davvero il mouse sul PC dell'allievo quando serve.
17. ✅ *fatto in 1.5.0* — **Versione desktop (.exe, .deb, .AppImage)** ★★ ⏱⏱ — come per lo Psicologo Digitale, con un pacchetto Electron che funziona anche su PC vecchi e si integra con FeniceOS.
18. ✅ *fatto in 1.3.0* — **Attestato con QR di verifica** ★★ ⏱ — il QR sull'attestato apre una pagina che conferma codice, intestatario e data (registro pubblico facoltativo, solo con consenso).
19. ✅ *fatto in 1.4.0* — **Accessibilità certificata** ★★★ ⏱⏱ — prova con lettori di schermo (NVDA, TalkBack, VoiceOver), contrasto elevato, modalità «un pulsante alla volta» per chi ha difficoltà motorie.
20. ✅ *fatto in 1.5.0* — **Kit per altri tutor** ★★ ⏱⏱ — licenza commerciale ai formatori di associazioni ed enti: il tuo programma diventa un prodotto, con il tuo marchio e il listino delle licenze.

## Dopo la 1.6.0

Idee emerse lavorando al percorso Accessori e alle schermate guida. La 1.7.0 ha realizzato il percorso di partenza dal test d'ingresso, il riepilogo della lezione per l'allievo, le guide sul singolo passo (21), la modalità essenziale dell'app Allievo e il cruscotto del tutor.

21. ✅ *fatto in 1.7.0* — **Link al singolo passo** ★ ⏱ — `#/guida/g-stampante-mac/4` apre la guida già sul passo 4, da mandare all'allievo quando è bloccato proprio lì, invece del link alla guida intera.
22. **Lettura ad alta voce passo per passo** ★ ⏱ — «Leggi ad alta voce» evidenzia il passo in corso e si ferma a fine passo; chi ha bisogno riascolta solo quello, senza far ripartire tutta la guida.
23. **Tutte le guide in un solo PDF** ★★ ⏱ — un pulsante «Stampa tutte le guide» con indice e una guida dopo l'altra, da lasciare all'allievo come fascicolo: oggi si scarica un PDF alla volta.
24. **Guide leggibili in bianco e nero** ★★ ⏱ — variante per chi stampa senza colore: il cerchio arancione diventa un tratteggio con il numero in nero e gli sfondi azzurri spariscono, senza perdere il punto da toccare.
25. ✅ *fatto in 1.7.0* — **Ricerca e filtro per lezione nella pagina guide** ★★ ⏱ — oltre al filtro per dispositivo, cercare per parola («stampante», «Wi-Fi») e trovare «le guide di questa lezione» dentro ogni lezione, senza girare per l'elenco.
26. **Nuove guide per gli accessori senza disegno** ★★ ⏱⏱ — webcam in videochiamata, secondo schermo, mouse e tastiera Bluetooth: le lezioni `accessori-2-1` e `accessori-2-2` oggi spiegano a parole ciò che le altre mostrano passo per passo.
27. **Varianti per modello** ★★ ⏱⏱ — Samsung e Xiaomi per Android, HP ed Epson per le stampanti, macOS Ventura e precedenti (dove si chiama ancora «Preferenze di Sistema»): la guida mostra la variante giusta invece di avvisare che «le scritte possono cambiare».
28. **Controllo automatico dei disegni** ★★ ⏱⏱ — screenshot di riferimento delle scene e confronto a ogni modifica, per accorgersi da soli di un numero che copre un testo o di un riquadro fuori bersaglio: nella 1.6.0 i due casi sono stati trovati guardando le pagine a mano.

## Dopo la 1.7.0

29. ✅ *fatto in 1.8.0* — **Quiz dal telefono per una persona sola** ★★★ ⏱ — la modalità aula senza gruppo e senza televisore: le domande restano sul monitor del computer, l'allievo risponde dal telefono col QR, correzione e punteggio subito sullo schermo e risultato salvato nella scheda del cliente.
30. ✅ *fatto in 1.8.0* — **Trasmetti allo schermo** ★★★ ⏱⏱ — un pulsante in vista manda le domande a un Chromecast in Wi-Fi, oppure apre lo schermo grande in una finestra per cavo HDMI, Fire TV o secondo monitor; la pagina dello schermo mostra domanda, colori, tempo, barre e classifica, con il tutto schermo.
31. **Trasmissione come app Cast registrata** ★★ ⏱⏱⏱ — per comparire nell'elenco dei dispositivi anche senza il selettore di Chrome, con un ricevitore Cast dedicato e il suo identificativo, senza cambiare la pagina dello schermo.

## Dopo la 1.8.0

32. ✅ *fatto in 1.9.0* — **Segni e voce** ★★★ ⏱⏱ — comunicatore a frasi intere che legge ad alta voce (per chi non parla, anche al telefono e allo sportello) e video in lingua dei segni registrati con la webcam, salvati sul dispositivo, collegati alle lezioni e condivisibili (per chi non sente).
33. **Dizionario LIS condiviso** ★★ ⏱⏱ — esportare i video in un pacchetto cifrato da dare all'allievo (o da ricevere da un collega), così i segni registrati una volta viaggiano senza WhatsApp e restano ordinati per parola e lezione.
34. **Riconoscimento dei segni sul dispositivo** ★★★ ⏱⏱⏱ — tradurre in testo i segni ripresi dalla webcam: oggi servono modelli grandi e non è realistico dentro una PWA offline; si può provare con un modello ridotto solo per un alfabeto di poche lettere, dichiarando i limiti.

## Dopo la 1.11.1 (1.12.0)

Le dodici proposte del giro di novembre 2026, ordinate per valore. Le voci ✅ sono state realizzate e coperte dalle verifiche automatiche; le altre restano qui come promemoria: a ogni nuovo giro si riparte dalla prima non fatta, si controlla che sia ancora valida e si aggiorna lo stato, così nessuna proposta sparisce. La 1.12.0 ha realizzato le tre più contenute e urgenti.

35. ✅ *fatto in 1.12.0* — **Abbinare i nomi ai partecipanti prima di salvare un quiz di gruppo** ★★★ ⏱ — la schermata finale propone per ogni telefono il partecipante dell'elenco (nome intero, o solo nome se unico), permette di correggerlo e salva con il nome giusto; chi non è in elenco resta col nome del telefono.
36. ✅ *fatto in 1.12.0* — **Lettura ad alta voce in aula e sul telefono** ★★ ⏱ — «Leggi» sul monitor e su ogni telefono pronuncia domanda, proposta e risposte con la lettera, e la spiegazione dopo la correzione.
37. ✅ *fatto in 1.12.0* — **Esportare i dati di un solo cliente** ★★ ⏱ — file JSON leggibile con anagrafica, registro, compiti, quiz, documenti e attestati di quella persona, più il riepilogo; la cancellazione del cliente esisteva già.
38. **Archivio locale cifrato con blocco automatico** ★★★ ⏱⏱ — i dati dei clienti sono in chiaro nel browser e il tablet passa di mano all'allievo; una passphrase all'avvio e un blocco dopo qualche minuto proteggono il caso più probabile. *Verifica prima di partire: che il backup cifrato e la sincronizzazione continuino a funzionare con l'archivio bloccato, e che l'app Allievo non chieda la password del tutor.*
39. **Backup automatico su una cartella scelta, con anteprima del contenuto** ★★★ ⏱⏱ — il promemoria settimanale dipende da un gesto umano; la File System Access API può salvare da sola una copia cifrata e mostrare cosa contiene un backup prima di importarlo. *Verifica: il browser di destinazione (Chrome, Edge, Safari) e il ripiego quando la cartella non è disponibile.*
40. **Foglio firme digitale per il registro presenze** ★★★ ⏱⏱ — per Comuni, associazioni e scuole il registro si firma a mano; un QR, la firma col dito sul telefono e l'unione nel PDF del mese tolgono la raccolta carta. *Verifica: firme fuori ordine, partecipanti assenti, foglio del docente e del referente.*
41. **«Chiedi aiuto» dall'app Allievo, agganciato al passo bloccato** ★★★ ⏱⏱ — l'aiuto a distanza oggi parte dal tutor; una richiesta con cliente, lezione e passo riduce le telefonate. *Verifica: cosa vede il tutor quando l'allievo non ha ancora un profilo o è offline.*
42. **«Lezione di oggi» in un flusso unico** ★★ ⏱⏱ — lavagna, argomenti, presenze, salvataggio e prossimo appuntamento in pochi tocchi, con i valori già precompilati. *Verifica: lezione saltata, cliente nuovo, gruppo con partecipanti.*
43. **Dossier di fine percorso in un PDF** ★★ ⏱ — ore, argomenti, andamento dei quiz, compiti e competenze in un unico documento da lasciare al cliente o all'ente. *Verifica: cliente senza quiz e percorso concluso a metà.*
44. **Confronto tra sessioni di gruppo, partecipante per partecipante** ★★ ⏱ — mostra chi è migliorato e chi è fermo, trasformando la media di gruppo in informazione didattica. *Verifica: partecipanti entrati o usciti tra una sessione e l'altra.*
45. **Quiz di gruppo senza classifica o a squadre, con ripresa della sessione** ★★ ⏱ — un interruttore «solo il gruppo» o «a squadre» evita l'imbarazzo della classifica individuale; il salvataggio automatico permette di riprendere se il browser si chiude. *Verifica: ripresa dopo un ricaricamento e punteggi già assegnati.*
46. **Conferma di presenza della prossima lezione dall'app Allievo** ★ ⏱⏱ — conferma o richiesta di rinvio con l'esito nell'agenda, senza account né server. *Verifica: allievo senza app installata, appuntamento spostato dal tutor.*

## Dopo la 1.12.4

Le sei idee mai discusse prima, emerse dalle prove reali sul quiz dal telefono e dall'uso quotidiano. La 47 è già stata realizzata nella 1.12.4; le altre restano aperte e numerate, con i rimandi alle proposte collegate.

47. ✅ *fatto in 1.12.4* — **Broker scelto dal monitor e scritto nella stanza** ★★★ ⏱⏱ — il monitor prova i broker pubblici, sceglie quello che risponde e mette l'indice nel nome della stanza (`b1-…`), che viaggia nel QR, nel link e nella pagina dello schermo; telefoni e schermo provano quel broker per primo e, se non risponde, ripiegano sugli altri nello stesso ordine. Così due dispositivi della stessa stanza non finiscono più su canali diversi e non si vedono. *Verifica: fatto — test su stanza, lettura dell'indice, ordine di ripiego e scelta fatta dal monitor; prova reale sul sito con stanza `b0-…` e due telefoni visti dal monitor. Vedi 52 per la diagnosi quando il canale è lento.*
48. **Presenze automatiche dal quiz di gruppo** ★★★ ⏱⏱ — dopo l'abbinamento dei nomi, un pulsante segna presenti i partecipanti nella lezione di oggi (creandola nel registro se manca), così il gruppo non si ricompila a mano per rendicontare a Comuni e associazioni. *Verifica: telefoni non abbinati o «non in elenco», due quiz nello stesso giorno, partecipante assente all'incontro. Si appoggia all'abbinamento della 35 e al registro presenze della 6; vedi 40 e 42 per il foglio firme e il flusso della lezione.*
49. **Scelta del partecipante dal telefono all'ingresso** ★★ ⏱⏱ — chi entra sceglie il proprio nome dall'elenco del gruppo (oppure «non in elenco»), così omonimi e refusi non arrivano fino alla schermata finale; il telefono mostra solo i nomi del gruppo a chi ha inquadrato il QR. *Verifica: due partecipanti con lo stesso nome di battesimo, nome fuori elenco, telefono che ricarica a metà partita. Completa la 35; vedi 45 per la ripresa della sessione.*
50. **Avviso «nuova versione pronta» con aggiornamento in un tocco** ★★ ⏱ — un banner usa il service worker in attesa per proporre «Aggiorna», invece di lasciare l'app su una cache vecchia (il caso del tasto Cerca che sembrava mancare). *Verifica: aggiornamento con l'app aperta, ritorno offline dopo l'aggiornamento, app installata su Android e su desktop. Vedi 39 per la copia di sicurezza prima di aggiornare.*
51. **Ripasso mirato dopo il quiz, per partecipante** ★★ ⏱⏱ — dalle risposte sbagliate propone le lezioni e le guide collegate e un messaggio pronto per l'allievo; solo dove il collegamento domanda→lezione esiste, senza inventarlo. *Verifica: quiz senza collegamenti, risposte tutte giuste, partecipante fuori elenco. Si appoggia alla correzione della 3 e alle guide della 25; vedi 43 per il documento di fine percorso.*
52. **Diagnostica dell'aula in un pannello unico** ★★ ⏱ — mostra broker scelto, telefoni collegati, ultimo messaggio ricevuto e un pulsante «prova il canale», per distinguere Internet assente da un broker che accetta ma non consegna. *Verifica: stanza senza telefoni, broker che non risponde, telefono che entra e resta in attesa. Completa il 47; vedi 41 per la richiesta d'aiuto dell'allievo e l'esito della prova sui broker qui sotto.*

## Esito della prova sui broker (25 novembre 2026)

Prova sul sito pubblicato **1.12.4**, con service worker annullato e cache svuotata, da questa macchina cloud. Obiettivo: capire se il caso «monitor e telefoni su broker diversi» è un difetto dell'app o della rete. Non è stato corretto nulla.

**Cosa è successo**
- Quattro stanze con due telefoni: in tutte la stanza conteneva il broker del monitor (`b1-…` per EMQX, `b0-…` per HiveMQ) e i telefoni lo hanno provato per primo. La scelta indipendente del broker, quella della 1.12.3, non si è più vista.
- In una stanza su quattro il monitor ha visto entrambi i telefoni; nelle altre tre ne ha visto uno solo. Nei casi falliti il telefono mancante aveva provato HiveMQ, non aveva ricevuto il CONNACK entro 7 secondi ed era ripiegato su EMQX, mentre il monitor restava su HiveMQ. Il telefono mostrava comunque «Ci sei, …!», senza avvisi, e il monitor contava 1 su 2.
- Riproduzione deterministica: stanza con monitor su EMQX e un telefono a cui è stato bloccato l'host `broker.emqx.io:8084`; il telefono è passato a Mosquitto, ha mostrato «Ci sei» e il monitor ha visto solo l'altro telefono.
- Prova MQTT diretta (5 CONNECT per broker, senza app): HiveMQ 4 CONNACK su 5 (un timeout a 9 s), EMQX 5 su 5, Mosquitto 3 su 5 (due errori WebSocket). I broker pubblici da questa macchina sono quindi instabili già a livello di connessione, non solo dentro l'app.

**Conclusione**
- Il difetto della 1.12.3 (ogni dispositivo sceglieva il broker per conto suo) è corretto: la stanza porta il broker del monitor e viene provato per primo.
- Il caso residuo è reale ma ha due cause distinte: l'instabilità dei broker pubblici da questa macchina (rete/broker, non codice) e il ripiego silenzioso dell'app, che quando un dispositivo non raggiunge il broker della stanza lo sposta su un altro e continua a mostrare «Ci sei» invece di avvisare o riprovare. Non è un problema di cifratura né di abbinamento dei nomi.
- Correzione candidata, non realizzata: mostrare che il telefono è su un canale diverso dal monitor e offrire «riprova», oppure non ripiegare quando la stanza indica già un broker (voce 52).

**Passi per riprodurlo** (sito pubblicato 1.12.4)
- Aprire il sito, annullare il service worker e svuotare la cache (DevTools › Application), poi ricaricare.
- Aprire «Quiz dal telefono», scegliere «Fino a 4 persone», un cliente e aprire la stanza.
- Controllare che la stanza inizi con `b0-`, `b1-` o `b2-` e che `TD.relay.indiceStanza(TD.aulaStato.stanza)` coincida con `TD.relay.BROKER.indexOf(TD.aulaStato.canale.broker)`.
- Aprire due telefoni dal link del QR, scrivere il nome e ripetere più stanze: in questa prova 3 su 4 hanno diviso i dispositivi.
- Nei DevTools dei telefoni guardare la rete: se compare più di un URL `wss://…/mqtt`, il secondo è il ripiego. Se il monitor conta meno telefoni di quelli che mostrano «Ci sei», il caso è riprodotto.
- Versione deterministica: bloccare l'host del broker del monitor su un solo telefono (estensione o sostituzione di `window.WebSocket` prima del caricamento) e ripetere l'ingresso; il telefono passa al broker successivo e non viene visto.
