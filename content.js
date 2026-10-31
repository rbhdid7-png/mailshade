(() => {
  const api = globalThis.browser || globalThis.chrome;
  const site = mailshadeDetectSite(location.hostname);
  if (!site) return;

  const root = document.documentElement;
  root.setAttribute("data-mdm-site", site.id);

  function apply(settings, sessionOff) {
    const on = mailshadeIsOn(settings, sessionOff, site.id);
    root.classList.toggle("mdm-on", on);
    root.classList.toggle("mdm-off", !on);
    root.setAttribute("data-mdm-theme", on ? settings.theme : "original");
    root.setAttribute("data-mdm-bodies", settings.darkenBodies === false ? "off" : "on");
  }

  apply(mailshadeNormalize({}), false);

  function readAndApply() {
    const sessionGet = api.storage.session
      ? api.storage.session.get("sessionOff")
      : Promise.resolve({});
    Promise.all([api.storage.local.get(["mailshade", "mailDarkMode"]), sessionGet])
      .then(([stored, session]) => {
        apply(mailshadeNormalize(stored), Boolean(session && session.sessionOff));
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
      apply(mailshadeNormalize(message.settings), Boolean(message.sessionOff));
    }
  });
})();
