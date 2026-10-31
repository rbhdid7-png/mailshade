const api = globalThis.browser || globalThis.chrome;

const DEFAULTS = {
  enabled: true,
  theme: "comfort",
  darkenBodies: true,
  sites: {
    gmail: true,
    outlook: true,
    yahoo: true,
    proton: true,
    icloud: true,
    aol: true,
    zoho: true
  }
};

const SITE_MAP = [
  { id: "gmail", label: "Gmail", match: /mail\.google\.com|inbox\.google\.com/ },
  { id: "outlook", label: "Outlook", match: /outlook\.(live|office|office365)\.com/ },
  { id: "yahoo", label: "Yahoo Mail", match: /mail\.yahoo\.com/ },
  { id: "proton", label: "Proton Mail", match: /mail\.proton(\.me|mail\.com)/ },
  { id: "icloud", label: "iCloud Mail", match: /icloud\.com/ },
  { id: "aol", label: "AOL Mail", match: /mail\.aol\.com/ },
  { id: "zoho", label: "Zoho Mail", match: /zoho\.com/ }
];

const els = {
  master: document.getElementById("masterToggle"),
  site: document.getElementById("siteToggle"),
  session: document.getElementById("sessionToggle"),
  siteLabel: document.getElementById("siteLabel"),
  unsupported: document.getElementById("unsupported"),
  darkenBodies: document.getElementById("darkenBodies"),
  resetBtn: document.getElementById("resetBtn"),
  status: document.getElementById("status")
};

let settings = JSON.parse(JSON.stringify(DEFAULTS));
let sessionOff = false;
let currentSite = null;

function detectSite(url) {
  if (!url) return null;
  return SITE_MAP.find((s) => s.match.test(url)) || null;
}

function normalize(raw) {
  const source = (raw && (raw.mailshade || raw.mailDarkMode)) || raw || {};
  let theme = source.theme || DEFAULTS.theme;
  if (theme === "midnight" || theme === "dim") theme = "comfort";
  if (theme !== "comfort" && theme !== "oled" && theme !== "original") theme = "comfort";
  return {
    enabled: source.enabled !== false,
    theme,
    darkenBodies: source.darkenBodies !== false,
    sites: { ...DEFAULTS.sites, ...(source.sites || {}) }
  };
}

async function getSessionOff() {
  if (!api.storage.session) return false;
  const session = await api.storage.session.get("sessionOff");
  return Boolean(session && session.sessionOff);
}

async function setSessionOff(value) {
  sessionOff = value;
  if (api.storage.session) {
    await api.storage.session.set({ sessionOff: value });
  }
}

async function loadSettings() {
  const stored = await api.storage.local.get(["mailshade", "mailDarkMode"]);
  settings = normalize(stored);
  sessionOff = await getSessionOff();
}

async function saveSettings() {
  await api.storage.local.set({ mailshade: settings });
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    try {
      await api.tabs.sendMessage(tab.id, {
        type: "MAILSHADE_UPDATE",
        settings,
        sessionOff
      });
    } catch (_err) {
      /* no content script on this tab */
    }
  }
}

function setStatus(text) {
  els.status.textContent = text;
}

function render() {
  els.master.checked = settings.enabled && settings.theme !== "original";
  els.darkenBodies.checked = settings.darkenBodies;
  els.session.checked = sessionOff;
  document.querySelectorAll(".theme").forEach((btn) => {
    const active = btn.dataset.theme === settings.theme;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (currentSite) {
    els.unsupported.hidden = true;
    els.site.disabled = false;
    els.site.checked = settings.sites[currentSite.id] !== false;
    els.siteLabel.textContent = currentSite.label;
  } else {
    els.unsupported.hidden = false;
    els.site.checked = false;
    els.site.disabled = true;
    els.siteLabel.textContent = "Not a supported mail site";
  }
}

els.master.addEventListener("change", async () => {
  settings.enabled = els.master.checked;
  if (els.master.checked && settings.theme === "original") settings.theme = "comfort";
  if (!els.master.checked) await setSessionOff(false);
  render();
  await saveSettings();
  setStatus(settings.enabled ? "Dark mode on" : "Dark mode off");
});

els.site.addEventListener("change", async () => {
  if (!currentSite) return;
  settings.sites[currentSite.id] = els.site.checked;
  await saveSettings();
  setStatus(els.site.checked ? `Enabled on ${currentSite.label}` : `Disabled on ${currentSite.label}`);
});

els.session.addEventListener("change", async () => {
  await setSessionOff(els.session.checked);
  await saveSettings();
  setStatus(sessionOff ? "Disabled for this browser session" : "Session override cleared");
});

els.darkenBodies.addEventListener("change", async () => {
  settings.darkenBodies = els.darkenBodies.checked;
  await saveSettings();
});

document.getElementById("themes").addEventListener("click", async (e) => {
  const btn = e.target.closest(".theme");
  if (!btn) return;
  settings.theme = btn.dataset.theme;
  settings.enabled = settings.theme !== "original";
  render();
  await saveSettings();
  setStatus(
    settings.theme === "original"
      ? "Original appearance"
      : settings.theme === "oled"
        ? "OLED Black"
        : "Comfort Dark"
  );
});

els.resetBtn.addEventListener("click", async () => {
  settings = JSON.parse(JSON.stringify(DEFAULTS));
  await setSessionOff(false);
  render();
  await saveSettings();
  setStatus("Defaults restored");
});

(async () => {
  await loadSettings();
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  currentSite = detectSite(tab && tab.url);
  render();
})();
