# AGENTS.md — tutor-digitale

Se sei un assistente IA che riprende il lavoro qui, **prima di tutto leggi** il file di consegna comune:
https://github.com/danilodauria/danilodauria.github.io/blob/main/HANDOFF.md

Regola fondamentale: **non riscrivere, rinominare o rifattorizzare ciò che funziona.** Prima un piano dettagliato, poi la conferma di Danilo, poi il codice.

## In questo repository

- **Cos'è**: lezioni di tecnologia su misura, app che funziona offline (PWA) con pacchetti desktop.
- **Leggi nell'ordine**: README.md → ultimi commit (`git log --oneline -30`) → il resto della cartella.
- **Verifica prima e dopo ogni modifica**: `npm test` (esegue `node tests/verify.cjs`).
- **Robot attivi**: Pagine (a ogni push su main), Sicurezza (push e ogni lunedì), Vademecum (su tag e su CHANGELOG, package.json e dati) e Pacchetti desktop (dopo il Vademecum). Non modificarli e non disattivarli.
- **Da sapere**: ci sono `CHANGELOG.md` e `MIGLIORIE.md`: aggiorna il CHANGELOG solo se Danilo chiede una nuova versione. Per un commit di sola consegna (questo file, HANDOFF*.md) scrivi `[skip ci]` nel messaggio.

Dopo il lavoro aggiungi una riga al registro: https://github.com/danilodauria/danilodauria.github.io/blob/main/HANDOFF-REGISTRO.md
