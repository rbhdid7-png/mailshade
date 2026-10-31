const assert = require("assert");
const {
  MAILSHADE_DEFAULTS,
  mailshadeNormalize,
  mailshadeDetectSite,
  mailshadeIsOn
} = require("../shared.js");

function check(name, fn) {
  try {
    fn();
    console.log(`OK: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

check("defaults enable comfort theme", () => {
  const settings = mailshadeNormalize({});
  assert.strictEqual(settings.enabled, true);
  assert.strictEqual(settings.theme, "comfort");
  assert.strictEqual(settings.darkenBodies, true);
  assert.deepStrictEqual(settings.sites, MAILSHADE_DEFAULTS.sites);
});

check("legacy midnight and dim map to comfort", () => {
  assert.strictEqual(mailshadeNormalize({ theme: "midnight" }).theme, "comfort");
  assert.strictEqual(mailshadeNormalize({ theme: "dim" }).theme, "comfort");
});

check("legacy mailDarkMode key is imported", () => {
  const settings = mailshadeNormalize({
    mailDarkMode: { enabled: false, theme: "oled", darkenBodies: false, sites: { gmail: false } }
  });
  assert.strictEqual(settings.enabled, false);
  assert.strictEqual(settings.theme, "oled");
  assert.strictEqual(settings.darkenBodies, false);
  assert.strictEqual(settings.sites.gmail, false);
  assert.strictEqual(settings.sites.outlook, true);
});

check("detects supported mail hosts and urls", () => {
  assert.strictEqual(mailshadeDetectSite("https://mail.google.com/mail/u/0/#inbox").id, "gmail");
  assert.strictEqual(mailshadeDetectSite("mail.google.com").id, "gmail");
  assert.strictEqual(mailshadeDetectSite("https://outlook.office365.com/mail/").id, "outlook");
  assert.strictEqual(mailshadeDetectSite("https://mail.yahoo.com/d/folders/1").id, "yahoo");
  assert.strictEqual(mailshadeDetectSite("https://mail.proton.me/u/0/inbox").id, "proton");
  assert.strictEqual(mailshadeDetectSite("https://www.icloud.com/mail/").id, "icloud");
  assert.strictEqual(mailshadeDetectSite("https://mail.aol.com/").id, "aol");
  assert.strictEqual(mailshadeDetectSite("https://mail.zoho.com/zm/").id, "zoho");
});

check("rejects unsupported hosts", () => {
  assert.strictEqual(mailshadeDetectSite("https://github.com"), null);
  assert.strictEqual(mailshadeDetectSite("https://google.com"), null);
  assert.strictEqual(mailshadeDetectSite(""), null);
  assert.strictEqual(mailshadeDetectSite("not a url"), null);
});

check("theme on/off matrix", () => {
  const on = mailshadeNormalize({ enabled: true, theme: "comfort", sites: { gmail: true } });
  assert.strictEqual(mailshadeIsOn(on, false, "gmail"), true);
  assert.strictEqual(mailshadeIsOn(on, true, "gmail"), false);
  assert.strictEqual(mailshadeIsOn({ ...on, enabled: false }, false, "gmail"), false);
  assert.strictEqual(mailshadeIsOn({ ...on, theme: "original" }, false, "gmail"), false);
  assert.strictEqual(mailshadeIsOn({ ...on, sites: { ...on.sites, gmail: false } }, false, "gmail"), false);
});

if (process.exitCode) {
  console.error("Logic tests failed.");
  process.exit(1);
}
console.log("Logic tests passed.");
