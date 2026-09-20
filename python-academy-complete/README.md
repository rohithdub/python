# Python Academy

A personal, static Python learning app for GitHub Pages. It runs without a backend or account and keeps progress in browser localStorage.

## What is included
- 11 real curriculum levels (0–10), 88 lessons, with no placeholder level modules.
- Lesson flow: objective → concept → syntax → example → practice → mastery check → notes/bookmarks.
- Level gating: the next level unlocks only after every lesson in the previous level is mastered.
- Code Lab & Practice Runner using Skulpt (in-browser, instant, 100% offline) and optional native Backend Server sandbox.
- Challenge center with test-case validation and XP rewards.
- XP, streak, bookmarks, notes, progress, export/import, and local reset.
- Responsive desktop/mobile layout and PWA app shell.
- Dual-mode support: standalone static GitHub Pages with offline PWA caching, plus automatic cloud syncing when connected to the backend server.

## GitHub Pages
1. Create a repository.
2. Upload the whole contents of this folder, keeping the `assets/` paths unchanged.
3. GitHub → Settings → Pages → Deploy from branch → choose the branch and root folder.
4. Open the Pages URL.

The Python runtime (Skulpt) is bundled locally in `assets/js/` and cached by the Service Worker (`sw.js`). No external CDN downloads or internet connection are required for in-browser execution!

## Privacy & Cloud Mode
By default, no account or backend is required. Progress and notes are stored under the browser's localStorage for this site. When running alongside the backend server, users can optionally sign in to sync progress across devices.
