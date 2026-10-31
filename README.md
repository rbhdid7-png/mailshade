# Mailshade

Mailshade is a Firefox and Chrome extension that applies a comfortable dark theme to webmail without inverting the whole page.

It restyles Gmail chrome (toolbar, search, list, menus) with a charcoal palette, keeps images and logos intact, and leaves link, compose, and status colors recognizable.

## Features

- Comfort Dark (default), OLED Black, and Original
- Enable or disable globally, per site, or for the current browser session
- Optional darkening of email message bodies
- Settings stored locally in the browser
- No analytics and no network calls from the extension itself

## Supported mail sites

Styled and intended to work:

- Gmail
- Outlook on the web
- Yahoo Mail
- Proton Mail
- iCloud Mail
- AOL Mail
- Zoho Mail

Gmail received the most selector work in this release. Other sites use lighter, role-based styles and may still show leftover light panels.

## Browsers

- Firefox 140+ (Manifest V3 `background.scripts`)
- Chrome 116+ (Manifest V3 service worker)
- Brave and Edge: same Chrome package and load-unpacked steps

Safari is not supported. Phone browsers and the Gmail app are not supported. See docs/DEVELOPMENT.md.

## Install

One repository. Two packaged manifests.

- Firefox: load the root `manifest.json`, or unzip `mailshade-firefox.zip`. Steps: docs/INSTALLATION.md
- Chrome / Brave / Edge: unzip `mailshade-chrome.zip` or load `dist/chrome`. Steps: docs/INSTALLATION.md

From source:

```
node scripts/validate.js
node scripts/test.js
node scripts/package.js
```

Do not load `manifest.chrome.json` in Firefox, and do not load the root Firefox `manifest.json` in Chrome.

## Privacy

Mailshade does not read email contents, credentials, or personal data. See docs/PRIVACY.md.

## License

MIT. See LICENSE.

## Contributing

See docs/DEVELOPMENT.md.
