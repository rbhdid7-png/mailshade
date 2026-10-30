# Installation

Use a development load until the extension is published on AMO or the Chrome Web Store.

## Firefox (EndeavourOS / Linux, macOS, Windows)

1. Download and unzip `mailshade-firefox.zip`, or clone this repository.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` in the unzipped folder (Firefox build uses `background.scripts`).
5. Open Gmail and reload the tab.
6. Pin Mailshade from the toolbar puzzle menu if you want the popup handy.

Temporary add-ons unload when Firefox restarts. Load `manifest.json` again after a restart.

If you cloned the repository, the root `manifest.json` is the Firefox manifest. Do not load `manifest.chrome.json` in Firefox.

## Chrome / Chromium / Edge

1. Download and unzip `mailshade-chrome.zip`.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the unzipped Chrome folder (it must contain a `manifest.json` with `background.service_worker`).
6. Open Gmail and reload the tab.

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
