# Section Notes

A local-first Chrome extension for annotating websites and exporting screenshot
reviews. Select a region, write a comment, and share a PNG containing both.

- **Section mode:** each region becomes an independent screenshot and comment.
- **Viewport mode:** one visible-page screenshot with multiple numbered comments.
- **Compact dock:** capture controls at the bottom center; details open on demand.
- **Persistent review:** saved annotations survive reloads and page navigation,
  and are shared across tabs in the same Chrome profile.
- **New session:** start fresh, with export-before-reset and recoverable reset.
- **ZIP export:** standalone PNG review cards, an HTML review, and JSON metadata.

No account, server, analytics, upload, or runtime dependencies.

## Install from source

```sh
git clone https://github.com/vigneshiyergithub/section-notes.git
cd section-notes
```

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked**, then select this repository's **extension/** folder.
3. Pin Section Notes from Chrome's Extensions menu.
4. Open a regular website and click the extension icon.

There is no Chrome Web Store listing. For a packaged ZIP, extract it first and
load the included `section-notes` folder.

## Use

The page is captured and frozen so moving content cannot shift your selection.
Drag a rectangle, write feedback, and select **Save** (or **Cmd/Ctrl + Enter**).
**Esc** cancels. Use the first two dock icons to choose Section or Viewport mode.

The speech bubble opens the review library. Expand a note to see its source,
full text, Edit, and Delete. The download icon exports the active review.

**More tools → New capture** captures the current visible page. **Browse page**
hides the extension so you can scroll or navigate. Click the extension icon to
return; it captures the current view and reloads saved annotations.

**More tools → New session → Start fresh** resets the active review across tabs.
The confirmation offers a ZIP export first. **Undo session reset** restores the
previous nonempty review before new annotations are added, including after a
reload. Only one recovery snapshot is retained. This is not a named-session archive.

Open the extension on each destination page to continue reviewing. It does not
inject itself automatically into every page.

## Export

Each PNG includes the original screenshot pixels plus a readable feedback panel,
source URL, and capture date. Viewport pin numbers match the embedded comment list.
Small crops are centered in a card at least 640 pixels wide so comments stay readable.

The ZIP also contains:

- `review.html` — open locally for the full review.
- `annotations.json` — session ID, source URLs, titles, timestamps, original CSS
  viewport dimensions and rectangles, and exported image dimensions/layout bounds.

Export format version 2 distinguishes `imageLayout.screenshot` from
`imageLayout.comments`. ZIP entries use STORE (no compression). Very large image
composites fail with a message rather than clipping feedback.

## Privacy and permissions

Chrome permissions are limited to `activeTab` and `scripting`, used when you
invoke the extension to capture the current tab and inject the annotation UI.
Saved screenshots/comments live in the extension's local IndexedDB database.
They are not sent to a service. Exports contain visible page content and source
URLs: review them before sharing. There is no redaction tool yet.

Wait for save confirmation before navigating. Storage is local to this Chrome
profile, is not encrypted by this extension, and is not cross-device sync.
Keep ZIP backups for important work. A reset recovery snapshot is retained locally;
reset should not be treated as secure erasure.

## Development

Use Node.js 22 or newer for development tooling. Chrome can load `extension/`
directly without Node.js, npm, or a build step.

```sh
npm ci
npm run verify
npm run package
```

The ZIP appears at `dist/section-notes-v1.4.0.zip`. The package includes only
extension files, public documentation, and licenses. After source changes, reload
Section Notes in `chrome://extensions`, then refresh the target tab.

See [CONTRIBUTING.md](CONTRIBUTING.md) and the
[testing checklist](docs/testing.md). CI runs verification and uploads the ZIP as
a workflow artifact; it does not publish a release or deploy anything.

## Limitations

- Viewport mode captures the visible website area, not the entire scrollable page.
- Chrome blocks injection on internal pages, the Web Store, and some protected pages.
- Local file pages need **Allow access to file URLs** in extension settings.
- Resize the page, then take a new capture before selecting additional regions.
- Region creation requires a pointer; a complete keyboard-only workflow is pending.
- Library updates from other tabs appear when reopened/exported, not in real time.
- Browser restart, large-library quotas, and high-DPI/multi-monitor cases need more testing.

## Source map

| File | Purpose |
| --- | --- |
| `extension/manifest.json` | Manifest V3 and minimal permissions |
| `extension/background.js` | Action handler, screenshot capture, message routing |
| `extension/content.js` | Shadow DOM dock, region selection, review controls |
| `extension/store.js` | Local storage, reset recovery, stale-session protection |
| `extension/screenshot-card.js` | Screenshot + comment PNG composition |
| `extension/zip.js` | Dependency-free ZIP writer |

## License

MIT © 2026 Vignesh Iyer. Lucide icons retain their upstream license; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
