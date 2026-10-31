const fs = require("fs");
const path = require("path");
const { run: runContrast } = require("./contrast");

const ROOT = path.join(__dirname, "..");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function readJson(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    fail(`missing ${file}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    fail(`${file} is not valid JSON: ${err.message}`);
    return null;
  }
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkPng(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return;
  const buf = fs.readFileSync(full);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(sig)) fail(`${rel} is not a PNG`);
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function checkFiles(manifest, label) {
  const required = [
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
  for (const file of required) {
    if (!exists(file)) fail(`${label}: missing ${file}`);
  }
  if (!manifest) return;
  const icons = Object.values(manifest.icons || {});
  const actionIcons = Object.values((manifest.action && manifest.action.default_icon) || {});
  for (const file of [...icons, ...actionIcons, manifest.action && manifest.action.default_popup]) {
    if (file && !exists(file)) fail(`${label}: missing referenced ${file}`);
  }
  const bg = manifest.background && (manifest.background.scripts || [manifest.background.service_worker]);
  for (const file of bg || []) {
    if (file && !exists(file)) fail(`${label}: missing background ${file}`);
  }
  for (const entry of manifest.content_scripts || []) {
    for (const file of [...(entry.js || []), ...(entry.css || [])]) {
      if (!exists(file)) fail(`${label}: missing content file ${file}`);
    }
  }
}

function checkFirefox(manifest) {
  if (!manifest) return;
  if (manifest.manifest_version !== 3) fail("firefox: manifest_version must be 3");
  if (!manifest.background || !Array.isArray(manifest.background.scripts)) {
    fail("firefox: background.scripts is required");
  } else {
    ok("firefox: background.scripts");
  }
  if (manifest.background && manifest.background.service_worker) {
    fail("firefox: must not use background.service_worker in this project");
  }
  if (!manifest.browser_specific_settings || !manifest.browser_specific_settings.gecko) {
    fail("firefox: gecko id missing");
  } else {
    ok(`firefox: gecko id ${manifest.browser_specific_settings.gecko.id}`);
  }
}

function checkChrome(manifest) {
  if (!manifest) return;
  if (manifest.manifest_version !== 3) fail("chrome: manifest_version must be 3");
  if (!manifest.background || !manifest.background.service_worker) {
    fail("chrome: background.service_worker is required");
  } else {
    ok(`chrome: service_worker ${manifest.background.service_worker}`);
  }
  if (manifest.background && manifest.background.scripts) {
    fail("chrome: must not use background.scripts");
  }
  if (manifest.browser_specific_settings) {
    fail("chrome: browser_specific_settings should be omitted from the Chrome package");
  } else {
    ok("chrome: no gecko-only keys");
  }
}

function checkRootMatchesFirefox(root, firefox) {
  if (!root || !firefox) return;
  if (JSON.stringify(root) !== JSON.stringify(firefox)) {
    fail("root manifest.json must match manifest.firefox.json");
  } else {
    ok("root manifest.json matches Firefox source");
  }
}

function checkFixture() {
  const fixture = path.join(ROOT, "tests", "fixtures", "gmail.html");
  if (!fs.existsSync(fixture)) {
    fail("missing tests/fixtures/gmail.html");
    return;
  }
  const html = fs.readFileSync(fixture, "utf8");
  for (const needle of ["mdm-on", "data-mdm-site=\"gmail\"", "styles/base.css", "styles/gmail.css", "a3s", "zA"]) {
    if (!html.includes(needle)) fail(`gmail fixture missing ${needle}`);
  }
  ok("simulated Gmail fixture present");
}

function main() {
  const root = readJson("manifest.json");
  const firefox = readJson("manifest.firefox.json");
  const chrome = readJson("manifest.chrome.json");
  checkFirefox(root);
  checkFirefox(firefox);
  checkChrome(chrome);
  checkRootMatchesFirefox(root, firefox);
  checkFiles(firefox, "firefox");
  checkFiles(chrome, "chrome");
  for (const icon of ["icons/icon16.png", "icons/icon32.png", "icons/icon48.png", "icons/icon128.png"]) {
    checkPng(icon);
  }
  if (firefox && chrome && same(firefox.host_permissions, chrome.host_permissions)) {
    ok("firefox and chrome host_permissions match");
  } else {
    fail("firefox and chrome host_permissions differ");
  }
  if (firefox && chrome && same(firefox.content_scripts, chrome.content_scripts)) {
    ok("firefox and chrome content_scripts match");
  } else {
    fail("firefox and chrome content_scripts differ");
  }
  if (firefox && root && same(root.host_permissions, firefox.host_permissions)) {
    ok("root host_permissions match firefox");
  }
  checkFixture();

  const { results, failures } = runContrast();
  ok(`contrast pairs checked: ${results.length}`);
  if (failures.length) {
    for (const row of failures) {
      fail(`contrast ${row.theme} ${row.name}: ${row.ratio == null ? "invalid" : row.ratio.toFixed(2)}`);
    }
  } else {
    ok("Gmail CSS tokens meet WCAG AA 4.5:1 (simulated token test, not live Gmail)");
  }

  if (process.exitCode) {
    console.error("Validation failed.");
    process.exit(1);
  }
  console.log("Validation passed.");
}

main();
