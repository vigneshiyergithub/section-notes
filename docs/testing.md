# Testing

## Automated

`npm run verify` checks syntax, manifest permissions and matching versions; runs
storage tests using real IndexedDB semantics via fake-indexeddb; and checks the
ZIP directory, UTF-8 paths, payload bytes and CRC-32. `npm run package` builds the
installable ZIP without a runtime dependency or bundler.

## Manual Chrome checklist

Use a synthetic local webpage. Enable file URL access for the extension if needed.

1. Click the extension icon. Only the small bottom dock should appear.
2. Drag a top-right region. Save a comment and check that the editor closes.
3. In viewport mode, save two comments; confirm both numbered regions share an image.
4. Open Library, expand a note, edit it, delete it, and Undo.
5. Export. Unzip and open every PNG: each must include the screenshot and full feedback.
   Open review.html and verify the same comments and source metadata.
6. Hide, scroll or change an SPA screen, then reopen. A fresh screenshot should appear.
7. Reload, follow a full-page link, and open a second tab. Saved notes should remain.
8. Start a new session. Check the confirmation, export shortcut, empty library,
   and Undo session reset. Reload before Undo to check recovery persistence.
9. After reset, attempt a save from a stale tab. It must not repopulate the new session.
10. Resize, capture again, and test long comments, Unicode, and unbroken URLs.

Automated tests do not replace Chrome's capture/activeTab permission checks, canvas
font rendering, high-DPI/multi-monitor testing, or accessibility testing. Region
creation currently requires dragging; a complete keyboard-only workflow is not
implemented.
