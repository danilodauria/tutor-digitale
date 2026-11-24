/* ==========================================================================
   Tutor Digitale · frasi pronte per il comunicatore «Segni e voce»
   Frasi intere, non parole singole: chi non parla le compone con due tocchi e
   il programma le legge ad alta voce. Le stesse frasi servono a chi non sente
   per farsi capire allo sportello, al telefono o a lezione.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

window.TD = window.TD || {};

TD.SEGNI = {
  categorie: [
    {
      id: "presentarsi", nome: "Presentarsi",
      voci: [
        { e: "🤟", t: "Sono sordo/a" },
        { e: "🤟", t: "Uso la lingua dei segni italiana (LIS)" },
        { e: "👀", t: "Leggo le labbra: parla guardandomi" },
        { e: "✍️", t: "Preferisco scrivere" },
        { e: "📱", t: "Posso scrivere sul telefono e mostrartelo" },
        { e: "👥", t: "Sono con un interprete LIS" },
        { e: "🦻", t: "Ho un apparecchio acustico" }
      ]
    },
    {
      id: "bisogni", nome: "Bisogni",
      voci: [
        { e: "💧", t: "Vorrei dell'acqua, per favore" },
        { e: "🚻", t: "Dov'è il bagno?" },
        { e: "🆘", t: "Ho bisogno di aiuto" },
        { e: "🪑", t: "Vorrei sedermi un momento" },
        { e: "💊", t: "Devo prendere le medicine" },
        { e: "📞", t: "Potete chiamare qualcuno per me?" },
        { e: "🥶", t: "Ho freddo" },
        { e: "🍽️", t: "Vorrei mangiare qualcosa" }
      ]
    },
    {
      id: "lezione", nome: "A lezione",
      voci: [
        { e: "❓", t: "Non ho capito, puoi ripetere?" },
        { e: "🐢", t: "Puoi andare più lentamente, per favore?" },
        { e: "📝", t: "Puoi scriverlo?" },
        { e: "👉", t: "Puoi mostrarmi di nuovo questo passaggio?" },
        { e: "✅", t: "Sì, ho capito" },
        { e: "🏁", t: "Ho finito" },
        { e: "🔁", t: "Ricominciamo da capo" },
        { e: "⏸️", t: "Possiamo fare una pausa?" }
      ]
    },
    {
      id: "emergenza", nome: "Emergenza",
      voci: [
        { e: "🚑", t: "Ho bisogno di aiuto subito" },
        { e: "📞", t: "Chiamate il 112" },
        { e: "🤒", t: "Non mi sento bene" },
        { e: "🏥", t: "Portatemi da un medico" },
        { e: "👥", t: "Ho bisogno di un interprete LIS" },
        { e: "🚪", t: "Dov'è l'uscita?" },
        { e: "📍", t: "Non so dove sono" }
      ]
    },
    {
      id: "cortesia", nome: "Cortesia",
      voci: [
        { e: "👋", t: "Buongiorno" },
        { e: "🙏", t: "Grazie mille" },
        { e: "✋", t: "Per favore" },
        { e: "😔", t: "Mi scusi" },
        { e: "👋", t: "Arrivederci" },
        { e: "😊", t: "Come stai?" }
      ]
    },
    {
      id: "emozioni", nome: "Come sto",
      voci: [
        { e: "😊", t: "Sono contento/a" },
        { e: "😴", t: "Sono stanco/a" },
        { e: "😟", t: "Sono preoccupato/a" },
        { e: "👍", t: "Va tutto bene" },
        { e: "👎", t: "Non va bene" },
        { e: "⏸️", t: "Ho bisogno di una pausa" }
      ]
    }
  ],
  rapide: [
    { e: "✅", t: "Sì" },
    { e: "❌", t: "No" },
    { e: "❓", t: "Non capisco" },
    { e: "🔁", t: "Ancora" },
    { e: "🐢", t: "Più lentamente" },
    { e: "🙏", t: "Grazie" }
  ]
};
