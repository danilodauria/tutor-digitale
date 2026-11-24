# Migliorie e idee per le prossime versioni

Elenco ragionato, dal più utile e semplice al più ambizioso. ★ = impatto, ⏱ = lavoro. Le voci fatte sono segnate con ✅: il promemoria settimanale legge questo file e propone le successive.

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
