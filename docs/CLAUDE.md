# WA Reader — Project Memory

This file is read automatically at the start of every agent session in this repo.
Do NOT ask the user to re-paste this. Refer back to it instead of re-explaining scope.

## What this is
A 100% client-side WhatsApp exported `.txt` chat viewer. No backend, no DB, no API,
no auth, no server. Deployed as a static site on **Cloudflare Pages (free tier)**.
Must work fully offline once loaded. No uploaded file may ever leave the browser —
this is the #1 non-negotiable constraint, above features, above polish.

Show this line somewhere visible in the UI:
`🔒 Your chat never leaves your browser. Everything is processed locally.`

## Tech stack (fixed — do not swap without asking)
- React + TypeScript + Vite
- TailwindCSS
- No React Router state that requires a server — use hash routing or in-memory routing
- No cookies/session/auth libraries

## Folder structure (do not flatten into fewer files)
```
src/
  components/   ChatBubble, ChatList, DateDivider, Header, Sidebar, SearchBar,
                UploadZone, StatsCard, MediaBubble, LoadingScreen, EmptyState
  pages/        Home, Viewer, Statistics
  parser/       whatsappParser.ts
  types/        chat.ts
  utils/        date.ts, search.ts, statistics.ts
  hooks/
  styles/
```

## Coding standards
- TypeScript interfaces for every data shape (see `types/chat.ts` — single source of truth)
- No duplicated logic between components — extract to `utils/` or `hooks/`
- No unused imports, no console errors/warnings
- Every component is self-contained and reusable — no god-components
- Virtualize any list that can exceed ~500 items (use `react-window` or `@tanstack/react-virtual`)

## Core data model
```ts
interface ChatMessage {
  id: string;
  date: string;       // ISO
  time: string;
  timestamp: number;  // epoch ms, for sorting/virtualization
  sender: string;
  text: string;
  isMine: boolean;
  type: 'text' | 'image' | 'video' | 'audio' | 'voice' | 'sticker' | 'gif'
      | 'document' | 'location' | 'contact' | 'deleted' | 'system';
}
```

## Cloudflare Pages deploy notes
- Build command: `npm run build`
- Output directory: `dist`
- Add `public/_redirects` with `/* /index.html 200` so client-side routes don't 404 on refresh
- No environment variables/secrets needed — there is no backend to configure

## How work is organized
Full feature list lives in `docs/PHASES.md`, broken into build phases.
Extra no-backend feature ideas live in `docs/FEATURES-EXTRA.md`.
**Work one phase at a time.** When asked to "do Phase N", only build what's listed
under that phase — don't reach ahead into later phases unless asked.

## Non-negotiables (repeat check before finishing any phase)
1. Zero network calls related to chat content (verify no fetch/XHR touches parsed data)
2. Works after disconnecting network (once assets are cached)
3. Handles a 100k+ message chat without freezing the main thread (virtualize + consider
   a Web Worker for parsing, see Phase 2)
