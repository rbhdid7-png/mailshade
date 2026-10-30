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

function normalize(raw) {
  const source = raw && (raw.mailshade || raw.mailDarkMode) || {};
  let theme = source.theme || DEFAULTS.theme;
  if (theme === "midnight" || theme === "dim") theme = "comfort";
  if (theme === "oled") theme = "oled";
  if (theme !== "comfort" && theme !== "oled" && theme !== "original") theme = "comfort";
  return {
    enabled: source.enabled !== false,
    theme,
    darkenBodies: source.darkenBodies !== false,
    sites: { ...DEFAULTS.sites, ...(source.sites || {}) }
  };
}

api.runtime.onInstalled.addListener(async () => {
  const stored = await api.storage.local.get(["mailshade", "mailDarkMode"]);
  if (!stored.mailshade) {
    await api.storage.local.set({ mailshade: normalize(stored) });
  }
});

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "MAILSHADE_GET") return false;
  Promise.all([
    api.storage.local.get(["mailshade", "mailDarkMode"]),
    api.storage.session ? api.storage.session.get("sessionOff") : Promise.resolve({})
  ]).then(([stored, session]) => {
    sendResponse({
      settings: normalize(stored),
      sessionOff: Boolean(session && session.sessionOff)
    });
  });
  return true;
});
