const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const SHARED = [
  "shared.js",
  "background.js",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "LICENSE",
  "README.md"
];

function copyFile(fromRel, toDir, toName) {
  const from = path.join(ROOT, fromRel);
  const dest = path.join(toDir, toName || fromRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(from, dest);
}

function copyDir(fromRel, toDir) {
  const from = path.join(ROOT, fromRel);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const rel = path.join(fromRel, entry.name);
    if (entry.isDirectory()) copyDir(rel, toDir);
    else copyFile(rel, toDir);
  }
}

function emptyDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, name), { recursive: true, force: true });
  }
}

function stage(browser, manifestSource) {
  const dest = path.join(DIST, browser);
  emptyDir(dest);
  copyFile(manifestSource, dest, "manifest.json");
  for (const file of SHARED) copyFile(file, dest);
  copyDir("styles", dest);
  copyDir("icons", dest);
  return dest;
}

function zipDir(sourceDir, zipPath) {
  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  const zip = spawnSync("zip", ["-r", "-X", "-q", zipPath, "."], {
    cwd: sourceDir,
    stdio: "inherit"
  });
  if (zip.status !== 0) {
    throw new Error(`zip failed for ${zipPath}`);
  }
}

function listZip(zipPath) {
  const listed = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
  if (listed.status !== 0) {
    throw new Error(`unzip -Z1 failed for ${zipPath}`);
  }
  return listed.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

function verifyZip(zipPath, browser) {
  const names = listZip(zipPath);
  const required = [
    "manifest.json",
    "shared.js",
    "background.js",
    "content.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "styles/base.css",
    "styles/gmail.css",
    "styles/outlook.css",
    "styles/yahoo.css",
    "styles/proton.css",
    "styles/generic.css",
    "icons/icon16.png",
    "icons/icon32.png",
    "icons/icon48.png",
    "icons/icon128.png"
  ];
  const missing = required.filter((file) => !names.includes(file));
  if (missing.length) {
    throw new Error(`${browser} zip missing: ${missing.join(", ")}`);
  }
  const extra = names.filter((file) => {
    if (file.endsWith("/")) return false;
    return !required.includes(file) && file !== "LICENSE" && file !== "README.md";
  });
  if (extra.length) {
    throw new Error(`${browser} zip has unexpected files: ${extra.join(", ")}`);
  }
  const extracted = spawnSync("unzip", ["-p", zipPath, "manifest.json"], { encoding: "utf8" });
  if (extracted.status !== 0) throw new Error(`could not read manifest from ${zipPath}`);
  const manifest = JSON.parse(extracted.stdout);
  if (manifest.manifest_version !== 3) throw new Error(`${browser} zip manifest_version is not 3`);
  if (browser === "firefox") {
    if (!manifest.background || !manifest.background.scripts) {
      throw new Error("firefox zip lacks background.scripts");
    }
    if (!manifest.browser_specific_settings || !manifest.browser_specific_settings.gecko) {
      throw new Error("firefox zip lacks gecko id");
    }
  }
  if (browser === "chrome") {
    if (!manifest.background || !manifest.background.service_worker) {
      throw new Error("chrome zip lacks background.service_worker");
    }
    if (manifest.browser_specific_settings) {
      throw new Error("chrome zip should not include gecko settings");
    }
  }
  console.log(`${browser} zip files: ${names.length}`);
}

function unlinkIfExists(file) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

function main() {
  fs.mkdirSync(DIST, { recursive: true });
  const firefoxDir = stage("firefox", "manifest.firefox.json");
  const chromeDir = stage("chrome", "manifest.chrome.json");
  const firefoxZip = path.join(DIST, "mailshade-firefox.zip");
  const chromeZip = path.join(DIST, "mailshade-chrome.zip");
  unlinkIfExists(firefoxZip);
  unlinkIfExists(chromeZip);
  zipDir(firefoxDir, firefoxZip);
  zipDir(chromeDir, chromeZip);
  verifyZip(firefoxZip, "firefox");
  verifyZip(chromeZip, "chrome");
  console.log(`Wrote ${firefoxZip}`);
  console.log(`Wrote ${chromeZip}`);
}

main();
