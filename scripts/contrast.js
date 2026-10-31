const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function parseHex(value) {
  const hex = String(value).trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrast(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  if (L1 == null || L2 == null) return null;
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

function readTokens(css) {
  const tokens = {};
  const re = /--mdm-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g;
  let match;
  while ((match = re.exec(css))) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

function themeBlock(css, theme) {
  const marker = `html.mdm-on[data-mdm-theme="${theme}"]`;
  const start = css.indexOf(marker);
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css.slice(open, close + 1);
}

function pairsFor(theme, tokens, extras) {
  return [
    ["text on bg", tokens.text, tokens.bg],
    ["muted on bg", tokens.muted, tokens.bg],
    ["text on surface", tokens.text, tokens.surface],
    ["muted on surface", tokens.muted, tokens.surface],
    ["text on unread", tokens.text, tokens.unread],
    ["muted on unread", tokens.muted, tokens.unread],
    ["text on hover", tokens.text, tokens.hover],
    ["text on selected", tokens.text, tokens.selected],
    ["link on bg", extras.link, tokens.bg],
    ["compose text on compose", extras.composeText, extras.compose],
    ["danger on bg", extras.danger, tokens.bg],
    ["success on bg", extras.success, tokens.bg],
    ["warning on bg", extras.warning, tokens.bg]
  ].map(([name, fg, bg]) => ({ theme, name, fg, bg, ratio: contrast(fg, bg) }));
}

function run() {
  const css = fs.readFileSync(path.join(ROOT, "styles", "base.css"), "utf8");
  const extras = {
    link: (css.match(/--mdm-link:\s*(#[0-9a-fA-F]{6})/) || [])[1],
    compose: (css.match(/--mdm-compose:\s*(#[0-9a-fA-F]{6})/) || [])[1],
    composeText: (css.match(/--mdm-compose-text:\s*(#[0-9a-fA-F]{6})/) || [])[1],
    danger: (css.match(/--mdm-danger:\s*(#[0-9a-fA-F]{6})/) || [])[1],
    success: (css.match(/--mdm-success:\s*(#[0-9a-fA-F]{6})/) || [])[1],
    warning: (css.match(/--mdm-warning:\s*(#[0-9a-fA-F]{6})/) || [])[1]
  };
  const results = [];
  for (const theme of ["comfort", "oled"]) {
    const tokens = readTokens(themeBlock(css, theme));
    results.push(...pairsFor(theme, tokens, extras));
  }
  const failures = results.filter((row) => row.ratio == null || row.ratio < 4.5);
  return { results, failures };
}

if (require.main === module) {
  const { results, failures } = run();
  for (const row of results) {
    const status = row.ratio != null && row.ratio >= 4.5 ? "AA" : "FAIL";
    const ratio = row.ratio == null ? "n/a" : row.ratio.toFixed(2);
    console.log(`${row.theme.padEnd(8)} ${row.name.padEnd(28)} ${ratio.padStart(5)}  ${status}`);
  }
  if (failures.length) {
    console.error(`Contrast failures: ${failures.length}`);
    process.exit(1);
  }
  console.log("All checked Gmail token pairs meet WCAG AA (4.5:1). Simulated CSS-token test only.");
}

module.exports = { run, contrast };
