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

- Firefox 109+ (Manifest V3 `background.scripts`)
- Chrome 116+ (Manifest V3 service worker)

Safari is not supported. See docs/DEVELOPMENT.md for the packaging and signing gap.

## Install

Developer install:

- Firefox: docs/INSTALLATION.md
- Chrome: docs/INSTALLATION.md

Packaged zips are produced with `node scripts/package.js`.

## Privacy

Mailshade does not read email contents, credentials, or personal data. See docs/PRIVACY.md.

## License

MIT. See LICENSE.

## Contributing

See docs/DEVELOPMENT.md.
