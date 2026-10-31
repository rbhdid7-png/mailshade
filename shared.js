const MAILSHADE_DEFAULTS = {
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

const MAILSHADE_SITES = [
  { id: "gmail", label: "Gmail", match: /mail\.google\.com$|inbox\.google\.com$/ },
  { id: "outlook", label: "Outlook", match: /(?:^|\.)outlook\.(?:live|office|office365)\.com$/ },
  { id: "yahoo", label: "Yahoo Mail", match: /(?:^|\.)mail\.yahoo\.com$/ },
  { id: "proton", label: "Proton Mail", match: /(?:^|\.)mail\.proton(?:\.me|mail\.com)$/ },
  { id: "icloud", label: "iCloud Mail", match: /(?:^|\.)icloud\.com$/ },
  { id: "aol", label: "AOL Mail", match: /(?:^|\.)mail\.aol\.com$/ },
  { id: "zoho", label: "Zoho Mail", match: /(?:^|\.)zoho\.com$/ }
];

function mailshadeNormalize(raw) {
  const source = (raw && (raw.mailshade || raw.mailDarkMode)) || raw || {};
  let theme = source.theme || MAILSHADE_DEFAULTS.theme;
  if (theme === "midnight" || theme === "dim") theme = "comfort";
  if (theme !== "comfort" && theme !== "oled" && theme !== "original") theme = "comfort";
  return {
    enabled: source.enabled !== false,
    theme,
    darkenBodies: source.darkenBodies !== false,
    sites: { ...MAILSHADE_DEFAULTS.sites, ...(source.sites || {}) }
  };
}

function mailshadeHostFromUrl(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch (_err) {
    return "";
  }
}

function mailshadeDetectSite(urlOrHost) {
  if (!urlOrHost) return null;
  const host = urlOrHost.includes("://") ? mailshadeHostFromUrl(urlOrHost) : urlOrHost;
  if (!host) return null;
  return MAILSHADE_SITES.find((site) => site.match.test(host)) || null;
}

function mailshadeIsOn(settings, sessionOff, siteId) {
  return (
    !sessionOff &&
    settings.enabled !== false &&
    settings.theme !== "original" &&
    settings.sites[siteId] !== false
  );
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    MAILSHADE_DEFAULTS,
    MAILSHADE_SITES,
    mailshadeNormalize,
    mailshadeDetectSite,
    mailshadeIsOn
  };
}
