# Sicurezza di Tutor Digitale

## Segnalare un problema

Se trovi una vulnerabilità, **non aprire una issue pubblica**: usa «Report a vulnerability» nella scheda
*Security* del repository (segnalazione privata) oppure scrivi all'autore tramite https://github.com/danilodauria.
Indica la versione (in fondo a ogni pagina), i passi per riprodurre il problema e l'effetto.

## Come è protetto il programma

- **Nessun server con i dati**: clienti, registro e documenti restano nel dispositivo del tutor; il backup è
  cifrato AES-256 con PBKDF2-SHA-256 (600.000 giri).
- **Content-Security-Policy** in ogni pagina: solo script del programma (gli script in linea sono ammessi per
  impronta), nessun plugin, nessuna cornice; collegamenti in uscita solo verso i tre canali pubblici cifrati.
- **Dati in arrivo ripuliti** (kit, risposte, casella, aula, sincronizzazione, file importati): niente chiavi
  `__proto__`/`constructor`, identificativi solo alfanumerici, allegati solo come `data:` di tipi ammessi
  (mai `javascript:`, HTML o SVG), pacchetti compressi limitati a 40 MB, messaggi vecchi o ripetuti scartati.
- **Firme**: kit e correzioni con HMAC per cliente ed ECDSA P-256 del tutor; l'app Allievo ricorda la chiave
  del tutor e avvisa se cambia o se manca. Attestati e licenze firmati e verificabili; una licenza è valida
  solo se firmata da una chiave dell'autore pubblicata.
- **CSV** senza formule eseguibili, **XML** FatturaPA con caratteri protetti.
- **Versione desktop**: Electron supportato, isolamento del contesto, sandbox, Node disattivato,
  collegamenti esterni solo `https`, `mailto`, `tel`, `rustdesk`, protocollo interno senza uscita dalle cartelle.

## Controlli automatici

- `node scripts/sicurezza.cjs` a ogni pubblicazione: CSP e impronte, iniezioni in `href`/`src`, `eval`,
  gestori in linea, `JSON.parse` non protetti, segreti nel repository, azioni dei workflow fissate all'impronta,
  permessi dei workflow, configurazione di Electron.
- `tests/verify.cjs`: prove su prototipi, allegati, CSV, pacchetti «a bomba», firme e licenze contraffatte.
- Workflow **Controllo di sicurezza** (a ogni modifica e ogni lunedì): i controlli sopra, `npm audit` delle
  dipendenze desktop, verifica che Electron sia ancora supportato, analisi **CodeQL**.
- **Dependabot**: aggiornamenti di Electron (settimanali) e delle azioni GitHub (mensili).

## Rischi noti e accettati

- I canali pubblici (MQTT) e i server STUN vedono gli indirizzi di rete e i nomi casuali delle stanze, mai i
  contenuti; possono rifiutare o cancellare messaggi (la casella conserva sempre una copia locale).
- Il link del kit contiene il segreto del cliente: va mandato solo all'allievo.
- In modalità aula chi conosce il QR può partecipare e scrivere un nome qualsiasi.
- La chiave di firma del tutor sta nel browser del dispositivo: proteggi il dispositivo con una password e
  cifra sempre il backup.
