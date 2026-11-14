/* Tutor Digitale · firma ad-hoc del pacchetto macOS (nessun certificato):
   senza firma, su Apple Silicon il programma risulterebbe «danneggiato».
   Il primo avvio chiede comunque conferma una volta (tasto destro › Apri).
   Codice: © 2026 Danilo D'Auria · licenza MIT */
const { execFileSync } = require("node:child_process");
const path = require("node:path");
exports.default = async function (context) {
  if (context.electronPlatformName !== "darwin") return;
  const app = path.join(context.appOutDir, context.packager.appInfo.productFilename + ".app");
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", app], { stdio: "inherit" });
};
