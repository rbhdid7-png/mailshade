if (typeof importScripts === "function") {
  importScripts("shared.js");
}

const api = globalThis.browser || globalThis.chrome;

api.runtime.onInstalled.addListener(async () => {
  const stored = await api.storage.local.get(["mailshade", "mailDarkMode"]);
  if (!stored.mailshade) {
    await api.storage.local.set({ mailshade: mailshadeNormalize(stored) });
  }
});

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "MAILSHADE_GET") return false;
  Promise.all([
    api.storage.local.get(["mailshade", "mailDarkMode"]),
    api.storage.session ? api.storage.session.get("sessionOff") : Promise.resolve({})
  ]).then(([stored, session]) => {
    sendResponse({
      settings: mailshadeNormalize(stored),
      sessionOff: Boolean(session && session.sessionOff)
    });
  });
  return true;
});
