(() => {
  const api = globalThis.browser || globalThis.chrome;
  const SITE_MAP = [
    { id: "gmail", match: /mail\.google\.com|inbox\.google\.com/ },
    { id: "outlook", match: /outlook\.(live|office|office365)\.com/ },
    { id: "yahoo", match: /mail\.yahoo\.com/ },
    { id: "proton", match: /mail\.proton(\.me|mail\.com)/ },
    { id: "icloud", match: /icloud\.com/ },
    { id: "aol", match: /mail\.aol\.com/ },
    { id: "zoho", match: /zoho\.com/ }
  ];

  const site = SITE_MAP.find((item) => item.match.test(location.hostname));
  if (!site) return;

  const root = document.documentElement;
  root.setAttribute("data-mdm-site", site.id);

  function normalize(raw) {
    const source = (raw && (raw.mailshade || raw.mailDarkMode)) || raw || {};
    let theme = source.theme || "comfort";
    if (theme === "midnight" || theme === "dim") theme = "comfort";
    if (theme !== "comfort" && theme !== "oled" && theme !== "original") theme = "comfort";
    return {
      enabled: source.enabled !== false,
      theme,
      darkenBodies: source.darkenBodies !== false,
      sites: source.sites || {}
    };
  }

  function apply(settings, sessionOff) {
    const on =
      !sessionOff &&
      settings.enabled !== false &&
      settings.theme !== "original" &&
      settings.sites[site.id] !== false;
    root.classList.toggle("mdm-on", on);
    root.classList.toggle("mdm-off", !on);
    root.setAttribute("data-mdm-theme", on ? settings.theme : "original");
    root.setAttribute("data-mdm-bodies", settings.darkenBodies === false ? "off" : "on");
  }

  apply({ enabled: true, theme: "comfort", darkenBodies: true, sites: {} }, false);

  function readAndApply() {
    const sessionGet = api.storage.session
      ? api.storage.session.get("sessionOff")
      : Promise.resolve({});
    Promise.all([api.storage.local.get(["mailshade", "mailDarkMode"]), sessionGet])
      .then(([stored, session]) => {
        apply(normalize(stored), Boolean(session && session.sessionOff));
      })
      .catch(() => {});
  }

  readAndApply();

  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes.mailshade || changes.mailDarkMode)) readAndApply();
    if (area === "session" && changes.sessionOff) readAndApply();
  });

  api.runtime.onMessage.addListener((message) => {
    if (message && message.type === "MAILSHADE_UPDATE") {
      apply(normalize(message.settings), Boolean(message.sessionOff));
    }
  });
})();
