# Contributing

Use Node.js 22 or newer. Run `npm ci`, then `npm run verify` before opening a PR.
The shipped extension has no runtime dependencies or build step. Keep additional
permissions and dependencies justified and minimal.

Load `extension/` unpacked in Chrome to test. Reload the extension and refresh
the target tab after changing source. Use synthetic pages and disposable comments;
do not include personal screenshots, exports, authentication data, or browser profiles
in issues, commits, or pull requests.

Changes to selection or export need manual checks in both capture modes. Changes
to persistence need coverage for migration, reset/restore, and stale tabs. See
[docs/testing.md](docs/testing.md) for the manual checklist.

Keep `package.json` and `extension/manifest.json` versions aligned. `npm run package`
builds a ZIP from extension files and public documentation only. Generated ZIPs
and `node_modules` are ignored.
