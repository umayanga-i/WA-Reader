# Build Phases

Prompt pattern to use with the agent (short, cheap):
> "Do Phase 3 from docs/PHASES.md. Only that phase."

Don't re-paste this whole file either once the agent has read it — just say the phase
number and any change of mind, e.g. "Phase 5, skip location cards for now."

---

## Phase 0 — Scaffold
- Vite + React + TS + Tailwind init
- Folder structure exactly as in CLAUDE.md
- `public/_redirects` for Cloudflare Pages SPA routing
- Empty pages: Home, Viewer, Statistics with placeholder routing

## Phase 1 — Upload & shell
- UploadZone: drag & drop + browse button, `.txt` only, size-agnostic
- LoadingScreen with parsing progress state
- EmptyState for Home before any file is loaded
- Toast/notification system (success + error) — no external backend-dependent lib

## Phase 2 — Parser
- `parser/whatsappParser.ts`
- Support: 24h time, 12h AM/PM, multi-line messages (continuation lines with no
  leading date get appended to previous message), deleted messages, media
  placeholders, system messages
- Output must match the `ChatMessage` interface exactly
- For large files (>10k lines), run parsing inside a Web Worker so the UI thread
  never blocks — this matters for the 100k-message requirement in Phase 6
- Unit-testable: parser takes a string, returns `ChatMessage[]`, no DOM/React deps

## Phase 3 — Chat view
- ChatBubble (mine = green/right, other = white/left), rounded, WhatsApp-like
- DateDivider, sticky while scrolling
- MediaBubble for recognized placeholders (`<Media omitted>`, `IMG-`, `VID-`,
  `AUD-`, `PTT-`, `STK-`, PDF/DOC names) — styled cards, not raw text
- Smooth scroll, Sidebar for jump-by-month/year/date

## Phase 4 — Themes
- Light / Dark / AMOLED, persisted in localStorage, no flash-of-wrong-theme on load

## Phase 5 — Search & filters
- Live search with highlight, prev/next navigation, Esc to close, Ctrl+F to open
- Search by sender / text / date
- Filters: only-mine, only-other, media-only, links-only, deleted-only, system-only

## Phase 6 — Virtualization & performance
- Swap ChatList to a virtualized list (react-window / @tanstack/react-virtual)
- Verify smooth scroll + search jump-to-result works with virtualization
- Load-test with a synthetic 100k-message file

## Phase 7 — Statistics
- Total messages, per-person counts, first/last message, most active day/month/hour
- Longest message, avg message length, longest inactive gap, avg reply time
- Top emojis, top words (basic stopword filtering)
- Daily/weekly/monthly activity charts (pick a lightweight charting approach —
  no backend-dependent analytics SDKs)

## Phase 8 — Export
- Export parsed chat as JSON
- Export as a single self-contained HTML file (inline CSS, no external asset
  dependency) — this doubles as an offline shareable archive

## Phase 9 — Polish & accessibility
- Keyboard shortcuts (Ctrl+F search, Esc close, arrows navigate results)
- Responsive pass: desktop (WhatsApp Web layout), tablet, mobile
- Final unused-import/console-warning sweep

## Phase 10 — Deploy
- Cloudflare Pages: connect repo, build command `npm run build`, output `dist`
- Confirm `_redirects` works on a hard refresh of a deep route
- Confirm zero network requests fire when a chat file is loaded (DevTools Network tab)
