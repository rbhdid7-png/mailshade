# Development

## Layout

```
manifest.json              Firefox development manifest
manifest.firefox.json      Firefox package source
manifest.chrome.json       Chrome package source
background.js              Defaults and settings fetch
content.js                 Applies theme attributes on mail pages
popup.html / popup.css / popup.js
styles/base.css            Color tokens
styles/gmail.css           Gmail chrome
styles/outlook.css
styles/yahoo.css
styles/proton.css
styles/generic.css
scripts/validate.js
scripts/package.js
```

## Commands

```
node scripts/validate.js
node scripts/package.js
```

`package.js` writes:

- `dist/firefox/` and `dist/mailshade-firefox.zip`
- `dist/chrome/` and `dist/mailshade-chrome.zip`

Do not commit `dist/` or zip archives.

## Debugging

- Firefox: `about:debugging` inspect the Mailshade background script and the mail tab.
- Chrome: `chrome://extensions` then **Inspect views** for the service worker and popup.
- Content styles are injected at `document_start`. A leftover white panel usually means a Gmail container still uses a Material surface token; add that token in `styles/gmail.css` rather than inverting the page.

## Browser differences

Firefox MV3 uses `background.scripts`. Chrome MV3 uses `background.service_worker`. Shared JS talks to `browser` or `chrome`. Do not ship one manifest to both stores.

Minimum versions in the manifests:

- Firefox 109, because MV3 `background.scripts` is required
- Chrome 116, because MV3 service workers and `storage.session` are used when present

Those versions come from the APIs in this repo, not from live browser QA in this environment.

## Safari

Safari on macOS is untested and unsupported.

To try later you would need Xcode, `safari-web-extension-converter` or a manual `manifest.json` conversion, an Apple Developer account, signing, and notarization. Safari also differs on background pages, `browser.storage.session`, and host permission prompts. Do not claim Safari support until that work is done on a Mac.

## Testing locally

1. Load the Firefox or Chrome unpacked build.
2. Open `https://mail.google.com` and confirm the list, search bar, and left nav are charcoal, not white.
3. Toggle Comfort Dark, OLED Black, and Original in the popup.
4. Reload the tab and confirm the chosen theme returns.
5. Turn **Darken email bodies** off and open a message; the body should stay light while chrome stays dark.
