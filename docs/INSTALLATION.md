# Installation

Use a development load until the extension is published on AMO or the Chrome Web Store.

## Firefox (EndeavourOS / Linux, macOS, Windows)

1. Download and unzip `mailshade-firefox.zip`, or clone this repository.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` in the unzipped folder (Firefox build uses `background.scripts`).
5. Open Gmail and reload the tab.
6. Pin Mailshade from the toolbar puzzle menu if you want the popup handy.

Firefox 140 or later is required. Temporary add-ons unload when Firefox restarts. Load `manifest.json` again after a restart.

If you cloned the repository, the root `manifest.json` is the Firefox manifest. Do not load `manifest.chrome.json` in Firefox.

## Chrome / Brave / Edge / Chromium

Brave uses the Chrome package. The steps are the same; only the extensions URL changes.

1. Download and unzip `mailshade-chrome.zip`, or run `node scripts/package.js` and use `dist/chrome`.
2. Open `chrome://extensions`, `brave://extensions`, or `edge://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the unzipped Chrome folder (it must contain a `manifest.json` with `background.service_worker`).
6. Open Gmail and reload the tab.

Do not load the repository root in Chrome. The root `manifest.json` is the Firefox manifest.

If you are packaging from source:

```
node scripts/package.js
```

Then load `dist/chrome` as an unpacked extension.

## After install

- Click the toolbar icon.
- Leave **Comfort Dark** selected for first use.
- Use **Original** to restore the site appearance without removing the add-on.
- Use **Disable for this session** to turn Mailshade off until the browser restarts.
