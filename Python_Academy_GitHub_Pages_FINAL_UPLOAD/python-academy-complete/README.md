# Python Academy

A personal, static Python learning app for GitHub Pages. It runs without a backend or account and keeps progress in browser localStorage.

## What is included
- 11 real curriculum levels (0–10), 88 lessons, with no placeholder level modules.
- Lesson flow: objective → concept → syntax → example → practice → mastery check → notes/bookmarks.
- Level gating: the next level unlocks only after every lesson in the previous level is mastered.
- Code Lab using Pyodide in a Web Worker with a 3-second execution watchdog and worker termination.
- Challenge center with test-case validation and XP rewards.
- XP, streak, bookmarks, notes, progress, export/import, and local reset.
- Responsive desktop/mobile layout and PWA app shell.

## GitHub Pages
1. Create a repository.
2. Upload the whole contents of this folder, keeping the `assets/icons` paths unchanged.
3. GitHub → Settings → Pages → Deploy from branch → choose the branch and root folder.
4. Open the Pages URL.

The first Python Code Lab run needs internet access because Pyodide is loaded from its CDN at runtime. The app shell itself is cacheable for offline use, but this version does **not** claim fully offline Python execution.

## Privacy
No account, backend, or analytics are required. Progress and notes are stored under the browser's localStorage for this site.
