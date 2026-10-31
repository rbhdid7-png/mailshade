const api = globalThis.browser || globalThis.chrome;

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

let settings = mailshadeNormalize({});
let sessionOff = false;
let currentSite = null;

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
  settings = mailshadeNormalize(stored);
  sessionOff = await getSessionOff();
}

async function getActiveTab() {
  if (!api.tabs || !api.tabs.query) return null;
  try {
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    return (tabs && tabs[0]) || null;
  } catch (_err) {
    return null;
  }
}

async function saveSettings() {
  await api.storage.local.set({ mailshade: settings });
  const tab = await getActiveTab();
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
  settings = mailshadeNormalize({});
  await setSessionOff(false);
  render();
  await saveSettings();
  setStatus("Defaults restored");
});

(async () => {
  await loadSettings();
  const tab = await getActiveTab();
  currentSite = mailshadeDetectSite(tab && tab.url);
  render();
})();
