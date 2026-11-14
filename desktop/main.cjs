/* ==========================================================================
   Tutor Digitale · versione desktop (miglioria 17)
   Il programma statico gira dentro Electron con un indirizzo proprio
   (tutor://app/): i dati restano nel profilo dell'utente del computer,
   funziona senza Internet e si aggiorna da solo dalle Release di GitHub.
   Codice: © 2026 Danilo D'Auria · licenza MIT (vedi LICENSE)
   ========================================================================== */

const { app, BrowserWindow, Menu, shell, protocol, net, dialog } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const CARTELLA = path.join(__dirname, "app");
const SCHEMA = "tutor";

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEMA, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);

if (!app.requestSingleInstanceLock()) { app.quit(); }

function finestra(pagina) {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 380, minHeight: 500,
    title: "Tutor Digitale",
    icon: path.join(__dirname, "build", "icon.png"),
    backgroundColor: "#f5f1e8",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: true }
  });
  win.loadURL(SCHEMA + "://app/" + (pagina || "index.html"));
  // i collegamenti esterni (siti, email, rustdesk://) si aprono fuori dal programma
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(SCHEMA + "://")) return { action: "allow" };
    shell.openExternal(url).catch(() => {});
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith(SCHEMA + "://")) { e.preventDefault(); shell.openExternal(url).catch(() => {}); }
  });
  // fotocamera, microfono e schermo servono a QR, assistente vocale e assistenza a distanza
  win.webContents.session.setPermissionRequestHandler((_wc, permesso, ok) => ok(["media", "display-capture", "notifications", "clipboard-sanitized-write", "fullscreen"].includes(permesso)));
  return win;
}

function menu() {
  const voce = (etichetta, pagina) => ({ label: etichetta, click: () => finestra(pagina) });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: "Tutor Digitale", submenu: [voce("Nuova finestra", "index.html"), voce("App Allievo (per provarla)", "allievo/index.html"), { type: "separator" }, { role: "quit", label: "Esci" }] },
    { label: "Visualizza", submenu: [{ role: "reload", label: "Ricarica" }, { role: "togglefullscreen", label: "Schermo intero (per la TV)" }, { role: "zoomIn", label: "Ingrandisci" }, { role: "zoomOut", label: "Riduci" }, { role: "resetZoom", label: "Dimensione normale" }] },
    { label: "Aiuto", submenu: [
      { label: "Vademecum (PDF)", click: () => shell.openPath(path.join(CARTELLA, "assets", "pdf", "vademecum-tutor-digitale.pdf")) },
      { label: "Sito del progetto", click: () => shell.openExternal("https://danilodauria.github.io/tutor-digitale/") },
      { label: "Informazioni", click: () => dialog.showMessageBox({ type: "info", title: "Tutor Digitale", message: "Tutor Digitale " + app.getVersion(), detail: "Ideato, scritto e sviluppato da Danilo D'Auria.\nCodice MIT, contenuti CC BY-NC-SA 4.0.\nI dati restano su questo computer." }) }
    ] }
  ]));
}

app.whenReady().then(() => {
  protocol.handle(SCHEMA, (req) => {
    const u = new URL(req.url);
    let rel = decodeURIComponent(u.pathname).replace(/^\/+/, "");
    if (!rel || rel.endsWith("/")) rel += "index.html";
    const file = path.normalize(path.join(CARTELLA, rel));
    if (!file.startsWith(CARTELLA)) return new Response("Vietato", { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  menu();
  finestra();
  try {
    const { autoUpdater } = require("electron-updater");
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  } catch (e) { /* senza Internet o in sviluppo: nessun aggiornamento */ }
});

app.on("second-instance", () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) finestra(); });
