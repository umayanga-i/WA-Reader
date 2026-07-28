# Extra Features — All Client-Side, No Backend

Pull these in one at a time, e.g.: "Add FEATURES-EXTRA #4 (offline PWA caching)."

1. **IndexedDB persistence** — remember the last parsed chat across page reloads
   (opt-in, with a clear "forget this chat" button) so re-uploading isn't needed
   every session. Still nothing leaves the browser.

2. **PWA / offline install** — Vite PWA plugin + service worker so the whole app
   (not just the chat) works with zero network after first load, and can be
   "installed" from the browser.

3. **Web Worker parsing** (also listed in Phase 2) — keeps huge files from
   freezing the UI.

4. **Single-file HTML export that's fully offline-viewable** — already in Phase 8,
   worth calling out: this becomes a shareable "read-only chat archive" a user
   can send to someone else without WA Reader itself.

5. **Password-protected export** — encrypt the exported JSON client-side with a
   passphrase (Web Crypto API, e.g. AES-GCM) before download, so an exported
   file sitting on disk isn't plain text.

6. **Chat comparison mode** — load two exported chats side-by-side, diff basic
   stats (who talked more, tone shift over time windows) — all client-side.

7. **Local in-browser AI summaries** — using something like transformers.js
   (runs a small model in-browser via WebAssembly/WebGPU, no API key, no
   network call at inference time) for optional chapter/day summaries or basic
   sentiment tagging. This is the only way to offer "AI summaries" while
   keeping the zero-backend, zero-upload guarantee — do NOT wire this to a
   hosted LLM API, since that would send chat content off-device.

8. **Bookmarks / pinned messages / notes** — stored in localStorage keyed by a
   hash of the loaded file, so they persist only for that specific chat.

9. **URL-state for filters/search** (not chat content) — so a filter/theme
   combination can be bookmarked, without ever putting message content in the
   URL.

10. **Print stylesheet** — clean printable view of the chat or stats page,
    useful for sharing a summary without the app itself.

11. **Timeline view** — a horizontal scrollable timeline of the relationship/chat
    (first message, big gaps, most active periods) as an alternate visualization
    on the Statistics page.

12. **Web Share API** — share exported HTML/JSON via the OS share sheet on
    mobile, still entirely local until the user explicitly shares.

13. **Multiple simultaneous chat tabs** — load several exports into browser tabs
    (each isolated in its own memory/IndexedDB namespace) for quick switching.
