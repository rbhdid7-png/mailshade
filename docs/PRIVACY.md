# Privacy

Mailshade is a local UI overlay. It does not collect, transmit, or store email contents, credentials, or personal data.

## Permissions actually used

- `storage` — saves theme, enable state, per-site toggles, and the email-body option in `browser.storage.local` / `chrome.storage.local`.
- `activeTab` — lets the popup tell the current mail tab to refresh styles after a setting change.
- Host permissions for the listed mail sites — required so content scripts and CSS can run on those pages.

The extension does not request `tabs` browsing history, cookies, webRequest, or debugger access.

`storage.session` is used when the browser provides it, only for the "disable for this session" flag. That flag is not synced and goes away when the browser restarts.

## What is not done

- No analytics
- No remote CSS or fonts
- No accounts, crash reports, or telemetry
- Content scripts do not read message bodies into extension storage
- Settings keys are `mailshade` (current) with a one-way import from the older `mailDarkMode` key

## Network

The extension makes no network requests of its own. Mail sites continue to load their own resources as they always do.
